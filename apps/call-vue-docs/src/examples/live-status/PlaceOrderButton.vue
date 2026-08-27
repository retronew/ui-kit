<script setup lang="ts">
import { ref } from 'vue'
import { Status } from './callable'
import type { Stage } from './callable'

const stages: readonly Stage[] = ['packing', 'shipped', 'out', 'delivered']
const running = ref(false)
const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

async function placeOrder() {
  running.value = true
  const call = Status.call({ stage: 'placed' })
  let dismissed = false
  void call.then(() => {
    dismissed = true
  })
  for (const stage of stages) {
    await sleep(900)
    if (dismissed) break
    Status.update(call, { stage })
  }
  await call
  running.value = false
}
</script>

<template>
  <button
    type="button"
    :disabled="running"
    class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
    @click="placeOrder"
  >
    {{ running ? 'Watching order…' : 'Place order' }}
  </button>
</template>
