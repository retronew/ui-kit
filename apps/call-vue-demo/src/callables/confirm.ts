import { createCallable } from '@retronew/call-vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

export interface ConfirmProps {
  title: string
  message: string
}

export type ConfirmResponse = boolean

/**
 * `Confirm.call({ title, message })` resolves `true`/`false` depending on
 * which button the user clicks — the archetypal call-vue use case. The
 * 150ms second argument matches `ConfirmDialog.vue`'s `--modal-close-dur`
 * (closes are faster than opens) and keeps an ended dialog mounted just
 * long enough for that CSS exit transition, driven off `call.ended`, to
 * finish before it's removed.
 */
export const Confirm = createCallable<ConfirmProps, ConfirmResponse>(ConfirmDialog, 150)
