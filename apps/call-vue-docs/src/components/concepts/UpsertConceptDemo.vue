<script setup lang="ts">
import { ref } from 'vue'
import type { Locale } from '~/i18n'
import { NoticeConcept } from './notice-concept-callable'

const copy: Record<
  Locale,
  { call: string; end: string; fired: string; active: string; yes: string; no: string }
> = {
  en: {
    call: 'Call upsert()',
    end: 'end()',
    fired: 'upserts fired',
    active: 'active',
    yes: 'yes',
    no: 'no',
  },
  'zh-cn': {
    call: '调用 upsert()',
    end: 'end()',
    fired: '触发次数',
    active: '是否活跃',
    yes: '是',
    no: '否',
  },
  ja: {
    call: 'upsert() を呼ぶ',
    end: 'end()',
    fired: '呼び出し回数',
    active: 'アクティブ',
    yes: 'はい',
    no: 'いいえ',
  },
}

const messages: Record<Locale, { first: string; update: string }> = {
  en: { first: 'First call → new instance', update: 'Update → same instance, new props' },
  'zh-cn': { first: '首次调用 → 新建实例', update: '更新 → 同一实例，新的 props' },
  ja: {
    first: '最初の呼び出し → 新しいインスタンス',
    update: '更新 → 同じインスタンス、新しい props',
  },
}

const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })

const callsRef = { current: 0 }
const activeRef = { current: false }
const calls = ref(0)
const active = ref(false)

function send() {
  const wasActive = activeRef.current
  activeRef.current = true
  callsRef.current += 1
  active.value = true
  calls.value = callsRef.current

  NoticeConcept.upsert({
    message: wasActive ? messages[props.locale].update : messages[props.locale].first,
    count: callsRef.current,
  }).then(() => {
    activeRef.current = false
    active.value = false
  })
}

function reset() {
  NoticeConcept.end()
}
</script>

<template>
  <div
    class="relative h-[200px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
  >
    <NoticeConcept />
    <div class="absolute left-4 top-4 flex flex-col gap-2">
      <button
        type="button"
        class="rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-xs font-medium text-[var(--color-accent-fg)] transition-colors hover:bg-[var(--color-accent-hover)]"
        @click="send"
      >
        {{ copy[locale].call }}
      </button>
      <button
        type="button"
        :disabled="!active"
        class="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs text-[var(--color-fg-muted)] transition-colors hover:text-[var(--color-fg)] disabled:opacity-50"
        @click="reset"
      >
        {{ copy[locale].end }}
      </button>
      <p class="mt-2 font-mono text-xs text-[var(--color-fg-subtle)]">
        {{ copy[locale].fired }}: {{ calls }}<br />{{ copy[locale].active }}:
        {{ active ? copy[locale].yes : copy[locale].no }}
      </p>
    </div>
  </div>
</template>
