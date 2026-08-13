# @retronew/toast-vue

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
