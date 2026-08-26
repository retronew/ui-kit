# @retronew/call-vue

[![npm version](https://img.shields.io/npm/v/%40retronew%2Fcall-vue.svg)](https://www.npmjs.com/package/@retronew/call-vue)
[![npm downloads](https://img.shields.io/npm/dm/%40retronew%2Fcall-vue.svg)](https://www.npmjs.com/package/@retronew/call-vue)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/%40retronew%2Fcall-vue)](https://bundlephobia.com/package/@retronew/call-vue)
[![License: MIT](https://img.shields.io/npm/l/%40retronew%2Fcall-vue.svg)](../../LICENSE)

Call & await Vue components like async functions. A Vue 3 port of
[`react-call`](https://github.com/desko27/react-call)'s core API
(`createCallable`, `call`/`upsert`/`end`/`update`) built on native Vue
reactivity — no context providers, no global store to wire up.

## Why

Confirmation dialogs, prompts, and toasts are usually one-off components you
have to mount, manage `v-model`/visibility for, and thread a resolve callback
through. `createCallable` turns the component itself into an awaitable
function:

```ts
const confirmed = await Confirm.call({ message: 'Delete this file?' })
if (confirmed) deleteFile()
```

No global state, no extra store — `<Confirm />` mounted once *is* the stack.

## Install

```bash
pnpm add @retronew/call-vue
```

## Quick start

1. Define the component. It receives your own props **plus** an injected
   `call` prop carrying the imperative context for this instance:

```vue
<!-- Confirm.vue -->
<script setup lang="ts">
import type { PropsWithCall } from '@retronew/call-vue'

type Props = { message: string }
type Response = boolean

defineProps<PropsWithCall<Props, Response, Record<string, never>>>()
</script>

<template>
  <div class="dialog">
    <p>{{ message }}</p>
    <button @click="call.end(true)">Yes</button>
    <button @click="call.end(false)">No</button>
  </div>
</template>
```

2. Wrap it with `createCallable` and mount the result once, anywhere near the
   root of your app:

```ts
// confirm.ts
import { createCallable } from '@retronew/call-vue'
import ConfirmDialog from './Confirm.vue'

export const Confirm = createCallable<{ message: string }, boolean>(ConfirmDialog)
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { Confirm } from './confirm'
</script>

<template>
  <Confirm />
  <!-- rest of the app -->
</template>
```

3. Call it like an async function, from anywhere:

```ts
import { Confirm } from './confirm'

async function handleDelete() {
  const confirmed = await Confirm.call({ message: 'Delete this file?' })
  if (confirmed) await deleteFile()
}
```

## API

- **`Confirm.call(props)`** → `Promise<Response>` — pushes a new instance onto
  the stack; resolves when that instance's `call.end(response)` runs.
- **`Confirm.upsert(props)`** → `Promise<Response>` — like `call`, but reuses
  the in-flight instance instead of stacking a new one while one is still
  open. Ideal for a single "status" toast whose props change over time
  (`Confirm.upsert({ text: 'Uploading… 42%' })`).
- **`Confirm.end(response)`** / **`Confirm.end(promise, response)`** —
  resolve every open call, or just the one identified by the promise `call()`/
  `upsert()` returned.
- **`Confirm.update(props)`** / **`Confirm.update(promise, props)`** —
  shallow-merge partial props into every open call, or just one, without
  resolving it.
- **`call.key`**, **`call.ended`**, **`call.index`**, **`call.stackSize`**,
  **`call.root`** — read inside the component: stable identity, whether
  `end()` already ran (so you can key an exit transition off it), this
  instance's position in the stack, how many are open, and whatever props
  were passed to `<Confirm rootProp="…" />`.

See the [Claude Code skill](skills/call-vue/SKILL.md) for the stacking model,
`unmountingDelay` exit-transition pattern, and the single-`<Root>` constraint
in depth.

## Exit transitions

Pass a second argument to `createCallable` to keep an ended call mounted
for N milliseconds — long enough for a `<Transition>` to play — before it's
actually removed from the stack:

```ts
export const Toast = createCallable<Props, Response>(ToastCard, 200 /* ms */)
```

Inside `ToastCard`, branch on `call.ended` to trigger the leave state.

## Stacking

Every `call()` while a previous one is still open stacks on top of it —
`<Confirm />` renders one component instance per open call, each with its own
`call.index`/`call.stackSize`. Nothing is queued or hidden automatically;
that's a decision your component makes (e.g. only rendering the top of the
stack, or rendering all of them with a depth-based transform).

## Constraints

- Exactly **one** `<Confirm />` may be mounted at a time. `call()`/`upsert()`
  throw `No <Root> found!` if none is mounted yet, or
  `Multiple instances of <Root> found!` if more than one is.
- Unmounting `<Confirm />` resets its stack — a fresh mount always starts
  empty.

## Claude Code skill

This package ships a [Claude Code skill](skills/call-vue/SKILL.md) covering
the stack/upsert model, exit-transition timing, and the single-`<Root>`
constraint. Claude Code doesn't auto-discover skills inside `node_modules`
yet, so after installing, copy or symlink it into your project:

```bash
mkdir -p .claude/skills
cp -r node_modules/@retronew/call-vue/skills/call-vue .claude/skills/call-vue
```

## Credits

API design ported from [`react-call`](https://github.com/desko27/react-call)
by [@desko27](https://github.com/desko27), reimplemented from scratch on Vue
3 reactivity primitives (`shallowRef`, no `useSyncExternalStore` equivalent
needed).
