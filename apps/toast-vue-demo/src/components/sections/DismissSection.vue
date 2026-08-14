<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const {
  swipeDismissEnabled,
  escapeDismissEnabled,
  handleSwipeDismissChange,
  handleEscapeDismissChange,
  handleUndismissableDemo,
  sectionCodes,
} = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.dismiss.title')" :description="t('sections.dismiss.desc')">
    <template #buttons>
      <span class="inline-flex basis-full items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('sections.dismiss.swipe')
      }}</span>
      <button
        class="demo-btn"
        :data-active="!swipeDismissEnabled"
        @click="handleSwipeDismissChange(false)"
      >
        {{ t('sections.dismiss.off') }}
      </button>
      <button
        class="demo-btn"
        :data-active="swipeDismissEnabled"
        @click="handleSwipeDismissChange(true)"
      >
        {{ t('sections.dismiss.on') }}
      </button>
      <span class="inline-flex basis-full items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('sections.dismiss.escape')
      }}</span>
      <button
        class="demo-btn"
        :data-active="!escapeDismissEnabled"
        @click="handleEscapeDismissChange(false)"
      >
        {{ t('sections.dismiss.off') }}
      </button>
      <button
        class="demo-btn"
        :data-active="escapeDismissEnabled"
        @click="handleEscapeDismissChange(true)"
      >
        {{ t('sections.dismiss.on') }}
      </button>
      <span class="inline-flex basis-full items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('sections.dismiss.perToast')
      }}</span>
      <button class="demo-btn" @click="handleUndismissableDemo">
        {{ t('sections.dismiss.perToastDemo') }}
      </button>
    </template>
    <template #code><CodeBlock :code="sectionCodes.dismiss" /></template>
  </DemoSection>
</template>
