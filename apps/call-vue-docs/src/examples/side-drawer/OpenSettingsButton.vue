<script setup lang="ts">
import { ref } from 'vue'
import { SettingsDrawerCall } from './callable'
import type { Settings } from './callable'

const settings = ref<Settings>({ notifications: true, syncOnLaunch: false, theme: 'system' })

async function openSettings() {
  const next = await SettingsDrawerCall.call({ initial: settings.value })
  if (next) settings.value = next
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
      @click="openSettings"
    >
      Open settings
    </button>
    <span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      >→ {{ settings.theme }} ·
      {{ settings.notifications ? 'notifications on' : 'notifications off' }}</span
    >
  </div>
</template>
