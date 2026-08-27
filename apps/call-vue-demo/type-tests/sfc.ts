import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import type { ConfirmProps, ConfirmResponse } from '../src/callables/confirm.ts'
import ConfirmDialog from '../src/components/ConfirmDialog.vue'

const ConfirmComponent: UserComponent<ConfirmProps, ConfirmResponse, {}> = ConfirmDialog
createCallable<ConfirmProps, ConfirmResponse>(ConfirmComponent)
