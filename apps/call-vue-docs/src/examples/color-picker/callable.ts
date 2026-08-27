import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import ColorPicker from './ColorPicker.vue'

export const ColorPickerCall = createCallable<
  { swatches: readonly string[]; current?: string },
  string | null
>(
  ColorPicker as unknown as UserComponent<
    { swatches: readonly string[]; current?: string },
    string | null,
    {}
  >,
)
