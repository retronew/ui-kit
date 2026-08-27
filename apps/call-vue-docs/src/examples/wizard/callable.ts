import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import type { WizardResult } from './types'
import Wizard from './Wizard.vue'

export type { WizardResult }
export const WizardCall = createCallable<void, WizardResult | null>(
  Wizard as unknown as UserComponent<void, WizardResult | null, {}>,
)
