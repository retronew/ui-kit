<script setup lang="ts">
import { ref } from 'vue'
import { ContextMenuCall } from './callable'

const last = ref<string | null>(null)
const actions = [
  { id: 'edit', label: 'Edit' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete', destructive: true },
] as const
async function open(event: MouseEvent) {
  event.preventDefault()
  const id = await ContextMenuCall.call({ x: event.clientX, y: event.clientY, actions })
  if (id) last.value = id
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] transition-[background-color] hover:bg-[var(--color-bg-muted)]"
      @click="open"
      @contextmenu="open"
    >
      Open menu</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
      last ? `→ ${last}` : '→ no action yet'
    }}</span>
  </div>
</template>
