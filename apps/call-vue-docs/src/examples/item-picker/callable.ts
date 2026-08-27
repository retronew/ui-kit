import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import ItemPicker from './ItemPicker.vue'
import type { Item } from './types'

export type { Item }
export const Picker = createCallable<{ title: string; items: readonly Item[] }, Item | null>(
  ItemPicker as unknown as UserComponent<
    { title: string; items: readonly Item[] },
    Item | null,
    {}
  >,
)
