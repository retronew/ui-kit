<script setup lang="ts">
import type { CallContext } from '@retronew/call-vue'
import type { PropType } from 'vue'
import type { ToastCardProps, ToastCardResponse } from '../callables/toast'

// See ConfirmDialog.vue for why this is object-style `defineProps` rather
// than the `defineProps<T>()` type-only macro.
defineProps({
  text: { type: String, required: true },
  call: {
    type: Object as PropType<CallContext<ToastCardProps, ToastCardResponse, {}>>,
    required: true,
  },
})
</script>

<template>
  <div class="toast" :class="{ leaving: call.ended }">
    {{ text }}
    <button class="dismiss" type="button" aria-label="Dismiss" @click="call.end()">×</button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  padding: 10px 12px;
  font-size: 13px;
  box-shadow: var(--dialog-shadow);
  opacity: 1;
  transform: translateY(0) scale(1);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast.leaving {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

.dismiss {
  display: inline-grid;
  width: 40px;
  min-width: 40px;
  height: 40px;
  padding: 0;
  place-items: center;
  margin-left: auto;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--fg-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.dismiss:hover {
  color: var(--fg);
  background: var(--surface-hover);
}

.dismiss:active {
  transform: scale(0.96);
}

.dismiss:focus-visible {
  outline: 2px solid var(--fg-muted);
  outline-offset: 2px;
}
</style>
