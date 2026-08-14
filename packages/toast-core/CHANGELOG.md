# @retronew/toast-core

## 0.4.0

### Minor Changes

- dadaccc: Add `defaultPosition` to `ToasterConfig` and `ToastStore.setDefaultPosition()`/`getDefaultPosition()`. Toasts created or updated without an explicit `position` now resolve through this fallback at creation/update time, so `max` and `errorDedupeKey` bucket them by their actual displayed position instead of a shared `'__default__'` bucket. `useToaster()` exposes the current value reactively as `defaultPosition`.

## 0.3.0

### Minor Changes

- 18f7996: Add `toViewportOffsetCss(offset)`, exported from both packages, to resolve a `ViewportOffset` (`number | string`) to a CSS length (`number → 'Npx'`, strings pass through) — replaces the `typeof viewportOffset === 'number' ? ... : ...` boilerplate every outlet previously had to hand-roll.

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

## 0.1.0

### Minor Changes

- Initial release of the toast component library workspace.
