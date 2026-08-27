---
name: call-vue
description: Reach for @retronew/call-vue (createCallable) when building UI that resolves a value back to its caller — confirmations, dialogs, form modals, toasts, notifications, context menus, pickers. Use when a Vue task involves any such "await the UI" interaction, when code imports createCallable from @retronew/call-vue, or when the user mentions call-vue, react-call, or Callables in a Vue project. If call-vue isn't a dependency yet but the problem fits, propose adding it. Covers Declare→Root→Call, call vs upsert, exit transitions, and the single-Root rule.
---

# @retronew/call-vue

`createCallable()` turns a Vue component into something you can `await`: you
call it imperatively from anywhere and it resolves with a value. This is a
Vue-native port of [`react-call`](https://github.com/desko27/react-call)'s
core API — same mental model, built on Vue's own reactivity (`shallowRef`)
instead of React's `useSyncExternalStore`.

## When to reach for it (and when not)

**Reach for it** when a piece of UI conceptually *returns a value to its
caller* and you want to `await` that value from async code: confirmations,
dialogs, form modals, toasts/notifications, context menus, pickers,
multi-step wizards.

**Propose it** if `@retronew/call-vue` isn't a dependency yet but the task
fits — then `pnpm add @retronew/call-vue`.

**Don't push it** when another solution is already in place and working —
mention it as an option, don't refactor unprompted. Skip it for purely
presentational components that return nothing, and for full-page flows better
served by routing.

## Vocabulary (use these exact terms)

- **Callable** — the value `createCallable()` returns. It is *both* a Vue
  component (mount `<Confirm />`) *and* a namespace of methods (`call`,
  `upsert`, `end`, `update`) attached to the same object. Don't call it a
  "modal/dialog/component".
- **Root** — the mounting form of the Callable: the bare `<Confirm />`
  itself. There is no separate `.Root` alias. Not a "provider/portal".
- **Call** — one imperative invocation (`Confirm.call({...})`), resolves to a
  **Response**.
- **Stack** — the ordered list of active Calls a Root renders (not a
  "queue"). Each renders as one instance of the user component.
- **CallContext** — the `call` prop your component receives: `{ end, ended,
  key, index, stackSize, root }`. Not a Vue "provide/inject context".
- **Upsert** — singleton-style Call (`upsert()`).

## The model: Declare → Root → Call

```vue
<!-- Confirm.vue -->
<script setup lang="ts">
import type { PropsWithCall } from '@retronew/call-vue'

type Props = { message: string }
type Response = boolean

// `call` is the special injected prop (the CallContext)
defineProps<PropsWithCall<Props, Response, {}>>()
</script>

<template>
  <div role="dialog">
    <p>{{ message }}</p>
    <button @click="call.end(true)">Yes</button>
    <button @click="call.end(false)">No</button>
  </div>
</template>
```

```ts
// confirm.ts — 1. Declare
import { createCallable } from '@retronew/call-vue'
import ConfirmDialog from './Confirm.vue'

export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog)
```

```vue
<!-- App.vue — 2. Root: mount once, somewhere always rendered -->
<template>
  <Confirm />
</template>
```

```ts
// 3. Call & await — from anywhere
const accepted = await Confirm.call({ message: 'Continue?' })
```

Generics are `createCallable<Props, Response, RootProps>` (all optional,
default to `void`/`void`/`{}`). `RootProps` accepts a normal interface without
extending `Record<string, unknown>`.

Plain functional components work too — `createCallable` accepts anything
matching Vue's `Component<Props>` type, including a bare
`(props) => VNode` function, which is often less ceremony than an SFC for a
tiny callable.

## Decision guide

- **`call` vs `upsert`** — `call()` opens a new Call every time (they stack).
  `upsert()` is singleton: the first invocation creates the Call, later
  `upsert()` calls update the same one and return the same promise. Use
  `upsert` for toasts, progress, loading — anything that should have at most
  one instance alive.
- **Root props vs call props** — per-Call data goes in `call()`'s props; data
  shared across every Call (theme, current user) goes in **RootProps**,
  passed as ordinary attrs to `<Confirm userName="…" />` and read back via
  `call.root` inside every mounted instance. `RootProps` arrives through
  Vue's `$attrs` under the hood — `<Root>` declares no props of its own, so
  it forwards whatever you hand it as-is.
- **End / update from the caller** — `Confirm.end(promise, value)` /
  `Confirm.update(promise, partialProps)` target one Call; omit the promise
  argument to affect every currently active Call instead.
- **Void responses** — externally, use `Toast.end(promise, undefined)` to
  target one Call and `Toast.end()` to end all Calls. Never write
  `Toast.end(promise)`: a single argument is the broadcast response position.
  Inside the component, `call.end()` is valid and ends only that instance.

## Hard rules (the common failures)

- **One Root per Callable.** Mounting `<Confirm />` in two live places throws
  *"Multiple instances of `<Root>` found!"* the next time `call()`/`upsert()`
  runs. Don't mount a Callable per-route or per-feature — mount it once, high
  in the tree (e.g. `App.vue`), same as you'd mount a single toast outlet.
- **Mount the Root where it stays alive when you call.** If the Root sits in
  a `v-if`-gated or route-unmounted subtree, `call()` from outside it throws
  *"No `<Root>` found!"*. If that's happening, check whether the Root got
  unmounted before the call, not whether `createCallable` was set up wrong.
- **Unmounting resets the stack.** A Callable's stack is scoped to its
  currently-mounted Root instance — remount it (e.g. via `v-if` toggling
  off/on, or HMR) and any Calls made against the previous mount are gone;
  there's no persistence across mounts.
- **Exit transitions** need the unmount delay as the 2nd argument to
  `createCallable`, then drive the leave state off `call.ended` (a boolean
  prop, not a Vue `<Transition>` hook by itself — combine the two):

  ```ts
  export const Toast = createCallable<Props, Response>(ToastCard, 200 /* ms */)
  ```

  Inside `ToastCard`, branch on `props.call.ended` to add a leaving class or
  swap into an exit-animation state; the instance stays mounted for 200ms
  after `end()` so a CSS transition (or Vue `<Transition>` wrapping the
  Callable's stack render) has time to play before removal.
- **SSR only registers on the client.** Repeated server renders do not count as
  mounted Roots. `call()`/`upsert()` before client `onMounted` throw
  *"No `<Root>` found!"*.
- **Async components load on demand.** Pass `defineAsyncComponent()` directly
  to `createCallable`; an empty stack does not invoke the loader. Prefer its
  `loadingComponent` and `errorComponent` options for Calls inserted after an
  already-resolved `<Suspense>` boundary.
- **SFC types need Vue tooling.** Use `vue-tsc --noEmit` to validate cross-file
  `.vue` props; a plain TypeScript shim cannot prove that the business props
  and injected `call` prop match.

## Anti-patterns

- Placing `<Confirm />` per-route or per-feature → multi-Root throw. One
  mount, reused everywhere via `.call()`.
- Reusing `call()` for singleton UI (toasts, a single progress indicator) →
  duplicate stacked instances. Use `upsert()` instead.
- Treating the Callable as a plain component to render with data props — the
  props you pass to `<Confirm />` itself are **RootProps** (shared context),
  never the per-instance data; that always goes through `.call(props)`.
- Reaching into `call.root` for data that changes per-Call — Root props are
  shared by every active Call (and react to Root prop updates); put data that
  differs per Call in the component's own props instead.
- Treating a dialog Callable as accessible by default — the library is
  headless. The user component owns naming, initial focus, Tab trapping,
  Escape behavior, focus restoration, and reduced motion.

## Quick reference

| Method | Targeted form | Untargeted form |
|---|---|---|
| `call(props)` | — | opens a new Call, returns its `Promise<Response>` |
| `upsert(props)` | — | opens or updates the pending upsert Call |
| `end(response)` / `end(promise, response)` | resolves the one Call | resolves every open Call |
| `update(props)` / `update(promise, props)` | merges into the one Call | merges into every open Call |

`call` prop shape inside the component: `{ key, end, ended, root, index,
stackSize }` — see the package [README](../../README.md) for the full field
descriptions.
