import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import ApprovalDialog from './ApprovalDialog.vue'

export const Approval = createCallable<{ action: string }, boolean>(
  ApprovalDialog as unknown as UserComponent<{ action: string }, boolean, {}>,
)
