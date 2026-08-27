<script setup lang="ts">
import { ref } from 'vue'
import { GreeterCall } from './callable'

const status = ref<'idle' | 'enabled' | 'dismissed'>('idle')
async function reviewSecurity() {
  const enabled = await GreeterCall.call({
    message: 'Enable two-factor authentication for your account?',
  })
  status.value = enabled ? 'enabled' : 'dismissed'
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <button
      type="button"
      class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
      @click="reviewSecurity"
    >
      Review security</button
    ><span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      ><template v-if="status === 'idle'">→ awaiting click…</template
      ><span v-else-if="status === 'enabled'" class="text-[var(--color-accent)]">→ 2FA enabled</span
      ><template v-else>→ dismissed</template></span
    >
  </div>
</template>
