<script setup lang="ts">
import type { CallContext } from '@retronew/call-vue'
import type { PropType } from 'vue'
import type { ConfirmProps, ConfirmResponse } from '../callables/confirm'

// Object-style `defineProps` (not the `defineProps<T>()` type-only macro):
// this toolchain's dev/test transform can't resolve cross-file imported
// types inside that macro ("No fs option provided to `compileScript` in
// non-Node environment") — apps/toast-vue-demo avoids it the same way, so
// the `call` prop's type comes from a `PropType` cast instead.
defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  call: {
    type: Object as PropType<CallContext<ConfirmProps, ConfirmResponse, Record<string, never>>>,
    required: true,
  },
})
</script>

<template>
  <div class="backdrop" @click.self="call.end(false)" @keydown.esc="call.end(false)">
    <div class="dialog" role="alertdialog" aria-modal="true" :aria-label="title">
      <h3 class="title">{{ title }}</h3>
      <p class="message">{{ message }}</p>
      <div class="actions">
        <button class="demo-btn" type="button" @click="call.end(false)">Cancel</button>
        <button class="demo-btn-strong" type="button" @click="call.end(true)">Confirm</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.dialog {
  width: min(320px, calc(100vw - 32px));
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  padding: 20px;
  box-shadow: var(--dialog-shadow);
}

.title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
}

.message {
  margin: 0;
  color: var(--fg-muted);
  font-size: 13px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}
</style>
