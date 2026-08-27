---
'@retronew/call-vue': minor
---

Add two new subpath exports:

- `@retronew/call-vue/vite`: a dev-only Vite transform that injects a stable `displayName` into top-level `createCallable` declarations, so an already-open Call survives its module's HMR update.
- `@retronew/call-vue/host`: `mount(Callable, options)` for mounting a single Root into isolated preview trees (Storybook, Histoire, etc.), with support for a `wrapper`, `container`, and component props.
