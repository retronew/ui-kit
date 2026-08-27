import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import type { Locale } from '~/i18n'
import type { ShowcaseKind } from './showcase-types'
import ShowcaseSurface from './ShowcaseSurface.vue'

export type { ShowcaseKind } from './showcase-types'

export interface ShowcaseProps {
  locale: Locale
  kind: ShowcaseKind
  title: string
  options: readonly ShowcaseOption[]
  x?: number
  y?: number
}

export interface ShowcaseOption {
  id: string
  label: string
  shortcut?: string
  icon?: string
  destructive?: boolean
}

// The SFC uses a structural local call prop to avoid the Vue compiler's
// TypeScript 6 generic-expansion recursion. It still satisfies this callable
// contract at runtime and in the template checked by Astro.
const ShowcaseComponent = ShowcaseSurface as unknown as UserComponent<
  ShowcaseProps,
  string | null,
  {}
>

export const Showcase = createCallable<ShowcaseProps, string | null>(ShowcaseComponent)

// The bottom-sheet example uses call.ended for its 300ms leave transition.
// Keeping this lifecycle isolated prevents a completed command, picker, wizard,
// or context menu from being held in the stack after it has resolved.
export const BottomSheet = createCallable<ShowcaseProps, string | null>(ShowcaseComponent, 300)
