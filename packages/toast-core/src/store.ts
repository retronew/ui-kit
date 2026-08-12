import type {
  Toast,
  ToastEffect,
  ToastOptions,
  ToastType,
  ToasterState,
  ViewportOffset,
} from './types'

/** Ticker interval (ms) for re-emitting state so `remaining`/`progress` stay live. */
const TICK_MS = 250

/** Default distance from the toast outlet to the viewport edge. */
const DEFAULT_VIEWPORT_OFFSET = 16

/** Default auto-dismiss durations (ms) per toast type. */
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  blank: 4000,
  custom: 4000,
  error: 5000,
  info: 4000,
  loading: Number.POSITIVE_INFINITY,
  success: 3000,
  warning: 5000,
}

export interface ToasterConfig {
  /**
   * Max active toasts (newest first). Overflow toasts are stacked (timer
   * suspended) until promoted. `0` (default) means unlimited.
   */
  max?: number
  /** Delay (ms) between dismiss and removal, for exit animations. Default `1000`. */
  removeDelay?: number
  /** Override the default auto-dismiss durations per type. */
  durations?: Partial<Record<ToastType, number>>
  /** Distance from the toast outlet to the viewport edge. Numbers are pixels. Default `16`. */
  viewportOffset?: ViewportOffset
}

type Listener<T> = (state: ToasterState<T>) => void
type EffectListener = (effect: ToastEffect) => void

interface TimerRecord {
  /** Active timeout handle, if running. */
  handle: ReturnType<typeof setTimeout> | undefined
  /** ms remaining when paused, or the original duration before first start. */
  remaining: number
  /** Timestamp the current run started, used to compute elapsed on pause. */
  startedAt: number
}

let counter = 0
function genId(): string {
  counter += 1
  return `toast-${Date.now().toString(36)}-${counter}`
}

/**
 * Framework-agnostic toast store: owns the toast list, auto-dismiss timers,
 * and subscriptions. No rendering or DOM, so it works across Vue/React/vanilla.
 */
export class ToastStore<T = unknown> {
  private toasts: Toast<T>[] = []
  private readonly listeners = new Set<Listener<T>>()
  private readonly effectListeners = new Set<EffectListener>()
  private readonly timers = new Map<string, TimerRecord>()
  private readonly config: Required<ToasterConfig>
  private tickHandle: ReturnType<typeof setInterval> | undefined

  /** Auto-pause all toasts while the tab is hidden; resume when visible again. */
  private readonly handleVisibilityChange = (): void => {
    if (typeof document === 'undefined') {
      return
    }
    if (document.hidden) {
      this.pause()
    } else {
      this.resume()
    }
  }

  constructor(config: ToasterConfig = {}) {
    this.config = {
      durations: { ...DEFAULT_DURATIONS, ...config.durations },
      max: config.max ?? 0,
      removeDelay: config.removeDelay ?? 1000,
      viewportOffset: config.viewportOffset ?? DEFAULT_VIEWPORT_OFFSET,
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    }
  }

  /** Immutable snapshot of the toast list with live `remaining`/`progress` per toast. */
  getState(): ToasterState<T> {
    return {
      toasts: this.toasts.map((t) => {
        const remaining = this.getRemaining(t.id)
        if (remaining === undefined) {
          return t
        }
        return { ...t, progress: this.getProgress(t.id), remaining }
      }),
      viewportOffset: this.config.viewportOffset,
    }
  }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(): void {
    const state = this.getState()
    for (const listener of this.listeners) {
      listener(state)
    }
  }

  /** Subscribe to one-shot toast effects (e.g. `shake`); fires once, never stored on the `Toast`. */
  onEffect(listener: EffectListener): () => void {
    this.effectListeners.add(listener)
    return () => {
      this.effectListeners.delete(listener)
    }
  }

  private emitEffect(effect: ToastEffect): void {
    for (const listener of this.effectListeners) {
      listener(effect)
    }
  }

  /** Create a new toast and start its auto-dismiss timer. Returns its id. */
  create(message: T, options: ToastOptions<T> = {}): string {
    const id = options.id ?? genId()
    const type = options.type ?? 'blank'
    const duration = options.duration ?? this.config.durations[type] ?? 4000
    const now = Date.now()

    const existing = this.toasts.find((t) => t.id === id)
    if (existing) {
      // Re-creating an existing id acts as an update.
      return this.update(id, { duration, message, type, ...options })
    }

    // Error dedup: re-emphasize the existing error instead of queueing another.
    if (type === 'error') {
      const existingError = this.toasts.find((t) => t.type === 'error' && t.status === 'visible')
      if (existingError) {
        const sameMessage = existingError.message === message
        this.clearTimer(existingError.id)
        this.toasts = this.toasts.map((t) => {
          if (t.id !== existingError.id) {
            return t
          }
          return {
            ...t,
            // Update message only when it differs.
            ...(sameMessage ? {} : { message }),
            updatedAt: Date.now(),
          }
        })
        this.recomputeStacking()
        this.emit()
        this.emitEffect({ id: existingError.id, type: 'shake' })
        return existingError.id
      }
    }

    const toast: Toast<T> = {
      action: options.action,
      cancel: options.cancel,
      createdAt: now,
      duration,
      id,
      message,
      meta: options.meta,
      paused: false,
      position: options.position,
      stacked: false,
      status: 'visible',
      type,
      updatedAt: now,
    }

    this.toasts = [toast, ...this.toasts]
    this.recomputeStacking()
    this.emit()
    return id
  }

  /** Patch an existing toast; restarts its timer if the duration changes. */
  update(id: string, patch: ToastOptions<T>): string {
    let durationChanged = false
    this.toasts = this.toasts.map((t) => {
      if (t.id !== id) {
        return t
      }
      // Fall back to the new type's default duration when type changes without an explicit one.
      const nextType = patch.type ?? t.type
      const nextDuration =
        patch.duration ??
        (patch.type !== undefined && patch.type !== t.type
          ? (this.config.durations[nextType] ?? t.duration)
          : t.duration)
      durationChanged = nextDuration !== t.duration
      return {
        ...t,
        ...('message' in patch ? { message: patch.message as T } : {}),
        type: nextType,
        duration: nextDuration,
        ...(patch.position !== undefined ? { position: patch.position } : {}),
        ...(patch.meta !== undefined ? { meta: patch.meta } : {}),
        ...(patch.action !== undefined ? { action: patch.action } : {}),
        ...(patch.cancel !== undefined ? { cancel: patch.cancel } : {}),
        status: 'visible',
        updatedAt: Date.now(),
      }
    })

    const toast = this.toasts.find((t) => t.id === id)
    if (toast && durationChanged) {
      // Restart the countdown from scratch.
      this.clearTimer(id)
    }
    // Re-show may change the active/stacked split; re-sync timers.
    this.recomputeStacking()
    this.emit()
    return id
  }

  /** Mark a toast (or all) as dismissed and remove it after `removeDelay`, letting consumers animate it out. */
  dismiss(id?: string): void {
    const now = Date.now()
    const dismissing: string[] = []
    this.toasts = this.toasts.map((t) => {
      if ((id === undefined || t.id === id) && t.status === 'visible') {
        dismissing.push(t.id)
        return { ...t, status: 'dismissed', updatedAt: now }
      }
      return t
    })
    for (const dismissedId of dismissing) {
      this.clearTimer(dismissedId)
      setTimeout(() => {
        this.remove(dismissedId)
      }, this.config.removeDelay)
    }
    // A freed slot promotes the next stacked toast.
    this.recomputeStacking()
    this.emit()
  }

  /** Immediately remove a toast (or all toasts) from the list. */
  remove(id?: string): void {
    if (id === undefined) {
      for (const t of this.toasts) {
        this.clearTimer(t.id)
      }
      this.toasts = []
    } else {
      this.clearTimer(id)
      this.toasts = this.toasts.filter((t) => t.id !== id)
    }
    // Removal may open a slot for a stacked toast.
    this.recomputeStacking()
    this.emit()
  }

  /** Pause the auto-dismiss timer of a toast (or all) — e.g. on hover. */
  pause(id?: string): void {
    let changed = false
    for (const t of this.toasts) {
      if (id !== undefined && t.id !== id) {
        continue
      }
      if (!t.paused) {
        t.paused = true
        changed = true
      }
      this.syncTimer(t)
    }
    this.syncTicker()
    if (changed) {
      this.toasts = [...this.toasts]
      this.emit()
    }
  }

  /** Resume a previously paused timer of a toast (or all). */
  resume(id?: string): void {
    let changed = false
    for (const t of this.toasts) {
      if (id !== undefined && t.id !== id) {
        continue
      }
      if (t.paused) {
        t.paused = false
        changed = true
      }
      this.syncTimer(t)
    }
    this.syncTicker()
    if (changed) {
      this.toasts = [...this.toasts]
      this.emit()
    }
  }

  /** Update a toast's measured height (from `ToastWrapper`) for stacking offsets. */
  setHeight(id: string, height: number): void {
    if (!id || height < 0) {
      return
    }
    this.toasts = this.toasts.map((t) =>
      t.id === id ? { ...t, height, updatedAt: Date.now() } : t,
    )
    this.emit()
  }

  /** Change the active-toast maximum at runtime and restack immediately. `0` disables stacking. */
  setMax(max: number): void {
    if (this.config.max === max) {
      return
    }
    this.config.max = max
    this.recomputeStacking()
    this.toasts = [...this.toasts]
    this.emit()
  }

  /** Change the distance from the toast outlet to the viewport edge at runtime. */
  setViewportOffset(viewportOffset: ViewportOffset): void {
    if (this.config.viewportOffset === viewportOffset) {
      return
    }
    this.config.viewportOffset = viewportOffset
    this.emit()
  }

  /** Dispose the store: clear timers, the tick loop, and listeners. */
  destroy(): void {
    for (const id of this.timers.keys()) {
      this.clearTimer(id)
    }
    this.timers.clear()
    this.stopTicking()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    }
    this.listeners.clear()
    this.effectListeners.clear()
    this.toasts = []
  }

  /** Recompute the active/stacked split from `config.max` per `position` bucket, then sync every timer. */
  private recomputeStacking(): void {
    const { max } = this.config
    const activeCounts = new Map<string, number>()
    for (const t of this.toasts) {
      if (t.status !== 'visible') {
        t.stacked = false
        continue
      }
      const key = t.position ?? '__default__'
      const count = activeCounts.get(key) ?? 0
      t.stacked = max > 0 && count >= max
      activeCounts.set(key, count + 1)
    }
    for (const t of this.toasts) {
      this.syncTimer(t)
    }
    this.syncTicker()
  }

  /** Start/stop the periodic re-emit that keeps `remaining`/`progress` live; runs only while a timer is counting down. */
  private syncTicker(): void {
    let running = false
    for (const record of this.timers.values()) {
      if (record.handle !== undefined) {
        running = true
        break
      }
    }
    if (running) {
      this.tickHandle ??= setInterval(() => this.emit(), TICK_MS)
    } else {
      this.stopTicking()
    }
  }

  private stopTicking(): void {
    if (this.tickHandle !== undefined) {
      clearInterval(this.tickHandle)
      this.tickHandle = undefined
    }
  }

  /** Start, suspend, or keep a toast's timer per its state; remaining time is preserved across pause/stack transitions. */
  private syncTimer(toast: Toast<T>): void {
    const hasTimer = Number.isFinite(toast.duration) && toast.duration > 0
    const shouldRun = hasTimer && toast.status === 'visible' && !toast.paused && !toast.stacked
    const record = this.timers.get(toast.id)

    if (shouldRun) {
      if (record?.handle !== undefined) {
        return // already counting down
      }
      const remaining = record?.remaining ?? toast.duration
      this.timers.set(toast.id, {
        handle: setTimeout(() => {
          this.dismiss(toast.id)
        }, remaining),
        remaining,
        startedAt: Date.now(),
      })
      return
    }

    if (record?.handle !== undefined) {
      // Running but shouldn't be — suspend, preserving remaining.
      clearTimeout(record.handle)
      record.remaining -= Date.now() - record.startedAt
      record.handle = undefined
    } else if (!record && hasTimer && toast.status === 'visible') {
      // Born stacked/paused: track the full duration for promotion.
      this.timers.set(toast.id, {
        handle: undefined,
        remaining: toast.duration,
        startedAt: Date.now(),
      })
    }
  }

  /** ms left before `id`'s timer fires; frozen while paused/stacked. `undefined` when no timer exists. */
  getRemaining(id: string): number | undefined {
    const record = this.timers.get(id)
    if (!record) {
      return undefined
    }
    if (record.handle === undefined) {
      // Paused or stacked: frozen at the last computed remaining.
      return Math.max(record.remaining, 0)
    }
    return Math.max(record.remaining - (Date.now() - record.startedAt), 0)
  }

  /** Fraction of `id`'s duration remaining (1 → 0) for a progress bar. `undefined` under the same conditions as `getRemaining`. */
  getProgress(id: string): number | undefined {
    const toast = this.toasts.find((t) => t.id === id)
    const remaining = this.getRemaining(id)
    if (
      !toast ||
      remaining === undefined ||
      !Number.isFinite(toast.duration) ||
      toast.duration <= 0
    ) {
      return undefined
    }
    return Math.min(Math.max(remaining / toast.duration, 0), 1)
  }

  private clearTimer(id: string): void {
    const record = this.timers.get(id)
    if (record?.handle !== undefined) {
      clearTimeout(record.handle)
    }
    this.timers.delete(id)
  }
}
