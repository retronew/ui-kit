<script setup lang="ts">
import { useMutationFlow } from '@retronew/call-vue/mutation-flow'
import { toRef } from 'vue'
import type { DemoCallContext } from '../call-context'
import type { SaveProps } from './mutation-flow-callable'

const props = defineProps<SaveProps & { call: DemoCallContext<'saved', { shouldFail: boolean }> }>()
const submit = useMutationFlow(props.call, toRef(props, 'mutationFn'))
</script>

<template>
  <div
    class="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg)]/70 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-label="Save changes"
  >
    <div
      class="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-2xl shadow-black/10"
    >
      <p class="text-sm font-medium text-[var(--color-fg)]">Save changes?</p>
      <p class="mt-1 text-xs text-[var(--color-fg-muted)]">Your unsaved work will be persisted.</p>
      <div class="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          :disabled="submit.pending"
          class="text-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)] disabled:opacity-50"
          @click="props.call.end('saved')"
        >
          Discard
        </button>
        <button
          type="button"
          :disabled="submit.pending"
          class="inline-flex h-7 items-center justify-center rounded-md bg-[var(--color-brand)] px-3 text-xs font-medium text-[var(--color-brand-fg)] transition-[background-color,opacity] hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
          @click="submit({ shouldFail: props.call.root.shouldFail })"
        >
          {{ submit.pending ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
