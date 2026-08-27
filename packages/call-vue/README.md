# @retronew/call-vue

[![npm version](https://img.shields.io/npm/v/%40retronew%2Fcall-vue.svg)](https://www.npmjs.com/package/@retronew/call-vue)
[![npm downloads](https://img.shields.io/npm/dm/%40retronew%2Fcall-vue.svg)](https://www.npmjs.com/package/@retronew/call-vue)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/%40retronew%2Fcall-vue)](https://bundlephobia.com/package/@retronew/call-vue)
[![License: MIT](https://img.shields.io/npm/l/%40retronew%2Fcall-vue.svg)](../../LICENSE)

Call & await Vue components like async functions. A Vue 3 port of
[`react-call`](https://github.com/desko27/react-call)'s core API
(`createCallable`, `call`/`upsert`/`end`/`update`) built on native Vue
reactivity — no context providers, no global store to wire up.

[Documentation with live demos](https://call-vue.retronew.dev) ·
[Examples](https://call-vue.retronew.dev/examples) ·
[Concepts](https://call-vue.retronew.dev/concepts) ·
[Full API reference](https://call-vue.retronew.dev/api)

## Contents

- [Install](#install)
- [Quick start](#quick-start)
- [API](#api)
- [Exit transitions](#exit-transitions)
- [Root props and TypeScript](#root-props-and-typescript)
- [Mutation flow](#mutation-flow)
- [Vite HMR](#vite-hmr)
- [Preview host](#preview-host)
- [Async components](#async-components)
- [SSR](#ssr)
- [Stacking](#stacking)
- [Errors and troubleshooting](#errors-and-troubleshooting)
- [Capability matrix](#capability-matrix)
- [FAQ](#faq)

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

Use `npm install @retronew/call-vue`, `yarn add @retronew/call-vue`, or
`bun add @retronew/call-vue` with another package manager.

## Quick start

1. Define the component. It receives your own props **plus** an injected
   `call` prop carrying the imperative context for this instance:

```vue
<!-- Confirm.vue -->
<script setup lang="ts">
import type { PropsWithCall } from '@retronew/call-vue'

type Props = { message: string }
type Response = boolean

defineProps<PropsWithCall<Props, Response, {}>>()
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

For a `void` response, the two external forms are intentionally distinct:

```ts
const promise = Toast.upsert({ text: 'Uploading…' })

Toast.end(promise, undefined) // end only this call
Toast.end() // end every open call
```

Do not write `Toast.end(promise)`: JavaScript would otherwise interpret that
single argument as the response for the broadcast overload. The public type
rejects this form. Inside the user component, `call.end()` remains the natural
way to finish its own `void` call.

See the [Claude Code skill](skills/call-vue/SKILL.md) for the stacking model,
`unmountingDelay` exit-transition pattern, and the single-`<Root>` constraint
in depth.

### Public types

All public types are flat named exports:

| Type | Purpose |
| --- | --- |
| `CallFunction<Props, Response>` | The typed `call()` method. |
| `UpsertFunction<Props, Response>` | The typed singleton `upsert()` method. |
| `CallContext<Props, Response, RootProps>` | The injected `call` prop. |
| `PropsWithCall<Props, Response, RootProps>` | Your props merged with `call`. |
| `UserComponent<Props, Response, RootProps>` | A component accepted by `createCallable`. |
| `Callable<Props, Response, RootProps>` | The Root component plus its imperative methods. |

## Exit transitions

Pass a second argument to `createCallable` to keep an ended call mounted
for N milliseconds — long enough for a `<Transition>` to play — before it's
actually removed from the stack:

```ts
export const Toast = createCallable<Props, Response>(ToastCard, 200 /* ms */)
```

Inside `ToastCard`, branch on `call.ended` to trigger the leave state.

## Root props and TypeScript

The third generic is the type of props mounted on the Callable Root. A normal
interface works directly; it does not need to extend `Record<string, unknown>`:

```ts
interface RootProps {
  accent: string
}

export const Notice = createCallable<NoticeProps, void, RootProps>(NoticeCard)
```

```vue
<Notice accent="#6366f1" />
```

Every active card reads the current value through `call.root.accent`. Updating
the Root prop re-renders active calls. For cross-file `.vue` prop validation,
run `vue-tsc --noEmit` in addition to a plain TypeScript check; plain `tsc`
cannot inspect generated SFC props by itself.

The Callable itself is the Root component. Mount `<Notice />`; there is no
separate `.Root` alias. Its public type is Vue's general `Component` shape, so
it remains valid whether the internal Root is represented as an options object
or a functional component.

## Mutation flow

For the common “submit → await a side effect → close only on success” flow,
import the opt-in composable from its own subpath:

```vue
<script setup lang="ts">
import { toRef } from 'vue'
import type { PropsWithCall } from '@retronew/call-vue'
import { useMutationFlow, type MutationFn } from '@retronew/call-vue/mutation-flow'

type Props = { mutationFn: MutationFn<boolean> }
const props = defineProps<PropsWithCall<Props, boolean, {}>>()
const submit = useMutationFlow(props.call, toRef(props, 'mutationFn'))
</script>

<template>
  <button :disabled="submit.pending" @click="submit()">Save</button>
  <button :disabled="submit.pending" @click="props.call.end(false)">Cancel</button>
</template>
```

`MutationFn<Response, Payload>` receives only `{ end }` and decides when to
close the Call. If it returns or rejects without calling `end`, the Call stays
open and `pending` clears, so the user can retry. Errors are not swallowed.

When `mutationFn` is optional, `submit(payload).orEnd(value)` supplies a
per-button fallback response only when no handler was provided. Omitting the
chain intentionally leaves the Call open for another explicit close path.

Pass a `Ref` such as `toRef(props, 'mutationFn')` when a live Call can receive
an updated handler through `Callable.update()`.

## Async components

`defineAsyncComponent()` can be passed directly to `createCallable`. The loader
is not invoked until the first call creates a component instance:

```ts
import { defineAsyncComponent } from 'vue'
import PickerLoadError from './PickerLoadError.vue'
import PickerLoading from './PickerLoading.vue'

const AsyncPicker = defineAsyncComponent({
  loader: () => import('./PickerDialog.vue'),
  loadingComponent: PickerLoading,
  errorComponent: PickerLoadError,
  delay: 0,
})

export const Picker = createCallable<PickerProps, PickedItem>(AsyncPicker)
```

Use Vue's `loadingComponent`/`errorComponent` options when a call may be added
after its surrounding `<Suspense>` has already resolved. Ending a call while
its component is still loading does not resurrect it when the loader finishes.

## SSR

Callable Roots are safe to render repeatedly with Vue SSR: server-side setup
does not register a live Root or leak the Root count into later requests. The
user component is not rendered on the server while the stack is empty.
`call()` and `upsert()` remain client-imperative APIs and throw
`No <Root> found!` until the Root's client `onMounted` hook has run.

## Vite HMR

Install the optional Vite plugin to retain an open Call while Vite re-evaluates
the module that declares its Callable during development:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import callVue from '@retronew/call-vue/vite'

export default defineConfig({
  plugins: [vue(), callVue()],
})
```

The plugin recognizes a direct named import (including an alias) and a
top-level `const` or `export const` declaration:

```ts
import { createCallable } from '@retronew/call-vue'

export const Confirm = createCallable(ConfirmDialog)
// development transform: Confirm.displayName = 'Confirm'
```

The assigned name lets the refreshed Callable adopt the mounted Root's Stack,
so active Calls remain available after a save. It is dev-only and has no
production behavior. Namespace imports, default exports, nested declarations,
and `let`/`var` declarations are deliberately not transformed; set
`Confirm.displayName = 'Confirm'` yourself for those shapes. A manual
assignment always wins over an injected one.

## Preview host

Storybook, Histoire, and similar tools can render several isolated Vue app
trees at once. Mounting the same Callable Root in every preview violates the
single-Root invariant. Mount it once, outside the preview apps instead:

```ts
// preview.ts
import { mount } from '@retronew/call-vue/host'
import { Confirm } from './confirm'

mount(Confirm)
```

`mount()` creates one body-level `<div data-call-vue-host>` and is idempotent;
later calls reuse that Vue app and replace its rendered Root. Pass a custom
container or a wrapper when needed:

```ts
mount(Confirm, {
  container: document.querySelector('#preview-host')!,
  wrapper: PreviewProviders,
})
```

The Host is a separate Vue app, so it does not inherit `provide` values,
plugins, or component registrations from a preview. Put the required setup in
`wrapper`. This is a browser-only helper; call it from preview setup or another
client entry, never during SSR.

## Accessibility responsibility

`call-vue` controls stack and Promise lifecycles; it is deliberately headless.
Dialog semantics remain the user component's responsibility. A production
dialog should at least provide an accessible name/description, move focus
inside on open, trap Tab, close with Escape when appropriate, restore focus on
unmount, and respect reduced-motion preferences.

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

## Errors and troubleshooting

| Error or symptom | Cause and solution |
| --- | --- |
| `No <Root> found!` | Mount the returned Callable once and wait for client `onMounted` before calling it. During SSR, move the call to a client interaction. |
| `Multiple instances of <Root> found!` | The same Callable is mounted in more than one live location. Keep exactly one Root for that Callable. |
| The Promise never resolves | Every success, cancel, Escape, and backdrop path must explicitly run `call.end(response)` or an external `Callable.end(...)`. Hiding the UI is not enough. |
| Exit animation is cut off | Match `createCallable(component, unmountingDelay)` to the CSS leave duration and style against `call.ended`. |
| A targeted `void` end fails to type-check | Use `Toast.end(promise, undefined)`. `Toast.end()` is the broadcast form. |
| Root data appears missing | Read mounted Root props from `call.root`; normal call props remain top-level component props. |

The documentation site has the expanded
[troubleshooting guide](https://call-vue.retronew.dev/troubleshooting).

## Capability matrix

This package targets `react-call`'s framework-neutral core semantics, while
using Vue-native components and lifecycle primitives.

| Capability | `call-vue` | Notes |
| --- | --- | --- |
| `createCallable`, `call`, `end` | Supported | Promise and broadcast/targeted semantics match the upstream core. |
| Concurrent Stack | Supported | Every normal call remains independently active. |
| `upsert`, `update` | Supported | Singleton Promise identity and targeted/broadcast updates are covered. |
| Root props | Supported | Available reactively through `call.root`. |
| Exit lifecycle | Supported | `call.ended` plus `unmountingDelay`. |
| Vue async components | Supported | Use `defineAsyncComponent`; empty stacks stay lazy. |
| SSR-safe Root creation | Supported | Calling remains client-only. |
| `<Callable.Root />` alias | Not provided | The direct `<Callable />` Root is the only API; the legacy alias was removed rather than soft-deprecated. |
| Mutation-flow helper subpath | Supported | Import `useMutationFlow` and its types from `@retronew/call-vue/mutation-flow`. |
| Vite HMR transform | Supported | `@retronew/call-vue/vite` assigns stable dev-only names so an open Stack survives supported Vite module updates. |
| Multi-preview host helper | Supported | `@retronew/call-vue/host` owns one isolated Root for Storybook/Histoire-style repeated previews. |

Unsupported entries are deliberate capability boundaries, not hidden aliases.
Do not import `react-call`-specific subpaths from this package.

## FAQ

### What if more than one call is active?

The Root renders all Calls as a Stack in insertion order. Your component may
show all of them, position them by `call.index`, or visually prioritize the
latest using `call.stackSize`.

### Can I place more than one Root?

Not for the same Callable. You may mount one `Confirm`, one `Toast`, and one
`Picker` together because those are three independent Callable values.

### Does `upsert()` replace normal calls?

No. The singleton upsert instance coexists with normal `call()` instances.
Repeated upserts update only the singleton and return its original Promise.

### Is mutation flow just an async function?

The domain work is an async function. `useMutationFlow` additionally
standardizes pending state, duplicate-submit behavior, payload typing, retry
after failure, and the rule that only an explicit `call.end()` closes the Call.
Those semantics are why it ships as an optional subpath rather than in the
core entry.

### Can I use Teleport?

Yes. Teleport is presentation owned by your user component. Mount the Callable
Root once, then Teleport each rendered dialog or toast to the desired target.

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
