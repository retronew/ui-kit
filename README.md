# ui-kit

[![CI](https://github.com/retronew/ui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/retronew/ui-kit/actions/workflows/ci.yml)
[![toast-core npm version](https://img.shields.io/npm/v/%40retronew%2Ftoast-core.svg?label=%40retronew%2Ftoast-core)](https://www.npmjs.com/package/@retronew/toast-core)
[![toast-vue npm version](https://img.shields.io/npm/v/%40retronew%2Ftoast-vue.svg?label=%40retronew%2Ftoast-vue)](https://www.npmjs.com/package/@retronew/toast-vue)
[![License: MIT](https://img.shields.io/npm/l/%40retronew%2Ftoast-core.svg)](./LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fe5196.svg)](https://conventionalcommits.org)

A Vite+ powered **monorepo** that houses all `@retronew` frontend libraries.
The first occupant is a headless toast library; the structure is designed so
new libraries (React/Svelte/vanilla adapters, components, utilities) drop in
without reshaping anything.

## Structure

```
ui-kit/
├─ packages/                 # publishable libraries (@retronew/*)
│  ├─ toast-core/            # framework-agnostic headless toast state machine
│  └─ toast-vue/             # Vue 3 adapter (composable + renderless outlet)
├─ apps/                     # demo / playground apps (private, not published)
│  └─ toast-vue-demo/        # Vite + Vue app exercising @retronew/toast-vue
├─ vite.config.ts            # shared lint / fmt / task config
└─ pnpm-workspace.yaml       # workspace + dependency catalog
```

### Extensibility

The toast library is split into a **headless core** and thin **framework
adapters**:

- `@retronew/toast-core` — owns state, timers, pause/resume, promise flows;
  renders nothing, has no DOM/framework dependency.
- `@retronew/toast-vue` — subscribes the core to Vue reactivity.

Adding React, Svelte, or a vanilla binding later means writing a new adapter
package against the same core — the core logic is never touched.

## Toolchain (Vite+)

Everything runs through the unified `vp` CLI:

| Task                         | Command                 |
| ---------------------------- | ----------------------- |
| Install deps                 | `vp install`            |
| Install E2E Chromium         | `pnpm run e2e:install`  |
| Run the Vue demo             | `vp run toast-vue-demo#dev` |
| Format + lint + typecheck    | `pnpm run check`        |
| Test with coverage budgets   | `pnpm run test:coverage` |
| Run browser + axe tests      | `pnpm run e2e`          |
| Run core performance budgets | `pnpm run perfcheck`    |
| Build all libraries          | `pnpm run build`        |
| Full local verification      | `pnpm run ready`        |

Libraries are bundled with **tsdown** (`vp pack`), tested with **Vitest** and
Playwright/axe, and linted/formatted with **Oxlint**/**Oxfmt** (`vp check`).

## Develop

```bash
vp install
vp run toast-vue-demo#dev # open the playground
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch workflow, Conventional
Commit format, staged-file hooks, and the checks required before a pull request.
