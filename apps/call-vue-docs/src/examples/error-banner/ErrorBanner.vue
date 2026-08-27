<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import type { DemoCallContext } from '~/components/call-context'

const props = defineProps<{ message: string; durationMs: number; call: DemoCallContext<void> }>()
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  timer = setTimeout(() => props.call.end(), props.durationMs)
})
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div
    role="alert"
    aria-live="assertive"
    :style="{ top: `${24 + call.index * 52}px` }"
    class="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 transition-[top] duration-200"
  >
    <div
      class="pointer-events-auto flex w-80 max-w-[calc(100vw-1.5rem)] items-center gap-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200 shadow-2xl backdrop-blur"
    >
      <span aria-hidden="true">⚠</span><span class="flex-1 truncate">{{ message }}</span
      ><button
        type="button"
        aria-label="Dismiss"
        class="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base leading-none text-red-300/80 transition-colors hover:bg-red-500/20 hover:text-red-100"
        @click="call.end"
      >
        ×
      </button>
    </div>
  </div>
</template>
