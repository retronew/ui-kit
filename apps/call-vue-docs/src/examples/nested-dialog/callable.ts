import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import NestedDialog from './NestedDialog.vue'

export const NestedDialogCall = createCallable<{ level: number }, void>(
  NestedDialog as unknown as UserComponent<{ level: number }, void, {}>,
)
