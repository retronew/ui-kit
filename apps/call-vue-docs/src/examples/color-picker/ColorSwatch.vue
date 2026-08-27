<script setup lang="ts">
import { ref } from 'vue'
import { ColorPickerCall } from './callable'

const swatches = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#e11d74',
  '#a3a3a3',
  '#000000',
  '#ffffff',
  '#f59e0b',
] as const
const color = ref('#e11d74')
async function pick() {
  const next = await ColorPickerCall.call({ swatches, current: color.value })
  if (next) color.value = next
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5 text-sm text-[var(--color-fg)] transition-[border-color] hover:border-[var(--color-border-strong)]"
      @click="pick"
    >
      <span
        aria-hidden="true"
        :style="{ backgroundColor: color }"
        class="h-5 w-5 rounded border border-[var(--color-border-strong)]"
      ></span
      ><span class="font-mono text-xs">{{ color }}</span></button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]">click to change</span>
  </div>
</template>
