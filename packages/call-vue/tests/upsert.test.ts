// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h, nextTick } from 'vue'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

type Props = { text: string }
type Response = boolean

function Toast(props: PropsWithCall<Props, Response, Record<string, never>>) {
  return h('div', { class: 'toast' }, props.text)
}

function VoidToast(props: PropsWithCall<Props, void, Record<string, never>>) {
  return h('div', { class: 'toast' }, props.text)
}

describe('upsert()', () => {
  it('reuses the same promise and call while no upsert is pending', async () => {
    const Toaster = createCallable<Props, Response>(Toast)
    const wrapper = mount(Toaster)

    const first = Toaster.upsert({ text: 'Uploading… 10%' })
    await nextTick()
    expect(wrapper.findAll('.toast')).toHaveLength(1)

    const second = Toaster.upsert({ text: 'Uploading… 50%' })
    await nextTick()

    expect(second).toBe(first)
    expect(wrapper.findAll('.toast')).toHaveLength(1)
    expect(wrapper.text()).toBe('Uploading… 50%')
  })

  it('starts a fresh call once the previous upsert has ended', async () => {
    const Toaster = createCallable<Props, Response>(Toast)
    mount(Toaster)

    const first = Toaster.upsert({ text: 'a' })
    Toaster.end(first, true)
    await nextTick()

    const second = Toaster.upsert({ text: 'b' })
    expect(second).not.toBe(first)
  })

  it('updates only the upsert item while ordinary calls coexist', async () => {
    const Toaster = createCallable<Props, Response>(Toast)
    const wrapper = mount(Toaster)

    void Toaster.call({ text: 'normal-a' })
    const first = Toaster.upsert({ text: 'upsert-a' })
    void Toaster.call({ text: 'normal-b' })
    const second = Toaster.upsert({ text: 'upsert-b' })
    await nextTick()

    expect(second).toBe(first)
    expect(wrapper.findAll('.toast').map((toast) => toast.text())).toEqual([
      'normal-a',
      'upsert-b',
      'normal-b',
    ])
  })

  it('untargeted end() also clears a pending upsert', async () => {
    const Toaster = createCallable<Props, Response>(Toast)
    mount(Toaster)

    const first = Toaster.upsert({ text: 'a' })
    Toaster.end(true)
    await nextTick()

    const second = Toaster.upsert({ text: 'b' })
    expect(second).not.toBe(first)
  })

  it('clears the pending upsert when the component ends its own call', async () => {
    function Confirmable(props: PropsWithCall<Props, Response, Record<string, never>>) {
      return h('button', { class: 'toast', onClick: () => props.call.end(true) }, props.text)
    }
    const Toaster = createCallable<Props, Response>(Confirmable)
    const wrapper = mount(Toaster)

    const first = Toaster.upsert({ text: 'a' })
    await nextTick()
    await wrapper.find('.toast').trigger('click')
    await expect(first).resolves.toBe(true)

    const second = Toaster.upsert({ text: 'b' })
    expect(second).not.toBe(first)
  })

  it('targets a void-response call when undefined is passed explicitly', async () => {
    const Toaster = createCallable<Props, void>(VoidToast)
    mount(Toaster)

    const first = Toaster.upsert({ text: 'a' })
    const second: Promise<void> = Toaster.call({ text: 'b' })
    let secondSettled = false
    void second.then(() => {
      secondSettled = true
    })

    Toaster.end(first, undefined)

    await expect(first).resolves.toBeUndefined()

    await nextTick()
    expect(secondSettled).toBe(false)

    Toaster.end(second, undefined)
    await expect(second).resolves.toBeUndefined()
  })
})
