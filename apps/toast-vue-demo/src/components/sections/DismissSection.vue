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
  handleSwipeOverrideDemo,
  handleEscapeOverrideDemo,
  lastDismissOverride,
  sectionCodes,
} = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.dismiss.title')" :description="t('sections.dismiss.desc')">
    <div class="mt-3.5">
      <span class="inline-flex items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('sections.dismiss.swipe')
      }}</span>
      <div class="mt-2 flex flex-wrap gap-2">
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
      </div>
      <span class="mt-3 inline-flex items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('sections.dismiss.escape')
      }}</span>
      <div class="mt-2 flex flex-wrap gap-2">
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
      </div>
      <CodeBlock :code="sectionCodes.dismiss" />
    </div>
    <div class="mt-5">
      <span class="inline-flex items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('sections.dismiss.perToast')
      }}</span>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          class="demo-btn"
          :data-active="lastDismissOverride === 'swipe'"
          @click="handleSwipeOverrideDemo"
        >
          {{ t('sections.dismiss.perToastSwipeOff') }}
        </button>
        <button
          class="demo-btn"
          :data-active="lastDismissOverride === 'escape'"
          @click="handleEscapeOverrideDemo"
        >
          {{ t('sections.dismiss.perToastEscapeOff') }}
        </button>
      </div>
      <CodeBlock :code="sectionCodes.dismissOverride" />
    </div>
  </DemoSection>
</template>
