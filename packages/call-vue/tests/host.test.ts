// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '../src/host/index.ts'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

const HOST_KEY = Symbol.for('call-vue.host')
type HostStore = { [HOST_KEY]?: { app: { unmount: () => void }; container: HTMLElement } }

function cleanupHost() {
  const store = globalThis as HostStore
  const host = store[HOST_KEY]
  host?.app.unmount()
  host?.container.remove()
  delete store[HOST_KEY]
  document.querySelectorAll('[data-call-vue-host]').forEach((element) => element.remove())
}

afterEach(cleanupHost)

type Props = { message: string }

function createConfirm() {
  return createCallable<Props, boolean>(
    (props: PropsWithCall<Props, boolean, Record<string, never>>) =>
      h('div', { role: 'dialog', 'aria-label': props.message }, [
        h('span', props.message),
        h('button', { onClick: () => props.call.end(true) }, 'Yes'),
      ]),
  )
}

describe('mount()', () => {
  it('mounts a body-level host by default', () => {
    const Confirm = createConfirm()
    mount(Confirm)

    const host = document.querySelector('[data-call-vue-host]')
    expect(host?.parentElement).toBe(document.body)
  })

  it('connects imperative calls to the one external Root', async () => {
    const Confirm = createConfirm()
    mount(Confirm)

    const result = Confirm.call({ message: 'from-preview' })
    await nextTick()
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1)

    const button = document.querySelector('[role="dialog"] button')
    if (!(button instanceof HTMLButtonElement))
      throw new Error('Host dialog action was not rendered')
    button.click()
    await expect(result).resolves.toBe(true)
  })

  it('reuses a host for repeated mounts', () => {
    const Confirm = createConfirm()
    mount(Confirm)
    const first = document.querySelector('[data-call-vue-host]')
    mount(Confirm)

    expect(document.querySelectorAll('[data-call-vue-host]')).toHaveLength(1)
    expect(document.querySelector('[data-call-vue-host]')).toBe(first)
  })

  it('wraps and replaces the rendered Root in the existing app', async () => {
    const Confirm = createConfirm()
    const First = defineComponent({
      setup:
        (_, { slots }) =>
        () =>
          h('section', { 'data-testid': 'first' }, slots.default?.()),
    })
    const Second = defineComponent({
      setup:
        (_, { slots }) =>
        () =>
          h('aside', { 'data-testid': 'second' }, slots.default?.()),
    })
    mount(Confirm, { wrapper: First })
    await nextTick()
    expect(document.querySelector('[data-testid="first"]')).not.toBeNull()

    mount(Confirm, { wrapper: Second })
    await nextTick()
    expect(document.querySelector('[data-testid="first"]')).toBeNull()
    expect(document.querySelector('[data-testid="second"]')).not.toBeNull()
  })

  it('uses an explicitly supplied container', async () => {
    const Confirm = createConfirm()
    const container = document.createElement('aside')
    document.body.appendChild(container)
    mount(Confirm, { container })
    void Confirm.call({ message: 'custom-container' })
    await nextTick()

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.querySelector('[data-call-vue-host]')).toBeNull()
  })
})
