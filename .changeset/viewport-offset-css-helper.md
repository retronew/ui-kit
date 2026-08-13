---
'@retronew/toast-core': minor
'@retronew/toast-vue': minor
---

Add `toViewportOffsetCss(offset)`, exported from both packages, to resolve a `ViewportOffset` (`number | string`) to a CSS length (`number → 'Npx'`, strings pass through) — replaces the `typeof viewportOffset === 'number' ? ... : ...` boilerplate every outlet previously had to hand-roll.
