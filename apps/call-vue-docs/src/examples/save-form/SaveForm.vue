<script setup lang="ts">
import { type MutationFn, useMutationFlow } from '@retronew/call-vue/mutation-flow'
import { ref, toRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'

type Payload = { name: string; shouldFail: boolean }
const props = defineProps<{
  initialName?: string
  mutationFn: MutationFn<string, Payload>
  call: DemoCallContext<string>
}>()
const name = ref(props.initialName ?? '')
const shouldFail = ref(false)
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
      <p class="text-base font-medium text-[var(--color-fg)]">Save item</p>
      <input
        v-model="name"
        type="text"
        :disabled="submit.pending"
        placeholder="Item name"
        class="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-base text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none disabled:opacity-50 md:text-sm"
      /><label class="mt-3 flex items-center gap-2 text-xs text-[var(--color-fg-subtle)]"
        ><input
          v-model="shouldFail"
          type="checkbox"
          :disabled="submit.pending"
          class="accent-[var(--color-accent)]"
        />Simulate a failed save</label
      >
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          :disabled="submit.pending"
          class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
          @click="call.end('')"
        >
          Cancel</button
        ><button
          type="button"
          :disabled="submit.pending || !name.trim()"
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
          @click="submit({ name: name.trim(), shouldFail })"
        >
          {{ submit.pending ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </section>
  </div>
</template>
