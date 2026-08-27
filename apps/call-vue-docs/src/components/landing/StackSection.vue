<script setup lang="ts">
import { computed, ref } from 'vue'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'
import { StackedCall } from './stack-callable'

const labels = [
  "I'm the first call. There can be many of us.",
  'A second call appeared on top. The first stays alive.',
  'Each call has its own CallContext. Closing me leaves the others.',
  'Open as many as you want — order is preserved, state isolated.',
  'Cap reached. Close one, open another. Or close all at once.',
]
const max = 5
const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const t = computed(() => landingMessages[props.locale].stack)
const active = ref(0)
let serial = 0

function open() {
  if (active.value >= max) return
  const label = labels[serial % labels.length] ?? 'Another call.'
  serial += 1
  active.value += 1
  StackedCall.call({ label }).finally(() => {
    active.value -= 1
  })
}

function closeAll() {
  StackedCall.end()
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-6 py-24">
    <div class="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
      <div>
        <p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          {{ t.eyebrow }}
        </p>
        <h2 class="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
          {{ t.title }}
        </h2>
        <p class="mt-4 text-base leading-7 text-[var(--color-fg-muted)]">{{ t.first }}</p>
        <p class="mt-3 text-base leading-7 text-[var(--color-fg-muted)]">{{ t.second }}</p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            :disabled="active >= max"
            class="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-brand-fg)] transition-[background-color,opacity,transform] hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
            @click="open"
          >
            {{ t.open }}
          </button>
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 text-sm text-[var(--color-fg)] transition-[background-color,transform] hover:bg-[var(--color-bg-muted)]"
            @click="closeAll"
          >
            {{ t.close }}
          </button>
          <span class="font-mono text-xs text-[var(--color-fg-subtle)] tabular-nums"
            >{{ active }} / {{ max }} active</span
          >
        </div>
      </div>

      <div
        class="relative h-[360px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
      >
        <StackedCall />
        <div
          v-if="active === 0"
          class="flex h-full items-center justify-center px-4 text-center font-mono text-xs text-[var(--color-fg-subtle)]"
        >
          {{ t.empty }}
        </div>
      </div>
    </div>
  </section>
</template>
