<script setup lang="ts">
import { ref } from 'vue'
import { Prompt } from './callable'

const name = ref('untitled-file.txt')

async function rename() {
  const next = await Prompt.call({
    title: 'Rename file',
    defaultValue: name.value,
    placeholder: 'New filename',
  })
  if (next) name.value = next
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
      @click="rename"
    >
      Rename
    </button>
    <span class="font-mono text-xs text-[var(--color-accent)]">→ {{ name }}</span>
  </div>
</template>
