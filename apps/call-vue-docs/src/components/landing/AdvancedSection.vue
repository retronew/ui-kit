<script setup lang="ts">
import { computed, ref } from 'vue'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'
import { AdvancedToast } from './advanced-callable'

interface LogEntry {
  id: number
  text: string
  tone: 'info' | 'good'
}

const busy = ref(false)
const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const t = computed(() => landingMessages[props.locale].advanced)
const broadcast = ref(false)
const log = ref<LogEntry[]>([])
const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

function append(text: string, tone: LogEntry['tone'] = 'info') {
  log.value = [...log.value.slice(-4), { id: Date.now() + Math.random(), text, tone }]
}

async function run() {
  if (busy.value) return
  busy.value = true
  log.value = []
  const promise = AdvancedToast.upsert({ message: 'Starting…', percent: 0 })
  append('upsert() creates one active call')
  for (let percent = 25; percent <= 100; percent += 25) {
    await sleep(450)
    const props = { message: `Working… ${percent}%`, percent }
    if (broadcast.value) AdvancedToast.update(props)
    else AdvancedToast.update(promise, props)
    append(`${broadcast.value ? 'broadcast' : 'targeted'} update → ${percent}%`)
  }
  await sleep(350)
  AdvancedToast.end(promise, undefined)
  await promise
  append('end(promise) resolves and unmounts', 'good')
  busy.value = false
}
</script>

<template>
  <section class="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <div class="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
            {{ t.eyebrow }}
          </p>
          <h2 class="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
            {{ t.title }}
          </h2>
          <p class="mt-4 text-base leading-7 text-[var(--color-fg-muted)]">{{ t.first }}</p>
          <p class="mt-3 text-base leading-7 text-[var(--color-fg-muted)]">{{ t.second }}</p>
          <div class="mt-6 flex flex-wrap items-center gap-4">
            <label class="flex min-h-10 items-center gap-2 text-sm text-[var(--color-fg-muted)]"
              ><input
                v-model="broadcast"
                type="checkbox"
                class="h-4 w-4 accent-[var(--color-accent)]"
              />{{ t.broadcast }}</label
            >
            <button
              type="button"
              :disabled="busy"
              class="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-brand-fg)] transition-[background-color,opacity,transform] hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
              @click="run"
            >
              {{ busy ? t.running : t.run }}
            </button>
            <a
              :href="`${locale === 'en' ? '' : `/${locale}`}/concepts/upsert-and-update`"
              class="font-mono text-xs text-[var(--color-fg-subtle)] underline-offset-2 hover:text-[var(--color-fg-muted)] hover:underline"
              >{{ t.code }}</a
            >
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div
            class="relative h-[180px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
          >
            <AdvancedToast accent="var(--color-accent)" />
            <div
              v-if="!busy"
              class="flex h-full items-center justify-center px-4 text-center font-mono text-xs text-[var(--color-fg-subtle)]"
            >
              {{ t.empty }}
            </div>
          </div>
          <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
              {{ t.log }}
            </p>
            <div class="mt-3 min-h-[150px] space-y-1.5 font-mono text-xs">
              <span v-if="log.length === 0" class="text-[var(--color-fg-subtle)]">{{
                t.logEmpty
              }}</span>
              <div
                v-for="entry in log"
                v-else
                :key="entry.id"
                :class="
                  entry.tone === 'good'
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-fg-muted)]'
                "
              >
                <span class="text-[var(--color-fg-subtle)]">▸ </span>{{ entry.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
