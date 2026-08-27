# @retronew/call-vue

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
