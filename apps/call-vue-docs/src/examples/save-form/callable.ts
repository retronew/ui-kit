import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import type { MutationFn } from '@retronew/call-vue/mutation-flow'
import SaveForm from './SaveForm.vue'

type Payload = { name: string; shouldFail: boolean }

export const SaveFormCall = createCallable<
  { initialName?: string; mutationFn: MutationFn<string, Payload> },
  string
>(
  SaveForm as unknown as UserComponent<
    { initialName?: string; mutationFn: MutationFn<string, Payload> },
    string,
    {}
  >,
)
