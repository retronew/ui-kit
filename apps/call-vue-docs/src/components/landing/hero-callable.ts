import { createCallable } from '@retronew/call-vue'
import type { Locale } from '~/i18n'
import HeroConfirmDialog from './HeroConfirmDialog.vue'

export const HeroConfirm = createCallable<{ message: string; locale: Locale }, boolean>(
  HeroConfirmDialog,
)
