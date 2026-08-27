<script setup lang="ts">
import { computed, ref } from 'vue'
import { examples as migratedExamples } from '~/examples/catalog'
import { exampleTranslations, landingMessages, localizePath } from '~/i18n'
import type { Locale } from '~/i18n'

type Category = 'dialog' | 'picker' | 'notification' | 'menu' | 'drawer' | 'overlay' | 'flow'
type Behavior =
  | 'update'
  | 'upsert'
  | 'mutation-flow'
  | 'stacking'
  | 'nested'
  | 'exit-animation'
  | 'root-props'
  | 'end-from-caller'
type Filter =
  | { kind: 'all' }
  | { kind: 'category'; value: Category }
  | { kind: 'behavior'; value: Behavior }

interface Entry {
  slug: string
  category: Category
  behaviors?: readonly Behavior[]
  title: string
  description: string
  detail?: boolean
}

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const query = ref('')
const filter = ref<Filter>({ kind: 'all' })
const categories: readonly Category[] = [
  'dialog',
  'picker',
  'notification',
  'menu',
  'drawer',
  'overlay',
  'flow',
]
const behaviors: readonly Behavior[] = [
  'update',
  'upsert',
  'mutation-flow',
  'stacking',
  'nested',
  'exit-animation',
  'root-props',
  'end-from-caller',
]

const copy = computed(() => {
  if (props.locale === 'zh-cn') {
    return {
      title: '示例',
      description: '可直接交互的 Callable。点击任意示例，即可在首页运行对应的真实 Vue 演示。',
      search: '搜索示例…',
      all: '全部',
      none: '没有匹配当前筛选条件的示例。',
      categories: {
        dialog: '对话框',
        picker: '选择器',
        notification: '通知',
        menu: '菜单',
        drawer: '抽屉',
        overlay: '覆盖层',
        flow: '流程',
      },
      behaviors: {
        update: '更新',
        upsert: 'Upsert',
        'mutation-flow': 'Mutation flow',
        stacking: '堆叠',
        nested: '嵌套',
        'exit-animation': '退出动画',
        'root-props': 'Root 属性',
        'end-from-caller': '由调用方结束',
      },
    }
  }
  if (props.locale === 'ja') {
    return {
      title: 'サンプル',
      description:
        '実際に操作できる Callable です。任意のサンプルをクリックすると、ホームページで Vue デモを実行できます。',
      search: 'サンプルを検索…',
      all: 'すべて',
      none: '現在のフィルターに一致するサンプルはありません。',
      categories: {
        dialog: 'ダイアログ',
        picker: 'ピッカー',
        notification: '通知',
        menu: 'メニュー',
        drawer: 'ドロワー',
        overlay: 'オーバーレイ',
        flow: 'フロー',
      },
      behaviors: {
        update: '更新',
        upsert: 'Upsert',
        'mutation-flow': 'Mutation flow',
        stacking: 'スタック',
        nested: 'ネスト',
        'exit-animation': '終了アニメーション',
        'root-props': 'Root props',
        'end-from-caller': '呼び出し側で終了',
      },
    }
  }
  return {
    title: 'Examples',
    description:
      'Real Callables you can interact with. Click into any example to run its live Vue demo on the homepage.',
    search: 'Search examples…',
    all: 'All',
    none: 'No examples match the current filters.',
    categories: {
      dialog: 'Dialog',
      picker: 'Picker',
      notification: 'Notification',
      menu: 'Menu',
      drawer: 'Drawer',
      overlay: 'Overlay',
      flow: 'Flow',
    },
    behaviors: {
      update: 'Update',
      upsert: 'Upsert',
      'mutation-flow': 'Mutation flow',
      stacking: 'Stacking',
      nested: 'Nested',
      'exit-animation': 'Exit animation',
      'root-props': 'Root props',
      'end-from-caller': 'End from caller',
    },
  }
})

const entries = computed<readonly Entry[]>(() => {
  const cards = landingMessages[props.locale].showcase.cards
  const translated = props.locale === 'en' ? undefined : exampleTranslations[props.locale]
  return [
    ...migratedExamples.map(({ slug, meta }) => ({
      slug,
      category: meta.category,
      behaviors: meta.behaviors,
      title: translated?.[slug]?.title ?? meta.title,
      description: translated?.[slug]?.description ?? meta.description,
      detail: true,
    })),
    {
      slug: 'command-palette',
      category: 'menu',
      behaviors: ['end-from-caller'],
      title: cards[0]?.[1] ?? 'Command palette',
      description: cards[0]?.[2] ?? '',
    },
    {
      slug: 'bottom-sheet',
      category: 'drawer',
      behaviors: ['exit-animation'],
      title: cards[1]?.[1] ?? 'Bottom sheet',
      description: cards[1]?.[2] ?? '',
    },
    {
      slug: 'wizard',
      category: 'flow',
      behaviors: ['end-from-caller'],
      title: cards[2]?.[1] ?? 'Multi-step wizard',
      description: cards[2]?.[2] ?? '',
    },
    {
      slug: 'color-picker',
      category: 'picker',
      title: cards[3]?.[1] ?? 'Color picker',
      description: cards[3]?.[2] ?? '',
    },
    {
      slug: 'context-menu',
      category: 'menu',
      title: cards[4]?.[1] ?? 'Context menu',
      description: cards[4]?.[2] ?? '',
    },
    {
      slug: 'progress-toast',
      category: 'notification',
      behaviors: ['update', 'upsert'],
      title: cards[5]?.[1] ?? 'Progress toast',
      description: cards[5]?.[2] ?? '',
    },
  ].filter(
    (entry, index, all) => all.findIndex((candidate) => candidate.slug === entry.slug) === index,
  )
})
const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  return entries.value.filter((entry) => {
    if (filter.value.kind === 'category' && entry.category !== filter.value.value) return false
    if (filter.value.kind === 'behavior' && !entry.behaviors?.includes(filter.value.value))
      return false
    if (!normalized) return true
    return [entry.title, entry.description, entry.category, ...(entry.behaviors ?? [])]
      .join(' ')
      .toLowerCase()
      .includes(normalized)
  })
})
const homeHref = computed(() => localizePath('/', props.locale))

function exampleHref(entry: Entry) {
  return entry.detail
    ? localizePath(`/examples/${entry.slug}`, props.locale)
    : `${homeHref.value}#${entry.slug}`
}

function selectCategory(category: Category) {
  filter.value = { kind: 'category', value: category }
}
function selectBehavior(behavior: Behavior) {
  filter.value = { kind: 'behavior', value: behavior }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-6 py-16">
    <div class="mb-12">
      <h1 class="text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-5xl">
        {{ copy.title }}
      </h1>
      <p class="mt-3 max-w-2xl text-base text-[var(--color-fg-muted)]">{{ copy.description }}</p>
    </div>

    <div class="mb-10 space-y-4">
      <input
        v-model="query"
        type="search"
        :placeholder="copy.search"
        class="w-full max-w-md rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:border-[var(--color-accent)] focus:outline-none"
      />
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          :class="
            filter.kind === 'all'
              ? 'rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-1 text-sm font-medium text-[var(--color-accent-fg)]'
              : 'rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-sm text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]'
          "
          @click="filter = { kind: 'all' }"
        >
          {{ copy.all }}
        </button>
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="
            filter.kind === 'category' && filter.value === category
              ? 'rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-1 text-sm font-medium text-[var(--color-accent-fg)]'
              : 'rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-sm text-[var(--color-fg-muted)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)]'
          "
          @click="selectCategory(category)"
        >
          {{ copy.categories[category] }}
        </button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="behavior in behaviors"
          :key="behavior"
          type="button"
          :class="
            filter.kind === 'behavior' && filter.value === behavior
              ? 'rounded-md border border-[var(--color-accent)] bg-[var(--color-bg-subtle)] px-2.5 py-1 font-mono text-xs text-[var(--color-accent)]'
              : 'rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 font-mono text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]'
          "
          @click="selectBehavior(behavior)"
        >
          {{ copy.behaviors[behavior] }}
        </button>
      </div>
    </div>

    <div
      v-if="filtered.length === 0"
      class="rounded-lg border border-dashed border-[var(--color-border)] py-16 text-center"
    >
      <p class="text-sm text-[var(--color-fg-muted)]">{{ copy.none }}</p>
    </div>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <a
        v-for="entry in filtered"
        :key="entry.slug"
        :href="exampleHref(entry)"
        class="group flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 transition-colors hover:border-[var(--color-accent)]"
      >
        <div class="flex items-center justify-between">
          <span class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">{{
            copy.categories[entry.category]
          }}</span>
          <span v-if="entry.behaviors?.length" class="flex gap-1">
            <span
              v-for="behavior in entry.behaviors"
              :key="behavior"
              class="rounded bg-[var(--color-bg-muted)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-fg-muted)]"
              >{{ copy.behaviors[behavior] }}</span
            >
          </span>
        </div>
        <h2
          class="text-lg font-medium text-[var(--color-fg)] transition-colors group-hover:text-[var(--color-accent)]"
        >
          {{ entry.title }}
        </h2>
        <p class="text-sm text-[var(--color-fg-muted)]">{{ entry.description }}</p>
      </a>
    </div>
    <p class="mt-8 font-mono text-xs text-[var(--color-fg-subtle)]">
      {{ filtered.length }} of {{ entries.length }} examples
    </p>
  </div>
</template>
