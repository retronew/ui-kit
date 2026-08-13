import type { ViewportOffset } from './types'

export type ValueFunction<TValue, TArg> = (arg: TArg) => TValue
export type ValueOrFunction<TValue, TArg> = TValue | ValueFunction<TValue, TArg>

function isFunction<TValue, TArg>(
  valOrFunction: ValueOrFunction<TValue, TArg>,
): valOrFunction is ValueFunction<TValue, TArg> {
  return typeof valOrFunction === 'function'
}

/** Call `valOrFunction(arg)` if it's a function, else return it. */
export function resolveValue<TValue, TArg>(
  valOrFunction: ValueOrFunction<TValue, TArg>,
  arg: TArg,
): TValue {
  return isFunction(valOrFunction) ? valOrFunction(arg) : valOrFunction
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Whether the user currently prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false
}

/** Subscribe to runtime reduced-motion preference changes. */
export function subscribeReducedMotion(listener: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  const handleChange = (event: MediaQueryListEvent): void => listener(event.matches)
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }
  if (typeof query.addListener === 'function') {
    query.addListener(handleChange)
    return () => query.removeListener(handleChange)
  }
  return () => {}
}

/** Resolve a `ViewportOffset` to a CSS length: numbers become `px`, strings pass through as-is. */
export function toViewportOffsetCss(offset: ViewportOffset): string {
  return typeof offset === 'number' ? `${offset}px` : offset
}
