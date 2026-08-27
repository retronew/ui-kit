<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from './callable'

const files = ['report.pdf', 'photo.jpg', 'archive.zip']
const online = ref(true)
const openCount = ref(0)
const idle = () => openCount.value === 0

function start() {
  online.value = true
  for (const label of files) {
    const call = Upload.call({ label, state: 'uploading' })
    openCount.value += 1
    void call.finally(() => {
      openCount.value -= 1
    })
  }
}
function toggleConnection() {
  online.value = !online.value
  Upload.update({ state: online.value ? 'uploading' : 'paused' })
}
function completeAll() {
  online.value = true
  Upload.update({ state: 'done' })
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div class="flex flex-wrap justify-center gap-3">
      <button
        type="button"
        :disabled="!idle()"
        class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        @click="start"
      >
        Start 3 uploads
      </button>
      <button
        type="button"
        :disabled="idle()"
        class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
        @click="toggleConnection"
      >
        Toggle connection
      </button>
      <button
        type="button"
        :disabled="idle()"
        class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
        @click="completeAll"
      >
        Complete all
      </button>
    </div>
    <span class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
      idle()
        ? '→ start some uploads, then broadcast to all of them'
        : `connection: ${online ? 'online' : 'offline'} — ${openCount} open`
    }}</span>
  </div>
</template>
