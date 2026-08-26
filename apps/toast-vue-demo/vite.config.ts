import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite-plus'

// The workspace has two structurally-similar `Plugin`/`UserConfig` types in
// scope at once (vite-plus's own `vite` alias vs. the real `vite` package
// pulled in transitively by unocss/@vitejs/plugin-vue's peers), which makes
// `tsgo` time out comparing them ("Excessive stack depth"/"No overload
// matches this call") once `plugins` is populated. Routing the config
// through `unknown` (not a direct `as` between the two structurally-similar
// types) sidesteps the comparison entirely instead of asking `tsgo` to
// resolve it. See apps/call-vue-demo/vite.config.ts for the identical fix.
const config = {
  plugins: [vue(), UnoCSS()],
  fmt: {},
  test: {
    coverage: {
      include: ['src/**/*.{ts,vue}'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 11,
        functions: 15,
        lines: 24,
        statements: 23,
      },
    },
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
}

export default defineConfig(config as unknown as Parameters<typeof defineConfig>[0])
