<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'

const props = withDefaults(
  defineProps<{
    title: string
    placeholder?: string
    defaultValue?: string
    call: DemoCallContext<string | null>
  }>(),
  { defaultValue: '' },
)
const value = ref(props.defaultValue)
const input = useTemplateRef<HTMLInputElement>('input')

function submit() {
  props.call.end(value.value.trim() || null)
}

onMounted(async () => {
  await nextTick()
  input.value?.focus()
})
</script>

<template>
  <div
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <form
      class="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
      @submit.prevent="submit"
    >
      <label for="prompt-input" class="text-base font-medium text-[var(--color-fg)]">{{
        title
      }}</label>
      <input
        id="prompt-input"
        ref="input"
        v-model="value"
        type="text"
        :placeholder="placeholder"
        class="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-base text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none md:text-sm"
      />
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          @click="call.end(null)"
        >
          Cancel</button
        ><button
          type="submit"
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
        >
          OK
        </button>
      </div>
    </form>
  </div>
</template>
