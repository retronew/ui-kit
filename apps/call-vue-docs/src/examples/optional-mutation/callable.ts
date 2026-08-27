import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import type { MutationFn } from '@retronew/call-vue/mutation-flow'
import OptionalMutationConfirm from './OptionalMutationConfirm.vue'

export const MutationConfirm = createCallable<
  { message: string; mutationFn?: MutationFn<boolean> },
  boolean
>(
  OptionalMutationConfirm as unknown as UserComponent<
    { message: string; mutationFn?: MutationFn<boolean> },
    boolean,
    {}
  >,
)
