<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'
import type { UploadState } from './types'

const props = defineProps<{
  label: string
  state: UploadState
  call: DemoCallContext<void>
}>()

const stateMeta: Record<UploadState, { icon: string; text: string }> = {
  uploading: { icon: '↑', text: 'uploading…' },
  paused: { icon: '⏸', text: 'paused' },
  done: { icon: '✓', text: 'done' },
}
</script>

<template>
  <div
    :style="{ bottom: `${24 + call.index * 52}px` }"
    class="pointer-events-none fixed right-6 z-50 transition-[bottom] duration-200"
  >
    <div
      class="pointer-events-auto flex w-72 items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] shadow-2xl backdrop-blur"
    >
      <span aria-hidden="true">{{ stateMeta[state].icon }}</span
      ><span class="flex-1 truncate">{{ label }}</span
      ><span class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
        stateMeta[state].text
      }}</span>
      <button
        type="button"
        aria-label="Dismiss"
        class="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
        @click="call.end"
      >
        ×
      </button>
    </div>
  </div>
</template>
