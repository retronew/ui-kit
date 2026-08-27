// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h, nextTick } from 'vue'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

type Props = { message: string }

function Dialog(props: PropsWithCall<Props, void, Record<string, never>>) {
  return h('div', { 'data-testid': `dialog-${props.message}` }, props.message)
}

describe('HMR persistence registry', () => {
  it('keeps the first displayName assignment', () => {
    const callable = createCallable<Props>(Dialog)
    callable.displayName = 'CallVueNameWins'
    callable.displayName = 'IgnoredName'

    expect(callable.displayName).toBe('CallVueNameWins')
  })

  it('allows a real displayName after a falsy assignment', () => {
    const callable = createCallable<Props>(Dialog)
    callable.displayName = undefined
    callable.displayName = 'CallVueNameAfterFalsy'

    expect(callable.displayName).toBe('CallVueNameAfterFalsy')
  })

  it('adopts a mounted Root store with the same displayName', async () => {
    const beforeUpdate = createCallable<Props>(Dialog)
    beforeUpdate.displayName = 'CallVueHmrPersist'
    const wrapper = mount(beforeUpdate)

    const afterUpdate = createCallable<Props>(Dialog)
    afterUpdate.displayName = 'CallVueHmrPersist'
    void afterUpdate.call({ message: 'survives' })
    await nextTick()

    expect(wrapper.get('[data-testid="dialog-survives"]').text()).toBe('survives')
    wrapper.unmount()
  })
})
