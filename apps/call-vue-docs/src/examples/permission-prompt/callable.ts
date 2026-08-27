import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import PermissionPrompt from './PermissionPrompt.vue'

export const Permission = createCallable<
  { appName: string; scopes: readonly string[] },
  'allow' | 'deny'
>(
  PermissionPrompt as unknown as UserComponent<
    { appName: string; scopes: readonly string[] },
    'allow' | 'deny',
    {}
  >,
)
