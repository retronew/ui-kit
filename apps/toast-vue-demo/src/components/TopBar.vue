<script setup lang="ts">
import { useToaster } from '@retronew/toast-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme'
import { useToasts } from '../composables/useToasts'
import { setLocale } from '../i18n'
import { cn } from '../lib/utils'

const { t, locale } = useI18n()
const { cycleTheme, nextTheme, theme } = useTheme()
const { toasts } = useToaster()
const { effectivePosition, handleEasterEggClick } = useToasts()

// Blur the bar only while a top toast is visible — bottom toasts don't overlap it.
const hasVisibleToast = computed(() =>
  toasts.value.some(
    (toast) => toast.status === 'visible' && effectivePosition(toast).startsWith('top'),
  ),
)
const themeOptions = [
  { icon: 'i-lucide-monitor', labelKey: 'topbar.themeSystem', value: 'system' },
  { icon: 'i-lucide-sun', labelKey: 'topbar.themeLight', value: 'light' },
  { icon: 'i-lucide-moon', labelKey: 'topbar.themeDark', value: 'dark' },
] as const
const themeButtonLabel = computed(() =>
  t('topbar.themeCycle', {
    current: t(themeOptions.find((option) => option.value === theme.value)?.labelKey ?? ''),
    next: t(themeOptions.find((option) => option.value === nextTheme.value)?.labelKey ?? ''),
  }),
)

function toggleLocale() {
  setLocale(locale.value === 'zh-CN' ? 'en' : 'zh-CN')
}
</script>

<template>
  <div
    :class="
      cn(
        'sticky top-3 z-40 flex h-15 items-center justify-between rounded-full border border-border bg-surface pl-6 pr-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-[filter,scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)]',
        hasVisibleToast ? 'scale-[0.97] blur-[2px]' : 'scale-100 blur-none',
      )
    "
  >
    <button
      type="button"
      class="cursor-pointer rounded-full text-lg tracking-tight transition-transform duration-150 ease-out active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-muted"
      :aria-label="t('topbar.easterEgg')"
      @click="handleEasterEggClick"
    >
      Toast Vue
    </button>
    <div class="flex items-center gap-1.5">
      <button
        class="grid h-7.5 min-w-[38px] cursor-pointer place-items-center rounded-2xl px-2 text-xs font-semibold transition-colors hover:bg-surface-hover"
        :aria-label="t('topbar.switchLanguage')"
        @click="toggleLocale"
      >
        {{ locale === 'zh-CN' ? '中文' : 'EN' }}
      </button>
      <button
        type="button"
        class="grid size-7.5 cursor-pointer place-items-center rounded-full transition-[background-color,scale] duration-150 ease-out hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg-muted active:scale-[0.96]"
        data-theme-preference
        :aria-label="themeButtonLabel"
        :title="themeButtonLabel"
        @click="cycleTheme"
      >
        <span class="relative grid size-4 place-items-center">
          <span
            v-for="option in themeOptions"
            :key="option.value"
            :class="
              cn(
                option.icon,
                'absolute inset-0 m-auto size-3.5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
                theme === option.value
                  ? 'scale-100 opacity-100 blur-none'
                  : 'scale-[0.25] opacity-0 blur-[4px]',
              )
            "
          />
        </span>
      </button>
    </div>
  </div>
</template>
