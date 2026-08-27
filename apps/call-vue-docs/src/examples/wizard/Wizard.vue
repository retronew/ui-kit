<script setup lang="ts">
import { nextTick, ref, watch, useTemplateRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'
import type { WizardResult } from './types'

const props = defineProps<{ call: DemoCallContext<WizardResult | null> }>()
const step = ref(0)
const name = ref('')
const email = ref('')
const plan = ref<WizardResult['plan']>('free')
const plans: readonly WizardResult['plan'][] = ['free', 'pro', 'team']
const nameInput = useTemplateRef<HTMLInputElement>('nameInput')
const emailInput = useTemplateRef<HTMLInputElement>('emailInput')

watch(
  step,
  async () => {
    await nextTick()
    if (step.value === 0) nameInput.value?.focus()
    if (step.value === 1) emailInput.value?.focus()
  },
  { immediate: true },
)
function next() {
  step.value += 1
}
function back() {
  step.value -= 1
}
function finish() {
  props.call.end({ name: name.value, email: email.value, plan: plan.value })
}
</script>

<template>
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Wizard"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
    >
      <div class="mb-5 flex items-center gap-2">
        <div
          v-for="index in 3"
          :key="index"
          class="h-1 flex-1 rounded-full"
          :class="index - 1 <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-muted)]'"
        ></div>
      </div>
      <template v-if="step === 0"
        ><p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Step 1 of 3
        </p>
        <p class="mt-1 text-base font-medium text-[var(--color-fg)]">Your name</p>
        <input
          ref="nameInput"
          v-model="name"
          type="text"
          placeholder="Ada Lovelace"
          class="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-base text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none md:text-sm"
      /></template>
      <template v-else-if="step === 1"
        ><p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Step 2 of 3
        </p>
        <p class="mt-1 text-base font-medium text-[var(--color-fg)]">Your email</p>
        <input
          ref="emailInput"
          v-model="email"
          type="email"
          placeholder="ada@example.com"
          class="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-base text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none md:text-sm"
      /></template>
      <template v-else
        ><p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          Step 3 of 3
        </p>
        <p class="mt-1 text-base font-medium text-[var(--color-fg)]">Pick a plan</p>
        <div class="mt-4 grid grid-cols-3 gap-2">
          <button
            v-for="option in plans"
            :key="option"
            type="button"
            :class="
              option === plan
                ? 'rounded-md border border-[var(--color-accent)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm font-medium text-[var(--color-accent)]'
                : 'rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]'
            "
            @click="plan = option"
          >
            {{ option }}
          </button>
        </div></template
      >
      <div class="mt-6 flex items-center justify-between">
        <button
          type="button"
          class="text-sm text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg-muted)]"
          @click="call.end(null)"
        >
          Cancel
        </button>
        <div class="flex gap-2">
          <button
            v-if="step > 0"
            type="button"
            class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            @click="back"
          >
            Back</button
          ><button
            v-if="step < 2"
            type="button"
            :disabled="(step === 0 && !name.trim()) || (step === 1 && !email.trim())"
            class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            @click="next"
          >
            Next</button
          ><button
            v-else
            type="button"
            class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
            @click="finish"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
