<script setup lang="ts">
import type { DemoCallContext } from './call-context'

defineProps<{
  pathname: string
  call: DemoCallContext<'home' | 'stay'>
}>()
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="not-found-title"
  >
    <section
      class="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl shadow-black/20"
    >
      <p class="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
        404 callable
      </p>
      <h2 id="not-found-title" class="mt-2 text-lg font-medium text-[var(--color-fg)]">
        Still looking for this page?
      </h2>
      <p class="mt-2 break-all font-mono text-xs text-[var(--color-fg-subtle)]">{{ pathname }}</p>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] px-4 text-sm text-[var(--color-fg-muted)]"
          @click="call.end('stay')"
        >
          Stay here</button
        ><button
          type="button"
          class="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-brand-fg)]"
          @click="call.end('home')"
        >
          Go home
        </button>
      </div>
    </section>
  </div>
</template>
