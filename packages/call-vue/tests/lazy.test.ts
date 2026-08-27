// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineAsyncComponent, defineComponent, h, nextTick, type Component } from 'vue'
import { createCallable } from '../src/index.ts'
import type { UserComponent } from '../src/index.ts'

interface Props {
  message: string
}

const Dialog: UserComponent<Props, boolean, {}> = (props) =>
  h('div', { class: 'dialog' }, props.message)

function deferredComponent() {
  let resolve!: (component: Component) => void
  const promise = new Promise<Component>((done) => {
    resolve = done
  })
  const loader = vi.fn(() => promise)
  const LoadingComponent = defineComponent({
    setup() {
      return () => h('p', { class: 'fallback' }, 'Loading')
    },
  })
  const component = defineAsyncComponent<UserComponent<Props, boolean, {}>>({
    loader,
    loadingComponent: LoadingComponent,
    delay: 0,
    suspensible: false,
  })
  return { component, loader, resolve }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('async components', () => {
  it('does not load the component while the call stack is empty', () => {
    const lazy = deferredComponent()
    const Callable = createCallable<Props, boolean>(lazy.component)
    const wrapper = mount(Callable)

    expect(lazy.loader).not.toHaveBeenCalled()
    expect(wrapper.find('.fallback').exists()).toBe(false)
  })

  it('loads on the first call and renders after the component resolves', async () => {
    const lazy = deferredComponent()
    const Callable = createCallable<Props, boolean>(lazy.component)
    const wrapper = mount(Callable)

    void Callable.call({ message: 'Lazy hello' })
    await nextTick()
    expect(lazy.loader).toHaveBeenCalledOnce()
    expect(wrapper.find('.fallback').exists()).toBe(true)

    lazy.resolve(Dialog)
    await flushPromises()
    await nextTick()

    expect(wrapper.find('.fallback').exists()).toBe(false)
    expect(wrapper.find('.dialog').text()).toBe('Lazy hello')
  })

  it('does not resurrect a call ended while its component is loading', async () => {
    const lazy = deferredComponent()
    const Callable = createCallable<Props, boolean>(lazy.component)
    const wrapper = mount(Callable)
    const promise = Callable.call({ message: 'Gone' })
    await nextTick()

    Callable.end(promise, false)
    await new Promise((resolve) => setTimeout(resolve, 0))
    lazy.resolve(Dialog)
    await flushPromises()
    await nextTick()

    await expect(promise).resolves.toBe(false)
    expect(wrapper.find('.dialog').exists()).toBe(false)
  })

  it('clears a loading call when its root unmounts', async () => {
    const lazy = deferredComponent()
    const Callable = createCallable<Props, boolean>(lazy.component)
    const wrapper = mount(Callable)
    const promise = Callable.call({ message: 'Unmounted' })
    let settled = false
    void promise.then(() => {
      settled = true
    })
    await nextTick()

    wrapper.unmount()
    lazy.resolve(Dialog)
    await flushPromises()

    const remounted = mount(Callable)
    await nextTick()
    expect(remounted.find('.dialog').exists()).toBe(false)
    expect(settled).toBe(false)
  })

  it('renders the configured error component when the loader rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const ErrorComponent = defineComponent({
      setup() {
        return () => h('p', { class: 'load-error' }, 'Could not load')
      },
    })
    const AsyncDialog = defineAsyncComponent<UserComponent<Props, boolean, {}>>({
      loader: () => Promise.reject(new Error('chunk failed')),
      errorComponent: ErrorComponent,
      delay: 0,
    })
    const Callable = createCallable<Props, boolean>(AsyncDialog)
    const wrapper = mount(Callable)

    void Callable.call({ message: 'Unavailable' })
    await flushPromises()
    await nextTick()

    expect(wrapper.find('.load-error').text()).toBe('Could not load')
  })
})
