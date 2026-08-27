import { createCallable } from '@retronew/call-vue'
import StackedDialog from './StackedDialog.vue'

export const StackedCall = createCallable<{ label: string }, void>(StackedDialog)
