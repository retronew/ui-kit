<script setup lang="ts">
import { ref } from 'vue'
import { Confirm } from './callable'

const status = ref<'idle' | 'deleted' | 'cancelled'>('idle')

async function confirmDelete() {
  const accepted = await Confirm.call({
    message: 'Delete this item? This action cannot be undone.',
  })
  status.value = accepted ? 'deleted' : 'cancelled'
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-[background-color] hover:bg-red-700"
      @click="confirmDelete"
    >
      Delete item
    </button>
    <span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      ><template v-if="status === 'idle'">→ awaiting click…</template
      ><template v-else-if="status === 'deleted'"
        ><span class="text-[var(--color-accent)]">→ deleted</span></template
      ><template v-else>→ cancelled</template></span
    >
  </div>
</template>
