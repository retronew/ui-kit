<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'

defineProps<{ title: string; message: string; call: DemoCallContext<void> }>()
</script>

<template>
  <div
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="alert-title"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
    >
      <p id="alert-title" class="text-base font-medium text-[var(--color-fg)]">{{ title }}</p>
      <p class="mt-2 text-sm text-[var(--color-fg-muted)]">{{ message }}</p>
      <div class="mt-6 flex justify-end">
        <button
          type="button"
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
          @click="call.end()"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>
