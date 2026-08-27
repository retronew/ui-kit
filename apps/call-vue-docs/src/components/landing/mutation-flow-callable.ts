import { createCallable } from '@retronew/call-vue'
import type { MutationFn } from '@retronew/call-vue/mutation-flow'
import SaveDialog from './SaveDialog.vue'

export type SavePayload = { shouldFail: boolean }
export type SaveProps = { mutationFn: MutationFn<'saved', SavePayload> }

export const SaveDialogCallable = createCallable<SaveProps, 'saved', { shouldFail: boolean }>(
  SaveDialog,
)
