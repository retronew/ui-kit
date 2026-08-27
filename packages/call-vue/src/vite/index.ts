import type { Plugin } from 'vite'
import { transformInjectDisplayNames } from './transform'

const SUPPORTED_FILE_RE = /\.(?:[cm]?[jt]sx?)$/

/**
 * Assigns a stable displayName to top-level Callables during Vite development.
 * The core uses that name to retain an open Stack across a module hot update.
 */
export default function callVue(): Plugin {
  let active = false

  return {
    name: 'call-vue',
    enforce: 'pre',
    configResolved(config) {
      active = config.command === 'serve' || config.mode === 'development'
    },
    transform(code, id) {
      if (!active || id.includes('node_modules') || !SUPPORTED_FILE_RE.test(id)) return null

      const transformed = transformInjectDisplayNames(code, id)
      return transformed === null ? null : { code: transformed, map: null }
    },
  }
}
