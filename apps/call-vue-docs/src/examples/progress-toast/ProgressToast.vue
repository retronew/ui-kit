<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'

const props = defineProps<{ message: string; percent?: number; call: DemoCallContext<void> }>()
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    :style="{ bottom: `${24 + call.index * 84}px` }"
    class="pointer-events-none fixed right-6 z-50 transition-[bottom] duration-200"
  >
    <div
      class="pointer-events-auto min-w-[280px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm text-[var(--color-fg)]">{{ message }}</p>
        <button
          type="button"
          aria-label="Dismiss"
          class="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-[color,background-color] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          @click="call.end()"
        >
          ×
        </button>
      </div>
      <div
        v-if="typeof percent === 'number'"
        class="mt-3 h-1 overflow-hidden rounded-full bg-[var(--color-bg-muted)]"
      >
        <div
          class="h-full bg-[var(--color-accent)] transition-all duration-200"
          :style="{ width: `${Math.min(100, Math.max(0, percent))}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
