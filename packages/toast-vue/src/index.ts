export { toast, toastStore, createToaster } from './toast'
export type { VueToastMessage } from './toast'
export { useToaster } from './useToaster'
export type {
  UseToaster,
  CalculateOffsetOptions,
  StackMetrics,
  StackMetricsOptions,
  UseToasterOptions,
} from './useToaster'
export { Toaster } from './Toaster'
export type { ToasterSlotProps } from './Toaster'
export { ToastWrapper, TOAST_TRANSITION } from './ToastWrapper'
export { useToastHotkey } from './useToastHotkey'
export type { UseToastHotkeyOptions } from './useToastHotkey'

// Re-export core types so consumers only need the Vue adapter.
export type {
  Toast,
  ToastAction,
  ToastApi,
  ToastOptions,
  ToastPauseReason,
  ToastPosition,
  ToastStatus,
  ToastSubscriptionOptions,
  ToastType,
  ToastUpdateOptions,
  ToasterConfig,
  ToasterState,
  ViewportOffset,
  PromiseMessages,
} from '@retronew/toast-core'

export {
  resolveValue,
  prefersReducedMotion,
  subscribeReducedMotion,
  toViewportOffsetCss,
} from '@retronew/toast-core'
export type { ValueOrFunction, ValueFunction } from '@retronew/toast-core'
