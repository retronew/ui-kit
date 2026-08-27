<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'

const props = defineProps<{
  swatches: readonly string[]
  current?: string
  call: DemoCallContext<string | null>
}>()
const panel = useTemplateRef<HTMLElement>('panel')
function onPointer(event: MouseEvent) {
  if (panel.value && !panel.value.contains(event.target as Node)) props.call.end(null)
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
    role="dialog"
    aria-modal="true"
    aria-label="Pick a color"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div
      ref="panel"
      class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
    >
      <p class="mb-3 text-sm font-medium text-[var(--color-fg)]">Pick a color</p>
      <div class="grid grid-cols-6 gap-2">
        <button
          v-for="color in swatches"
          :key="color"
          type="button"
          :aria-label="color"
          :style="{ backgroundColor: color }"
          :class="
            color === current
              ? 'h-9 w-9 rounded-md ring-2 ring-[var(--color-fg)] ring-offset-2 ring-offset-[var(--color-bg)]'
              : 'h-9 w-9 rounded-md transition-transform hover:scale-110'
          "
          @click="call.end(color)"
        ></button>
      </div>
    </div>
  </div>
</template>
