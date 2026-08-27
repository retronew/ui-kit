# @retronew/call-vue

## 0.5.0

### Minor Changes

- c83e2d5: Add two new subpath exports:

  - `@retronew/call-vue/vite`: a dev-only Vite transform that injects a stable `displayName` into top-level `createCallable` declarations, so an already-open Call survives its module's HMR update.
  - `@retronew/call-vue/host`: `mount(Callable, options)` for mounting a single Root into isolated preview trees (Storybook, Histoire, etc.), with support for a `wrapper`, `container`, and component props.

## 0.4.1

### Patch Changes

- 9339e44: Minify the published build output. The main entry drops from ~4.5kB (~1.7kB gzip) to ~1.6kB (~0.8kB gzip); type declarations are unaffected. No API or behavior changes.

## 0.4.0

### Minor Changes

- d3ffc48: Add `@retronew/call-vue/mutation-flow`, a Vue composable (`useMutationFlow`) that mirrors `react-call`'s mutation-flow behavior: a reactive `pending` getter, reentrancy protection while a submission is in flight, and support for an optional or `Ref`-swappable handler via `submit(payload).orEnd(value)`.

## 0.3.0

### Minor Changes

- 54526ec: Align the Vue core lifecycle and public API with its documented contract:

  - remove the legacy `.Root` alias; the Callable itself is the only Root component,
  - avoid leaking Root registrations across Vue SSR renders,
  - make natural interface Root props and direct SFC usage type-safe,
  - reject ambiguous `end(promise)` calls when `Response` is `void`, and
  - document and test async components, SSR, lifecycle races, and accessibility responsibilities.

## 0.2.0

### Minor Changes

- fd238c0: Add `@retronew/call-vue`, a Vue 3 port of react-call's `createCallable` API — call and await Vue components (confirmations, dialogs, toasts) like async functions, via `call`/`upsert`/`end`/`update`.
