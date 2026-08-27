// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h, nextTick } from 'vue'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

interface Props {
  label: string
}

function Item(props: PropsWithCall<Props, boolean, {}>) {
  return h('div', { class: 'item', 'data-ended': String(props.call.ended) }, props.label)
}

async function flushRemoval(delay = 0) {
  await new Promise((resolve) => setTimeout(resolve, delay))
  await nextTick()
}

describe('end() boundaries', () => {
  it('removes only the targeted item from the middle of the stack', async () => {
    const List = createCallable<Props, boolean>(Item)
    const wrapper = mount(List)
    void List.call({ label: 'first' })
    const middle = List.call({ label: 'middle' })
    void List.call({ label: 'last' })

    List.end(middle, false)
    await expect(middle).resolves.toBe(false)
    await flushRemoval()

    expect(wrapper.findAll('.item').map((item) => item.text())).toEqual(['first', 'last'])
  })

  it('resolves and removes every item when no target is supplied', async () => {
    const List = createCallable<Props, boolean>(Item)
    const wrapper = mount(List)
    const first = List.call({ label: 'first' })
    const second = List.call({ label: 'second' })

    List.end(true)

    await expect(Promise.all([first, second])).resolves.toEqual([true, true])
    await flushRemoval()
    expect(wrapper.findAll('.item')).toHaveLength(0)
  })

  it('does not remove calls created after an end-all in the same tick', async () => {
    const List = createCallable<Props, boolean>(Item)
    const wrapper = mount(List)
    void List.call({ label: 'before' })

    List.end(false)
    void List.call({ label: 'after-one' })
    void List.call({ label: 'after-two' })
    await flushRemoval()

    expect(wrapper.findAll('.item').map((item) => item.text())).toEqual(['after-one', 'after-two'])
  })

  it('treats end-all on an empty stack as a no-op for later calls', async () => {
    const List = createCallable<Props, boolean>(Item)
    const wrapper = mount(List)

    List.end(false)
    void List.call({ label: 'later' })
    await flushRemoval()

    expect(wrapper.text()).toBe('later')
  })

  it('does not remove later calls when a targeted end is delayed', async () => {
    const List = createCallable<Props, boolean>(Item, 20)
    const wrapper = mount(List)
    const first = List.call({ label: 'first' })

    List.end(first, false)
    void List.call({ label: 'later' })
    await nextTick()

    expect(wrapper.find('[data-ended="true"]').text()).toBe('first')
    await flushRemoval(30)
    expect(wrapper.findAll('.item').map((item) => item.text())).toEqual(['later'])
  })

  it('ignores repeated operations after a call has been removed', async () => {
    const List = createCallable<Props, boolean>(Item)
    const wrapper = mount(List)
    const promise = List.call({ label: 'first' })

    List.end(promise, true)
    await flushRemoval()
    List.end(promise, false)
    List.update(promise, { label: 'changed' })
    await flushRemoval()

    await expect(promise).resolves.toBe(true)
    expect(wrapper.findAll('.item')).toHaveLength(0)
  })
})
