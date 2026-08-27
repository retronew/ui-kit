<script setup lang="ts">
import { computed, ref } from 'vue'
import { SaveDialogCallable } from '~/components/landing/mutation-flow-callable'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'

type LogEntry = { id: number; text: string; tone: 'info' | 'good' | 'bad' }

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const t = computed(() => landingMessages[props.locale].advanced)
const shouldFail = ref(false)
const busy = ref(false)
const log = ref<LogEntry[]>([])

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

function append(text: string, tone: LogEntry['tone']) {
  log.value = [...log.value.slice(-3), { id: Date.now() + Math.random(), text, tone }]
}

function openSave() {
  if (busy.value) return

  busy.value = true
  log.value = []
  void SaveDialogCallable.call({
    mutationFn: async (call, payload) => {
      append('• pending = true', 'info')
      await sleep(700)
      try {
        if (payload.shouldFail) throw new Error('Save failed')
        append('• success → call.end()', 'good')
        call.end('saved')
      } catch {
        append('• caught — pending clears, call stays open', 'bad')
      }
    },
  }).finally(() => {
    busy.value = false
  })
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <div
      class="relative h-[240px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
    >
      <SaveDialogCallable :shouldFail="shouldFail" />
      <div class="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          :disabled="busy"
          class="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] transition-colors hover:bg-[var(--color-bg-muted)] disabled:opacity-50"
          @click="openSave"
        >
          {{ busy ? t.running : t.run }}
        </button>
      </div>
    </div>

    <div
      class="flex h-[240px] flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4"
    >
      <label class="flex items-center gap-2 text-sm text-[var(--color-fg-muted)]"
        ><input v-model="shouldFail" type="checkbox" class="accent-[var(--color-accent)]" />{{
          t.broadcast
        }}</label
      >
      <div
        class="mt-3 flex-1 overflow-y-auto rounded-md bg-[var(--color-bg)] p-3 font-mono text-xs"
      >
        <span v-if="log.length === 0" class="text-[var(--color-fg-subtle)]">{{ t.logEmpty }}</span>
        <div
          v-for="entry in log"
          v-else
          :key="entry.id"
          :class="
            entry.tone === 'good'
              ? 'text-[var(--color-accent)]'
              : entry.tone === 'bad'
                ? 'text-red-500 dark:text-red-400'
                : 'text-[var(--color-fg-muted)]'
          "
        >
          {{ entry.text }}
        </div>
      </div>
    </div>
  </div>
</template>
