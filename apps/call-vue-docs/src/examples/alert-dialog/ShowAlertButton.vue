<script setup lang="ts">
import { ref } from 'vue'
import { Alert } from './callable'

const acknowledged = ref(false)

async function showAlert() {
  await Alert.call({
    title: 'Heads up',
    message: 'Your session will expire in 5 minutes. Save your work to keep it.',
  })
  acknowledged.value = true
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
      @click="showAlert"
    >
      Show alert
    </button>
    <span class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
      acknowledged ? '→ acknowledged' : '→ awaiting click…'
    }}</span>
  </div>
</template>
