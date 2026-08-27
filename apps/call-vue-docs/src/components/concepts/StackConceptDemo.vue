<script setup lang="ts">
import { computed, ref } from 'vue'
import { StackedCall } from '~/components/landing/stack-callable'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'

const labels: Record<Locale, readonly string[]> = {
  en: [
    'First call. Older calls stay alive underneath when you open more.',
    'Second call layered on top. Both calls hold their own CallContext.',
    'Three calls. Closing the middle one would leave the other two alive.',
    'Four. Order is preserved by insertion — no shuffling.',
    'Five — the demo cap. In real apps there is no limit.',
  ],
  'zh-cn': [
    '第一次调用。之后再打开更多时，更早的调用仍会留在下面。',
    '第二次调用叠在上面。两个调用各自持有自己的 CallContext。',
    '三个调用。关闭中间那个不会影响另外两个。',
    '第四个。顺序按插入次序保留——不会重新排列。',
    '第五个——演示上限。真实应用里没有这个限制。',
  ],
  ja: [
    '最初の Call です。さらに開くと、古い Call はその下に残り続けます。',
    '二つ目の Call が上に重なりました。どちらも自分の CallContext を持ちます。',
    '三つの Call。真ん中を閉じても、残り二つはそのまま残ります。',
    '四つ目。挿入順が保たれます——並び替えはありません。',
    '五つ目——デモの上限です。実際のアプリに上限はありません。',
  ],
}

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const t = computed(() => landingMessages[props.locale].stack)
const max = 5
const active = ref(0)
let serial = 0

function open() {
  if (active.value >= max) return
  const depth = serial % max
  const label = labels[props.locale][depth] ?? 'Another call on the stack.'
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
  <div
    class="relative h-[300px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
  >
    <StackedCall />
    <div class="absolute right-4 top-4 flex flex-col items-end gap-2">
      <button
        type="button"
        :disabled="active >= max"
        class="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
        @click="open"
      >
        {{ t.open }}
      </button>
      <button
        type="button"
        :disabled="active === 0"
        class="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
        @click="closeAll"
      >
        {{ t.close }}
      </button>
      <span class="font-mono text-[10px] text-[var(--color-fg-subtle)] tabular-nums"
        >{{ active }} / {{ max }}</span
      >
    </div>
    <div
      v-if="active === 0"
      class="flex h-full items-center justify-center px-4 text-center font-mono text-xs text-[var(--color-fg-subtle)]"
    >
      {{ t.empty }}
    </div>
  </div>
</template>
