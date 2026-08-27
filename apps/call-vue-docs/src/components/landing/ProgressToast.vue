<script setup lang="ts">
import type { DemoCallContext } from '../call-context'

interface Props {
  message: string
  percent: number
}

defineProps<Props & { call: DemoCallContext<void> }>()
</script>

<template>
  <div
    role="status"
    class="fixed right-5 bottom-5 z-50 w-72 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl shadow-black/15"
  >
    <div class="flex items-center justify-between gap-4">
      <span class="text-sm text-[var(--color-fg)]">{{ message }}</span>
      <span class="font-mono text-xs text-[var(--color-fg-subtle)] tabular-nums"
        >{{ percent }}%</span
      >
    </div>
    <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
      <div
        class="h-full rounded-full bg-[var(--color-brand)] transition-[width] duration-200"
        :style="{ width: `${percent}%` }"
      ></div>
    </div>
  </div>
</template>
