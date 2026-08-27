<script setup lang="ts">
import { ref } from 'vue'
import { ErrorBannerCall } from './callable'

const count = ref(0)
function triggerError() {
  count.value += 1
  void ErrorBannerCall.call({
    message: `Network request failed (#${count.value})`,
    durationMs: 1500,
  })
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
      @click="triggerError"
    >
      Simulate error</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
      count > 0 ? `${count} error${count === 1 ? '' : 's'} triggered` : 'no errors yet'
    }}</span>
  </div>
</template>
