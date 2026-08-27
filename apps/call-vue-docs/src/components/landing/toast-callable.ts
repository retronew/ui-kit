import { createCallable } from '@retronew/call-vue'
import ProgressToast from './ProgressToast.vue'

export const Progress = createCallable<{ message: string; percent: number }, void>(
  ProgressToast,
  180,
)
