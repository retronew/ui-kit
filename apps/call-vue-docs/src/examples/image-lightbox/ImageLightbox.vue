<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import type { DemoCallContext } from '~/components/call-context'
const props = defineProps<{ src: string; alt: string; call: DemoCallContext<void> }>()
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') props.call.end()
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>
<template>
  <div
    role="dialog"
    aria-modal="true"
    :aria-label="alt"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
    @click="call.end()"
  >
    <img
      :src="src"
      :alt="alt"
      class="max-h-full max-w-full rounded-md shadow-2xl"
      @click.stop
    /><button
      type="button"
      aria-label="Close"
      class="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-white backdrop-blur transition-[background-color] hover:bg-white/20"
      @click.stop="call.end()"
    >
      ×
    </button>
  </div>
</template>
