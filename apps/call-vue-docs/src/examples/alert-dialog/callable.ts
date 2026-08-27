import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import AlertDialog from './AlertDialog.vue'

export interface AlertProps {
  title: string
  message: string
}

export const Alert = createCallable<AlertProps, void>(
  AlertDialog as unknown as UserComponent<AlertProps, void, {}>,
)
