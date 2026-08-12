/** Built-in semantic toast types. `custom` carries no implicit styling or duration. */
export type ToastType = 'blank' | 'success' | 'error' | 'loading' | 'info' | 'warning' | 'custom'

/** Lifecycle status of a toast. */
export type ToastStatus = 'visible' | 'dismissed'

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
  id: string
  type: ToastType
  /** Primary content. */
  message: T
  status: ToastStatus
  /** Auto-dismiss duration in ms. `Infinity` disables auto-dismiss. */
  duration: number
  position?: ToastPosition
  /** Whether the auto-dismiss timer is paused (e.g. on hover). */
  paused: boolean
  /**
   * Beyond the active `max`: timer suspended until promoted.
   * Consumers use this to queue or stack overflow toasts.
   */
  stacked: boolean
  createdAt: number
  updatedAt: number
  /** Measured rendered height (px) for stacking offsets. */
  height?: number
  /** Arbitrary user metadata. */
  meta?: Record<string, unknown>
  /** Inline action button (e.g. "Undo"); does not dismiss the toast. */
  action?: ToastAction<T>
  /** Inline cancel button; consumers usually dismiss the toast in its handler. */
  cancel?: ToastAction<T>
  /**
   * ms left before auto-dismiss; live-updated by the store ticker while the
   * timer runs. `undefined` when no timer is active (no duration, paused,
   * stacked, dismissed).
   */
  remaining?: number
  /** `remaining / duration` (1 = just started → 0 = about to dismiss) for a progress bar; same liveness rules as `remaining`. */
  progress?: number
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

/** Snapshot of the store, handed to subscribers on every change. */
export interface ToasterState<T = unknown> {
  toasts: Toast<T>[]
  /** Global layout hint for the distance from the viewport edge. */
  viewportOffset: ViewportOffset
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
