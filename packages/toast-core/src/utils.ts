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

/** Whether the user prefers reduced motion; memoised after the first call. */
export const prefersReducedMotion = (() => {
  let shouldReduceMotion: boolean | undefined

  return (): boolean => {
    if (shouldReduceMotion === undefined && typeof window !== 'undefined') {
      const mediaQuery = matchMedia('(prefers-reduced-motion: reduce)')
      shouldReduceMotion = !mediaQuery || mediaQuery.matches
    }
    return shouldReduceMotion ?? false
  }
})()
