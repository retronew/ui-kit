<script setup lang="ts">
import { type MutationFn, useMutationFlow } from '@retronew/call-vue/mutation-flow'
import { toRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'

const props = defineProps<{
  message: string
  mutationFn?: MutationFn<boolean>
  call: DemoCallContext<boolean>
}>()
const submit = useMutationFlow(props.call, toRef(props, 'mutationFn'))
</script>

<template>
  <div
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <section
      class="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
    >
      <p class="text-base text-[var(--color-fg)]">{{ message }}</p>
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          :disabled="submit.pending"
          class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
          @click="call.end(false)"
        >
          Cancel</button
        ><button
          type="button"
          :disabled="submit.pending"
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          @click="submit().orEnd(true)"
        >
          {{ submit.pending ? 'Working…' : 'Confirm' }}
        </button>
      </div>
    </section>
  </div>
</template>
