<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{ command: string; label?: string }>(), {
  label: 'Copy command',
})
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.command)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 1500)
  } catch {
    copied.value = false
  }
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div
    class="inline-flex max-w-full items-center gap-2 overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-left font-mono text-sm text-[var(--color-fg)]"
  >
    <span class="text-[var(--color-fg-subtle)]">$</span>
    <span tabindex="0" class="flex-1 overflow-x-auto whitespace-nowrap">{{ command }}</span>
    <button
      type="button"
      class="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--color-fg-subtle)] transition-[color,background-color,transform] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)] after:absolute after:-inset-2.5 after:content-['']"
      :aria-label="copied ? 'Copied' : label"
      @click="copy"
    >
      <svg
        v-if="copied"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-[var(--color-accent)]"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
    <span class="sr-only" aria-live="polite">{{ copied ? 'Command copied' : '' }}</span>
  </div>
</template>
