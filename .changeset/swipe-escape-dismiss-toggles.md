---
"@retronew/toast-vue": minor
---

Add `swipeDismiss` and `escapeDismiss` props to `<ToastWrapper>` (both default `true`) to opt individual toasts out of the pointer-drag swipe gesture and/or the `Escape` key handler. Both are reactive: toggling `swipeDismiss` off mid-drag springs the toast back to rest instead of leaving the gesture half-committed, and `touch-action` falls back to `auto` so native scrolling/panning works normally when swipe is disabled.
