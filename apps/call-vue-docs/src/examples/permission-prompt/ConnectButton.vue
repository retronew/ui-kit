<script setup lang="ts">
import { ref } from 'vue'
import { Permission } from './callable'

const status = ref<'idle' | 'connected' | 'denied'>('idle')
async function connect() {
  const result = await Permission.call({
    appName: 'call-vue demo',
    scopes: ['Read your profile', 'Read your repositories', 'Subscribe to webhook events'],
  })
  status.value = result === 'allow' ? 'connected' : 'denied'
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      :disabled="status === 'connected'"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      @click="connect"
    >
      {{ status === 'connected' ? 'Connected' : 'Connect with GitHub' }}</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      ><template v-if="status === 'idle'">→ awaiting consent…</template
      ><span v-else-if="status === 'connected'" class="text-[var(--color-accent)]">→ allowed</span
      ><template v-else>→ denied</template></span
    >
  </div>
</template>
