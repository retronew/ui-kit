<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'

defineProps<{ message: string; call: DemoCallContext<boolean> }>()
</script>

<template>
  <div
    role="dialog"
    aria-modal="true"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
    >
      <p class="text-base text-[var(--color-fg)]">{{ message }}</p>
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          @click="call.end(false)"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
          @click="call.end(true)"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>
