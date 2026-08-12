# @retronew/toast-core

[![npm version](https://img.shields.io/npm/v/%40retronew%2Ftoast-core.svg)](https://www.npmjs.com/package/@retronew/toast-core)
[![npm downloads](https://img.shields.io/npm/dm/%40retronew%2Ftoast-core.svg)](https://www.npmjs.com/package/@retronew/toast-core)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/%40retronew%2Ftoast-core)](https://bundlephobia.com/package/@retronew/toast-core)
[![License: MIT](https://img.shields.io/npm/l/%40retronew%2Ftoast-core.svg)](../../LICENSE)

Framework-agnostic, **headless** toast state machine. It owns the toast list,
auto-dismiss timers, pause/resume, max-stack and promise lifecycles — and
renders **nothing**. Framework adapters (`@retronew/toast-vue`, and future
React / Svelte / vanilla bindings) subscribe to it and handle rendering.

## Install

```bash
pnpm add @retronew/toast-core
```

## Usage

```ts
import { ToastStore, createToastApi } from '@retronew/toast-core'

const store = new ToastStore<string>({ max: 3, removeDelay: 1000, viewportOffset: 16 })
const toast = createToastApi(store)

const unsubscribe = store.subscribe(({ toasts, viewportOffset }) => {
  // render `toasts` however you like — this is the headless seam
  // numbers in `viewportOffset` represent pixels
  console.log(toasts, viewportOffset)
})

toast.success('Saved!')
toast.promise(saveUser(), {
  loading: 'Saving…',
  success: 'Saved!',
  error: 'Failed.',
})

unsubscribe()
```

Live countdown snapshots are opt-in so consumers that do not render progress
bars do not re-render every 250ms:

```ts
store.subscribe(render, { progress: true })
```

## API surface

- `ToastStore` — `create` / `update` / `dismiss` / `remove` / `pause` /
  `resume` / `setViewportOffset` / `subscribe` / `getState` / `destroy`.
- `createToastApi(store)` — ergonomic `toast()` with `.success` / `.error` /
  `.loading` / `.info` / `.warning` / `.custom` / `.promise` / `.dismiss` /
  `.update` / `.remove`.

`pause`/`resume` accept an optional reason (`manual`, `interaction`, or
`visibility`), and independent reasons do not overwrite one another. Optional
fields can be cleared through `update(id, { action: null })` (also `cancel`,
`meta`, and `position`).

All mutators except `create()` return a boolean indicating whether state or an
internal pause reason changed. Missing ids, empty patches, identical values,
and repeated dismiss/remove calls return `false` without notifying subscribers.

Visible errors deduplicate by position by default. Supply `errorDedupeKey` to
group them by application identity instead:

```ts
const store = new ToastStore({
  errorDedupeKey: ({ meta }) => String(meta?.requestId),
})
```

Equal keys reuse the visible error toast, apply the latest options, reset its
timer, and emit a `shake` effect. Different keys create independent errors.

All toast content is generic (`Toast<T>`), so messages can be strings, VNodes,
render functions, or any custom payload your renderer understands.

## Claude Code skill

This package ships a [Claude Code skill](skills/toast-core/SKILL.md) covering
the store lifecycle, stacking, timers, and the `onEffect`/dedup model. Claude
Code doesn't auto-discover skills inside `node_modules` yet, so after
installing, copy or symlink it into your project:

```bash
mkdir -p .claude/skills
cp -r node_modules/@retronew/toast-core/skills/toast-core .claude/skills/toast-core
```
