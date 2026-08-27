import { defineComponent, h, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'
import { createStackStore } from './store'
import type { Resolve } from './types'
import type {
  Callable,
  CallContext,
  CallFunction,
  UpsertFunction,
  UserComponent as UserComponentType,
} from './types'

// A Callable's Vite transform assigns a stable displayName during module
// evaluation. A refreshed module can then adopt the pre-refresh store, which
// still belongs to the mounted Root. This registry is intentionally dev-only
// at the call site below, so production consumers do not pay for HMR state.
type RegisteredStore = ReturnType<typeof createStackStore<unknown, unknown>>

const storeRegistry = /* @__PURE__ */ new Map<string, RegisteredStore>()

/**
 * Turns a Vue component into a "callable": mount it once as `<Confirm />`
 * and then `await Confirm.call(props)` from anywhere to push an instance
 * onto its stack and get back a promise that resolves when the instance
 * calls `call.end(response)`.
 *
 * This is a Vue-native port of react-call's `createCallable` — see
 * `skills/call-vue/SKILL.md` for the full mental model (stack, upsert,
 * lifecycle constraints).
 */
export function createCallable<Props = void, Response = void, RootProps extends object = {}>(
  UserComponent: UserComponentType<Props, Response, RootProps>,
  unmountingDelay = 0,
): Callable<Props, Response, RootProps> {
  const storeRef: { current: ReturnType<typeof createStackStore<Props, Response>> } = {
    current: createStackStore<Props, Response>(),
  }

  const createEnd = (promise: Promise<Response> | null) => (response: Response) => {
    // Capture exactly which calls this end() resolves now. `set` runs
    // `updateFn` once per targeted call — for a targeted end that's a
    // single call, for an end-all (promise === null) it's every call
    // currently in the stack. The deferred removal then clears only
    // those, so calls added later in the same tick (e.g. an end-all
    // immediately followed by call()) are never clobbered.
    const ending = new Set<Promise<Response>>()
    storeRef.current.set(promise, (call) => {
      call.resolve(response)
      ending.add(call.promise)
      return { ...call, ended: true }
    })
    globalThis.setTimeout(() => storeRef.current.remove(ending), unmountingDelay)
  }

  const assertSingleRoot = () => {
    const count = storeRef.current.getRootCount()
    if (!count) throw new Error('No <Root> found!')
    if (count > 1) throw new Error('Multiple instances of <Root> found!')
  }

  const call: CallFunction<Props, Response> = (props) => {
    assertSingleRoot()

    let resolve!: Resolve<Response>
    const promise = new Promise<Response>((res) => {
      resolve = res
    })

    storeRef.current.add({
      props,
      end: createEnd(promise),
      ended: false,
      promise,
      resolve,
    })

    return promise
  }

  const upsert: UpsertFunction<Props, Response> = (props) => {
    assertSingleRoot()

    const existing = storeRef.current.getUpsertPromise()
    if (existing) {
      storeRef.current.set(existing, (c) => ({ ...c, props }))
      return existing
    }

    let resolve!: Resolve<Response>
    const promise = new Promise<Response>((res) => {
      resolve = res
    })
    storeRef.current.setUpsertPromise(promise)

    storeRef.current.add({
      props,
      end: (response: Response) => {
        storeRef.current.setUpsertPromise(null)
        createEnd(promise)(response)
      },
      ended: false,
      promise,
      resolve,
    })

    return promise
  }

  const end = ((...args: [Promise<Response>, Response] | [Response]) => {
    const targeted = args.length === 2
    const promise = targeted ? args[0] : null
    const response = targeted ? args[1] : args[0]

    if (!targeted || promise === storeRef.current.getUpsertPromise()) {
      storeRef.current.setUpsertPromise(null)
    }

    return createEnd(promise)(response)
  }) as Callable<Props, Response, RootProps>['end']

  const update: ((promise: Promise<Response>, props: Partial<Props>) => void) &
    ((props: Partial<Props>) => void) = (
    ...args: [Promise<Response>, Partial<Props>] | [Partial<Props>]
  ) => {
    const targeted = args.length === 2
    storeRef.current.set(targeted ? args[0] : null, (c) => ({
      ...c,
      props: { ...c.props, ...(targeted ? args[1] : args[0]) },
    }))
  }

  // `RootProps` is only known to the caller's generic instantiation — Vue's
  // `defineComponent` here infers an empty props type since we declare none
  // (everything arrives through `attrs`, see below), so the public,
  // caller-facing type is asserted through `unknown` rather than narrowed.
  const Root = defineComponent({
    name: 'CallableRoot',
    inheritAttrs: false,
    setup(_, { attrs }) {
      let unmountRoot: (() => void) | undefined

      // Vue executes setup() during SSR but does not run unmount hooks there.
      // Count roots only after a client mount so server renders cannot leak
      // root registrations into later requests.
      onMounted(() => {
        unmountRoot = storeRef.current.mountRoot()
      })
      onUnmounted(() => unmountRoot?.())

      return () =>
        storeRef.current.stack.value.map((item, index, stack) =>
          h(UserComponent, {
            ...item.props,
            key: item.key,
            call: {
              key: item.key,
              end: item.end,
              ended: item.ended,
              root: attrs as RootProps,
              index,
              stackSize: stack.length,
            } satisfies CallContext<Props, Response, RootProps>,
          }),
        )
    },
  }) as unknown as Component<RootProps>

  const callable = Object.assign(Root, { call, upsert, end, update }) as Callable<
    Props,
    Response,
    RootProps
  >

  if (process.env.NODE_ENV !== 'production') {
    let displayName: string | undefined
    let registered = false
    Object.defineProperty(callable, 'displayName', {
      configurable: true,
      enumerable: true,
      get: () => displayName,
      set: (value: string | undefined) => {
        if (registered) return
        displayName = value
        if (!value) return
        registered = true
        const existing = storeRegistry.get(value)
        if (existing) {
          storeRef.current = existing as unknown as ReturnType<
            typeof createStackStore<Props, Response>
          >
        } else {
          storeRegistry.set(value, storeRef.current as unknown as RegisteredStore)
        }
      },
    })
  }

  return callable
}
