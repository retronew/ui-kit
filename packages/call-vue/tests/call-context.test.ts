// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h, nextTick } from 'vue'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

interface Props {
  id: string
}

function Probe(props: PropsWithCall<Props, void, {}>) {
  return h('div', {
    class: 'probe',
    'data-id': props.id,
    'data-index': props.call.index,
    'data-key': props.call.key,
    'data-stack-size': props.call.stackSize,
  })
}

describe('CallContext', () => {
  it('projects stable keys and zero-based indexes in stack order', async () => {
    const Callable = createCallable<Props>(Probe)
    const wrapper = mount(Callable)
    void Callable.call({ id: 'a' })
    void Callable.call({ id: 'b' })
    void Callable.call({ id: 'c' })
    await nextTick()

    const probes = wrapper.findAll('.probe')
    expect(probes.map((probe) => probe.attributes('data-index'))).toEqual(['0', '1', '2'])
    expect(new Set(probes.map((probe) => probe.attributes('data-key'))).size).toBe(3)
  })

  it('updates stackSize for every active item', async () => {
    const Callable = createCallable<Props>(Probe)
    const wrapper = mount(Callable)
    void Callable.call({ id: 'a' })
    await nextTick()
    expect(wrapper.find('.probe').attributes('data-stack-size')).toBe('1')

    void Callable.call({ id: 'b' })
    await nextTick()
    expect(wrapper.findAll('.probe').map((probe) => probe.attributes('data-stack-size'))).toEqual([
      '2',
      '2',
    ])
  })

  it('passes root props to calls and reacts to root prop changes', async () => {
    interface RootProps {
      accent: string
    }

    function RootProbe(props: PropsWithCall<Props, void, RootProps>) {
      return h('div', { class: 'root-probe' }, `${props.id}:${props.call.root.accent}`)
    }

    const Callable = createCallable<Props, void, RootProps>(RootProbe)
    const wrapper = mount(Callable, { props: { accent: 'indigo' } })
    void Callable.call({ id: 'a' })
    await nextTick()
    expect(wrapper.text()).toBe('a:indigo')

    await wrapper.setProps({ accent: 'violet' })
    expect(wrapper.text()).toBe('a:violet')
  })
})
