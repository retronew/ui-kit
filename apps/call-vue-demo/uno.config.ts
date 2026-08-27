import { defineConfig, presetIcons, presetWind4, transformerVariantGroup } from 'unocss'

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.(vue|[jt]sx|mdx?|html)($|\?)/, 'src/**/*.{js,ts}'],
      exclude: [],
    },
  },
  presets: [
    presetWind4({
      // Dark mode is toggled via a `.dark` class on <html> (see the inline
      // bootstrap script in index.html), not media queries.
      dark: 'class',
    }),
    presetIcons({
      collections: {
        lucide: () => import('@iconify-json/lucide/icons.json').then((i) => i.default),
      },
    }),
  ],
  shortcuts: {
    'demo-btn':
      "relative inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-surface px-3.5 py-1.5 text-[13px] font-medium leading-[1.4] text-fg transition-[color,background-color,border-color,transform] duration-150 hover:bg-surface-hover active:scale-96 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-muted motion-reduce:transform-none after:absolute after:-inset-y-2 after:inset-x-0 after:content-['']",
    'demo-btn-strong':
      "relative inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-surface-strong bg-surface-strong px-3.5 py-1.5 text-[13px] font-medium leading-[1.4] text-fg-on-strong transition-[color,background-color,border-color,transform] duration-150 hover:bg-surface-strong-hover active:scale-96 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-muted motion-reduce:transform-none after:absolute after:-inset-y-2 after:inset-x-0 after:content-['']",
  },
  theme: {
    font: {
      mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    },
    colors: {
      fg: {
        DEFAULT: 'var(--fg)',
        muted: 'var(--fg-muted)',
        'on-strong': 'var(--surface-strong-fg)',
      },
      surface: {
        DEFAULT: 'var(--surface)',
        hover: 'var(--surface-hover)',
        strong: 'var(--surface-strong)',
        'strong-hover': 'var(--surface-strong-hover)',
      },
      border: 'var(--border)',
    },
  },
  transformers: [transformerVariantGroup()],
})
