<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'

interface Props {
  message: string
  count: number
}

defineProps<Props & { call: DemoCallContext<void> }>()
</script>

<template>
  <div role="status" aria-live="polite" class="pointer-events-none absolute bottom-4 right-4">
    <div
      class="pointer-events-auto min-w-[240px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 shadow-2xl"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm text-[var(--color-fg)]">{{ message }}</p>
        <span class="font-mono text-xs text-[var(--color-accent)]">#{{ count }}</span>
      </div>
      <button
        type="button"
        class="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg-muted)]"
        @click="call.end()"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>
