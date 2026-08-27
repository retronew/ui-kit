<script setup lang="ts">
import { ref } from 'vue'
import { MutationConfirm } from './callable'

const status = ref('→ awaiting click…')
const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

async function discardDraft() {
  const confirmed = await MutationConfirm.call({ message: 'Discard your draft?' })
  status.value = confirmed ? '→ draft discarded' : '→ kept'
}
async function publishPost() {
  const confirmed = await MutationConfirm.call({
    message: 'Publish this post now?',
    mutationFn: async (call) => {
      await sleep(900)
      call.end(true)
    },
  })
  status.value = confirmed ? '→ published' : '→ cancelled'
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div class="flex gap-3">
      <button
        type="button"
        class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
        @click="discardDraft"
      >
        Discard draft</button
      ><button
        type="button"
        class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
        @click="publishPost"
      >
        Publish post
      </button>
    </div>
    <span class="font-mono text-xs text-[var(--color-fg-subtle)]">{{ status }}</span>
  </div>
</template>
