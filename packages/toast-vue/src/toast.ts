import { ToastStore, createToastApi } from '@retronew/toast-core'
import type { ToastApi, ToasterConfig } from '@retronew/toast-core'

/** Default message type: a plain string or any payload your `<Toaster>` understands. */
export type VueToastMessage = unknown

/** Shared singleton store + API — the common "just import and call" path. */
export const toastStore = new ToastStore()

/** The global `toast(...)` function bound to the shared store. */
export const toast: ToastApi = createToastApi(toastStore)

/** Create an isolated toaster (own store + API) for scoped regions or tests. */
export function createToaster<T = VueToastMessage>(
  config?: ToasterConfig,
): {
  store: ToastStore<T>
  toast: ToastApi<T>
} {
  const store = new ToastStore<T>(config)
  return { store, toast: createToastApi(store) }
}
