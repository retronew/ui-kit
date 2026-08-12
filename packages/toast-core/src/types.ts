/** Built-in semantic toast types. `custom` carries no implicit styling. */
export type ToastType = 'blank' | 'success' | 'error' | 'loading' | 'info' | 'warning' | 'custom'

/** Lifecycle status of a toast. */
export type ToastStatus = 'visible' | 'dismissed'

/** Independent reasons that can suspend a toast timer. */
export type ToastPauseReason = 'interaction' | 'manual' | 'visibility'

/** Distance between the toast outlet and the viewport edge. Numbers are pixels. */
export type ViewportOffset = number | string

/** Positions a toast can be anchored to; hints for headless consumers. */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

/** A button rendered alongside a toast's message, e.g. "Undo" or "Cancel". */
export interface ToastAction<T = unknown> {
  label: string
  /** Receives the live toast record. */
  onClick?: (toast: Toast<T>) => void
}

/** A single toast record. `T` is the shape of the user-controlled `message`. */
export interface Toast<T = unknown> {
  readonly id: string
  readonly type: ToastType
  /** Primary content. */
  readonly message: T
  readonly status: ToastStatus
  /** Auto-dismiss duration in ms. `Infinity` disables auto-dismiss. */
  readonly duration: number
  readonly position?: ToastPosition
  /** Whether the auto-dismiss timer is paused (e.g. on hover). */
  readonly paused: boolean
  /**
   * Beyond the active `max`: timer suspended until promoted.
   * Consumers use this to queue or stack overflow toasts.
   */
  readonly stacked: boolean
  readonly createdAt: number
  readonly updatedAt: number
  /** Measured rendered height (px) for stacking offsets. */
  readonly height?: number
  /** Arbitrary user metadata. */
  readonly meta?: Readonly<Record<string, unknown>>
  /** Inline action button (e.g. "Undo"); does not dismiss the toast. */
  readonly action?: ToastAction<T>
  /** Inline cancel button; consumers usually dismiss the toast in its handler. */
  readonly cancel?: ToastAction<T>
  /**
   * ms left before auto-dismiss; live-updated by the store ticker while the
   * timer runs. Frozen while paused/stacked; `undefined` when no finite timer
   * exists or after dismissal/removal.
   */
  readonly remaining?: number
  /** `remaining / duration` (1 = just started → 0 = about to dismiss). */
  readonly progress?: number
}

/** Options accepted when creating or updating a toast. */
export interface ToastOptions<T = unknown> {
  id?: string
  type?: ToastType
  message?: T
  /** Override the auto-dismiss duration (ms); `Infinity`/`0` disables it. */
  duration?: number
  position?: ToastPosition
  meta?: Record<string, unknown>
  action?: ToastAction<T>
  cancel?: ToastAction<T>
}

/** Fields accepted when patching a toast. `null` clears an optional field. */
export interface ToastUpdateOptions<T = unknown> {
  type?: ToastType
  message?: T
  duration?: number
  position?: ToastPosition | null
  meta?: Record<string, unknown> | null
  action?: ToastAction<T> | null
  cancel?: ToastAction<T> | null
}

/** Stable inputs available when grouping visible error toasts for deduplication. */
export interface ToastDedupeContext<T = unknown> {
  readonly message: T
  readonly type: ToastType
  readonly position?: ToastPosition
  readonly meta?: Readonly<Record<string, unknown>>
}

/**
 * Returns the bucket used to deduplicate visible errors. Return values should
 * be stable primitives; equal keys share one toast.
 */
export type ToastDedupeKey<T = unknown> = (toast: ToastDedupeContext<T>) => PropertyKey

/** Snapshot of the store, handed to subscribers on every change. */
export interface ToasterState<T = unknown> {
  readonly toasts: readonly Toast<T>[]
  /** Global layout hint for the distance from the viewport edge. */
  readonly viewportOffset: ViewportOffset
}

/** Controls which derived state changes a subscriber receives. */
export interface ToastSubscriptionOptions {
  /** Receive periodic snapshots while finite timers run. Default `false`. */
  progress?: boolean
}

/** A one-shot signal for a toast (e.g. `shake` on error dedup), delivered via `ToastStore.onEffect`. */
export interface ToastEffect {
  type: 'shake'
  id: string
}

/** Messages for `toast.promise`; static or derived. */
export interface PromiseMessages<V, T = unknown> {
  loading: T
  success: T | ((value: V) => T)
  error: T | ((error: unknown) => T)
}
