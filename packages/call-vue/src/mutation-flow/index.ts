import { isRef, ref } from 'vue'
import type { Ref } from 'vue'

/** The narrow call view exposed to a mutation handler. */
export type MutationCall<Response> = {
  end: (response: Response) => void
}

/** An async side-effect that decides when its Call should close. */
export type MutationFn<Response, Payload = void> = (
  call: MutationCall<Response>,
  payload: Payload,
) => Promise<void>

/** Runs a required mutation and exposes its in-flight state. */
export type Trigger<Payload> = ((payload: Payload) => void) & {
  pending: boolean
}

/** Adds a per-callsite fallback for an optional mutation. */
export type ChainTrigger<Payload, Response> = ((payload: Payload) => {
  orEnd: (value: Response) => void
}) & { pending: boolean }

type MutationSource<Response, Payload> =
  | MutationFn<Response, Payload>
  | Readonly<Ref<MutationFn<Response, Payload> | undefined>>
  | undefined

const noopChain = { orEnd: () => {} }

function resolveMutation<Response, Payload>(
  source: MutationSource<Response, Payload>,
): MutationFn<Response, Payload> | undefined {
  return isRef(source) ? source.value : source
}

/**
 * Coordinates an async submission with a Call's lifecycle.
 *
 * Pass a `Ref` when the handler can change while the Call is mounted, such as
 * when `Callable.update()` replaces a `mutationFn` prop.
 */
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  mutationFn: MutationFn<Response, Payload> | Readonly<Ref<MutationFn<Response, Payload>>>,
): Trigger<Payload>
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  mutationFn: MutationSource<Response, Payload>,
): ChainTrigger<Payload, Response>
export function useMutationFlow<Response, Payload = void>(
  call: MutationCall<Response>,
  mutationSource: MutationSource<Response, Payload>,
): ChainTrigger<Payload, Response> {
  const pending = ref(false)
  let inFlight = false

  const trigger = ((payload: Payload) => {
    if (inFlight) return noopChain

    const mutationFn = resolveMutation(mutationSource)
    if (!mutationFn) return { orEnd: (value: Response) => call.end(value) }

    inFlight = true
    pending.value = true
    void mutationFn(call, payload).finally(() => {
      inFlight = false
      pending.value = false
    })

    return noopChain
  }) as ChainTrigger<Payload, Response>

  Object.defineProperty(trigger, 'pending', {
    enumerable: true,
    get: () => pending.value,
  })

  return trigger
}
