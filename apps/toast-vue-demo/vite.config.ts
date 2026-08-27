import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig({
  plugins: lazyPlugins(() => [vue(), UnoCSS()]),
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
})
