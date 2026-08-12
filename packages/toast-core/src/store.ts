import type {
  Toast,
  ToastDedupeContext,
  ToastDedupeKey,
  ToastEffect,
  ToastOptions,
  ToastPauseReason,
  ToastSubscriptionOptions,
  ToastType,
  ToasterState,
  ToastUpdateOptions,
  ViewportOffset,
} from './types'

/** Ticker interval (ms) for subscribers that explicitly request live progress. */
const TICK_MS = 250
const DEFAULT_VIEWPORT_OFFSET = 16

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  blank: 4000,
  custom: 4000,
  error: 5000,
  info: 4000,
  loading: Number.POSITIVE_INFINITY,
  success: 3000,
  warning: 5000,
}

export interface ToasterConfig<T = unknown> {
  /** Max active toasts per position. `0` (default) means unlimited. */
  max?: number
  /** Delay (ms) between dismiss and removal. Default `1000`. */
  removeDelay?: number
  /** Override the default auto-dismiss durations per type. */
  durations?: Partial<Record<ToastType, number>>
  /** Distance from the toast outlet to the viewport edge. Numbers are pixels. */
  viewportOffset?: ViewportOffset
  /**
   * Groups visible error toasts for deduplication. Defaults to their position.
   * Equal keys reuse the existing toast and emit a shake effect.
   */
  errorDedupeKey?: ToastDedupeKey<T>
}

type Listener<T> = (state: ToasterState<T>) => void
type EffectListener = (effect: ToastEffect) => void

interface TimerRecord {
  handle: ReturnType<typeof setTimeout> | undefined
  remaining: number
  startedAt: number
}

interface EffectSubscription {
  id?: string
  listener: EffectListener
}

let counter = 0
const DEFAULT_ERROR_DEDUPE_KEY = Symbol('default-error-position')

function genId(): string {
  counter += 1
  return `toast-${Date.now().toString(36)}-${counter}`
}

function assertDuration(duration: number, name = 'duration'): number {
  if (duration === Number.POSITIVE_INFINITY || (Number.isFinite(duration) && duration >= 0)) {
    return duration
  }
  throw new RangeError(`${name} must be a non-negative finite number or Infinity`)
}

function assertMax(max: number): number {
  if (!Number.isSafeInteger(max) || max < 0) {
    throw new RangeError('max must be a non-negative safe integer')
  }
  return max
}

function assertRemoveDelay(delay: number): number {
  if (!Number.isFinite(delay) || delay < 0) {
    throw new RangeError('removeDelay must be a non-negative finite number')
  }
  return delay
}

function assertViewportOffset(offset: ViewportOffset): ViewportOffset {
  if (
    (typeof offset === 'number' && (!Number.isFinite(offset) || offset < 0)) ||
    (typeof offset === 'string' && offset.trim() === '')
  ) {
    throw new RangeError('viewportOffset must be a non-negative number or non-empty string')
  }
  return offset
}

function cloneToast<T>(toast: Toast<T>, remaining: number | undefined): Toast<T> {
  return {
    ...toast,
    ...(toast.action ? { action: { ...toast.action } } : {}),
    ...(toast.cancel ? { cancel: { ...toast.cancel } } : {}),
    ...(toast.meta ? { meta: cloneMetadata(toast.meta) } : {}),
    ...(remaining === undefined
      ? {}
      : {
          progress: Math.min(Math.max(remaining / toast.duration, 0), 1),
          remaining,
        }),
  }
}

function cloneMetadata(meta: Readonly<Record<string, unknown>>): Record<string, unknown> {
  return cloneMetadataValue(meta, new WeakMap()) as Record<string, unknown>
}

function cloneMetadataValue(value: unknown, seen: WeakMap<object, unknown>): unknown {
  if (value === null || typeof value !== 'object') return value
  const existing = seen.get(value)
  if (existing !== undefined) return existing
  if (Array.isArray(value)) {
    const copy: unknown[] = []
    seen.set(value, copy)
    for (const item of value) copy.push(cloneMetadataValue(item, seen))
    return copy
  }
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) return value
  const copy: Record<string, unknown> = {}
  seen.set(value, copy)
  for (const [key, item] of Object.entries(value)) {
    copy[key] = cloneMetadataValue(item, seen)
  }
  return copy
}

function metadataEqual(
  left: unknown,
  right: unknown,
  seen = new WeakMap<object, object>(),
): boolean {
  if (Object.is(left, right)) return true
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') {
    return false
  }
  if (Object.getPrototypeOf(left) !== Object.getPrototypeOf(right)) return false
  const previous = seen.get(left)
  if (previous !== undefined) return previous === right
  seen.set(left, right)
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    return left.every((item, index) => metadataEqual(item, right[index], seen))
  }
  if (Object.getPrototypeOf(left) !== Object.prototype && Object.getPrototypeOf(left) !== null) {
    return false
  }
  const leftEntries = Object.entries(left)
  const rightRecord = right as Record<string, unknown>
  if (leftEntries.length !== Object.keys(rightRecord).length) return false
  return leftEntries.every(
    ([key, value]) =>
      Object.prototype.hasOwnProperty.call(rightRecord, key) &&
      metadataEqual(value, rightRecord[key], seen),
  )
}

function actionEqual<T>(left: Toast<T>['action'], right: Toast<T>['action']): boolean {
  return (
    left === right ||
    (left !== undefined &&
      right !== undefined &&
      left.label === right.label &&
      left.onClick === right.onClick)
  )
}

/** Framework-agnostic toast state machine and subscription source. */
export class ToastStore<T = unknown> {
  private toasts: Toast<T>[] = []
  private readonly listeners = new Map<Listener<T>, Required<ToastSubscriptionOptions>>()
  private readonly effectListeners = new Set<EffectSubscription>()
  private readonly timers = new Map<string, TimerRecord>()
  private readonly removalTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private readonly pauseReasons = new Map<string, Set<ToastPauseReason>>()
  private readonly config: Required<ToasterConfig<T>>
  private tickHandle: ReturnType<typeof setInterval> | undefined
  private destroyed = false
  private visibilityPaused = false

  private readonly handleVisibilityChange = (): void => {
    if (this.destroyed || typeof document === 'undefined') return
    this.visibilityPaused = document.hidden
    if (document.hidden) {
      this.pause(undefined, 'visibility')
    } else {
      this.resume(undefined, 'visibility')
    }
  }

  constructor(config: ToasterConfig<T> = {}) {
    const durations = { ...DEFAULT_DURATIONS, ...config.durations }
    for (const [type, duration] of Object.entries(durations)) {
      assertDuration(duration, `durations.${type}`)
    }
    this.config = {
      durations,
      errorDedupeKey:
        config.errorDedupeKey ??
        ((toast: ToastDedupeContext<T>) => toast.position ?? DEFAULT_ERROR_DEDUPE_KEY),
      max: assertMax(config.max ?? 0),
      removeDelay: assertRemoveDelay(config.removeDelay ?? 1000),
      viewportOffset: assertViewportOffset(config.viewportOffset ?? DEFAULT_VIEWPORT_OFFSET),
    }
    if (typeof document !== 'undefined') {
      this.visibilityPaused = document.hidden
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    }
  }

  /** Immutable snapshot with live `remaining`/`progress` values. */
  getState(): ToasterState<T> {
    const now = Date.now()
    return {
      toasts: this.toasts.map((toast) =>
        cloneToast(toast, this.getRemainingFromRecord(this.timers.get(toast.id), now)),
      ),
      viewportOffset: this.config.viewportOffset,
    }
  }

  /** Subscribe to state changes. Live timer ticks are opt-in. */
  subscribe(listener: Listener<T>, options: ToastSubscriptionOptions = {}): () => void {
    this.assertActive()
    this.listeners.set(listener, { progress: options.progress ?? false })
    this.syncTicker()
    return () => {
      this.listeners.delete(listener)
      this.syncTicker()
    }
  }

  private emit(progressOnly = false): void {
    const state = this.getState()
    for (const [listener, options] of this.listeners) {
      if (!progressOnly || options.progress) this.notifyListener(listener, state)
    }
  }

  /** Subscribe to one-shot effects. Passing `id` avoids unrelated callbacks. */
  onEffect(listener: EffectListener, id?: string): () => void {
    this.assertActive()
    const subscription = { id, listener }
    this.effectListeners.add(subscription)
    return () => this.effectListeners.delete(subscription)
  }

  private emitEffect(effect: ToastEffect): void {
    for (const subscription of this.effectListeners) {
      if (subscription.id === undefined || subscription.id === effect.id) {
        try {
          subscription.listener(effect)
        } catch (error: unknown) {
          this.reportListenerError(error)
        }
      }
    }
  }

  /** Create a toast and start its timer. Reusing an id updates that toast. */
  create(message: T, options: ToastOptions<T> = {}): string {
    this.assertActive()
    const id = options.id ?? genId()
    const type = options.type ?? 'blank'
    const duration = assertDuration(options.duration ?? this.config.durations[type] ?? 4000)
    const existing = this.toasts.find((toast) => toast.id === id)

    if (existing) {
      this.update(id, { ...options, duration, message, type })
      return id
    }

    if (type === 'error') {
      const dedupeKey = this.config.errorDedupeKey({
        message,
        meta: options.meta,
        position: options.position,
        type,
      })
      const existingError = this.toasts.find(
        (toast) =>
          toast.type === 'error' &&
          toast.status === 'visible' &&
          Object.is(
            this.config.errorDedupeKey({
              message: toast.message,
              meta: toast.meta,
              position: toast.position,
              type: toast.type,
            }),
            dedupeKey,
          ),
      )
      if (existingError) {
        this.clearTimer(existingError.id)
        const changed = this.update(existingError.id, { ...options, duration, message, type })
        if (!changed) {
          const current = this.toasts.find((toast) => toast.id === existingError.id)
          if (current) this.syncTimer(current)
          this.syncTicker()
        }
        this.emitEffect({ id: existingError.id, type: 'shake' })
        return existingError.id
      }
    }

    const now = Date.now()
    if (this.visibilityPaused) {
      this.pauseReasons.set(id, new Set(['visibility']))
    }
    const toast: Toast<T> = {
      action: options.action ? { ...options.action } : undefined,
      cancel: options.cancel ? { ...options.cancel } : undefined,
      createdAt: now,
      duration,
      id,
      message,
      meta: options.meta ? cloneMetadata(options.meta) : undefined,
      paused: this.visibilityPaused || this.isPaused(id),
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

  /** Patch an existing toast. `null` clears optional presentation fields. */
  update(id: string, patch: ToastUpdateOptions<T>): boolean {
    this.assertActive()
    const index = this.toasts.findIndex((toast) => toast.id === id)
    if (index < 0) return false

    const current = this.toasts[index] as Toast<T>
    const nextType = patch.type ?? current.type
    const nextDuration = assertDuration(
      patch.duration ??
        (patch.type !== undefined && patch.type !== current.type
          ? (this.config.durations[nextType] ?? current.duration)
          : current.duration),
    )
    const next: Toast<T> = {
      ...current,
      ...('message' in patch ? { message: patch.message as T } : {}),
      ...('position' in patch ? { position: patch.position ?? undefined } : {}),
      ...('meta' in patch ? { meta: patch.meta ? cloneMetadata(patch.meta) : undefined } : {}),
      ...('action' in patch ? { action: patch.action ? { ...patch.action } : undefined } : {}),
      ...('cancel' in patch ? { cancel: patch.cancel ? { ...patch.cancel } : undefined } : {}),
      duration: nextDuration,
      paused: this.visibilityPaused || this.isPaused(id),
      status: 'visible',
      type: nextType,
      updatedAt: Date.now(),
    }
    const changed =
      next.type !== current.type ||
      !Object.is(next.message, current.message) ||
      next.duration !== current.duration ||
      next.position !== current.position ||
      !metadataEqual(next.meta, current.meta) ||
      !actionEqual(next.action, current.action) ||
      !actionEqual(next.cancel, current.cancel) ||
      current.status !== 'visible' ||
      next.paused !== current.paused
    if (!changed) return false

    const restarting = nextDuration !== current.duration || current.status === 'dismissed'
    if (restarting) this.clearTimer(id)
    this.clearRemovalTimer(id)
    if (this.visibilityPaused) {
      const reasons = this.pauseReasons.get(id) ?? new Set<ToastPauseReason>()
      reasons.add('visibility')
      this.pauseReasons.set(id, reasons)
    }
    this.toasts = this.toasts.map((toast, toastIndex) => (toastIndex === index ? next : toast))
    this.recomputeStacking()
    this.emit()
    return true
  }

  /** Mark a toast (or all) dismissed, then remove it after `removeDelay`. */
  dismiss(id?: string): boolean {
    this.assertActive()
    const now = Date.now()
    const dismissing = new Set<string>()
    this.toasts = this.toasts.map((toast) => {
      if ((id === undefined || toast.id === id) && toast.status === 'visible') {
        dismissing.add(toast.id)
        this.pauseReasons.delete(toast.id)
        return { ...toast, paused: false, status: 'dismissed', updatedAt: now }
      }
      return toast
    })
    if (dismissing.size === 0) return false

    for (const dismissedId of dismissing) {
      this.clearTimer(dismissedId)
      this.clearRemovalTimer(dismissedId)
      const handle = setTimeout(() => {
        this.removalTimers.delete(dismissedId)
        const toast = this.toasts.find((candidate) => candidate.id === dismissedId)
        if (!this.destroyed && toast?.status === 'dismissed') this.remove(dismissedId)
      }, this.config.removeDelay)
      this.removalTimers.set(dismissedId, handle)
    }
    this.recomputeStacking()
    this.emit()
    return true
  }

  /** Immediately remove a toast (or all toasts). */
  remove(id?: string): boolean {
    this.assertActive()
    if (id === undefined) {
      if (this.toasts.length === 0) return false
      for (const toast of this.toasts) {
        this.clearTimer(toast.id)
        this.clearRemovalTimer(toast.id)
        this.pauseReasons.delete(toast.id)
      }
      this.toasts = []
    } else {
      if (!this.toasts.some((toast) => toast.id === id)) return false
      this.clearTimer(id)
      this.clearRemovalTimer(id)
      this.pauseReasons.delete(id)
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    }
    this.recomputeStacking()
    this.emit()
    return true
  }

  /** Suspend a toast timer for an independent reason. */
  pause(id?: string, reason: ToastPauseReason = 'manual'): boolean {
    this.assertActive()
    let snapshotChanged = false
    let reasonsChanged = false
    this.toasts = this.toasts.map((toast) => {
      if (toast.status !== 'visible' || (id !== undefined && toast.id !== id)) return toast
      const reasons = this.pauseReasons.get(toast.id) ?? new Set<ToastPauseReason>()
      const wasPaused = reasons.size > 0
      const reasonWasPresent = reasons.has(reason)
      reasons.add(reason)
      if (!reasonWasPresent) reasonsChanged = true
      this.pauseReasons.set(toast.id, reasons)
      if (wasPaused === reasons.size > 0 && toast.paused === reasons.size > 0) return toast
      snapshotChanged = true
      return { ...toast, paused: true, updatedAt: Date.now() }
    })
    for (const toast of this.toasts) this.syncTimer(toast)
    this.syncTicker()
    if (snapshotChanged) this.emit()
    return reasonsChanged
  }

  /** Release one pause reason; counting resumes only when no reasons remain. */
  resume(id?: string, reason: ToastPauseReason = 'manual'): boolean {
    this.assertActive()
    let snapshotChanged = false
    let reasonsChanged = false
    this.toasts = this.toasts.map((toast) => {
      if (toast.status !== 'visible' || (id !== undefined && toast.id !== id)) return toast
      const reasons = this.pauseReasons.get(toast.id)
      if (reasons?.delete(reason)) reasonsChanged = true
      if (reasons?.size === 0) this.pauseReasons.delete(toast.id)
      const paused = this.isPaused(toast.id)
      if (toast.paused === paused) return toast
      snapshotChanged = true
      return { ...toast, paused, updatedAt: Date.now() }
    })
    for (const toast of this.toasts) this.syncTimer(toast)
    this.syncTicker()
    if (snapshotChanged) this.emit()
    return reasonsChanged
  }

  /** Update a measured height. Invalid, missing, and unchanged values are ignored. */
  setHeight(id: string, height: number): boolean {
    this.assertActive()
    if (!id || !Number.isFinite(height) || height < 0) return false
    const index = this.toasts.findIndex((toast) => toast.id === id)
    if (index < 0 || this.toasts[index]?.height === height) return false
    this.toasts = this.toasts.map((toast, toastIndex) =>
      toastIndex === index ? { ...toast, height, updatedAt: Date.now() } : toast,
    )
    this.emit()
    return true
  }

  /** Change the active maximum. */
  setMax(max: number): boolean {
    this.assertActive()
    const normalized = assertMax(max)
    if (this.config.max === normalized) return false
    this.config.max = normalized
    this.recomputeStacking()
    this.emit()
    return true
  }

  setViewportOffset(viewportOffset: ViewportOffset): boolean {
    this.assertActive()
    const normalized = assertViewportOffset(viewportOffset)
    if (this.config.viewportOffset === normalized) return false
    this.config.viewportOffset = normalized
    this.emit()
    return true
  }

  /** Dispose all work. A destroyed store cannot be reused. */
  destroy(): boolean {
    if (this.destroyed) return false
    this.destroyed = true
    for (const [id] of this.timers) this.clearTimer(id)
    for (const [id] of this.removalTimers) this.clearRemovalTimer(id)
    this.stopTicking()
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    }
    this.listeners.clear()
    this.effectListeners.clear()
    this.pauseReasons.clear()
    this.toasts = []
    return true
  }

  private recomputeStacking(): void {
    const activeCounts = new Map<string, number>()
    this.toasts = this.toasts.map((toast) => {
      if (toast.status !== 'visible') return toast.stacked ? { ...toast, stacked: false } : toast
      const key = toast.position ?? '__default__'
      const count = activeCounts.get(key) ?? 0
      const stacked = this.config.max > 0 && count >= this.config.max
      activeCounts.set(key, count + 1)
      return toast.stacked === stacked ? toast : { ...toast, stacked }
    })
    for (const toast of this.toasts) this.syncTimer(toast)
    this.syncTicker()
  }

  private syncTicker(): void {
    const wantsProgress = [...this.listeners.values()].some((options) => options.progress)
    const timerRunning = [...this.timers.values()].some((record) => record.handle !== undefined)
    if (wantsProgress && timerRunning) {
      this.tickHandle ??= setInterval(() => this.emit(true), TICK_MS)
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

  private syncTimer(toast: Toast<T>): void {
    const hasTimer = Number.isFinite(toast.duration) && toast.duration > 0
    const shouldRun = hasTimer && toast.status === 'visible' && !toast.paused && !toast.stacked
    const record = this.timers.get(toast.id)
    if (shouldRun) {
      if (record?.handle !== undefined) return
      const remaining = record?.remaining ?? toast.duration
      this.timers.set(toast.id, {
        handle: setTimeout(() => this.dismiss(toast.id), remaining),
        remaining,
        startedAt: Date.now(),
      })
      return
    }
    if (record?.handle !== undefined) {
      clearTimeout(record.handle)
      record.remaining = Math.max(record.remaining - (Date.now() - record.startedAt), 0)
      record.handle = undefined
    } else if (!record && hasTimer && toast.status === 'visible') {
      this.timers.set(toast.id, {
        handle: undefined,
        remaining: toast.duration,
        startedAt: Date.now(),
      })
    }
  }

  getRemaining(id: string): number | undefined {
    return this.getRemainingFromRecord(this.timers.get(id), Date.now())
  }

  getProgress(id: string): number | undefined {
    const toast = this.toasts.find((candidate) => candidate.id === id)
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

  private getRemainingFromRecord(record: TimerRecord | undefined, now: number): number | undefined {
    if (!record) return undefined
    return Math.max(
      record.handle === undefined ? record.remaining : record.remaining - (now - record.startedAt),
      0,
    )
  }

  private clearTimer(id: string): void {
    const record = this.timers.get(id)
    if (record?.handle !== undefined) clearTimeout(record.handle)
    this.timers.delete(id)
  }

  private clearRemovalTimer(id: string): void {
    const handle = this.removalTimers.get(id)
    if (handle !== undefined) clearTimeout(handle)
    this.removalTimers.delete(id)
  }

  private isPaused(id: string): boolean {
    return (this.pauseReasons.get(id)?.size ?? 0) > 0
  }

  private assertActive(): void {
    if (this.destroyed) throw new Error('ToastStore has been destroyed')
  }

  private notifyListener(listener: Listener<T>, state: ToasterState<T>): void {
    try {
      listener(state)
    } catch (error: unknown) {
      this.reportListenerError(error)
    }
  }

  private reportListenerError(error: unknown): void {
    if ('reportError' in globalThis && typeof globalThis.reportError === 'function') {
      globalThis.reportError(error)
      return
    }
    queueMicrotask(() => {
      throw error
    })
  }
}
