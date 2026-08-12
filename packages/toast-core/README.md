# @retronew/toast-core

Framework-agnostic, **headless** toast state machine. It owns the toast list,
auto-dismiss timers, pause/resume, max-stack and promise lifecycles — and
renders **nothing**. Framework adapters (`@retronew/toast-vue`, and future
React / Svelte / vanilla bindings) subscribe to it and handle rendering.

## Install

```bash
vp install @retronew/toast-core
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

## API surface

- `ToastStore` — `create` / `update` / `dismiss` / `remove` / `pause` /
  `resume` / `setViewportOffset` / `subscribe` / `getState` / `destroy`.
- `createToastApi(store)` — ergonomic `toast()` with `.success` / `.error` /
  `.loading` / `.info` / `.warning` / `.custom` / `.promise` / `.dismiss` /
  `.update` / `.remove`.

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
