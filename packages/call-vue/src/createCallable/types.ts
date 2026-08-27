import type { Component } from 'vue'

/** Internal: the executor passed to `new Promise()` needs a typed `resolve`. */
export type Resolve<Response> = (value: Response | PromiseLike<Response>) => void

/**
 * Properties every `call.*` context carries, regardless of stack position.
 * Mirrors `CallItemPublicProperties` in react-call's store.
 */
export interface CallItemPublicProperties<Response> {
  /** Stable identity for this call within the stack; safe to use as a `:key`. */
  key: string
  /** Resolve this specific call's promise and mark it `ended`. */
  end: (response: Response) => void
  /**
   * `true` once `end()` has resolved this call. The call stays mounted for
   * `unmountingDelay` ms after this flips, so an exit transition can play.
   */
  ended: boolean
}

/** The `call()` method returned by `createCallable`. */
export type CallFunction<Props, Response> = (props: Props) => Promise<Response>

/** The `upsert()` method returned by `createCallable`. */
export type UpsertFunction<Props, Response> = (props: Props) => Promise<Response>

/**
 * The special `call` prop every user component receives, on top of its own
 * `Props`. Carries per-call identity/state plus stack/root context.
 */
export type CallContext<_Props, Response, RootProps> = CallItemPublicProperties<Response> & {
  /** Props passed to `<Root>` (the mounted callable component), if any. */
  root: RootProps
  /** This call's position in the current stack (0 = oldest). */
  index: number
  /** Number of calls currently stacked (including this one). */
  stackSize: number
}

/** User props merged with the injected `call` context. */
export type PropsWithCall<Props, Response, RootProps> = Props & {
  call: CallContext<Props, Response, RootProps>
}

/**
 * The shape `createCallable` expects: any Vue component (SFC, `defineComponent`,
 * or functional) whose props satisfy `PropsWithCall<Props, Response, RootProps>`.
 */
export type UserComponent<Props, Response, RootProps> = Component<
  PropsWithCall<Props, Response, RootProps>
>

type EndFunction<Response> = ((
  promise: Promise<Response>,
  response: [Response] extends [void] ? undefined : Response,
) => void) &
  ([Response] extends [void] ? (response?: undefined) => void : (response: Response) => void)

/**
 * What `createCallable` returns.
 *
 * The callable is the Root component itself — mount it with `<Confirm />`
 * and use the imperative methods (`call`, `upsert`, `end`, `update`) as
 * properties on the very same object.
 */
export type Callable<Props, Response, RootProps> = Component<RootProps> & {
  /**
   * A stable development-only key used by the Vite integration to retain an
   * open Stack when the module that created this Callable is hot-reloaded.
   */
  displayName?: string
  call: CallFunction<Props, Response>
  upsert: UpsertFunction<Props, Response>
  end: EndFunction<Response>
  update: ((promise: Promise<Response>, props: Partial<Props>) => void) &
    ((props: Partial<Props>) => void)
}
