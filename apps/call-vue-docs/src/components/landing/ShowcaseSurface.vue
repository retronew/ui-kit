<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { DemoCallContext } from '../call-context'
import type { ShowcaseKind } from './showcase-types'

interface Props {
  locale: 'en' | 'zh-cn' | 'ja'
  kind: ShowcaseKind
  title: string
  options: readonly {
    id: string
    label: string
    shortcut?: string
    icon?: string
    destructive?: boolean
  }[]
  x?: number
  y?: number
}

const props = defineProps<Props & { call: DemoCallContext<string | null> }>()
const entered = ref(false)
const query = ref('')
const active = ref(0)
const step = ref(0)
const name = ref('')
const email = ref('')
const plan = ref<'free' | 'pro' | 'team'>('free')
const plans = ['free', 'pro', 'team'] as const
const panel = useTemplateRef<HTMLElement>('panel')
const commandInput = useTemplateRef<HTMLInputElement>('commandInput')
const wizardInput = useTemplateRef<HTMLInputElement>('wizardInput')

const commandItems = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  return normalized
    ? props.options.filter((option) => option.label.toLowerCase().includes(normalized))
    : props.options
})
const sheetOpen = computed(() => entered.value && !props.call.ended)
const contextStyle = computed(() => {
  const viewportWidth = typeof window === 'undefined' ? 320 : window.innerWidth
  const viewportHeight = typeof window === 'undefined' ? 320 : window.innerHeight
  return {
    left: `${props.x ?? viewportWidth / 2}px`,
    top: `${props.y ?? viewportHeight / 2}px`,
  }
})
const copy = computed(() => {
  if (props.locale === 'zh-cn') {
    return {
      commandPlaceholder: '输入命令…',
      noMatches: '没有匹配项',
      name: '你的名字',
      email: '你的邮箱',
      plan: '选择套餐',
      step: '第',
      of: '步，共 3 步',
      cancel: '取消',
      back: '返回',
      next: '下一步',
      finish: '完成',
    }
  }
  if (props.locale === 'ja') {
    return {
      commandPlaceholder: 'コマンドを入力…',
      noMatches: '一致する項目がありません',
      name: '名前',
      email: 'メールアドレス',
      plan: 'プランを選択',
      step: 'ステップ',
      of: '/ 3',
      cancel: 'キャンセル',
      back: '戻る',
      next: '次へ',
      finish: '完了',
    }
  }
  return {
    commandPlaceholder: 'Type a command…',
    noMatches: 'No matches',
    name: 'Your name',
    email: 'Your email',
    plan: 'Pick a plan',
    step: 'Step',
    of: 'of 3',
    cancel: 'Cancel',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
  }
})

function close() {
  props.call.end(null)
}
function onCommandInput() {
  active.value = 0
}
function chooseCommand(option: (typeof props.options)[number]) {
  props.call.end(option.id)
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    return
  }
  if (props.kind !== 'command') return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = Math.min(commandItems.value.length - 1, active.value + 1)
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = Math.max(0, active.value - 1)
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const option = commandItems.value[active.value]
    if (option) chooseCommand(option)
  }
}
function onDocumentPointer(event: MouseEvent) {
  if (
    ['sheet', 'picker', 'context'].includes(props.kind) &&
    panel.value &&
    !panel.value.contains(event.target as Node)
  )
    close()
}
function nextWizardStep() {
  step.value += 1
  nextTick(() => wizardInput.value?.focus())
}
function finishWizard() {
  props.call.end(`${name.value} · ${email.value} · ${plan.value}`)
}
function selectPlan(choice: (typeof plans)[number]) {
  plan.value = choice
}

onMounted(async () => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('mousedown', onDocumentPointer)
  if (props.kind === 'sheet') {
    await nextTick()
    requestAnimationFrame(() => {
      entered.value = true
    })
  }
  if (props.kind === 'command') commandInput.value?.focus()
  if (props.kind === 'wizard') wizardInput.value?.focus()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousedown', onDocumentPointer)
})
</script>

<template>
  <div
    v-if="kind === 'command'"
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-32 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
  >
    <section
      ref="panel"
      class="w-full max-w-md overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl"
    >
      <input
        ref="commandInput"
        v-model="query"
        type="search"
        :placeholder="copy.commandPlaceholder"
        class="w-full border-b border-[var(--color-border)] bg-transparent px-4 py-3 text-base text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:outline-none md:text-sm"
        @input="onCommandInput"
      />
      <ul class="max-h-72 overflow-y-auto p-1">
        <li
          v-if="commandItems.length === 0"
          class="px-3 py-2 text-sm text-[var(--color-fg-subtle)]"
        >
          {{ copy.noMatches }}
        </li>
        <li v-for="(option, index) in commandItems" v-else :key="option.id">
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-[color,background-color]"
            :class="
              index === active
                ? 'bg-[var(--color-bg-subtle)] text-[var(--color-fg)]'
                : 'text-[var(--color-fg-muted)]'
            "
            @mouseenter="active = index"
            @click="chooseCommand(option)"
          >
            <span>{{ option.label }}</span>
            <span v-if="option.shortcut" class="font-mono text-xs text-[var(--color-fg-subtle)]">{{
              option.shortcut
            }}</span>
          </button>
        </li>
      </ul>
    </section>
  </div>

  <div
    v-else-if="kind === 'sheet'"
    class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
    :class="sheetOpen ? 'opacity-100' : 'opacity-0'"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
  >
    <section
      ref="panel"
      class="w-full max-w-md rounded-t-2xl border-x border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl transition-transform duration-300 ease-out"
      :class="sheetOpen ? 'translate-y-0' : 'translate-y-full'"
    >
      <div
        class="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--color-border-strong)]"
        aria-hidden="true"
      ></div>
      <p class="px-2 py-1 text-sm font-medium text-[var(--color-fg)]">{{ title }}</p>
      <ul class="mt-2">
        <li v-for="option in options" :key="option.id">
          <button
            type="button"
            class="flex w-full items-center rounded-md px-3 py-3 text-left text-sm text-[var(--color-fg)] transition-[background-color] hover:bg-[var(--color-bg-subtle)]"
            @click="call.end(option.id)"
          >
            <span v-if="option.icon" aria-hidden="true">{{ option.icon }}</span>
            <span>{{ option.label }}</span>
          </button>
        </li>
      </ul>
    </section>
  </div>

  <div
    v-else-if="kind === 'wizard'"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
  >
    <section
      class="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
    >
      <div class="mb-5 flex items-center gap-2" aria-hidden="true">
        <span
          v-for="index in 3"
          :key="index"
          class="h-1 flex-1 rounded-full"
          :class="index - 1 <= step ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-muted)]'"
        ></span>
      </div>
      <template v-if="step === 0"
        ><p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          {{ copy.step }} 1 {{ copy.of }}
        </p>
        <p class="mt-1 text-base font-medium text-[var(--color-fg)]">{{ copy.name }}</p>
        <input
          ref="wizardInput"
          v-model="name"
          type="text"
          placeholder="Ada Lovelace"
          class="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-base text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none md:text-sm"
      /></template>
      <template v-else-if="step === 1"
        ><p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          {{ copy.step }} 2 {{ copy.of }}
        </p>
        <p class="mt-1 text-base font-medium text-[var(--color-fg)]">{{ copy.email }}</p>
        <input
          ref="wizardInput"
          v-model="email"
          type="email"
          placeholder="ada@example.com"
          class="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-2 text-base text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none md:text-sm"
      /></template>
      <template v-else
        ><p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          {{ copy.step }} 3 {{ copy.of }}
        </p>
        <p class="mt-1 text-base font-medium text-[var(--color-fg)]">{{ copy.plan }}</p>
        <div class="mt-4 grid grid-cols-3 gap-2">
          <button
            v-for="choice in plans"
            :key="choice"
            type="button"
            class="rounded-md border px-3 py-2 text-sm transition-[color,border-color]"
            :class="
              choice === plan
                ? 'border-[var(--color-accent)] bg-[var(--color-bg-subtle)] font-medium text-[var(--color-accent)]'
                : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
            "
            @click="selectPlan(choice)"
          >
            {{ choice }}
          </button>
        </div></template
      >
      <div class="mt-6 flex items-center justify-between">
        <button
          type="button"
          class="text-sm text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg-muted)]"
          @click="close"
        >
          {{ copy.cancel }}
        </button>
        <div class="flex gap-2">
          <button
            v-if="step > 0"
            type="button"
            class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)]"
            @click="step -= 1"
          >
            {{ copy.back }}</button
          ><button
            v-if="step < 2"
            type="button"
            :disabled="(step === 0 && !name.trim()) || (step === 1 && !email.trim())"
            class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            @click="nextWizardStep"
          >
            {{ copy.next }}</button
          ><button
            v-else
            type="button"
            class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
            @click="finishWizard"
          >
            {{ copy.finish }}
          </button>
        </div>
      </div>
    </section>
  </div>

  <div
    v-else-if="kind === 'picker'"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
  >
    <section
      ref="panel"
      class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-2xl"
    >
      <p class="mb-3 text-sm font-medium text-[var(--color-fg)]">{{ title }}</p>
      <div class="grid grid-cols-6 gap-2">
        <button
          v-for="color in ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#e11d74']"
          :key="color"
          type="button"
          :aria-label="color"
          class="h-9 w-9 rounded-md transition-transform hover:scale-110"
          :style="{ backgroundColor: color }"
          @click="call.end(color)"
        ></button>
      </div>
    </section>
  </div>

  <section
    v-else
    ref="panel"
    role="menu"
    :style="contextStyle"
    class="fixed z-50 min-w-[180px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-1 shadow-2xl"
  >
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      role="menuitem"
      class="block w-full rounded px-3 py-1.5 text-left text-sm transition-[background-color]"
      :class="
        option.destructive
          ? 'text-red-500 hover:bg-red-500/10'
          : 'text-[var(--color-fg)] hover:bg-[var(--color-bg-subtle)]'
      "
      @click="call.end(option.id)"
    >
      {{ option.label }}
    </button>
  </section>
</template>
