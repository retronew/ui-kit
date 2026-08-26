// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

type Props = { message: string }
type Response = boolean

function ConfirmDialog(props: PropsWithCall<Props, Response, Record<string, never>>) {
  return h('div', { class: 'confirm', 'data-key': props.call.key }, [
    h('span', props.message),
    h('button', { class: 'yes', onClick: () => props.call.end(true) }, 'yes'),
    h('button', { class: 'no', onClick: () => props.call.end(false) }, 'no'),
  ])
}

function makeConfirm() {
  return createCallable<Props, Response>(ConfirmDialog)
}

describe(createCallable, () => {
  it('throws when call() runs before a <Root> is mounted', () => {
    const Confirm = makeConfirm()
    expect(() => Confirm.call({ message: 'hi' })).toThrow('No <Root> found!')
  })

  it('throws when two <Root> instances are mounted at once', () => {
    const Confirm = makeConfirm()
    const Comp = defineComponent({
      setup() {
        return () => [h(Confirm), h(Confirm)]
      },
    })
    mount(Comp)
    expect(() => Confirm.call({ message: 'hi' })).toThrow('Multiple instances of <Root> found!')
  })

  it('mounts a call and resolves its promise on end()', async () => {
    const Confirm = makeConfirm()
    const wrapper = mount(Confirm)

    const promise = Confirm.call({ message: 'Delete file?' })
    await nextTick()

    expect(wrapper.findAll('.confirm')).toHaveLength(1)
    expect(wrapper.text()).toContain('Delete file?')

    await wrapper.find('.yes').trigger('click')
    await expect(promise).resolves.toBe(true)
  })

  it('stacks multiple concurrent calls in call order', async () => {
    const Confirm = makeConfirm()
    const wrapper = mount(Confirm)

    Confirm.call({ message: 'first' })
    Confirm.call({ message: 'second' })
    await nextTick()

    const items = wrapper.findAll('.confirm')
    expect(items).toHaveLength(2)
    expect(items[0]?.text()).toContain('first')
    expect(items[1]?.text()).toContain('second')
  })

  it('removes an ended call from the stack immediately with unmountingDelay 0', async () => {
    const Confirm = makeConfirm()
    const wrapper = mount(Confirm)

    Confirm.call({ message: 'only' })
    await nextTick()
    await wrapper.find('.yes').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()

    expect(wrapper.findAll('.confirm')).toHaveLength(0)
  })

  it('keeps an ended call mounted for unmountingDelay ms before removing it', async () => {
    const Confirm = createCallable<Props, Response>(
      (props: PropsWithCall<Props, Response, Record<string, never>>) =>
        h('div', { class: 'confirm' }, props.call.ended ? 'ended' : 'active'),
      50,
    )
    const wrapper = mount(Confirm)

    const promise = Confirm.call({ message: 'x' })
    await nextTick()
    Confirm.end(promise, true)
    await nextTick()

    expect(wrapper.findAll('.confirm')).toHaveLength(1)
    expect(wrapper.text()).toBe('ended')

    await new Promise((resolve) => setTimeout(resolve, 60))
    await nextTick()
    expect(wrapper.findAll('.confirm')).toHaveLength(0)
  })

  it('resets the stack once every <Root> unmounts', async () => {
    const Confirm = makeConfirm()
    const wrapper = mount(Confirm)
    Confirm.call({ message: 'a' })
    await nextTick()
    expect(wrapper.findAll('.confirm')).toHaveLength(1)

    wrapper.unmount()
    expect(() => Confirm.call({ message: 'b' })).toThrow('No <Root> found!')
  })
})
