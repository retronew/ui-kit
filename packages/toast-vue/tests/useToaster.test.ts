// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { Toaster, ToastWrapper, createToaster, useToaster, useToastHotkey } from '../src/index.ts'

/**
 * jsdom's `trigger()` assigns `clientX`/`clientY` onto a getter-only
 * `MouseEvent`; a plain `Event` with `Object.assign` works instead, since
 * handlers only read properties.
 */
function firePointerEvent(
  target: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  init: Partial<PointerEvent>,
): void {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, init)
  target.dispatchEvent(event)
}

describe(useToaster, () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('reactively reflects toasts created via the API', async () => {
    const { store, toast } = createToaster<string>()

    const Comp = defineComponent({
      setup() {
        const { toasts } = useToaster(store)
        return () =>
          h(
            'ul',
            toasts.value.map((t) => h('li', { key: t.id }, t.message)),
          )
      },
    })

    const wrapper = mount(Comp)
    expect(wrapper.findAll('li')).toHaveLength(0)

    toast.success('done')
    await nextTick()
    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(wrapper.find('li').text()).toBe('done')
  })

  it('reactively reflects the core viewport offset', async () => {
    const { store } = createToaster<string>({ viewportOffset: '2rem' })

    const Comp = defineComponent({
      setup() {
        const { viewportOffset } = useToaster(store)
        return () => h('div', String(viewportOffset.value))
      },
    })

    const wrapper = mount(Comp)
    expect(wrapper.text()).toBe('2rem')

    store.setViewportOffset(24)
    await nextTick()
    expect(wrapper.text()).toBe('24')
  })

  it('unsubscribes when the component unmounts', () => {
    const { store } = createToaster<string>()
    const spy = vi.spyOn(store, 'subscribe')

    const Comp = defineComponent({
      setup() {
        useToaster(store)
        return () => h('div')
      },
    })

    const wrapper = mount(Comp)
    const unsub = spy.mock.results[0]?.value as () => void
    expect(unsub).toBeTypeOf('function')
    wrapper.unmount()
    store.create('ignored')
    expect(store.getState().toasts).toHaveLength(1)
  })
})

describe('Toaster (renderless)', () => {
  it('exposes toasts and handlers via slot props', async () => {
    // Untyped store, matching <Toaster>'s non-generic prop type.
    const { store, toast } = createToaster({ viewportOffset: '2rem' })
    toast('hi')

    const wrapper = mount(Toaster, {
      props: { store },
      slots: {
        default: (props: {
          toasts: { id: string; message: unknown }[]
          viewportOffset: number | string
        }) =>
          props.toasts.map((t) =>
            h('span', { key: t.id }, `${String(t.message)}:${props.viewportOffset}`),
          ),
      },
    })

    await nextTick()
    expect(wrapper.text()).toContain('hi:2rem')
  })
})

describe(ToastWrapper, () => {
  let animateMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // jsdom lacks matchMedia (used by prefersReducedMotion()) and Element.animate — stub both.
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    )
    animateMock = vi.fn().mockReturnValue({ cancel: vi.fn() })
    Element.prototype.animate = animateMock as unknown as typeof Element.prototype.animate
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('anchors the stack scale at the toast center when center-align is on', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-right', centerAlign: true },
      slots: { default: 'Oops' },
    })
    await nextTick()

    expect(wrapper.attributes('style')).toContain('transform-origin: center')
  })

  it('anchors the stack scale at the position-implied edge without center-align', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-right' },
      slots: { default: 'Oops' },
    })
    await nextTick()

    expect(wrapper.attributes('style')).toContain('transform-origin: right top')
  })

  it('plays a shake via WAAPI when the store dedups a repeat error for this toast', async () => {
    // Untyped store, matching ToastWrapper's non-generic prop type.
    const { store, toast } = createToaster()
    const id = toast.error('fail')
    mount(ToastWrapper, {
      props: { id, status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()

    toast.error('fail')

    expect(animateMock).toHaveBeenCalledTimes(1)
    const [keyframes, options] = animateMock.mock.calls[0]
    expect(options).toMatchObject({ composite: 'add' })
    expect(keyframes).toEqual(expect.arrayContaining([{ transform: 'translateX(0)' }]))
  })

  it('ignores shake effects for other toast ids', async () => {
    const { store } = createToaster()
    mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()

    store.create('fail', { id: 'other', type: 'error' })
    store.create('fail', { id: 'other', type: 'error' })

    expect(animateMock).not.toHaveBeenCalled()
  })

  it('cancels an in-flight shake instead of stacking on rapid repeat triggers', async () => {
    const { store, toast } = createToaster()
    const cancel = vi.fn()
    animateMock.mockReturnValue({ cancel })
    const id = toast.error('fail')
    mount(ToastWrapper, {
      props: { id, status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()

    toast.error('fail')
    toast.error('fail')

    expect(animateMock).toHaveBeenCalledTimes(2)
    expect(cancel).toHaveBeenCalledTimes(1)
  })

  it('skips the shake under reduced motion', async () => {
    // prefersReducedMotion() memoises — needs a fresh module graph to re-stub.
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    )
    vi.resetModules()
    const fresh = await import('../src/index.ts')

    const { store, toast } = fresh.createToaster()
    const id = toast.error('fail')
    mount(fresh.ToastWrapper, {
      props: { id, status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()

    toast.error('fail')

    expect(animateMock).not.toHaveBeenCalled()
  })

  it('unsubscribes from store effects on unmount', async () => {
    const { store, toast } = createToaster()
    const id = toast.error('fail')
    const wrapper = mount(ToastWrapper, {
      props: { id, status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()
    wrapper.unmount()

    toast.error('fail')

    expect(animateMock).not.toHaveBeenCalled()
  })

  it('emits dismiss-request on Escape — the keyboard-only equivalent of hover-to-dismiss', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()

    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
  })

  it('ignores non-Escape keys', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()

    await wrapper.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('dismiss-request')).toBeUndefined()
  })

  it('commits and emits dismiss-request after dragging past the distance threshold', async () => {
    const finished = Promise.resolve()
    animateMock.mockReturnValue({ cancel: vi.fn(), finished })
    const { store } = createToaster()
    // Horizontal drags only engage toward a corner's own outward edge.
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-right' },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: 'touch',
    })
    // First move crosses the hysteresis threshold; second crosses the commit distance.
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 40, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 120, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 120, clientY: 0, pointerId: 1 })
    await finished
    await nextTick()

    expect(animateMock).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
  })

  it('allows horizontal swipe at a corner position', async () => {
    const finished = Promise.resolve()
    animateMock.mockReturnValue({ cancel: vi.fn(), finished })
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'bottom-right' },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 40, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 120, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 120, clientY: 0, pointerId: 1 })
    await finished
    await nextTick()

    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
  })

  it('does not let a corner be swiped in the "inward" horizontal direction', async () => {
    const { store } = createToaster()
    const onClick = vi.fn()
    // bottom-right's outward direction is right (+1) — dragging left is inward.
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'bottom-right' },
      slots: { default: () => h('button', { onClick }, 'dismiss') },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: -120, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: -120, clientY: 0, pointerId: 1 })

    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('dismiss-request')).toBeUndefined()
  })

  it('does not allow horizontal swipe on a *-center toast, but vertical still works', async () => {
    const finished = Promise.resolve()
    animateMock.mockReturnValue({ cancel: vi.fn(), finished })
    const { store } = createToaster()
    const onClick = vi.fn()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-center' },
      slots: { default: () => h('button', { onClick }, 'dismiss') },
    })
    await nextTick()

    // Horizontal swipes don't engage on a *-center toast.
    firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 120, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 120, clientY: 0, pointerId: 1 })
    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('dismiss-request')).toBeUndefined()

    // Vertical, matching top-center's exit direction.
    firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 2 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 0, clientY: -40, pointerId: 2 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 0, clientY: -120, pointerId: 2 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 0, clientY: -120, pointerId: 2 })
    await finished
    await nextTick()
    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
  })

  it('springs back without dismissing when the drag stays below every threshold', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: 'touch',
    })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 25, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 25, clientY: 0, pointerId: 1 })
    await nextTick()

    expect(animateMock).not.toHaveBeenCalled()
    expect(wrapper.emitted('dismiss-request')).toBeUndefined()
  })

  it('suppresses the trailing click after a real drag, but lets a plain tap through', async () => {
    const { store } = createToaster()
    const onClick = vi.fn()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-right' },
      slots: { default: () => h('button', { onClick }, 'dismiss') },
    })
    await nextTick()

    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)

    // A real drag below the commit threshold springs back, but the browser's
    // own trailing click on release must still be swallowed.
    firePointerEvent(wrapper.element, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 2,
      pointerType: 'touch',
    })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 30, clientY: 0, pointerId: 2 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 30, clientY: 0, pointerId: 2 })
    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not engage the drag below the movement hysteresis', async () => {
    const { store } = createToaster()
    const onClick = vi.fn()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store },
      slots: { default: () => h('button', { onClick }, 'dismiss') },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: 'touch',
    })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 4, clientY: 0, pointerId: 1 }) // < hysteresis
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 4, clientY: 0, pointerId: 1 })

    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not capture the pointer on a plain pointerdown, only once a drag is confirmed', async () => {
    /**
     * Capturing on pointerdown retargets the compatibility `click` event to
     * this element per the Pointer Events spec, breaking buttons inside
     * toasts — capture must wait for a confirmed drag.
     */
    const original = (Element.prototype as unknown as Record<string, unknown>).setPointerCapture
    const captureSpy = vi.fn()
    Element.prototype.setPointerCapture =
      captureSpy as unknown as typeof Element.prototype.setPointerCapture
    try {
      const { store } = createToaster()
      const wrapper = mount(ToastWrapper, {
        props: { id: 't1', status: 'visible', store, toastPosition: 'top-right' },
        slots: { default: 'Oops' },
      })
      await nextTick()

      firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
      expect(captureSpy).not.toHaveBeenCalled()

      firePointerEvent(wrapper.element, 'pointermove', { clientX: 40, clientY: 0, pointerId: 1 })
      expect(captureSpy).toHaveBeenCalledWith(1)
    } finally {
      ;(Element.prototype as unknown as Record<string, unknown>).setPointerCapture = original
    }
  })

  it('lets a top toast be swiped up to dismiss', async () => {
    const finished = Promise.resolve()
    animateMock.mockReturnValue({ cancel: vi.fn(), finished })
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-center' },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 0, clientY: -40, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 0, clientY: -120, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 0, clientY: -120, pointerId: 1 })
    await finished
    await nextTick()

    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
  })

  it('does not let a top toast be swiped down', async () => {
    const { store } = createToaster()
    const onClick = vi.fn()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-center' },
      slots: { default: () => h('button', { onClick }, 'dismiss') },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 0, clientY: 120, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 0, clientY: 120, pointerId: 1 })
    await nextTick()

    expect(wrapper.emitted('dismiss-request')).toBeUndefined()
    // The "wrong" direction never engages as a gesture, so a click still works.
    await wrapper.find('button').trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('lets a bottom toast be swiped down to dismiss', async () => {
    const finished = Promise.resolve()
    animateMock.mockReturnValue({ cancel: vi.fn(), finished })
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'bottom-center' },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 0, clientY: 40, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 0, clientY: 120, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 0, clientY: 120, pointerId: 1 })
    await finished
    await nextTick()

    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
  })
})

describe(useToastHotkey, () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('focuses the frontmost toast on the default Alt+T combo', () => {
    document.body.innerHTML =
      '<div data-toast-wrapper="newest" tabindex="0"></div><div data-toast-wrapper="older" tabindex="0"></div>'
    const front = document.querySelector<HTMLElement>('[data-toast-wrapper="newest"]')
    const focusSpy = vi.spyOn(front as HTMLElement, 'focus')

    const Comp = defineComponent({
      setup() {
        useToastHotkey()
        return () => h('div')
      },
    })
    const wrapper = mount(Comp, { attachTo: document.body })

    window.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 't' }))
    expect(focusSpy).toHaveBeenCalledOnce()

    wrapper.unmount()
    document.body.innerHTML = ''
  })

  it('does not fire without the modifier', () => {
    document.body.innerHTML = '<div data-toast-wrapper="a" tabindex="0"></div>'
    const el = document.querySelector<HTMLElement>('[data-toast-wrapper="a"]')
    const focusSpy = vi.spyOn(el as HTMLElement, 'focus')

    const Comp = defineComponent({
      setup() {
        useToastHotkey()
        return () => h('div')
      },
    })
    const wrapper = mount(Comp, { attachTo: document.body })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }))
    expect(focusSpy).not.toHaveBeenCalled()

    wrapper.unmount()
    document.body.innerHTML = ''
  })

  it('supports a custom key combo', () => {
    document.body.innerHTML = '<div data-toast-wrapper="a" tabindex="0"></div>'
    const el = document.querySelector<HTMLElement>('[data-toast-wrapper="a"]')
    const focusSpy = vi.spyOn(el as HTMLElement, 'focus')

    const Comp = defineComponent({
      setup() {
        useToastHotkey({ keys: ['Control', 'Shift', 'k'] })
        return () => h('div')
      },
    })
    const wrapper = mount(Comp, { attachTo: document.body })

    // Alt+T (the default) must no longer trigger it.
    window.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 't' }))
    expect(focusSpy).not.toHaveBeenCalled()

    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k', shiftKey: true }))
    expect(focusSpy).toHaveBeenCalledOnce()

    wrapper.unmount()
    document.body.innerHTML = ''
  })
})
