import type { ToastStore } from './store'
import type { PromiseMessages, ToastOptions } from './types'

/**
 * The `toast(...)` function bound to a store — a react-hot-toast / sonner-style
 * surface, framework-agnostic.
 */
export interface ToastApi<T = unknown> {
  /** Create a `blank` toast. */
  (message: T, options?: ToastOptions<T>): string
  success(message: T, options?: ToastOptions<T>): string
  error(message: T, options?: ToastOptions<T>): string
  loading(message: T, options?: ToastOptions<T>): string
  info(message: T, options?: ToastOptions<T>): string
  warning(message: T, options?: ToastOptions<T>): string
  custom(message: T, options?: ToastOptions<T>): string
  /** Patch an existing toast by id. */
  update(id: string, patch: ToastOptions<T>): string
  /** Dismiss a toast (or all) — exit, then removal. */
  dismiss(id?: string): void
  /** Remove a toast (or all) immediately. */
  remove(id?: string): void
  /**
   * Drive a toast through a promise's lifecycle: `loading` → `success`/`error`.
   * Returns the promise. Accepts a `Promise` or a `() => Promise` factory.
   */
  promise<V>(
    promise: Promise<V> | (() => Promise<V>),
    messages: PromiseMessages<V, T>,
    options?: ToastOptions<T>,
  ): Promise<V>
}

/** Build a `toast` API bound to the given store. */
export function createToastApi<T = unknown>(store: ToastStore<T>): ToastApi<T> {
  const api = ((message: T, options?: ToastOptions<T>) =>
    store.create(message, {
      ...options,
      type: options?.type ?? 'blank',
    })) as ToastApi<T>

  api.success = (message, options) => store.create(message, { ...options, type: 'success' })
  api.error = (message, options) => store.create(message, { ...options, type: 'error' })
  api.loading = (message, options) => store.create(message, { ...options, type: 'loading' })
  api.info = (message, options) => store.create(message, { ...options, type: 'info' })
  api.warning = (message, options) => store.create(message, { ...options, type: 'warning' })
  api.custom = (message, options) => store.create(message, { ...options, type: 'custom' })

  api.update = (id, patch) => store.update(id, patch)
  api.dismiss = (id) => {
    store.dismiss(id)
  }
  api.remove = (id) => {
    store.remove(id)
  }

  api.promise = async (promiseOrFactory, messages, options) => {
    const id = store.create(messages.loading, {
      ...options,
      type: 'loading',
    })

    const p = typeof promiseOrFactory === 'function' ? promiseOrFactory() : promiseOrFactory

    try {
      const value = await p
      const message =
        typeof messages.success === 'function'
          ? (messages.success as (v: unknown) => T)(value)
          : messages.success
      store.update(id, { ...options, message, type: 'success' })
      return value
    } catch (error: unknown) {
      const message =
        typeof messages.error === 'function'
          ? (messages.error as (e: unknown) => T)(error)
          : messages.error
      store.update(id, { ...options, message, type: 'error' })
      throw error
    }
  }

  return api
}
