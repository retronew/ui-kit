<script setup lang="ts">
import { ref } from 'vue'
import { Approval } from './callable'

const status = ref('→ no request yet')
const secondsLeft = ref<number | null>(null)
const timeoutSeconds = 4

async function requestApproval() {
  status.value = 'awaiting approval…'
  const call = Approval.call({ action: 'Deploy to production' })
  let answered = false
  void call.then(() => {
    answered = true
  })
  let left = timeoutSeconds
  secondsLeft.value = left
  const ticker = window.setInterval(() => {
    left -= 1
    secondsLeft.value = left > 0 ? left : null
    if (left <= 0) window.clearInterval(ticker)
  }, 1000)
  let timedOut = false
  const timer = window.setTimeout(() => {
    if (answered) return
    timedOut = true
    Approval.end(call, false)
  }, timeoutSeconds * 1000)
  const approved = await call
  window.clearTimeout(timer)
  window.clearInterval(ticker)
  secondsLeft.value = null
  status.value = approved ? '→ approved' : timedOut ? '→ auto-declined (timed out)' : '→ declined'
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      :disabled="secondsLeft !== null"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      @click="requestApproval"
    >
      Request approval</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      ><span v-if="secondsLeft !== null" class="text-[var(--color-accent)]"
        >auto-declines in {{ secondsLeft }}s…</span
      ><template v-else>{{ status }}</template></span
    >
  </div>
</template>
