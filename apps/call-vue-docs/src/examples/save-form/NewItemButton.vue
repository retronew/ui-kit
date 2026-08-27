<script setup lang="ts">
import { ref } from 'vue'
import { SaveFormCall } from './callable'

const saved = ref<string | null>(null)
const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
async function newItem() {
  const result = await SaveFormCall.call({
    mutationFn: async (call, { name, shouldFail }) => {
      await sleep(900)
      try {
        if (shouldFail) throw new Error('Saving failed — try again.')
        call.end(name)
      } catch {
        // The form stays open so its caller can retry with a valid submission.
      }
    },
  })
  if (result) saved.value = result
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      @click="newItem"
    >
      New item</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      ><span v-if="saved" class="text-[var(--color-accent)]">→ saved "{{ saved }}"</span
      ><template v-else>→ tick "simulate a failed save" to see it stay open</template></span
    >
  </div>
</template>
