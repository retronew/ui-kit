import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import CommandPalette from './CommandPalette.vue'
import type { Command } from './types'

export type { Command }

export const CommandPaletteCall = createCallable<{ commands: readonly Command[] }, string | null>(
  CommandPalette as unknown as UserComponent<{ commands: readonly Command[] }, string | null, {}>,
)
