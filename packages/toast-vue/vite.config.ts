import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {},
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  pack: {
    entry: ['src/index.ts'],
    dts: {
      tsgo: true,
    },
    // `vue` and the core are external — adapters depend on, not bundle, them.
    deps: {
      neverBundle: ['vue', '@retronew/toast-core'],
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
})
