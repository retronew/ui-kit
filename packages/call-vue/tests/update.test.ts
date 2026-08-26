// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h, nextTick } from 'vue'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

type Props = { label: string; count: number }
type Response = boolean

function Item(props: PropsWithCall<Props, Response, Record<string, never>>) {
  return h('div', { class: 'item' }, `${props.label}:${props.count}`)
}

describe('update()', () => {
  it('merges partial props into a targeted call', async () => {
    const List = createCallable<Props, Response>(Item)
    const wrapper = mount(List)

    const promise = List.call({ label: 'a', count: 1 })
    await nextTick()

    List.update(promise, { count: 2 })
    await nextTick()

    expect(wrapper.text()).toBe('a:2')
  })

  it('merges partial props into every call when untargeted', async () => {
    const List = createCallable<Props, Response>(Item)
    const wrapper = mount(List)

    List.call({ label: 'a', count: 1 })
    List.call({ label: 'b', count: 1 })
    await nextTick()

    List.update({ count: 9 })
    await nextTick()

    const items = wrapper.findAll('.item')
    expect(items.map((w) => w.text())).toEqual(['a:9', 'b:9'])
  })

  it('leaves other calls untouched when targeted', async () => {
    const List = createCallable<Props, Response>(Item)
    const wrapper = mount(List)

    const first = List.call({ label: 'a', count: 1 })
    List.call({ label: 'b', count: 1 })
    await nextTick()

    List.update(first, { count: 5 })
    await nextTick()

    const items = wrapper.findAll('.item')
    expect(items.map((w) => w.text())).toEqual(['a:5', 'b:1'])
  })
})
