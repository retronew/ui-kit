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
      // Dark mode is toggled via a `.dark` class on <html> (see useTheme), not media queries.
      dark: 'class',
    }),
    presetIcons({
      collections: {
        lucide: () => import('@iconify-json/lucide/icons.json').then((i) => i.default),
      },
    }),
  ],
  shortcuts: {
    // Active state is driven by the `data-active` attribute, not a class swap.
    'demo-btn':
      'relative inline-flex cursor-pointer items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] font-medium leading-[1.4] text-fg transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-muted data-[active=true]:border-surface-strong data-[active=true]:bg-surface-strong data-[active=true]:text-fg-on-strong data-[active=true]:hover:bg-surface-strong-hover',
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
