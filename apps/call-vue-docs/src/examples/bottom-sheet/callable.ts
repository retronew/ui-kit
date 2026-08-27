import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import BottomSheet from './BottomSheet.vue'
import type { Action } from './types'

export type { Action }

export const BottomSheetCall = createCallable<
  { title: string; actions: readonly Action[] },
  string | null
>(
  BottomSheet as unknown as UserComponent<
    { title: string; actions: readonly Action[] },
    string | null,
    {}
  >,
  300,
)
