import type { Component, DefineComponent } from 'vue'

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

/**
 * What `createCallable` returns.
 *
 * The callable is the Root component itself — mount it with `<Confirm />`
 * (or `<Confirm.Root />`) and use the imperative methods (`call`, `upsert`,
 * `end`, `update`) as properties on the very same object.
 */
export type Callable<Props, Response, RootProps> = DefineComponent<RootProps> & {
  /** Alias for the callable itself — `Confirm.Root === Confirm`. */
  Root: DefineComponent<RootProps>
  call: CallFunction<Props, Response>
  upsert: UpsertFunction<Props, Response>
  end: ((promise: Promise<Response>, response: Response) => void) & ((response: Response) => void)
  update: ((promise: Promise<Response>, props: Partial<Props>) => void) &
    ((props: Partial<Props>) => void)
}
