<script setup lang="ts">
import { computed, ref } from 'vue'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'
import { HeroConfirm } from './hero-callable'
import HeroInstall from './HeroInstall.vue'

interface Result {
  value: string
  highlighted: boolean
  timestamp: number
}

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const t = computed(() => landingMessages[props.locale].hero)

const nativeResult = ref<Result | null>(null)
const callResult = ref<Result | null>(null)

function runNative() {
  const accepted = window.confirm('Continue?')
  nativeResult.value = {
    value: String(accepted),
    highlighted: accepted,
    timestamp: Date.now(),
  }
}

async function runCall() {
  const accepted = await HeroConfirm.call({
    message:
      props.locale === 'zh-cn' ? '继续吗？' : props.locale === 'ja' ? '続けますか？' : 'Continue?',
    locale: props.locale,
  })
  callResult.value = {
    value: String(accepted),
    highlighted: accepted,
    timestamp: Date.now(),
  }
}
</script>

<template>
  <HeroConfirm />

  <section class="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
    <div class="text-center">
      <HeroInstall :locale="locale" />
      <h1 class="mt-6 text-4xl font-medium tracking-tight text-[var(--color-fg)] md:text-6xl">
        {{ t.title }} <span class="font-mono text-[var(--color-accent)]">await</span>.
      </h1>
      <p class="mx-auto mt-6 max-w-xl text-base leading-7 text-[var(--color-fg-muted)] md:text-lg">
        <code class="font-mono text-sm">createCallable()</code> {{ t.description }}
      </p>
    </div>

    <div class="mt-16 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-8">
      <div
        class="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 md:p-8"
      >
        <div class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          {{ t.browser }}
        </div>
        <pre
          tabindex="0"
          class="mt-4 overflow-x-auto font-mono text-sm leading-relaxed text-[var(--color-fg-muted)]"
        >const ok = <span class="text-[var(--color-fg)]">window.confirm('Continue?')</span></pre>
        <button
          type="button"
          class="relative mt-6 inline-flex items-center gap-2 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-4 py-2 font-mono text-sm text-[var(--color-fg)] transition-[background-color,transform] hover:bg-[var(--color-bg-muted)] after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"
          @click="runNative"
        >
          {{ t.run }}
        </button>
        <div class="mt-3 h-5">
          <Transition name="result" mode="out-in">
            <span
              v-if="nativeResult"
              :key="nativeResult.timestamp"
              class="inline-flex items-center gap-2 font-mono text-xs"
            >
              <span class="text-[var(--color-fg-subtle)]">→</span>
              <span
                :class="
                  nativeResult.highlighted
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-fg-muted)]'
                "
                >{{ nativeResult.value }}</span
              >
            </span>
            <span v-else class="font-mono text-xs text-[var(--color-fg-subtle)]"
              >→&nbsp;{{ t.awaiting }}</span
            >
          </Transition>
        </div>
      </div>

      <div
        class="min-w-0 rounded-xl border-2 border-[var(--color-accent)] bg-[var(--color-bg-subtle)] p-6 md:p-8"
      >
        <div class="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          {{ t.component }}
        </div>
        <pre
          tabindex="0"
          class="mt-4 overflow-x-auto font-mono text-sm leading-relaxed text-[var(--color-fg-muted)]"
        >const ok = <span class="text-[var(--color-fg)]">await Confirm.call(props)</span></pre>
        <button
          type="button"
          class="relative mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--color-brand)] px-4 py-2 font-mono text-sm text-[var(--color-brand-fg)] transition-[background-color,transform] hover:bg-[var(--color-brand-hover)] after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']"
          @click="runCall"
        >
          {{ t.run }}
        </button>
        <div class="mt-3 h-5">
          <Transition name="result" mode="out-in">
            <span
              v-if="callResult"
              :key="callResult.timestamp"
              class="inline-flex items-center gap-2 font-mono text-xs"
            >
              <span class="text-[var(--color-fg-subtle)]">→</span>
              <span
                :class="
                  callResult.highlighted
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-fg-muted)]'
                "
                >{{ callResult.value }}</span
              >
            </span>
            <span v-else class="font-mono text-xs text-[var(--color-fg-subtle)]"
              >→&nbsp;{{ t.awaiting }}</span
            >
          </Transition>
        </div>
      </div>
    </div>

    <p class="mx-auto mt-12 max-w-md text-center font-mono text-xs text-[var(--color-fg-subtle)]">
      {{ t.same }}
    </p>
  </section>
</template>
