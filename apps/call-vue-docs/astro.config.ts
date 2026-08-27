import { fileURLToPath } from 'node:url'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vue from '@astrojs/vue'
import tailwindcss from '@tailwindcss/vite'
import expressiveCode from 'astro-expressive-code'
import { locales } from './src/i18n'

const callVuePath = (path: string) =>
  fileURLToPath(new URL(`../../packages/call-vue/${path}`, import.meta.url))

export default {
  site: 'https://call-vue.retronew.dev',
  // English pages live unprefixed at the site root (prefixDefaultLocale:
  // false); zh-cn/ja live under literal src/pages/<locale>/ folders, which
  // is what lets Astro.currentLocale resolve correctly for them.
  i18n: {
    defaultLocale: 'en',
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [expressiveCode(), mdx(), vue(), sitemap()],
  vite: {
    plugins: tailwindcss(),
    resolve: {
      dedupe: ['vue'],
      alias: [
        {
          find: /^@retronew\/call-vue$/,
          replacement: callVuePath('src/index.ts'),
        },
        {
          find: /^@retronew\/call-vue\/package\.json$/,
          replacement: callVuePath('package.json'),
        },
      ],
    },
  },
}
