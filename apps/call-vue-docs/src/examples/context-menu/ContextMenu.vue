<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'
import type { Action } from './types'

const props = defineProps<{
  x: number
  y: number
  actions: readonly Action[]
  call: DemoCallContext<string | null>
}>()
const menu = useTemplateRef<HTMLElement>('menu')
function onPointer(event: MouseEvent) {
  if (menu.value && !menu.value.contains(event.target as Node)) props.call.end(null)
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') props.call.end(null)
}
onMounted(() => {
  document.addEventListener('mousedown', onPointer)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onPointer)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div
    ref="menu"
    role="menu"
    :style="{ top: `${y}px`, left: `${x}px` }"
    class="fixed z-50 min-w-[180px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-1 shadow-2xl"
  >
    <button
      v-for="action in actions"
      :key="action.id"
      type="button"
      role="menuitem"
      :class="
        action.destructive
          ? 'block w-full rounded px-3 py-1.5 text-left text-sm text-red-500 transition-[background-color] hover:bg-red-500/10'
          : 'block w-full rounded px-3 py-1.5 text-left text-sm text-[var(--color-fg)] transition-[background-color] hover:bg-[var(--color-bg-subtle)]'
      "
      @click="call.end(action.id)"
    >
      {{ action.label }}
    </button>
  </div>
</template>
