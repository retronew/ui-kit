import { shallowRef } from 'vue'
import type { Resolve } from './types'

export type CallItem<Props, Response> = {
  key: string
  props: Props
  end: (response: Response) => void
  ended: boolean
  promise: Promise<Response>
  resolve: Resolve<Response>
}

type Stack<Props, Response> = CallItem<Props, Response>[]

/**
 * Vue-native replacement for react-call's `useSyncExternalStore`-backed
 * store: `shallowRef` already gives us a single reactive snapshot per
 * store, so there's no separate subscribe/getSnapshot machinery to hand-roll.
 *
 * `rootCount` plays the role react-call's `listeners.size` plays — it's how
 * `assertSingleRoot` in `createCallable` detects a missing or duplicated
 * `<Root>`. It's tracked here (rather than as its own `ref`) because it must
 * never trigger a re-render on its own; only stack changes should.
 */
export function createStackStore<Props, Response>() {
  let nextKey = 0
  let upsertPromise: Promise<Response> | null = null
  let rootCount = 0
  const stack = shallowRef<Stack<Props, Response>>([])

  return {
    stack,
    add: (call: Omit<CallItem<Props, Response>, 'key'>) => {
      stack.value = [...stack.value, { ...call, key: String(nextKey++) }]
    },
    set: (
      promise: Promise<Response> | null,
      updateFn: (call: CallItem<Props, Response>) => CallItem<Props, Response>,
    ) => {
      stack.value = stack.value.map((call) =>
        promise && call.promise !== promise ? call : updateFn(call),
      )
    },
    remove: (promises: Set<Promise<Response>>) => {
      stack.value = stack.value.filter((c) => !promises.has(c.promise))
    },
    /** Call once from a mounted `<Root>`; call the returned function on unmount. */
    mountRoot: () => {
      rootCount++
      return () => {
        rootCount--
        if (rootCount === 0) {
          nextKey = 0
          stack.value = []
          upsertPromise = null
        }
      }
    },
    getRootCount: () => rootCount,
    getUpsertPromise: () => upsertPromise,
    setUpsertPromise: (p: Promise<Response> | null) => {
      upsertPromise = p
    },
  }
}
