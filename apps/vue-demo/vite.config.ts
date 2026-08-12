import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite-plus'
import { lazyPlugins } from 'vite-plus'

export default defineConfig({
  plugins: lazyPlugins(() => [vue(), UnoCSS()]),
  fmt: {},
})
