import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import ConfirmDialog from './ConfirmDialog.vue'

export interface ConfirmProps {
  message: string
}

export const Confirm = createCallable<ConfirmProps, boolean>(
  ConfirmDialog as unknown as UserComponent<ConfirmProps, boolean, {}>,
)
