import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import Greeter from './Greeter.vue'

export type GreeterRootProps = { userName: string }

export const GreeterCall = createCallable<{ message: string }, boolean, GreeterRootProps>(
  Greeter as unknown as UserComponent<{ message: string }, boolean, GreeterRootProps>,
)
