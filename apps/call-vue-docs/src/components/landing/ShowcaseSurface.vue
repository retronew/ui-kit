<script setup lang="ts">
import { computed } from 'vue'
import type { Locale } from '~/i18n'
import type { DemoCallContext } from '../call-context'
import type { ShowcaseKind } from './showcase-types'

interface Props {
  locale: Locale
  kind: ShowcaseKind
  title: string
  options: string[]
  x?: number
  y?: number
}

const props = defineProps<Props & { call: DemoCallContext<string | null> }>()
const panelClass = computed(() => {
  if (props.kind === 'sheet') return 'absolute inset-x-0 bottom-0 mx-auto max-w-lg rounded-t-2xl'
  if (props.kind === 'context') return 'absolute w-56 rounded-lg'
  return 'relative mx-auto w-full max-w-sm rounded-xl'
})
const panelStyle = computed(() =>
  props.kind === 'context'
    ? {
        left: `${Math.min(props.x ?? 24, window.innerWidth - 240)}px`,
        top: `${Math.min(props.y ?? 80, window.innerHeight - 260)}px`,
      }
    : undefined,
)
const swatches = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#087cca']
const labels = computed(() => ({
  close: props.locale === 'zh-cn' ? '关闭' : props.locale === 'ja' ? '閉じる' : 'Close',
  choose: props.locale === 'zh-cn' ? '选择' : props.locale === 'ja' ? '選択' : 'Choose',
  name: props.locale === 'zh-cn' ? '你的名字' : props.locale === 'ja' ? '名前' : 'Your name',
  complete:
    props.locale === 'zh-cn'
      ? '完成流程'
      : props.locale === 'ja'
        ? 'フローを完了'
        : 'Complete flow',
}))
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/45 p-4 backdrop-blur-sm"
    :class="kind === 'sheet' ? '' : kind === 'context' ? '' : 'flex items-center justify-center'"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    @click.self="call.end(null)"
  >
    <section
      :class="panelClass"
      :style="panelStyle"
      class="border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-2xl shadow-black/20"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="font-mono text-[10px] uppercase tracking-wider text-[var(--color-fg-subtle)]">
            {{ kind }}
          </p>
          <h3 class="mt-1 text-sm font-medium text-[var(--color-fg)]">{{ title }}</h3>
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-fg-subtle)] transition-[color,background-color,transform] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
          :aria-label="labels.close"
          @click="call.end(null)"
        >
          ×
        </button>
      </div>

      <div v-if="kind === 'picker'" class="mt-5 grid grid-cols-6 gap-2">
        <button
          v-for="swatch in swatches"
          :key="swatch"
          type="button"
          class="aspect-square min-h-9 rounded-md border border-black/10 shadow-sm"
          :style="{ backgroundColor: swatch }"
          :aria-label="`${labels.choose} ${swatch}`"
          @click="call.end(swatch)"
        ></button>
      </div>
      <div v-else-if="kind === 'wizard'" class="mt-5">
        <div class="mb-4 flex gap-1" aria-hidden="true">
          <span class="h-1 flex-1 rounded-full bg-[var(--color-brand)]"></span
          ><span class="h-1 flex-1 rounded-full bg-[var(--color-border)]"></span
          ><span class="h-1 flex-1 rounded-full bg-[var(--color-border)]"></span>
        </div>
        <label class="text-xs text-[var(--color-fg-muted)]"
          >{{ labels.name
          }}<input
            value="Ada Lovelace"
            class="mt-2 h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 text-base text-[var(--color-fg)]"
        /></label>
        <button
          type="button"
          class="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-brand-fg)] transition-[background-color,transform] hover:bg-[var(--color-brand-hover)]"
          @click="call.end('Ada · Pro')"
        >
          {{ labels.complete }}
        </button>
      </div>
      <div v-else class="mt-4 grid gap-1">
        <button
          v-for="option in options"
          :key="option"
          type="button"
          class="flex h-9 items-center rounded-md px-3 text-left text-sm text-[var(--color-fg-muted)] transition-[color,background-color,transform] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
          @click="call.end(option)"
        >
          {{ option }}
        </button>
      </div>
    </section>
  </div>
</template>
