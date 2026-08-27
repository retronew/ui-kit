import { describe, expect, it } from 'vite-plus/test'
import callVue from '../src/vite/index.ts'
import { transformInjectDisplayNames } from '../src/vite/transform.ts'

describe('@retronew/call-vue/vite', () => {
  it('adds names to direct top-level createCallable declarations', () => {
    const source =
      "import { createCallable as create } from '@retronew/call-vue'\nexport const Confirm = create(Dialog)\nconst Toast = create(ToastView)"

    expect(transformInjectDisplayNames(source, '/src/callables.ts')).toBe(
      `${source}\nConfirm.displayName = "Confirm";\nToast.displayName = "Toast";\n`,
    )
  })

  it('does not overwrite manual names or transform unsupported declarations', () => {
    const source = `
import { createCallable } from '@retronew/call-vue'
export const Confirm = createCallable(Dialog)
Confirm.displayName = 'Dialog'
let Toast = createCallable(ToastView)
export default createCallable(DefaultView)
function nested() { const Nested = createCallable(NestedView) }
`

    expect(transformInjectDisplayNames(source, '/src/callables.ts')).toBeNull()
  })

  it('returns null instead of throwing on unparsable source', () => {
    const source = "createCallable('unterminated string"

    expect(transformInjectDisplayNames(source, '/src/callables.ts')).toBeNull()
  })

  it('treats a development mode as active even outside serve', async () => {
    const plugin = callVue()
    if (typeof plugin.configResolved !== 'function') throw new Error('Expected a config hook')
    const resolveConfig = plugin.configResolved as unknown as (
      config: unknown,
    ) => void | Promise<void>
    await resolveConfig({ command: 'build', mode: 'development' })
    if (typeof plugin.transform !== 'function') throw new Error('Expected a transform hook')
    const transform = plugin.transform as unknown as (
      code: string,
      id: string,
    ) => { code: string; map: null } | null | Promise<{ code: string; map: null } | null>

    expect(
      await transform(
        "import { createCallable } from '@retronew/call-vue'; const Confirm = createCallable(Dialog)",
        '/src/confirm.ts',
      ),
    ).not.toBeNull()
  })

  it('is inactive outside development, and skips files without a Callable', async () => {
    const plugin = callVue()
    if (typeof plugin.configResolved !== 'function') throw new Error('Expected a config hook')
    const resolveConfig = plugin.configResolved as unknown as (
      config: unknown,
    ) => void | Promise<void>
    await resolveConfig({ command: 'build', mode: 'production' })
    if (typeof plugin.transform !== 'function') throw new Error('Expected a transform hook')
    const transform = plugin.transform as unknown as (
      code: string,
      id: string,
    ) => { code: string; map: null } | null | Promise<{ code: string; map: null } | null>

    expect(
      await transform(
        "import { createCallable } from '@retronew/call-vue'; const Confirm = createCallable(Dialog)",
        '/src/confirm.ts',
      ),
    ).toBeNull()

    await resolveConfig({ command: 'serve', mode: 'production' })
    expect(await transform('export const x = 1', '/src/plain.ts')).toBeNull()
  })

  it('only transforms during dev serve and skips dependencies', async () => {
    const plugin = callVue()
    if (typeof plugin.configResolved !== 'function') throw new Error('Expected a config hook')
    const resolveConfig = plugin.configResolved as unknown as (
      config: unknown,
    ) => void | Promise<void>
    await resolveConfig({ command: 'serve', mode: 'development' })
    if (typeof plugin.transform !== 'function') throw new Error('Expected a transform hook')
    const transform = plugin.transform as unknown as (
      code: string,
      id: string,
    ) => { code: string; map: null } | null | Promise<{ code: string; map: null } | null>

    expect(
      await transform(
        "import { createCallable } from '@retronew/call-vue'; const Confirm = createCallable(Dialog)",
        '/src/confirm.ts',
      ),
    ).toEqual({
      code: 'import { createCallable } from \'@retronew/call-vue\'; const Confirm = createCallable(Dialog)\nConfirm.displayName = "Confirm";\n',
      map: null,
    })
    expect(
      await transform(
        "import { createCallable } from '@retronew/call-vue'; const Confirm = createCallable(Dialog)",
        '/node_modules/example/index.ts',
      ),
    ).toBeNull()
  })
})
