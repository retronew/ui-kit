<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'
import type { Stage } from './types'

const props = defineProps<{ stage: Stage; call: DemoCallContext<void> }>()
const stages: readonly Stage[] = ['placed', 'packing', 'shipped', 'out', 'delivered']
const labels: Record<Stage, string> = {
  placed: 'Order placed',
  packing: 'Packing your order',
  shipped: 'Handed to carrier',
  out: 'Out for delivery',
  delivered: 'Delivered',
}
</script>

<template>
  <div class="pointer-events-none fixed right-6 bottom-6 z-50">
    <div
      class="pointer-events-auto w-[280px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
            Order #4821
          </p>
          <p class="mt-0.5 text-sm font-medium text-[var(--color-fg)]">{{ labels[stage] }}</p>
        </div>
        <button
          type="button"
          :aria-label="stage === 'delivered' ? 'Dismiss' : 'Stop watching'"
          class="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          @click="call.end"
        >
          ×
        </button>
      </div>
      <div class="mt-3 flex gap-1">
        <span
          v-for="(item, index) in stages"
          :key="item"
          class="h-1 flex-1 rounded-full transition-colors"
          :class="
            index <= stages.indexOf(stage)
              ? 'bg-[var(--color-accent)]'
              : 'bg-[var(--color-bg-muted)]'
          "
        ></span>
      </div>
    </div>
  </div>
</template>
