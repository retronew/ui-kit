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
  options: string[]
  x?: number
  y?: number
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
