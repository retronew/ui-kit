// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

type Props = { text: string }
type Response = void

function Note(props: PropsWithCall<Props, Response, Record<string, never>>) {
  return h('div', { class: 'note' }, props.text)
}

describe('multiple createCallable() instances', () => {
  it('keep fully independent stacks', async () => {
    const A = createCallable<Props, Response>(Note)
    const B = createCallable<Props, Response>(Note)

    const Comp = defineComponent({
      setup() {
        return () => [h(A), h(B)]
      },
    })
    const wrapper = mount(Comp)

    void A.call({ text: 'from A' })
    await nextTick()

    expect(wrapper.findAll('.note')).toHaveLength(1)
    expect(() => void B.call({ text: 'from B' })).not.toThrow()
    await nextTick()
    expect(wrapper.findAll('.note')).toHaveLength(2)
  })

  it('remounting the same Callable elsewhere starts from an empty stack', async () => {
    const A = createCallable<Props, Response>(Note)
    const wrapper1 = mount(A)
    void A.call({ text: 'x' })
    await nextTick()
    expect(wrapper1.findAll('.note')).toHaveLength(1)

    wrapper1.unmount()

    const wrapper2 = mount(A)
    await nextTick()
    expect(wrapper2.findAll('.note')).toHaveLength(0)
  })
})
