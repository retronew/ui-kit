<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../composables/useToasts'
import { GITHUB_URL } from '../constants'

const { t } = useI18n()
const { handleHeroClick } = useToasts()
</script>

<template>
  <section class="flex flex-col items-center pt-14 pb-6 text-center">
    <h1
      class="bg-gradient-to-r from-fg to-fg-muted bg-clip-text text-[56px] font-semibold tracking-[-0.03em] text-transparent"
    >
      Toast Vue
    </h1>
    <p class="mt-1 mb-5 text-[17px] text-fg-muted">{{ t('hero.subtitle') }}</p>
    <div class="flex gap-2.5">
      <button
        class="relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-surface-strong px-[18px] py-[9px] text-sm font-medium text-fg-on-strong transition-opacity hover:opacity-85"
        @click="handleHeroClick"
      >
        {{ t('hero.renderToast') }}
      </button>
      <a
        class="relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-border bg-surface px-[18px] py-[9px] text-sm font-medium text-fg transition-colors hover:bg-surface-hover"
        :href="GITHUB_URL"
        target="_blank"
        rel="noopener noreferrer"
        >GitHub</a
      >
    </div>
    <a
      class="mt-[18px] font-medium text-fg-muted underline decoration-[1.5px] decoration-border underline-offset-[3px] transition-colors hover:text-fg hover:decoration-fg-muted"
      :href="`${GITHUB_URL}#readme`"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ t('hero.documentation') }}
    </a>
  </section>
</template>
