import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import ProgressToast from './ProgressToast.vue'

export const Toast = createCallable<{ message: string; percent?: number }, void>(
  ProgressToast as unknown as UserComponent<{ message: string; percent?: number }, void, {}>,
)
