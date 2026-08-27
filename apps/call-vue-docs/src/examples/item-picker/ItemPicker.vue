<script setup lang="ts">
import type { DemoCallContext } from '~/components/call-context'
import type { Item } from './types'

defineProps<{ title: string; items: readonly Item[]; call: DemoCallContext<Item | null> }>()
</script>

<template>
  <div
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2 shadow-2xl"
    >
      <div class="flex items-center justify-between px-3 py-2">
        <p class="text-sm font-medium text-[var(--color-fg)]">{{ title }}</p>
        <button
          type="button"
          aria-label="Cancel"
          class="-mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-base leading-none text-[var(--color-fg-subtle)] transition-[color,background-color] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          @click="call.end(null)"
        >
          ×
        </button>
      </div>
      <ul class="max-h-72 overflow-y-auto">
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-[var(--color-fg)] transition-[background-color] hover:bg-[var(--color-bg-subtle)]"
            @click="call.end(item)"
          >
            <span>{{ item.name }}</span
            ><span v-if="item.hint" class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
              item.hint
            }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
