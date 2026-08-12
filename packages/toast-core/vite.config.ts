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
        branches: 84,
        functions: 80,
        lines: 89,
        statements: 85,
      },
    },
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
