<script setup lang="ts">
import type { DemoCallContext } from '../call-context'

interface Props {
  message: string
  percent: number
}

defineProps<Props & { call: DemoCallContext<void, { accent: string }> }>()
</script>

<template>
  <div
    class="absolute inset-x-5 top-1/2 -translate-y-1/2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-xl shadow-black/10"
    role="status"
  >
    <div class="flex items-center justify-between gap-4">
      <p class="text-sm font-medium text-[var(--color-fg)]">{{ message }}</p>
      <span class="font-mono text-xs text-[var(--color-fg-subtle)] tabular-nums"
        >{{ percent }}%</span
      >
    </div>
    <div class="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
      <div
        class="h-full rounded-full transition-[width] duration-200"
        :style="{ width: `${percent}%`, backgroundColor: call.root.accent }"
      ></div>
    </div>
  </div>
</template>
