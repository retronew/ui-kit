import { createCallable } from '@retronew/call-vue'
import ToastCard from '../components/ToastCard.vue'
import { asCallableComponent } from './asCallableComponent'

export interface ToastCardProps {
  text: string
}

export type ToastCardResponse = void

/**
 * `Toast.upsert({ text })` reuses the same instance while one is already
 * open (singleton semantics) instead of stacking a new one — ideal for a
 * progress/status toast whose text changes over time. The 220ms second
 * argument keeps an ended instance mounted long enough for the CSS exit
 * transition in `ToastCard.vue` (driven off `call.ended`) to finish before
 * it's actually removed from the stack.
 */
export const Toast = createCallable<ToastCardProps, ToastCardResponse>(
  asCallableComponent(ToastCard),
  220,
)
