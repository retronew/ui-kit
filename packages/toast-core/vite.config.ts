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
    dts: {
      tsgo: true,
    },
    entry: ['src/index.ts'],
  },
  test: {
    coverage: {
      include: ['src/**/*.ts'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 91,
        functions: 96,
        lines: 96,
        statements: 93,
      },
    },
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
