import type {
  Toast,
  ToastPauseReason,
  ToastPosition,
  ToastStore,
  ToasterState,
  ViewportOffset,
} from '@retronew/toast-core'
import { onScopeDispose, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { toastStore } from './toast'
import type { VueToastMessage } from './toast'

const DEFAULT_GUTTER = 8

export interface CalculateOffsetOptions {
  /** Stack newer toasts before older ones when true. Default: `false`. */
  reverseOrder?: boolean
  /** Gap between adjacent toasts in px. Default: `8`. */
  gutter?: number
  /** Fallback position for toasts that have no explicit `position`. */
  defaultPosition?: ToastPosition
  /** Include queued/stacked toasts in cumulative offsets. Default `false`. */
  includeStacked?: boolean
}

export interface StackMetricsOptions {
  defaultPosition?: ToastPosition
}

export interface UseToasterOptions {
  /** Subscribe to 250ms timer snapshots for countdown/progress UI. Default `false`. */
  progress?: MaybeRefOrGetter<boolean>
}

export interface StackMetrics {
  index: number
  isFront: boolean
  zIndex: number
}

export interface UseToaster<T> {
  toasts: ShallowRef<readonly Toast<T>[]>
  viewportOffset: ShallowRef<ViewportOffset>
  dismiss: (id?: string) => boolean
  remove: (id?: string) => boolean
  pause: (id?: string, reason?: ToastPauseReason) => boolean
  resume: (id?: string, reason?: ToastPauseReason) => boolean
  updateHeight: (id: string, height: number) => boolean
  calculateOffset: (toast: Toast<T>, opts?: CalculateOffsetOptions) => number
  getStackMetrics: (toast: Toast<T>, opts?: StackMetricsOptions) => StackMetrics
  getRemaining: (id: string) => number | undefined
  getProgress: (id: string) => number | undefined
}

interface LayoutCache {
  metrics: Map<string, StackMetrics>
  offsets: Map<string, number>
}

/** Subscribe Vue state to a static or reactive toast store. */
export function useToaster<T = VueToastMessage>(
  store: MaybeRefOrGetter<ToastStore<T>> = toastStore as ToastStore<T>,
  options: UseToasterOptions = {},
): UseToaster<T> {
  const initialState = toValue(store).getState()
  const toasts = shallowRef<readonly Toast<T>[]>(initialState.toasts)
  const viewportOffset = shallowRef<ViewportOffset>(initialState.viewportOffset)
  let layoutSource: readonly Toast<T>[] | undefined
  const layoutCaches = new Map<string, LayoutCache>()

  function applyState(state: ToasterState<T>): void {
    toasts.value = state.toasts
    viewportOffset.value = state.viewportOffset
  }

  const stopWatching = watch(
    [() => toValue(store), () => toValue(options.progress ?? false)] as const,
    ([nextStore, progress], _previous, onCleanup) => {
      applyState(nextStore.getState())
      const unsubscribe = nextStore.subscribe(applyState, { progress })
      onCleanup(unsubscribe)
    },
    { immediate: true },
  )
  onScopeDispose(stopWatching)

  function currentStore(): ToastStore<T> {
    return toValue(store)
  }

  function getLayout(
    defaultPosition: ToastPosition | undefined,
    gutter: number,
    reverseOrder: boolean,
    includeStacked: boolean,
  ): LayoutCache {
    if (layoutSource !== toasts.value) {
      layoutSource = toasts.value
      layoutCaches.clear()
    }
    const key = `${defaultPosition ?? '__default__'}|${gutter}|${reverseOrder}|${includeStacked}`
    const cached = layoutCaches.get(key)
    if (cached) return cached

    const groups = new Map<string, Toast<T>[]>()
    for (const toast of toasts.value) {
      const position = toast.position ?? defaultPosition ?? '__default__'
      const group = groups.get(position) ?? []
      group.push(toast)
      groups.set(position, group)
    }

    const layout: LayoutCache = { metrics: new Map(), offsets: new Map() }
    for (const group of groups.values()) {
      const visible = group.filter((toast) => toast.status === 'visible')
      for (const [index, toast] of visible.entries()) {
        layout.metrics.set(toast.id, {
          index,
          isFront: index === 0,
          zIndex: visible.length - index,
        })
      }

      let offset = 0
      const ordered = reverseOrder ? group : [...group].reverse()
      for (const toast of ordered) {
        layout.offsets.set(toast.id, offset)
        if (
          toast.height != null &&
          toast.status === 'visible' &&
          (includeStacked || !toast.stacked)
        ) {
          offset += toast.height + gutter
        }
      }
    }
    layoutCaches.set(key, layout)
    return layout
  }

  function calculateOffset(toast: Toast<T>, opts?: CalculateOffsetOptions): number {
    const {
      reverseOrder = false,
      gutter = DEFAULT_GUTTER,
      defaultPosition,
      includeStacked = false,
    } = opts ?? {}
    return (
      getLayout(defaultPosition, gutter, reverseOrder, includeStacked).offsets.get(toast.id) ?? 0
    )
  }

  function getStackMetrics(toast: Toast<T>, opts?: StackMetricsOptions): StackMetrics {
    const layout = getLayout(opts?.defaultPosition, DEFAULT_GUTTER, false, false)
    return layout.metrics.get(toast.id) ?? { index: -1, isFront: false, zIndex: 0 }
  }

  return {
    calculateOffset,
    dismiss: (id) => currentStore().dismiss(id),
    getProgress: (id) => currentStore().getProgress(id),
    getRemaining: (id) => currentStore().getRemaining(id),
    getStackMetrics,
    pause: (id, reason) => currentStore().pause(id, reason),
    remove: (id) => currentStore().remove(id),
    resume: (id, reason) => currentStore().resume(id, reason),
    toasts,
    updateHeight: (id, height) => currentStore().setHeight(id, height),
    viewportOffset,
  }
}
