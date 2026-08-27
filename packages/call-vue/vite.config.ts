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
    entry: ['src/index.ts', 'src/mutation-flow/index.ts'],
    dts: {
      tsgo: true,
    },
    // `vue` is external — consumers depend on, not bundle, it.
    deps: {
      neverBundle: ['vue'],
    },
    // The unminified output keeps full JSDoc comments, which dominates its
    // size (~4.5kB vs ~1.7kB minified). Type declarations stay untouched.
    minify: true,
  },
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 84,
        functions: 94,
        lines: 96,
        statements: 95,
      },
    },
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
})
