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
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0,
      },
    },
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
})
