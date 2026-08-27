import { createCallable } from '@retronew/call-vue'
import type { UserComponent } from '@retronew/call-vue'
import PromptInput from './PromptInput.vue'

export interface PromptProps {
  title: string
  placeholder?: string
  defaultValue?: string
}

export const Prompt = createCallable<PromptProps, string | null>(
  PromptInput as unknown as UserComponent<PromptProps, string | null, {}>,
)
