# @retronew/toast-vue

## 1.1.0

### Minor Changes

- 2d9ece4: Add `swipeDismiss` and `escapeDismiss` props to `<ToastWrapper>` (both default `true`) to opt individual toasts out of the pointer-drag swipe gesture and/or the `Escape` key handler. Both are reactive: toggling `swipeDismiss` off mid-drag springs the toast back to rest instead of leaving the gesture half-committed, and `touch-action` falls back to `auto` so native scrolling/panning works normally when swipe is disabled.

## 1.0.0

### Major Changes

- cf653ee: **Breaking:** the renderless outlet `<Toaster>` is renamed to `<ToasterProvider>` (its `ToasterSlotProps` type is now `ToasterProviderSlotProps`). Update your imports/templates: `import { Toaster } from '@retronew/toast-vue'` → `import { ToasterProvider } from '@retronew/toast-vue'`, and `<Toaster v-slot="...">` → `<ToasterProvider v-slot="...">`. No behavior change otherwise — this is purely a rename, freeing up the `Toaster` name for a possible future batteries-included component.

### Minor Changes

- 18f7996: Add `toViewportOffsetCss(offset)`, exported from both packages, to resolve a `ViewportOffset` (`number | string`) to a CSS length (`number → 'Npx'`, strings pass through) — replaces the `typeof viewportOffset === 'number' ? ... : ...` boilerplate every outlet previously had to hand-roll.

### Patch Changes

- Updated dependencies [18f7996]
  - @retronew/toast-core@0.3.0

## 0.3.1

### Patch Changes

- 12b07a3: Fix a brief visual overlap in the default (non-`pop`) motion where a newly-entering toast and the older toast it displaces would cross paths mid-transition. The entering toast now travels the exact distance (`own height + gap`) neighbours are reflowing by, instead of a fixed 60% of its own height, so the gap between them stays constant throughout the shared transition. `pop` mode and the exit transition are unchanged.

## 0.3.0

### Minor Changes

- 66021d6: Add a `pop` prop to `<ToastWrapper>` for a react-hot-toast-style entrance/exit — a bigger scale pop, asymmetric enter/exit distance and opacity, and distinct enter/exit easing. Off by default; the default motion is unchanged. Shares `--toast-motion-duration` with the default motion, and uses a stronger `--toast-motion-blur` fallback so the blur stays legible against the bigger, faster motion.

## 0.2.0

### Minor Changes

- 7fc878f: Stabilize toast lifecycle behavior and reduce idle rendering work.

  - Prevent stale delayed removals and preserve independent pause reasons.
  - Return isolated readonly snapshots, validate configuration, and allow optional fields to be cleared.
  - Settle synchronous promise-factory failures and scope error deduplication by position.
  - Add configurable error deduplication keys and boolean changed results for mutators.
  - Make live progress snapshots opt-in and add linear cached Vue layout metrics.
  - Support reactive toaster stores, runtime reduced-motion changes, ResizeObserver measurement,
    focus restoration, and safer swipe/hotkey behavior.

### Patch Changes

- 35133b5: Fix a crash in the swipe-to-dismiss fling handler when `Animation.finished` is unavailable (e.g. a partial `animate()` polyfill), falling back to dismissing immediately instead of throwing.
- Updated dependencies [7fc878f]
  - @retronew/toast-core@0.2.0

## 0.1.0

### Minor Changes

- Initial release of the toast component library workspace.

### Patch Changes

- Updated dependencies
  - @retronew/toast-core@0.1.0
