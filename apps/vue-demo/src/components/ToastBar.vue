<script setup lang="ts">
import { resolveValue } from '@retronew/toast-vue'
import type { Toast, ValueOrFunction } from '@retronew/toast-vue'
import { computed, isVNode } from 'vue'
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import ToastIcon from './ToastIcon.vue'

const props = withDefaults(
  defineProps<{
    toast: Toast
    /** In Stack mode with center-align: pins the card to a fixed width so the expand/collapse transform never animates width. */
    fixedWidth?: boolean
  }>(),
  { fixedWidth: false },
)

const emit = defineEmits<{
  dismiss: []
}>()

const { t } = useI18n()

const resolvedMessage = computed(() =>
  resolveValue(props.toast.message as ValueOrFunction<Component | string, Toast>, props.toast),
)

// Matches the dismiss button's shape/hover language, but always visible since action/cancel are the toast's point.
const inlineButtonClass =
  'relative shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium text-fg-muted transition-[background-color,color,scale] duration-150 hover:bg-surface-hover hover:text-fg active:scale-[0.96]'

function handleCancel() {
  props.toast.cancel?.onClick?.(props.toast)
  emit('dismiss')
}
</script>

<template>
  <div
    class="group pointer-events-auto relative flex cursor-pointer items-center gap-3 rounded-3xl border border-[var(--toast-border)] bg-[var(--toast-bg)] px-5 py-3.5 leading-[1.3] text-fg shadow-[var(--toast-shadow)] will-change-transform"
    :class="fixedWidth ? 'w-[350px]' : 'max-w-[350px]'"
    style="touch-action: none"
    @click="emit('dismiss')"
  >
    <ToastIcon
      v-if="toast.type !== 'blank' && toast.type !== 'custom'"
      class="-mr-0.25"
      :type="toast.type"
    />
    <div
      class="flex min-w-0 flex-1 justify-start whitespace-pre-line"
      :class="{ 'ml-1': toast.type === 'blank' }"
      :role="toast.type === 'error' ? 'alert' : 'status'"
      :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
    >
      <component :is="resolvedMessage" v-if="isVNode(resolvedMessage)" />
      <template v-else>{{ resolvedMessage }}</template>
    </div>
    <button
      v-if="toast.action"
      :class="inlineButtonClass"
      @click.stop="toast.action?.onClick?.(toast)"
    >
      {{ toast.action.label }}
    </button>
    <button v-if="toast.cancel" :class="inlineButtonClass" @click.stop="handleCancel">
      {{ toast.cancel.label }}
    </button>
    <button
      v-if="!toast.meta?.hideDismiss"
      class="relative grid size-[22px] shrink-0 cursor-pointer place-items-center rounded-full text-fg-muted opacity-0 transition-[opacity,background-color,color,scale] duration-150 before:absolute before:-inset-[9px] before:content-[''] group-hover:opacity-100 hover:bg-surface-hover hover:text-fg active:scale-[0.96]"
      :aria-label="t('toastBar.dismiss')"
      @click.stop="emit('dismiss')"
    >
      <span class="i-lucide-x size-3" />
    </button>
  </div>
</template>
