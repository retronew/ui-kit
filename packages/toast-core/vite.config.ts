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
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
