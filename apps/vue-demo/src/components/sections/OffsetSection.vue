<script setup lang="ts">
import { toastStore, useToaster } from '@retronew/toast-vue'
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const { viewportOffset } = useToaster(toastStore)
const { offsetPresets, formatOffset, handleOffsetChange, sectionCodes } = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.offset.title')" :description="t('sections.offset.desc')">
    <template #buttons>
      <button
        v-for="px in offsetPresets"
        :key="px"
        class="demo-btn"
        :data-active="viewportOffset === px"
        @click="handleOffsetChange(px)"
      >
        {{ formatOffset(px) }}
      </button>
    </template>
    <template #code><CodeBlock :code="sectionCodes.offset" /></template>
  </DemoSection>
</template>
