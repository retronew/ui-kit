<script setup lang="ts">
import { computed } from 'vue'
import type { DemoCallContext } from '../call-context'

interface Props {
  label: string
}

const props = defineProps<Props & { call: DemoCallContext<void> }>()
const position = computed(() => ({
  top: `calc(50% + ${props.call.index * 14 - 80}px)`,
  left: `calc(50% + ${props.call.index * 18 - 140}px)`,
}))
</script>

<template>
  <div
    role="dialog"
    aria-modal="false"
    :style="position"
    class="absolute w-72 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl shadow-black/12"
  >
    <div class="flex items-center justify-between">
      <span class="font-mono text-xs text-[var(--color-fg-subtle)]"
        >call #{{ call.index + 1 }}</span
      >
      <button
        type="button"
        aria-label="Close this call"
        class="-mr-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-[color,background-color,transform] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
        @click="call.end()"
      >
        ×
      </button>
    </div>
    <p class="mt-2 text-sm text-[var(--color-fg)]">{{ label }}</p>
  </div>
</template>
