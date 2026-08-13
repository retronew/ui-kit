<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const {
  dedupActive,
  handleSameErrorBurst,
  handleDifferentErrors,
  handleSingleError,
  handleDismissAllClick,
  sectionCodes,
} = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.dedup.title')" :description="t('sections.dedup.desc')">
    <template #buttons>
      <button class="demo-btn" :data-active="dedupActive === 'same'" @click="handleSameErrorBurst">
        {{ t('dedup.sameError') }}
      </button>
      <button
        class="demo-btn"
        :data-active="dedupActive === 'different'"
        @click="handleDifferentErrors"
      >
        {{ t('dedup.differentErrors') }}
      </button>
      <button class="demo-btn" :data-active="dedupActive === 'single'" @click="handleSingleError">
        {{ t('dedup.singleError') }}
      </button>
      <span class="inline-flex basis-full items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('dedup.actions')
      }}</span>
      <button class="demo-btn" @click="handleDismissAllClick">{{ t('dedup.dismissAll') }}</button>
    </template>
    <template #code><CodeBlock :code="sectionCodes.dedup" /></template>
  </DemoSection>
</template>
