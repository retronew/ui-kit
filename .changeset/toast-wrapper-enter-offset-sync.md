---
'@retronew/toast-vue': patch
---

Fix a brief visual overlap in the default (non-`pop`) motion where a newly-entering toast and the older toast it displaces would cross paths mid-transition. The entering toast now travels the exact distance (`own height + gap`) neighbours are reflowing by, instead of a fixed 60% of its own height, so the gap between them stays constant throughout the shared transition. `pop` mode and the exit transition are unchanged.
