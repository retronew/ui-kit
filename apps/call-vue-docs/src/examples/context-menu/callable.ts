import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import ContextMenu from './ContextMenu.vue'
import type { Action } from './types'

export type { Action }
export const ContextMenuCall = createCallable<
  { x: number; y: number; actions: readonly Action[] },
  string | null
>(
  ContextMenu as unknown as UserComponent<
    { x: number; y: number; actions: readonly Action[] },
    string | null,
    {}
  >,
)
