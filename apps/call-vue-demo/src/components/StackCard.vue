<script setup lang="ts">
import type { CallContext } from '@retronew/call-vue'
import type { PropType } from 'vue'
import type { StackCardProps, StackCardResponse, StackRootProps } from '../callables/stack'

// See ConfirmDialog.vue for why this is object-style `defineProps` rather
// than the `defineProps<T>()` type-only macro.
const props = defineProps({
  label: { type: String, required: true },
  call: {
    type: Object as PropType<CallContext<StackCardProps, StackCardResponse, StackRootProps>>,
    required: true,
  },
})

const depthFromTop = () => props.call.stackSize - 1 - props.call.index
</script>

<template>
  <div
    class="stack-card"
    :style="{
      transform: `translateY(${depthFromTop() * -12}px) scale(${1 - depthFromTop() * 0.04})`,
      zIndex: call.index,
      borderColor: call.root.accent,
    }"
  >
    <span class="position">#{{ call.index + 1 }} / {{ call.stackSize }}</span>
    <span class="label">{{ label }}</span>
    <button class="demo-btn" type="button" @click="call.end()">Close</button>
  </div>
</template>

<style scoped>
.stack-card {
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  padding: 12px 14px;
  box-shadow: var(--dialog-shadow);
  transform-origin: top center;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease;
}

.position {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  color: var(--fg-muted);
}

.label {
  flex: 1;
  font-size: 13px;
}
</style>
