import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import SettingsDrawer from './SettingsDrawer.vue'
import type { Settings } from './types'

export type { Settings, Theme } from './types'

export const SettingsDrawerCall = createCallable<{ initial: Settings }, Settings | null>(
  SettingsDrawer as unknown as UserComponent<{ initial: Settings }, Settings | null, {}>,
  300,
)
