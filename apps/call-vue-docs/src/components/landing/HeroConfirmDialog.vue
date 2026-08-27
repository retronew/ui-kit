<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'
import type { DemoCallContext } from '../call-context'

interface ConfirmProps {
  message: string
  locale: Locale
}

const props = defineProps<ConfirmProps & { call: DemoCallContext<boolean> }>()
const panel = useTemplateRef<HTMLElement>('panel')
const continueButton = useTemplateRef<HTMLButtonElement>('continueButton')
let restoreTarget: HTMLElement | null = null

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    props.call.end(false)
    return
  }

  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [
    ...panel.value.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled)',
    ),
  ]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

onMounted(async () => {
  restoreTarget = document.activeElement as HTMLElement | null
  window.addEventListener('keydown', onKeydown)
  await nextTick()
  continueButton.value?.focus()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  restoreTarget?.focus()
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="hero-confirm-title"
  >
    <section
      ref="panel"
      class="dialog-panel w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl shadow-black/20"
    >
      <p id="hero-confirm-title" class="text-base text-[var(--color-fg)]">{{ message }}</p>
      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-fg-muted)] transition-[color,border-color,transform] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]"
          @click="call.end(false)"
        >
          {{ landingMessages[locale].hero.cancel }}
        </button>
        <button
          ref="continueButton"
          type="button"
          class="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-brand-fg)] transition-[background-color,transform] hover:bg-[var(--color-brand-hover)]"
          @click="call.end(true)"
        >
          {{ landingMessages[locale].hero.continue }}
        </button>
      </div>
    </section>
  </div>
</template>
