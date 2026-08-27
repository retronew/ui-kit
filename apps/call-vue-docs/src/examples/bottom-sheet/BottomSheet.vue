<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'
import type { Action } from './types'

const props = defineProps<{
  title: string
  actions: readonly Action[]
  call: DemoCallContext<string | null>
}>()
const entered = ref(false)
const sheet = useTemplateRef<HTMLElement>('sheet')

function close() {
  props.call.end(null)
}
function onPointer(event: MouseEvent) {
  if (sheet.value && !sheet.value.contains(event.target as Node)) close()
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    entered.value = true
  })
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
    :aria-label="title"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
    :class="entered && !call.ended ? 'opacity-100' : 'opacity-0'"
  >
    <div
      ref="sheet"
      class="w-full max-w-md rounded-t-2xl border-x border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl transition-transform duration-300 ease-out"
      :class="entered && !call.ended ? 'translate-y-0' : 'translate-y-full'"
    >
      <div
        aria-hidden="true"
        class="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-border-strong)]"
      ></div>
      <p class="px-2 py-1 text-sm font-medium text-[var(--color-fg)]">{{ title }}</p>
      <ul class="mt-2">
        <li v-for="action in actions" :key="action.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm text-[var(--color-fg)] transition-[background-color] hover:bg-[var(--color-bg-subtle)]"
            @click="call.end(action.id)"
          >
            <span v-if="action.icon" aria-hidden="true">{{ action.icon }}</span
            ><span>{{ action.label }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
