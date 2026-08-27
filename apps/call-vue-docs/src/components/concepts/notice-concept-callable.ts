import { createCallable } from '@retronew/call-vue'
import NoticeConceptDialog from './NoticeConceptDialog.vue'

export const NoticeConcept = createCallable<{ message: string; count: number }, void>(
  NoticeConceptDialog,
)
