// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

interface Props {
  message: string
}

function Message(props: PropsWithCall<Props, void, {}>) {
  return h('p', { class: 'message' }, props.message)
}

describe('SSR to client lifecycle', () => {
  it('registers normally on the client after a server render', async () => {
    const Callable = createCallable<Props>(Message)
    const serverMarkup = await renderToString(createSSRApp(Callable))
    expect(serverMarkup).not.toContain('message')

    const wrapper = mount(Callable)
    void Callable.call({ message: 'client' })
    await nextTick()

    expect(wrapper.find('.message').text()).toBe('client')
  })
})
