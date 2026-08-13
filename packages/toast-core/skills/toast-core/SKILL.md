---
name: toast-core
description: Use this skill whenever working with @retronew/toast-core — the framework-agnostic headless toast state machine that powers @retronew toast adapters (e.g. @retronew/toast-vue). Trigger it when the user wants to build a new framework adapter (React, Svelte, vanilla JS) on top of ToastStore, write/debug logic against ToastStore or createToastApi directly, understand the toast lifecycle (visible → dismissed → removed), the error-dedup/shake behavior, stacking (`max`/`stacked`), viewport offset configuration, or auto-dismiss timer semantics (pause/resume, Infinity duration). Also use it when the user asks "how do I use toast-core" or mentions ToastStore, ToastEffect, or createToastApi by name.
---

# @retronew/toast-core

Framework-agnostic toast state machine. Owns the toast list, auto-dismiss timers, and pub/sub — zero rendering, zero DOM. Every framework adapter (Vue, and any future React/Svelte one) is a thin layer over this.

## Core objects

- **`ToastStore<T>`** — the state machine. `T` is the shape of a toast's `message`.
- **`createToastApi(store)`** — wraps a store with the ergonomic `toast(...)`, `toast.success(...)`, `toast.promise(...)` etc. API.
- Both are usually paired: a framework adapter creates one `ToastStore` singleton and one `ToastApi` bound to it.

```ts
import { ToastStore, createToastApi } from '@retronew/toast-core'

const store = new ToastStore({ max: 3, viewportOffset: 16 })
const toast = createToastApi(store)

toast.success('Saved!')
toast('Plain message')
toast.promise(fetchThing(), { loading: 'Loading…', success: 'Done!', error: 'Failed' })
```

## Subscribing to state

`ToastStore` has **two separate subscription channels** — don't conflate them:

1. **`store.subscribe(listener)`** — persistent state. Fires on every toast list or global layout-hint change (create/update/dismiss/remove/pause/resume/height/viewport-offset change). `listener` receives `{ toasts: Toast<T>[], viewportOffset: number | string }`. This is what a framework adapter's reactive wrapper (e.g. Vue's `useToaster`) subscribes to for its refs/signals.
2. **`store.onEffect(listener)`** — one-shot signals, currently just `{ type: 'shake', id }` (fired when a duplicate error re-emphasizes an existing toast instead of queueing a new one — see "Error dedup" below). **Effects are not part of a `Toast` record** and never appear in `getState()`. If you're tempted to add a "bumped counter" field to `Toast` to drive a UI animation, use `onEffect` instead — it's an actual event, not persisted state a consumer has to diff.

Both return an unsubscribe function.

## Toast lifecycle

`status: 'visible' | 'dismissed'`. There's a third implicit state — "removed" — which just means the toast is gone from `store.getState().toasts` entirely:

```
create() → visible ──dismiss()──→ dismissed ──(after `removeDelay`ms)──→ gone
                                       │
                              remove() can skip straight here
```

`dismiss()` doesn't delete the toast immediately — it flips `status` to `'dismissed'` and schedules `remove()` after `config.removeDelay` (default 1000ms). This gives a UI layer time to play an exit animation before the toast actually disappears from the list. If your adapter's UI removes the DOM node the instant `status` changes, exit animations never play — key it on `status`, not on list membership.

## Stacking (`max` / `stacked`)

`new ToastStore({ max: 3 })` caps how many toasts are "active" at once (oldest of the overflow get `stacked: true`, timer suspended). This is **not** a visual behavior — `ToastStore` doesn't compute positions or stack/queue layouts. It just flags which toasts should have their timers paused because a UI layer is choosing not to show them yet (queued) or is showing them piled into a stack. The UI layer decides what `stacked: true` *looks like*.

Call `store.setMax(n)` to change the cap at runtime; it restacks immediately.
It returns `true` when the cap changed and `false` for an identical value.

`store.setHeight(id, height)` records a toast's rendered height — needed by adapters that compute stacking offsets from cumulative heights (e.g. `toast-vue`'s `calculateOffset`). Framework-agnostic core, framework-specific offset math.

## Viewport offset

`viewportOffset` is the core-owned global layout hint for the gap between an outlet and the viewport edge. Configure it with `new ToastStore({ viewportOffset })`; the default is `16`. A number represents pixels, while a string may be any renderer-supported length such as `'1.5rem'` or `'max(16px, env(safe-area-inset-top))'`.

It is published in `getState()` and every `subscribe()` snapshot. Call `store.setViewportOffset(value)` to change it at runtime; adapters should mirror it into their native reactive primitive. Core stores the value but never touches the DOM, so the renderer remains responsible for applying it (for example as CSS `inset`). Use the exported `toViewportOffsetCss(offset)` to resolve it to a CSS length (`number → 'Npx'`, strings pass through) instead of hand-rolling that check in every consumer.

## Error dedup + shake

Creating a `type: 'error'` toast while another error toast with the same
deduplication key is still `status: 'visible'` does **not** queue a second one.
The default key is the toast position. The existing toast receives the latest
options, its timer resets, and the store emits `{ type: 'shake', id }` via
`onEffect`. Non-error types are never deduped this way.

```ts
toast.error('Network request failed') // creates toast A
toast.error('Network request failed') // no new toast — A gets a shake effect
toast.error('Timed out')              // still just A — message updates, another shake effect
```

Applications can supply `errorDedupeKey` when constructing the store:

```ts
const store = new ToastStore({
  errorDedupeKey: ({ meta }) => String(meta?.requestId),
})
```

Return a stable primitive. Equal keys share a visible error even across
positions; different keys remain independent.

## Mutator return values and no-ops

`update`, `dismiss`, `remove`, `pause`, `resume`, `setHeight`, `setMax`,
`setViewportOffset`, and `destroy` return `true` only when they change state or
an internal pause reason. Missing ids, empty/identical updates, and repeated
operations return `false` and do not notify state subscribers. `create`
continues to return the toast id.

If you're building a UI layer, subscribe to `onEffect` and play a decorative "shake"/re-emphasis animation on the matching toast id when you see `type: 'shake'`. Don't try to derive this from `subscribe()`/state diffing — the effect can fire on updates that otherwise look identical to the previous state (e.g. the "same message repeated" case above only bumps `updatedAt`).

## Timers

- `duration: number` per toast; `Infinity` (or `0` via options normalization) disables auto-dismiss.
- `pause(id?, reason?)` / `resume(id?, reason?)` — suspend/restart the countdown, preserving elapsed time. Reasons are `manual` (default), `interaction`, and `visibility`; the timer resumes only after every active reason is released. Omit `id` to affect every current toast.
- Stacked or non-visible toasts never have a running timer regardless of `paused` — see `syncTimer` in `store.ts` if you need the exact precedence rules.
- The store auto-pauses everything with the independent `visibility` reason while the tab is backgrounded, so foregrounding never releases an interaction/manual pause.
- `getRemaining(id)` / `getProgress(id)` — live countdown data (ms left / `1→0` fraction), pause-and-stack-aware, computed on demand rather than stored. Periodic 250ms snapshots are opt-in via `store.subscribe(listener, { progress: true })`; ordinary subscribers only receive real state changes.

## Building a new framework adapter

The pattern every adapter follows (see `packages/toast-vue/src/toast.ts` and `useToaster.ts` for a complete reference implementation):

1. One shared `ToastStore` singleton + `createToastApi(store)` bound to it, exported as `toast`.
2. A reactive wrapper subscribing via `store.subscribe(...)`, exposing both `toasts` and `viewportOffset` through the framework's native reactive primitives (Vue refs, React state, Svelte stores, ...).
3. Expose `store.onEffect(...)` somewhere a UI component can reach it, for the shake/re-emphasis behavior.
4. Support scoped instances: export a `createToaster(config)` that makes an independent `{ store, toast }` pair, for consumers who don't want the shared singleton (tests, multiple isolated toast regions on one page).
5. Stay headless: don't ship a stacking algorithm as *the* answer inside the adapter's core — expose the raw ingredients (`toasts`, `height`, `viewportOffset`, `calculateOffset`-style helpers) and let the consuming app decide how toasts are positioned and stacked. `toast-core` and its adapters intentionally never hardcode colors, animation curves, or DOM layout.
