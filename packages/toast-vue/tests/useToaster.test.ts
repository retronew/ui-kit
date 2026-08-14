// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import {
  ToasterProvider,
  ToastWrapper,
  createToaster,
  useToaster,
  useToastHotkey,
} from '../src/index.ts'

/**
 * jsdom's `trigger()` assigns `clientX`/`clientY` onto a getter-only
 * `MouseEvent`; a plain `Event` with `Object.assign` works instead, since
 * handlers only read properties.
 */
function firePointerEvent(
  target: Element,
  type: 'lostpointercapture' | 'pointercancel' | 'pointerdown' | 'pointermove' | 'pointerup',
  init: Partial<PointerEvent>,
): void {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const { timeStamp, ...properties } = init
  Object.assign(event, properties)
  if (timeStamp !== undefined) Object.defineProperty(event, 'timeStamp', { value: timeStamp })
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

  it('reactively reflects the core default position', async () => {
    const { store } = createToaster<string>({ defaultPosition: 'top-center' })

    const Comp = defineComponent({
      setup() {
        const { defaultPosition } = useToaster(store)
        return () => h('div', String(defaultPosition.value))
      },
    })

    const wrapper = mount(Comp)
    expect(wrapper.text()).toBe('top-center')

    store.setDefaultPosition('bottom-right')
    await nextTick()
    expect(wrapper.text()).toBe('bottom-right')
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

  it('switches subscriptions when a reactive store changes', async () => {
    const first = createToaster<string>()
    const second = createToaster<string>()
    const activeStore = shallowRef(first.store)
    let exposed: ReturnType<typeof useToaster<string>> | undefined
    const Comp = defineComponent({
      setup() {
        exposed = useToaster(activeStore)
        return () => h('div', exposed?.toasts.value.map((toast) => toast.message).join(','))
      },
    })
    const wrapper = mount(Comp)
    first.toast('first')
    await nextTick()
    expect(wrapper.text()).toBe('first')

    activeStore.value = second.store
    await nextTick()
    expect(wrapper.text()).toBe('')
    first.toast('ignored')
    second.toast('second')
    await nextTick()
    expect(wrapper.text()).toBe('second')
  })

  it('uses stable list order for offsets when timestamps are equal', () => {
    vi.setSystemTime(1000)
    const { store } = createToaster<string>()
    const firstId = store.create('first', { duration: Infinity })
    const secondId = store.create('second', { duration: Infinity })
    store.setHeight(firstId, 10)
    store.setHeight(secondId, 20)
    let exposed: ReturnType<typeof useToaster<string>> | undefined
    const Comp = defineComponent({
      setup() {
        exposed = useToaster(store)
        return () => h('div')
      },
    })
    mount(Comp)
    const second = exposed?.toasts.value.find((toast) => toast.id === secondId)
    expect(second && exposed?.calculateOffset(second)).toBe(18)
  })

  it('delegates control methods to the current store', () => {
    const { store } = createToaster<string>()
    const id = store.create('one', { duration: 5000 })
    let exposed: ReturnType<typeof useToaster<string>> | undefined
    const Comp = defineComponent({
      setup() {
        exposed = useToaster(store)
        return () => h('div')
      },
    })
    mount(Comp)

    expect(exposed?.getRemaining(id)).toBe(5000)
    expect(exposed?.getProgress(id)).toBe(1)
    expect(exposed?.pause(id)).toBe(true)
    expect(exposed?.resume(id)).toBe(true)
    expect(exposed?.updateHeight(id, 42)).toBe(true)
    expect(exposed?.getStackMetrics(store.getState().toasts[0]!)).toMatchObject({
      index: 0,
      isFront: true,
    })
    expect(exposed?.dismiss(id)).toBe(true)
    expect(exposed?.remove(id)).toBe(true)
    expect(store.getState().toasts).toHaveLength(0)
  })
})

describe('ToasterProvider (renderless)', () => {
  it('defaults to the shared singleton store when none is provided', async () => {
    const { toastStore, toast } = await import('../src/index.ts')
    toast('from the default store')

    const wrapper = mount(ToasterProvider, {
      slots: {
        default: (props: { toasts: readonly { id: string; message: unknown }[] }) =>
          props.toasts.map((t) => h('span', { key: t.id }, String(t.message))),
      },
    })

    await nextTick()
    expect(wrapper.text()).toContain('from the default store')
    toastStore.remove()
  })

  it('exposes toasts and handlers via slot props', async () => {
    // Untyped store, matching <ToasterProvider>'s non-generic prop type.
    const { store, toast } = createToaster({ viewportOffset: '2rem' })
    toast('hi')

    const wrapper = mount(ToasterProvider, {
      props: { store },
      slots: {
        default: (props: {
          toasts: readonly { id: string; message: unknown }[]
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

  it('exposes defaultPosition via slot props', async () => {
    const { store, toast } = createToaster({ defaultPosition: 'top-center' })
    toast('hi')

    const wrapper = mount(ToasterProvider, {
      props: { store },
      slots: {
        default: (props: {
          toasts: readonly { id: string; message: unknown }[]
          defaultPosition?: string
        }) =>
          props.toasts.map((t) =>
            h('span', { key: t.id }, `${String(t.message)}:${props.defaultPosition}`),
          ),
      },
    })

    await nextTick()
    expect(wrapper.text()).toContain('hi:top-center')
  })

  it('resubscribes when the store prop changes', async () => {
    const first = createToaster()
    const second = createToaster()
    first.toast('first')
    second.toast('second')
    const wrapper = mount(ToasterProvider, {
      props: { store: first.store },
      slots: {
        default: ({ toasts }: { toasts: readonly { message: unknown }[] }) =>
          h('span', typeof toasts[0]?.message === 'string' ? toasts[0].message : ''),
      },
    })
    expect(wrapper.text()).toBe('first')

    await wrapper.setProps({ store: second.store })
    expect(wrapper.text()).toBe('second')
    first.toast('ignored')
    await nextTick()
    expect(wrapper.text()).toBe('second')
  })

  it('exposes progress and opts into timer snapshots only when requested', async () => {
    const { store, toast } = createToaster()
    const subscribe = vi.spyOn(store, 'subscribe')
    const wrapper = mount(ToasterProvider, {
      props: { progress: true, store },
      slots: {
        default: ({
          getProgress,
          toasts,
        }: {
          getProgress: (id: string) => number | undefined
          toasts: readonly { id: string }[]
        }) => h('span', toasts[0] ? String(getProgress(toasts[0].id)) : ''),
      },
    })
    toast('counting', { duration: 1000 })
    await nextTick()
    expect(subscribe).toHaveBeenCalledWith(expect.any(Function), { progress: true })
    expect(Number(wrapper.text())).toBeGreaterThan(0.99)
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

  it('enters at an exact reflow-matching offset (own height + gap) in the default motion for a top toast', () => {
    const { store } = createToaster()
    // No await: checked before the mount-flip rAF fires, i.e. still entering.
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-center' },
      slots: { default: 'Oops' },
    })

    expect(wrapper.attributes('style')).toContain(
      'translateY(calc(-100% - var(--toast-stack-gap, 8px)))',
    )
  })

  it('mirrors the entering offset for a bottom toast in the default motion', () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'bottom-center' },
      slots: { default: 'Oops' },
    })

    expect(wrapper.attributes('style')).toContain(
      'translateY(calc(100% + var(--toast-stack-gap, 8px)))',
    )
  })

  it('keeps the original ±60% offset while exiting in the default motion', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-center' },
      slots: { default: 'Oops' },
    })
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await wrapper.setProps({ status: 'dismissed' })

    expect(wrapper.attributes('style')).toContain('translateY(-60%)')
  })

  it("uses the pop preset's bigger scale, longer distance, and stronger blur while entering", () => {
    const { store } = createToaster()
    // No await: checked before the mount-flip rAF fires, i.e. still in the "entering" state.
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, pop: true },
      slots: { default: 'Oops' },
    })

    const style = wrapper.attributes('style')
    expect(style).toContain('scale(0.6)')
    expect(style).toContain('translateY(-200%)')
    expect(style).toContain('opacity: 0.5')
    expect(style).toContain('blur(var(--toast-motion-blur, 6px))')
    expect(style).toContain('cubic-bezier(0.21, 1.02, 0.73, 1)')
  })

  it("uses the pop preset's shorter distance and full fade while exiting", async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, pop: true },
      slots: { default: 'Oops' },
    })
    // Flush the mount-flip rAF so the toast is "visible" before we dismiss it.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    await wrapper.setProps({ status: 'dismissed' })

    const style = wrapper.attributes('style')
    expect(style).toContain('scale(0.6)')
    expect(style).toContain('translateY(-150%)')
    expect(style).toContain('opacity: 0')
    expect(style).toContain('blur(var(--toast-motion-blur, 6px))')
    expect(style).toContain('cubic-bezier(0.06, 0.71, 0.55, 1)')
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

  it('subscribes only to effects for its own toast id', async () => {
    const { store } = createToaster()
    const spy = vi.spyOn(store, 'onEffect')
    mount(ToastWrapper, {
      props: { id: 'target', status: 'visible', store },
      slots: { default: 'Oops' },
    })
    await nextTick()

    expect(spy).toHaveBeenCalledWith(expect.any(Function), 'target')
  })

  it('moves its effect subscription when the store prop changes', async () => {
    const first = createToaster()
    const second = createToaster()
    first.store.create('first', { id: 'shared', type: 'error' })
    second.store.create('second', { id: 'shared', type: 'error' })
    const wrapper = mount(ToastWrapper, {
      props: { id: 'shared', status: 'visible', store: first.store },
      slots: { default: 'Shared id' },
    })
    await nextTick()
    await wrapper.setProps({ store: second.store })

    second.toast.error('second again')
    expect(animateMock).toHaveBeenCalledOnce()
    first.toast.error('first again')
    expect(animateMock).toHaveBeenCalledOnce()
  })

  it('coalesces resize measurements into one animation frame', async () => {
    let callback: ResizeObserverCallback | undefined
    const disconnect = vi.fn()
    const observe = vi.fn()
    class ResizeObserverMock {
      constructor(nextCallback: ResizeObserverCallback) {
        callback = nextCallback
      }
      disconnect = disconnect
      observe = observe
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 'target', status: 'visible', store },
      slots: { default: 'Measured' },
    })
    await nextTick()
    expect(observe).toHaveBeenCalledOnce()

    callback?.([], {} as ResizeObserver)
    callback?.([], {} as ResizeObserver)
    callback?.([], {} as ResizeObserver)
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    expect(wrapper.emitted('height-update')).toHaveLength(2)
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('reacts to reduced-motion preference changes at runtime', async () => {
    let listener: ((event: { matches: boolean }) => void) | undefined
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        addEventListener: (_type: string, next: (event: { matches: boolean }) => void) => {
          listener = next
        },
        matches: false,
        removeEventListener: vi.fn(),
      })),
    )
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 'target', status: 'visible', store },
      slots: { default: 'Motion' },
    })
    await nextTick()
    listener?.({ matches: true })
    await nextTick()

    expect(wrapper.attributes('style')).toContain('transition: none')
  })

  it('allows native horizontal panning for center-positioned toasts', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 'target', status: 'visible', store, toastPosition: 'top-center' },
      slots: { default: 'Pan' },
    })
    await nextTick()
    expect(wrapper.attributes('style')).toContain('touch-action: pan-x')
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

  it('ignores Escape when escapeDismiss is false', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, escapeDismiss: false },
      slots: { default: 'Oops' },
    })
    await nextTick()

    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('dismiss-request')).toBeUndefined()
  })

  it('resumes responding to Escape once escapeDismiss is toggled back on', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, escapeDismiss: false },
      slots: { default: 'Oops' },
    })
    await nextTick()
    await wrapper.setProps({ escapeDismiss: true })

    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
  })

  it('ignores pointer gestures when swipeDismiss is false', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: {
        id: 't1',
        status: 'visible',
        store,
        toastPosition: 'top-right',
        swipeDismiss: false,
      },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: 'touch',
    })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 40, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 120, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 120, clientY: 0, pointerId: 1 })
    await nextTick()

    expect(animateMock).not.toHaveBeenCalled()
    expect(wrapper.emitted('dismiss-request')).toBeUndefined()
    expect(wrapper.attributes('style')).toContain('touch-action: auto')
  })

  it('springs a mid-drag gesture back to rest when swipeDismiss is toggled off', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-right', swipeDismiss: true },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      pointerType: 'touch',
    })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 40, clientY: 0, pointerId: 1 })
    await nextTick()
    expect(wrapper.attributes('style')).toContain('translateX(40px)')

    await wrapper.setProps({ swipeDismiss: false })
    // Committing the now-cancelled gesture should not dismiss.
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 120, clientY: 0, pointerId: 1 })
    await nextTick()

    expect(wrapper.attributes('style')).toContain('translateX(0px)')
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

  it('dismisses immediately when animate() has no finished promise', async () => {
    // Default mock from beforeEach: { cancel: vi.fn() }, no `finished`.
    const { store } = createToaster()
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
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 40, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 120, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointerup', { clientX: 120, clientY: 0, pointerId: 1 })
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

  it('does not use stale release velocity after the pointer pauses', async () => {
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-right' },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      timeStamp: 0,
    })
    firePointerEvent(wrapper.element, 'pointermove', {
      clientX: 30,
      clientY: 0,
      pointerId: 1,
      timeStamp: 10,
    })
    firePointerEvent(wrapper.element, 'pointerup', {
      clientX: 30,
      clientY: 0,
      pointerId: 1,
      timeStamp: 200,
    })
    await nextTick()

    expect(animateMock).not.toHaveBeenCalled()
    expect(wrapper.emitted('dismiss-request')).toBeUndefined()
  })

  it('cleans up a cancelled drag and leaves the next click usable', async () => {
    const { store } = createToaster()
    const onClick = vi.fn()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-right' },
      slots: { default: () => h('button', { onClick }, 'action') },
    })
    await nextTick()
    firePointerEvent(wrapper.element, 'pointerdown', { clientX: 0, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointermove', { clientX: 30, clientY: 0, pointerId: 1 })
    firePointerEvent(wrapper.element, 'pointercancel', { pointerId: 1 })
    await wrapper.find('button').trigger('click')

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('settles a committed drag when pointer capture is lost', async () => {
    const finished = Promise.resolve()
    animateMock.mockReturnValue({ cancel: vi.fn(), finished })
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      props: { id: 't1', status: 'visible', store, toastPosition: 'top-right' },
      slots: { default: 'Oops' },
    })
    await nextTick()

    firePointerEvent(wrapper.element, 'pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
      timeStamp: 0,
    })
    firePointerEvent(wrapper.element, 'pointermove', {
      clientX: 120,
      clientY: 0,
      pointerId: 1,
      timeStamp: 20,
    })
    firePointerEvent(wrapper.element, 'lostpointercapture', {
      pointerId: 1,
      timeStamp: 20,
    })
    await finished
    await nextTick()

    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
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

  it('restores focus after Escape dismisses a focused toast', async () => {
    const previous = document.createElement('button')
    document.body.appendChild(previous)
    previous.focus()
    const { store } = createToaster()
    const wrapper = mount(ToastWrapper, {
      attachTo: document.body,
      props: { id: 't1', status: 'visible', store },
      slots: { default: 'Notice' },
    })
    await nextTick()

    ;(wrapper.element as HTMLElement).focus()
    await wrapper.trigger('keydown', { key: 'Escape' })
    await Promise.resolve()

    expect(wrapper.emitted('dismiss-request')).toEqual([['t1']])
    expect(document.activeElement).toBe(previous)
    wrapper.unmount()
    previous.remove()
  })
})

describe(useToastHotkey, () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('focuses the frontmost toast on the default Alt+T combo', () => {
    document.body.innerHTML =
      '<div data-toast-wrapper="newest" data-toast-status="visible" tabindex="0"></div><div data-toast-wrapper="older" data-toast-status="visible" tabindex="0"></div>'
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
    document.body.innerHTML =
      '<div data-toast-wrapper="a" data-toast-status="visible" tabindex="0"></div>'
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
    document.body.innerHTML =
      '<div data-toast-wrapper="a" data-toast-status="visible" tabindex="0"></div>'
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

  it('ignores hotkeys typed in editable controls', () => {
    document.body.innerHTML =
      '<input id="editor"><div data-toast-wrapper="a" data-toast-status="visible" tabindex="0"></div>'
    const toast = document.querySelector<HTMLElement>('[data-toast-wrapper="a"]')
    const focusSpy = vi.spyOn(toast as HTMLElement, 'focus')
    const Comp = defineComponent({
      setup() {
        useToastHotkey()
        return () => h('div')
      },
    })
    const wrapper = mount(Comp, { attachTo: document.body })
    const input = document.querySelector<HTMLInputElement>('#editor') as HTMLInputElement
    input.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, bubbles: true, key: 't' }))

    expect(focusSpy).not.toHaveBeenCalled()
    wrapper.unmount()
    document.body.innerHTML = ''
  })

  it('skips dismissed wrappers when focusing the front toast', () => {
    document.body.innerHTML =
      '<div data-toast-wrapper="leaving" data-toast-status="dismissed" tabindex="0"></div><div data-toast-wrapper="visible" data-toast-status="visible" tabindex="0"></div>'
    const visible = document.querySelector<HTMLElement>('[data-toast-wrapper="visible"]')
    const focusSpy = vi.spyOn(visible as HTMLElement, 'focus')
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
})
