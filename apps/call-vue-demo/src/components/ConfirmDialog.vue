<script setup lang="ts">
import type { CallContext } from '@retronew/call-vue'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import type { ConfirmProps, ConfirmResponse } from '../callables/confirm'

// Object-style `defineProps` (not the `defineProps<T>()` type-only macro):
// this toolchain's dev/test transform can't resolve cross-file imported
// types inside that macro ("No fs option provided to `compileScript` in
// non-Node environment") — apps/toast-vue-demo avoids it the same way, so
// the `call` prop's type comes from a `PropType` cast instead.
const props = defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  call: {
    type: Object as PropType<CallContext<ConfirmProps, ConfirmResponse, {}>>,
    required: true,
  },
})

const cancelButton = ref<HTMLButtonElement>()
const confirmButton = ref<HTMLButtonElement>()
const previouslyFocused =
  typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null)
const titleId = `confirm-title-${props.call.key}`
const descriptionId = `confirm-description-${props.call.key}`

onMounted(async () => {
  await nextTick()
  cancelButton.value?.focus()
})

onBeforeUnmount(() => {
  if (previouslyFocused?.isConnected) previouslyFocused.focus()
})

function finish(response: ConfirmResponse) {
  props.call.end(response)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    finish(false)
    return
  }

  if (event.key !== 'Tab') return
  const first = cancelButton.value
  const last = confirmButton.value
  if (!first || !last) return

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <div class="backdrop" @click.self="finish(false)" @keydown="handleKeydown">
    <div
      class="dialog"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descriptionId"
    >
      <h3 :id="titleId" class="title">{{ title }}</h3>
      <p :id="descriptionId" class="message">{{ message }}</p>
      <div class="actions">
        <button ref="cancelButton" class="demo-btn" type="button" @click="finish(false)">
          Cancel
        </button>
        <button ref="confirmButton" class="demo-btn-strong" type="button" @click="finish(true)">
          Confirm
        </button>
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
