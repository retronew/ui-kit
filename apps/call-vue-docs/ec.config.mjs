import { defineEcConfig } from 'astro-expressive-code'

export default defineEcConfig({
  themes: ['github-light', 'github-dark'],
  customizeTheme: (theme) =>
    theme.applyHueAndChromaAdjustments({
      accents: '#42b883',
    }),
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) => (theme.type === 'dark' ? '.dark' : false),
  defaultProps: { wrap: false },
  styleOverrides: {
    focusBorder: '#2c7a55',
    codeSelectionBackground: 'rgba(66, 184, 131, 0.24)',
    codeFontFamily: 'var(--font-mono, ui-monospace, monospace)',
    uiFontFamily: 'var(--font-sans, system-ui, sans-serif)',
    borderRadius: '0.5rem',
    textMarkers: {
      markBackground: 'rgba(66, 184, 131, 0.18)',
      markBorderColor: 'rgba(44, 122, 85, 0.62)',
    },
  },
})
