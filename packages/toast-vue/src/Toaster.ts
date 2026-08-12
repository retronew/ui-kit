import type { Toast, ToastStore, ViewportOffset } from '@retronew/toast-core'
import { defineComponent } from 'vue'
import type { PropType, SlotsType } from 'vue'
import { toastStore } from './toast'
import type { VueToastMessage } from './toast'
import { useToaster } from './useToaster'
import type { CalculateOffsetOptions, StackMetrics, StackMetricsOptions } from './useToaster'

/** Slot props exposed by the renderless `<Toaster>` outlet. */
export interface ToasterSlotProps<T = VueToastMessage> {
  toasts: Toast<T>[]
  /** Distance from the toast outlet to the viewport edge. Numbers are pixels. */
  viewportOffset: ViewportOffset
  dismiss: (id?: string) => void
  remove: (id?: string) => void
  pause: (id?: string) => void
  resume: (id?: string) => void
  /** Report a toast's rendered height; wire to `<ToastWrapper>`'s `height-update`. */
  updateHeight: (id: string, height: number) => void
  /** Cumulative pixel offset for a toast within its stack. */
  calculateOffset: (toast: Toast<T>, opts?: CalculateOffsetOptions) => number
  /** A toast's index/front/z-index within its position group. */
  getStackMetrics: (toast: Toast<T>, opts?: StackMetricsOptions) => StackMetrics
  /** ms left before `id`'s timer fires; pause-aware, `undefined` when no timer is active. */
  getRemaining: (id: string) => number | undefined
}

/**
 * Renderless toast outlet: renders nothing itself; you provide the markup via
 * the default slot and receive `toasts` plus control handlers as slot props.
 */
export const Toaster = defineComponent({
  name: 'Toaster',
  props: {
    /** Store to bind to. Defaults to the shared singleton store. */
    store: {
      default: () => toastStore,
      type: Object as PropType<ToastStore>,
    },
  },
  setup(props, { slots }) {
    const {
      toasts,
      dismiss,
      remove,
      pause,
      resume,
      updateHeight,
      calculateOffset,
      getStackMetrics,
      getRemaining,
      viewportOffset,
    } = useToaster(props.store)
    return () =>
      slots.default?.({
        calculateOffset,
        dismiss,
        getRemaining,
        getStackMetrics,
        pause,
        remove,
        resume,
        toasts: toasts.value,
        updateHeight,
        viewportOffset: viewportOffset.value,
      })
  },
  slots: Object as SlotsType<{
    default: (props: ToasterSlotProps) => unknown
  }>,
})
