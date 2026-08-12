---
'@retronew/toast-vue': patch
---

Fix a crash in the swipe-to-dismiss fling handler when `Animation.finished` is unavailable (e.g. a partial `animate()` polyfill), falling back to dismissing immediately instead of throwing.
