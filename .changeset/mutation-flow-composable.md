---
'@retronew/call-vue': minor
---

Add `@retronew/call-vue/mutation-flow`, a Vue composable (`useMutationFlow`) that mirrors `react-call`'s mutation-flow behavior: a reactive `pending` getter, reentrancy protection while a submission is in flight, and support for an optional or `Ref`-swappable handler via `submit(payload).orEnd(value)`.
