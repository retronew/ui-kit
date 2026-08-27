<script setup lang="ts">
import { ref } from 'vue'
import { Toast } from './callable'

const pending = ref(false)
const done = ref(false)
const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
async function run() {
  if (pending.value) return
  pending.value = true
  done.value = false
  try {
    Toast.upsert({ message: 'Starting…', percent: 0 })
    for (let percent = 20; percent <= 100; percent += 20) {
      await sleep(180)
      Toast.upsert({ message: `Working… ${percent}%`, percent })
    }
    await sleep(500)
    Toast.end()
    done.value = true
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      :disabled="pending"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      @click="run"
    >
      {{ pending ? 'Working…' : 'Run progress' }}</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
      done ? '→ done' : '→ awaits upsert()'
    }}</span>
  </div>
</template>
