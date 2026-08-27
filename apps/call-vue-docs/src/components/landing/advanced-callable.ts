import { createCallable } from '@retronew/call-vue'
import AdvancedProgress from './AdvancedProgress.vue'

export const AdvancedToast = createCallable<
  { message: string; percent: number },
  void,
  { accent: string }
>(AdvancedProgress, 160)
