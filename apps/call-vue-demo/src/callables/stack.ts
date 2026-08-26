import { createCallable } from '@retronew/call-vue'
import StackCard from '../components/StackCard.vue'
import { asCallableComponent } from './asCallableComponent'

export interface StackCardProps {
  label: string
}

export type StackCardResponse = void

export interface StackRootProps extends Record<string, unknown> {
  /** Shared across every stacked card — demonstrates `RootProps`/`call.root`. */
  accent: string
}

/**
 * `Stack.call({ label })` never resolves anything meaningful (`Response` is
 * `void`) — it exists to show several concurrent calls stacking on top of
 * each other, each aware of its `call.index`/`call.stackSize`, and reading
 * shared data via `call.root` (passed as `<Stack accent="…" />`).
 */
export const Stack = createCallable<StackCardProps, StackCardResponse, StackRootProps>(
  asCallableComponent(StackCard),
)
