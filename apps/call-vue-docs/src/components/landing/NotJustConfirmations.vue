<script setup lang="ts">
import { computed, reactive } from 'vue'
import { landingMessages, localizePath } from '~/i18n'
import type { Locale } from '~/i18n'
import { BottomSheet, Showcase } from './showcase-callable'
import type { ShowcaseOption, ShowcaseProps } from './showcase-callable'
import { Progress } from './toast-callable'

interface Card extends ShowcaseProps {
  slug: string
  category: string
  description: string
}

const cards: Card[] = [
  {
    slug: 'command-palette',
    category: 'Menu',
    title: 'Command palette',
    description: '⌘K-style search. Choose a command and await the result.',
    kind: 'command',
    options: [],
  },
  {
    slug: 'bottom-sheet',
    category: 'Drawer',
    title: 'Bottom sheet',
    description: 'Slides up from the bottom — resolves with the action you tap.',
    kind: 'sheet',
    options: [],
  },
  {
    slug: 'wizard',
    category: 'Flow',
    title: 'Multi-step wizard',
    description: 'A signup flow — one await resolves with the whole form.',
    kind: 'wizard',
    options: [],
  },
  {
    slug: 'color-picker',
    category: 'Picker',
    title: 'Color picker',
    description: 'Click a swatch — resolves with the hex value.',
    kind: 'picker',
    options: [],
  },
  {
    slug: 'context-menu',
    category: 'Menu',
    title: 'Context menu',
    description: 'Forwards the cursor position to a positioned Callable.',
    kind: 'context',
    options: [],
  },
  {
    slug: 'progress-toast',
    category: 'Notification',
    title: 'Progress toast',
    description: 'A singleton that updates itself via upsert() as work progresses.',
    kind: 'command',
    options: [],
  },
]
const localizedOptions: Record<Locale, Record<string, readonly ShowcaseOption[]>> = {
  en: {
    'command-palette': [
      { id: 'open-file', label: 'Open file', shortcut: '⌘ O' },
      { id: 'find', label: 'Find in files', shortcut: '⌘ ⇧ F' },
      { id: 'toggle-theme', label: 'Toggle theme' },
      { id: 'restart', label: 'Restart' },
    ],
    'bottom-sheet': [
      { id: 'share', label: 'Share', icon: '⇪' },
      { id: 'copy-link', label: 'Copy link', icon: '⤴' },
      { id: 'pin', label: 'Pin', icon: '📌' },
      { id: 'archive', label: 'Archive', icon: '🗄' },
    ],
    'context-menu': [
      { id: 'edit', label: 'Edit' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'delete', label: 'Delete', destructive: true },
    ],
  },
  'zh-cn': {
    'command-palette': [
      { id: 'open-file', label: '打开文件', shortcut: '⌘ O' },
      { id: 'find', label: '在文件中查找', shortcut: '⌘ ⇧ F' },
      { id: 'toggle-theme', label: '切换主题' },
      { id: 'restart', label: '重新启动' },
    ],
    'bottom-sheet': [
      { id: 'share', label: '分享', icon: '⇪' },
      { id: 'copy-link', label: '复制链接', icon: '⤴' },
      { id: 'pin', label: '置顶', icon: '📌' },
      { id: 'archive', label: '归档', icon: '🗄' },
    ],
    'context-menu': [
      { id: 'edit', label: '编辑' },
      { id: 'duplicate', label: '复制' },
      { id: 'delete', label: '删除', destructive: true },
    ],
  },
  ja: {
    'command-palette': [
      { id: 'open-file', label: 'ファイルを開く', shortcut: '⌘ O' },
      { id: 'find', label: 'ファイル内を検索', shortcut: '⌘ ⇧ F' },
      { id: 'toggle-theme', label: 'テーマを切替' },
      { id: 'restart', label: '再起動' },
    ],
    'bottom-sheet': [
      { id: 'share', label: '共有', icon: '⇪' },
      { id: 'copy-link', label: 'リンクをコピー', icon: '⤴' },
      { id: 'pin', label: '固定', icon: '📌' },
      { id: 'archive', label: 'アーカイブ', icon: '🗄' },
    ],
    'context-menu': [
      { id: 'edit', label: '編集' },
      { id: 'duplicate', label: '複製' },
      { id: 'delete', label: '削除', destructive: true },
    ],
  },
}
const surfaceTitles: Record<Locale, Record<string, string>> = {
  en: {
    'command-palette': 'Command palette',
    'bottom-sheet': 'Quick actions',
    wizard: 'Wizard',
    'color-picker': 'Pick a color',
  },
  'zh-cn': {
    'command-palette': '命令面板',
    'bottom-sheet': '快捷操作',
    wizard: '引导流程',
    'color-picker': '选择颜色',
  },
  ja: {
    'command-palette': 'コマンドパレット',
    'bottom-sheet': 'クイックアクション',
    wizard: 'ウィザード',
    'color-picker': '色を選択',
  },
}
const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const t = computed(() => landingMessages[props.locale].showcase)
const results = reactive<Record<string, string | null>>({})
const pending = reactive<Record<string, boolean>>({})

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

async function run(card: Card, event: MouseEvent) {
  if (pending[card.slug]) return
  pending[card.slug] = true
  try {
    if (card.slug === 'progress-toast') {
      Progress.upsert({
        message:
          props.locale === 'zh-cn' ? '正在启动…' : props.locale === 'ja' ? '開始中…' : 'Starting…',
        percent: 0,
      })
      for (let percent = 20; percent <= 100; percent += 20) {
        await sleep(180)
        const progressLabel =
          props.locale === 'zh-cn' ? '处理中' : props.locale === 'ja' ? '処理中' : 'Working'
        Progress.upsert({ message: `${progressLabel}… ${percent}%`, percent })
      }
      await sleep(400)
      Progress.end()
      results[card.slug] = 'done'
      return
    }
    const cardIndex = cards.indexOf(card)
    const callable = card.kind === 'sheet' ? BottomSheet : Showcase
    const value = await callable.call({
      locale: props.locale,
      kind: card.kind,
      title: surfaceTitles[props.locale][card.slug] ?? t.value.cards[cardIndex]?.[1] ?? card.title,
      options: localizedOptions[props.locale][card.slug] ?? card.options,
      x: event.clientX,
      y: event.clientY,
    })
    results[card.slug] = value ?? 'null'
  } finally {
    pending[card.slug] = false
  }
}
</script>

<template>
  <Showcase />
  <BottomSheet />
  <Progress />

  <section class="mx-auto max-w-6xl px-6 py-24">
    <div class="text-center">
      <p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
        {{ t.eyebrow }}
      </p>
      <h2 class="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
        {{ t.title }}
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--color-fg-muted)]">
        {{ t.description }}
      </p>
    </div>

    <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="card in cards"
        :id="card.slug"
        :key="card.slug"
        class="scroll-mt-24 flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5"
      >
        <p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          {{ t.cards[cards.indexOf(card)]?.[0] ?? card.category }}
        </p>
        <h3 class="mt-1 text-base font-medium text-[var(--color-fg)]">
          {{ t.cards[cards.indexOf(card)]?.[1] ?? card.title }}
        </h3>
        <p class="mt-2 flex-1 text-sm leading-6 text-[var(--color-fg-muted)]">
          {{ t.cards[cards.indexOf(card)]?.[2] ?? card.description }}
        </p>
        <div class="mt-4 flex items-center gap-3">
          <button
            type="button"
            :disabled="pending[card.slug]"
            class="rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
            @click="run(card, $event)"
          >
            {{ t.try }}
          </button>
          <a
            :href="`${localizePath('/examples', locale)}#${card.slug}`"
            class="font-mono text-xs text-[var(--color-fg-subtle)] underline-offset-2 transition-colors hover:text-[var(--color-fg-muted)] hover:underline"
            >{{ t.code }}</a
          >
        </div>
        <div class="mt-3 h-5 font-mono text-xs">
          <span class="text-[var(--color-fg-subtle)]">→ </span
          ><span
            :class="
              results[card.slug] && results[card.slug] !== 'null'
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-fg-subtle)]'
            "
            >{{ results[card.slug] ?? landingMessages[locale].hero.awaiting }}</span
          >
        </div>
      </article>
    </div>
    <div class="mt-10 text-center">
      <a
        :href="localizePath('/examples', locale)"
        class="inline-flex items-center gap-2 font-mono text-sm text-[var(--color-accent)] underline-offset-4 hover:underline"
        >{{ t.browse }} <span aria-hidden="true">→</span></a
      >
    </div>
  </section>
</template>
