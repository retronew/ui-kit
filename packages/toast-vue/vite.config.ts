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
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 83,
        functions: 82,
        lines: 93,
        statements: 92,
      },
    },
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
})
