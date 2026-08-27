import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import type { UploadState } from './types'
import UploadPill from './UploadPill.vue'

export type { UploadState } from './types'

export const Upload = createCallable<{ label: string; state: UploadState }, void>(
  UploadPill as unknown as UserComponent<{ label: string; state: UploadState }, void, {}>,
)
