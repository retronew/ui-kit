---
'@retronew/toast-core': minor
'@retronew/toast-vue': minor
---

Stabilize toast lifecycle behavior and reduce idle rendering work.

- Prevent stale delayed removals and preserve independent pause reasons.
- Return isolated readonly snapshots, validate configuration, and allow optional fields to be cleared.
- Settle synchronous promise-factory failures and scope error deduplication by position.
- Add configurable error deduplication keys and boolean changed results for mutators.
- Make live progress snapshots opt-in and add linear cached Vue layout metrics.
- Support reactive toaster stores, runtime reduced-motion changes, ResizeObserver measurement,
  focus restoration, and safer swipe/hotkey behavior.
