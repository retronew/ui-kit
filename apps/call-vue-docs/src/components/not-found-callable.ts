import { createCallable } from '@retronew/call-vue'
import NotFoundDialog from './NotFoundDialog.vue'

export const NotFoundCall = createCallable<{ pathname: string }, 'home' | 'stay'>(NotFoundDialog)
