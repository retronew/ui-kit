<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { code as yaceCode } from 'yace/highlighters/code'
import { cn } from '../lib/utils'

const props = defineProps<{
  code: string
}>()

const { t } = useI18n()

// yace's `code()` highlighter escapes input and emits `yace-tok--*` classes; token colors live below.
const highlighted = computed(() => yaceCode()(props.code))
const isMultiline = computed(() => props.code.includes('\n'))

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    // Clipboard unavailable (e.g. non-secure context) — ignore.
  }
}

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div
    class="code-block group relative mt-3.5 overflow-hidden rounded-2xl border border-[#d0d7de] bg-[#f6f8fa] dark:border-border dark:bg-surface"
  >
    <button
      :class="
        cn(
          'absolute right-2 grid size-7 cursor-pointer place-items-center rounded-lg border border-[#d0d7de] bg-white text-[#57606a] opacity-0 transition-[opacity,background-color,color,scale] duration-150 ease-out before:absolute before:-inset-[6px] before:content-[\'\'] group-hover:opacity-100 hover:bg-[#f3f4f6] hover:text-[#1f2328] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#57606a] active:scale-[0.96] dark:border-border dark:bg-surface-hover dark:text-fg-muted dark:hover:bg-fg/10 dark:hover:text-fg dark:focus-visible:outline-fg-muted',
          isMultiline ? 'top-2' : 'top-1/2 -translate-y-1/2',
        )
      "
      :aria-label="copied ? t('codeBlock.copied') : t('codeBlock.copyCode')"
      @click="copyCode"
    >
      <span class="relative grid size-3.5 place-items-center">
        <span
          :class="
            cn(
              'i-lucide-check absolute inset-0 m-auto size-3 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
              copied ? 'scale-100 opacity-100 blur-none' : 'scale-[0.25] opacity-0 blur-[4px]',
            )
          "
        />
        <span
          :class="
            cn(
              'i-lucide-copy size-3 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
              copied ? 'scale-[0.25] opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-none',
            )
          "
        />
      </span>
    </button>
    <pre
      class="m-0 overflow-x-auto px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#57606a] dark:focus-visible:outline-fg-muted"
      tabindex="0"
    ><code
      class="font-mono text-[13px] leading-[1.6] whitespace-pre text-[#1f2328] dark:text-[#d4d4d4]"
      v-html="highlighted"
    /></pre>
  </div>
</template>

<style scoped>
/* yace token colors: GitHub Light by default, VS Code Dark Modern under `.dark`. */
.code-block :deep(.yace-tok--com) {
  color: #656d76;
}

.code-block :deep(.yace-tok--str) {
  color: #0a3069;
}

.code-block :deep(.yace-tok--kw) {
  color: #cf222e;
}

.code-block :deep(.yace-tok--num) {
  color: #0550ae;
}

/* `:global(...)` must wrap the entire selector chain — splitting it produces a bare `.dark { }`
   rule that the scoped-CSS compiler silently drops. */
:global(.dark .code-block .yace-tok--com) {
  color: #6a9955;
}

:global(.dark .code-block .yace-tok--str) {
  color: #ce9178;
}

:global(.dark .code-block .yace-tok--kw) {
  color: #569cd6;
}

:global(.dark .code-block .yace-tok--num) {
  color: #b5cea8;
}
</style>
