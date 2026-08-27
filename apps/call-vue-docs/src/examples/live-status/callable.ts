import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import LiveStatus from './LiveStatus.vue'
import type { Stage } from './types'

export type { Stage } from './types'

export const Status = createCallable<{ stage: Stage }, void>(
  LiveStatus as unknown as UserComponent<{ stage: Stage }, void, {}>,
)
