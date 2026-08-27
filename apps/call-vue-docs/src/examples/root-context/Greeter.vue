<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'

type RootProps = { userName: string }
const props = defineProps<{ message: string; call: DemoCallContext<boolean, RootProps> }>()
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
      <p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
        Signed in as {{ call.root.userName }}
      </p>
      <p class="mt-2 text-base text-[var(--color-fg)]">{{ message }}</p>
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          @click="call.end(false)"
        >
          Not now</button
        ><button
          type="button"
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
          @click="call.end(true)"
        >
          Enable
        </button>
      </div>
    </section>
  </div>
</template>
