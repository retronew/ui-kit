<script setup lang="ts">
import { useToaster } from '@retronew/toast-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme'
import { useToasts } from '../composables/useToasts'
import { setLocale } from '../i18n'
import { cn } from '../lib/utils'

const { t, locale } = useI18n()
const { isDark, toggleTheme } = useTheme()
const { toasts } = useToaster()
const { effectivePosition } = useToasts()

// Blur the bar only while a top toast is visible — bottom toasts don't overlap it.
const hasVisibleToast = computed(() =>
  toasts.value.some(
    (toast) => toast.status === 'visible' && effectivePosition(toast).startsWith('top'),
  ),
)

function toggleLocale() {
  setLocale(locale.value === 'zh-CN' ? 'en' : 'zh-CN')
}
</script>

<template>
  <div
    :class="
      cn(
        'sticky top-3 z-40 flex h-15 items-center justify-between rounded-full border border-border bg-surface pl-6 pr-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-[filter,opacity,scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)]',
        hasVisibleToast ? 'scale-[0.97] blur-[2px] opacity-70' : 'scale-100 blur-none opacity-100',
      )
    "
  >
    <span class="text-lg tracking-tight">Toast Vue</span>
    <div class="flex items-center gap-1.5">
      <button
        class="grid h-7.5 min-w-[38px] cursor-pointer place-items-center rounded-2xl px-2 text-xs font-semibold transition-colors hover:bg-surface-hover"
        :aria-label="t('topbar.switchLanguage')"
        @click="toggleLocale"
      >
        {{ locale === 'zh-CN' ? '中文' : 'EN' }}
      </button>
      <button
        class="relative grid size-7.5 cursor-pointer place-items-center rounded-full transition-[background-color,scale] duration-150 ease-out before:absolute before:-inset-[5px] before:content-[''] hover:bg-surface-hover active:scale-[0.96]"
        :aria-label="t('topbar.toggleTheme')"
        @click="toggleTheme"
      >
        <span class="relative grid size-4 place-items-center">
          <span
            :class="
              cn(
                'i-lucide-sun absolute inset-0 m-auto size-3.5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
                isDark ? 'scale-[0.25] opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-none',
              )
            "
          />
          <span
            :class="
              cn(
                'i-lucide-moon size-3.5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
                isDark ? 'scale-100 opacity-100 blur-none' : 'scale-[0.25] opacity-0 blur-[4px]',
              )
            "
          />
        </span>
      </button>
    </div>
  </div>
</template>
