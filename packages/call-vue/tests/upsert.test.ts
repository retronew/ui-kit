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

  it('untargeted end() also clears a pending upsert', async () => {
    const Toaster = createCallable<Props, Response>(Toast)
    mount(Toaster)

    const first = Toaster.upsert({ text: 'a' })
    Toaster.end(true)
    await nextTick()

    const second = Toaster.upsert({ text: 'b' })
    expect(second).not.toBe(first)
  })
})
