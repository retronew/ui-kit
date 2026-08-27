<script setup lang="ts">
import { ref } from 'vue'
import { CommandPaletteCall } from './callable'

const commands = [
  { id: 'new-file', label: 'New file', shortcut: '⌘ N' },
  { id: 'open', label: 'Open…', shortcut: '⌘ O' },
  { id: 'save', label: 'Save', shortcut: '⌘ S' },
  { id: 'find', label: 'Find in files', shortcut: '⌘ ⇧ F' },
  { id: 'toggle-theme', label: 'Toggle theme' },
  { id: 'restart', label: 'Restart' },
] as const
const last = ref<string | null>(null)

async function openPalette() {
  const id = await CommandPaletteCall.call({ commands })
  if (id) last.value = id
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-2 font-mono text-sm text-[var(--color-fg)] transition-[background-color] hover:bg-[var(--color-bg-muted)]"
      @click="openPalette"
    >
      ⌘ K</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      ><span v-if="last" class="text-[var(--color-accent)]">→ {{ last }}</span
      ><template v-else>→ no command run yet</template></span
    >
  </div>
</template>
