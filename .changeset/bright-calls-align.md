---
'@retronew/call-vue': minor
---

Align the Vue core lifecycle and public API with its documented contract:

- remove the legacy `.Root` alias; the Callable itself is the only Root component,
- avoid leaking Root registrations across Vue SSR renders,
- make natural interface Root props and direct SFC usage type-safe,
- reject ambiguous `end(promise)` calls when `Response` is `void`, and
- document and test async components, SSR, lifecycle races, and accessibility responsibilities.
