import { createCallable } from '@retronew/call-vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { asCallableComponent } from './asCallableComponent'

export interface ConfirmProps {
  title: string
  message: string
}

export type ConfirmResponse = boolean

/**
 * `Confirm.call({ title, message })` resolves `true`/`false` depending on
 * which button the user clicks — the archetypal call-vue use case.
 */
export const Confirm = createCallable<ConfirmProps, ConfirmResponse>(
  asCallableComponent(ConfirmDialog),
)
