---
'@retronew/toast-core': minor
'@retronew/toast-vue': minor
---

Add `defaultPosition` to `ToasterConfig` and `ToastStore.setDefaultPosition()`/`getDefaultPosition()`. Toasts created or updated without an explicit `position` now resolve through this fallback at creation/update time, so `max` and `errorDedupeKey` bucket them by their actual displayed position instead of a shared `'__default__'` bucket. `useToaster()` exposes the current value reactively as `defaultPosition`.
