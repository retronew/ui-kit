import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import ErrorBanner from './ErrorBanner.vue'

export const ErrorBannerCall = createCallable<{ message: string; durationMs: number }, void>(
  ErrorBanner as unknown as UserComponent<{ message: string; durationMs: number }, void, {}>,
)
