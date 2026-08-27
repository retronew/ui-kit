<script setup lang="ts">
import { ref } from 'vue'
import { WizardCall } from './callable'

const result = ref<string | null>(null)
async function start() {
  const value = await WizardCall.call()
  result.value = value ? `${value.name} · ${value.email} · ${value.plan}` : 'cancelled'
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
      @click="start"
    >
      Start signup</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
      result ? `→ ${result}` : '→ awaiting click…'
    }}</span>
  </div>
</template>
