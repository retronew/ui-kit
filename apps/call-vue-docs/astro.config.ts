import { fileURLToPath } from 'node:url'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vue from '@astrojs/vue'
import tailwindcss from '@tailwindcss/vite'
import expressiveCode from 'astro-expressive-code'

const callVuePath = (path: string) =>
  fileURLToPath(new URL(`../../packages/call-vue/${path}`, import.meta.url))

export default {
  site: 'https://call-vue.retronew.dev',
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
