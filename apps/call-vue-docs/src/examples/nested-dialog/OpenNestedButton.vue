<script setup lang="ts">
import { NestedDialogCall } from './callable'
</script>

<template>
  <button
    type="button"
    class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
    @click="NestedDialogCall.call({ level: 1 })"
  >
    Open dialog
  </button>
</template>
