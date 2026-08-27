<script setup lang="ts">
import { ref } from 'vue'
import { BottomSheetCall } from './callable'

const actions = [
  { id: 'share', label: 'Share', icon: '⇪' },
  { id: 'copy-link', label: 'Copy link', icon: '⤴' },
  { id: 'pin', label: 'Pin', icon: '📌' },
  { id: 'archive', label: 'Archive', icon: '🗄' },
] as const
const last = ref<string | null>(null)
async function openActions() {
  const id = await BottomSheetCall.call({ title: 'Quick actions', actions })
  if (id) last.value = id
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
      @click="openActions"
    >
      Quick actions</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      ><span v-if="last" class="text-[var(--color-accent)]">→ {{ last }}</span
      ><template v-else>→ no action yet</template></span
    >
  </div>
</template>
