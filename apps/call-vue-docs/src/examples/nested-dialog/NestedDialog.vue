<script setup lang="ts">
import { computed } from 'vue'
import type { DemoCallContext } from '~/components/call-context'
import { NestedDialogCall } from './callable'

const props = defineProps<{ level: number; call: DemoCallContext<void> }>()
const isTopmost = computed(() => props.call.index + 1 === props.call.stackSize)
const visible = computed(() => props.call.index >= props.call.stackSize - 10)
const offset = computed(() => (props.call.index % 6) * 18)

function openNested() {
  void NestedDialogCall.call({ level: props.level + 1 })
}
</script>

<template>
  <div
    v-if="visible"
    :class="
      isTopmost
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
        : 'pointer-events-none fixed inset-0 z-50 flex items-center justify-center'
    "
  >
    <section
      :style="{ transform: `translate(${offset}px, ${offset}px)` }"
      class="pointer-events-auto w-[340px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
    >
      <div class="flex items-center justify-between">
        <p class="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Level {{ level }} · #{{ call.index + 1 }} of {{ call.stackSize }}
        </p>
        <button
          type="button"
          aria-label="Close"
          class="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          @click="call.end"
        >
          ×
        </button>
      </div>
      <p class="mt-3 text-sm text-[var(--color-fg)]">
        A Callable can open itself. Each open instance has its own promise, resolved by its own
        <code class="font-mono text-xs">call.end()</code>.
      </p>
      <div class="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-md text-sm font-medium text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg-muted)]"
          @click="NestedDialogCall.end"
        >
          Close all
        </button>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            @click="call.end"
          >
            Close</button
          ><button
            type="button"
            class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
            @click="openNested"
          >
            Open nested
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
