import { describe, expect, it } from 'vite-plus/test'
import { createSSRApp, h } from 'vue'
// @vitest-environment node
import { renderToString } from 'vue/server-renderer'
import { createCallable } from '../src/index.ts'
import type { PropsWithCall } from '../src/index.ts'

type Props = { message: string }

function Message(props: PropsWithCall<Props, void, Record<string, never>>) {
  return h('p', props.message)
}

describe('server rendering', () => {
  it('does not register a client root during SSR', async () => {
    const Callable = createCallable<Props>(Message)

    await renderToString(createSSRApp(Callable))

    expect(() => Callable.call({ message: 'server' })).toThrow('No <Root> found!')
    expect(() => Callable.upsert({ message: 'server' })).toThrow('No <Root> found!')
  })

  it('can render the same callable root across multiple requests', async () => {
    const Callable = createCallable<Props>(Message)

    await renderToString(createSSRApp(Callable))
    await expect(renderToString(createSSRApp(Callable))).resolves.toBeTypeOf('string')

    expect(() => Callable.call({ message: 'server' })).toThrow('No <Root> found!')
  })
})
