<script setup lang="ts">
import { ref } from 'vue'
import { Picker } from './callable'
const fruits = [
  { id: 'apple', name: 'Apple', hint: '🍎' },
  { id: 'banana', name: 'Banana', hint: '🍌' },
  { id: 'cherry', name: 'Cherry', hint: '🍒' },
  { id: 'grape', name: 'Grape', hint: '🍇' },
  { id: 'mango', name: 'Mango', hint: '🥭' },
] as const
const picked = ref<string | null>(null)
async function pick() {
  const choice = await Picker.call({ title: 'Pick a fruit', items: fruits })
  picked.value = choice?.name ?? null
}
</script>
<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
      @click="pick"
    >
      Pick a fruit</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      ><span v-if="picked" class="text-[var(--color-accent)]">→ {{ picked }}</span
      ><template v-else>→ nothing picked yet</template></span
    >
  </div>
</template>
