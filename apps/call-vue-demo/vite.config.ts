import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite-plus'

// The workspace has two structurally-similar `Plugin`/`UserConfig` types in
// scope at once (vite-plus's own `vite` alias vs. the real `vite` package
// pulled in transitively by unocss/@vitejs/plugin-vue's peers), which makes
// `tsgo` time out comparing them ("Excessive stack depth"/"No overload
// matches this call") once `plugins` is populated — the same failure
// already present, uncaught, in apps/toast-vue-demo/vite.config.ts. Not a
// call-vue-demo-specific issue; routing the config through `unknown` (not
// a direct `as` between the two structurally-similar types) sidesteps the
// comparison entirely instead of asking `tsgo` to resolve it.
const config = {
  plugins: [vue(), UnoCSS()],
  fmt: {},
  test: {
    coverage: {
      include: ['src/**/*.{ts,vue}'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0,
      },
    },
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
}

export default defineConfig(config as unknown as Parameters<typeof defineConfig>[0])
