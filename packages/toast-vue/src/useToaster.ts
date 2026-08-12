import type {
  Toast,
  ToastPosition,
  ToastStore,
  ToasterState,
  ViewportOffset,
} from '@retronew/toast-core'
import { onScopeDispose, shallowRef } from 'vue'
import type { ShallowRef } from 'vue'
import { toastStore } from './toast'
import type { VueToastMessage } from './toast'

const DEFAULT_GUTTER = 8

export interface CalculateOffsetOptions {
  /** Stack newest-first (towards `top`) when true. Default: `false`. */
  reverseOrder?: boolean
  /** Gap between adjacent toasts in px. Default: `8`. */
  gutter?: number
  /** Fallback position for toasts that have no explicit `position`. */
  defaultPosition?: ToastPosition
}

export interface StackMetricsOptions {
  /** Fallback position for toasts that have no explicit `position`. */
  defaultPosition?: ToastPosition
}

/** A toast's position within its on-screen stack (same `position` group). */
export interface StackMetrics {
  /** 0-based position, front (newest/topmost) first. */
  index: number
  /** `true` for the frontmost toast in its group. */
  isFront: boolean
  /** Higher for toasts nearer the front. */
  zIndex: number
}

export interface UseToaster<T> {
  /** Reactive list of current toasts, newest first. */
  toasts: ShallowRef<Toast<T>[]>
  /** Reactive distance from the toast outlet to the viewport edge. */
  viewportOffset: ShallowRef<ViewportOffset>
  dismiss: (id?: string) => void
  remove: (id?: string) => void
  pause: (id?: string) => void
  resume: (id?: string) => void
  /**
   * Report a toast's rendered height to the store. Wire to `ToastWrapper`'s
   * `height-update` event.
   */
  updateHeight: (id: string, height: number) => void
  /**
   * Cumulative pixel offset for a toast within its stack; position each toast
   * absolutely with it.
   */
  calculateOffset: (toast: Toast<T>, opts?: CalculateOffsetOptions) => number
  /** A toast's index/front/z-index within its position group. */
  getStackMetrics: (toast: Toast<T>, opts?: StackMetricsOptions) => StackMetrics
  /** ms left before `id`'s timer fires; frozen while paused/stacked, `undefined` once there's no active timer. */
  getRemaining: (id: string) => number | undefined
  /** `id`'s remaining duration as a `1` → `0` fraction for a progress bar; same rules as `getRemaining`. */
  getProgress: (id: string) => number | undefined
}

/**
 * Subscribe a Vue component to a toast store and expose reactive `toasts`
 * plus control handlers. Unsubscribes automatically on scope dispose.
 * Pass a custom store for a scoped outlet; defaults to the shared singleton.
 */
export function useToaster<T = VueToastMessage>(
  store: ToastStore<T> = toastStore as unknown as ToastStore<T>,
): UseToaster<T> {
  const initialState = store.getState()
  const toasts = shallowRef<Toast<T>[]>(initialState.toasts)
  const viewportOffset = shallowRef<ViewportOffset>(initialState.viewportOffset)
  const stop = store.subscribe((state: ToasterState<T>) => {
    toasts.value = state.toasts
    viewportOffset.value = state.viewportOffset
  })
  onScopeDispose(stop)

  function updateHeight(id: string, height: number): void {
    store.setHeight(id, height)
  }

  function calculateOffset(toast: Toast<T>, opts?: CalculateOffsetOptions): number {
    const { reverseOrder = false, gutter = DEFAULT_GUTTER, defaultPosition } = opts ?? {}
    const toastPosition = toast.position ?? defaultPosition

    return toasts.value.reduce((acc, t) => {
      // Stacked toasts are hidden/piled away, so they don't shift the toasts in front of them.
      if (t.height == null || t.status !== 'visible' || t.stacked) {
        return acc
      }
      const pos = t.position ?? defaultPosition
      if (pos !== toastPosition) {
        return acc
      }
      const isBefore = reverseOrder ? t.createdAt > toast.createdAt : t.createdAt < toast.createdAt
      return isBefore ? acc + t.height + gutter : acc
    }, 0)
  }

  function getStackMetrics(toast: Toast<T>, opts?: StackMetricsOptions): StackMetrics {
    const { defaultPosition } = opts ?? {}
    const toastPosition = toast.position ?? defaultPosition

    // Same-position, still-visible toasts, newest first.
    const group = toasts.value.filter(
      (t) => t.status === 'visible' && (t.position ?? defaultPosition) === toastPosition,
    )
    const index = group.findIndex((t) => t.id === toast.id)

    return {
      index: index < 0 ? 0 : index,
      isFront: index === 0,
      zIndex: group.length - Math.max(index, 0),
    }
  }

  return {
    calculateOffset,
    dismiss: (id) => store.dismiss(id),
    getProgress: (id) => store.getProgress(id),
    getRemaining: (id) => store.getRemaining(id),
    getStackMetrics,
    pause: (id) => store.pause(id),
    remove: (id) => store.remove(id),
    resume: (id) => store.resume(id),
    toasts,
    updateHeight,
    viewportOffset,
  }
}
