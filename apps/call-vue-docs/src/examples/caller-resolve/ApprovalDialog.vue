<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'

const props = defineProps<{ action: string; call: DemoCallContext<boolean> }>()
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
      <p class="text-base text-[var(--color-fg)]">Approve: {{ action }}?</p>
      <p class="mt-1 text-xs text-[var(--color-fg-subtle)]">
        Auto-declines from the caller if you don't respond in time.
      </p>
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          @click="call.end(false)"
        >
          Decline</button
        ><button
          type="button"
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
          @click="call.end(true)"
        >
          Approve
        </button>
      </div>
    </section>
  </div>
</template>
