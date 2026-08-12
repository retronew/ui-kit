import { defineConfig } from 'vite-plus'

export default defineConfig({
  fmt: {
    ignorePatterns: ['**/*.md'],
    singleQuote: true,
    semi: false,
    tabWidth: 2,
    sortImports: {
      newlinesBetween: false,
    },
  },

  lint: {
    ignorePatterns: ['**/*.md'],
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      'vite-plus/prefer-vite-plus-imports': 'error',
      'typescript/no-explicit-any': 'error',
    },
  },

  run: {
    cache: true,
  },

  staged: {
    '*': 'vp check --fix',
  },
})
