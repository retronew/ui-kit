<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'

const props = defineProps<{
  appName: string
  scopes: readonly string[]
  call: DemoCallContext<'allow' | 'deny'>
}>()
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
      <p class="text-base font-medium text-[var(--color-fg)]">
        Allow <span class="text-[var(--color-accent)]">{{ appName }}</span> to:
      </p>
      <ul class="mt-4 space-y-2">
        <li
          v-for="scope in scopes"
          :key="scope"
          class="flex items-start gap-2 text-sm text-[var(--color-fg-muted)]"
        >
          <span aria-hidden="true" class="text-[var(--color-accent)]">✓</span>{{ scope }}
        </li>
      </ul>
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
          @click="call.end('deny')"
        >
          Deny</button
        ><button
          type="button"
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
          @click="call.end('allow')"
        >
          Allow
        </button>
      </div>
    </section>
  </div>
</template>
