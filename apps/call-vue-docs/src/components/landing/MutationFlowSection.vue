<script setup lang="ts">
import { computed, ref } from 'vue'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'
import { SaveDialogCallable } from './mutation-flow-callable'

type LogEntry = { id: number; text: string; tone: 'info' | 'good' | 'bad' }

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const t = computed(() => landingMessages[props.locale].advanced)
const shouldFail = ref(false)
const busy = ref(false)
const log = ref<LogEntry[]>([])

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

function append(text: string, tone: LogEntry['tone']) {
  log.value = [...log.value.slice(-4), { id: Date.now() + Math.random(), text, tone }]
}

function openSave() {
  if (busy.value) return

  busy.value = true
  log.value = []
  void SaveDialogCallable.call({
    mutationFn: async (call, payload) => {
      append('trigger fires • pending = true', 'info')
      await sleep(900)

      try {
        if (payload.shouldFail) throw new Error('Network error')
        append('success → call.end("saved")', 'good')
        call.end('saved')
      } catch {
        append('caught → pending clears, call stays open', 'bad')
      }
    },
  }).finally(() => {
    busy.value = false
  })
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
          <p class="mt-4 text-base leading-7 text-[var(--color-fg-muted)]">
            <template v-if="locale === 'en'"
              >The hook tracks <code class="font-mono text-sm">pending</code> for you. Your
              <code class="font-mono text-sm">mutationFn</code> decides — by calling
              <code class="font-mono text-sm">call.end()</code> or not — whether the dialog
              closes.</template
            >
            <template v-else-if="locale === 'zh-cn'"
              >这个 composable 会管理 <code class="font-mono text-sm">pending</code>。<code
                class="font-mono text-sm"
                >mutationFn</code
              >
              是否调用
              <code class="font-mono text-sm">call.end()</code>，决定对话框是否关闭。</template
            >
            <template v-else
              >この composable は <code class="font-mono text-sm">pending</code> を管理します。<code
                class="font-mono text-sm"
                >mutationFn</code
              >
              が
              <code class="font-mono text-sm">call.end()</code>
              を呼ぶかどうかで、ダイアログを閉じるか決まります。</template
            >
          </p>
          <p class="mt-3 text-base leading-7 text-[var(--color-fg-muted)]">
            <template v-if="locale === 'en'"
              >On a handled failure, <code class="font-mono text-sm">pending</code> clears and the
              Call stays open so the user can retry without losing their place.</template
            >
            <template v-else-if="locale === 'zh-cn'"
              >业务错误被自行处理后，<code class="font-mono text-sm">pending</code> 会清除而 Call
              保持打开，用户可以原地重试。</template
            >
            <template v-else
              >失敗を自分で処理すると
              <code class="font-mono text-sm">pending</code> は解除され、Call
              は開いたままなのでその場で再試行できます。</template
            >
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-4">
            <label class="flex min-h-10 items-center gap-2 text-sm text-[var(--color-fg-muted)]"
              ><input
                v-model="shouldFail"
                type="checkbox"
                class="h-4 w-4 accent-[var(--color-accent)]"
              />{{ t.broadcast }}</label
            >
            <button
              type="button"
              :disabled="busy"
              class="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-brand-fg)] transition-[background-color,opacity] hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
              @click="openSave"
            >
              {{ busy ? t.running : t.run }}
            </button>
            <a
              :href="`${locale === 'en' ? '' : `/${locale}`}/concepts/mutation-flow`"
              class="font-mono text-xs text-[var(--color-fg-subtle)] underline-offset-2 hover:text-[var(--color-fg-muted)] hover:underline"
              >{{ t.code }}</a
            >
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div
            class="relative h-[180px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
          >
            <SaveDialogCallable :shouldFail="shouldFail" />
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
                    : entry.tone === 'bad'
                      ? 'text-red-500 dark:text-red-400'
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
