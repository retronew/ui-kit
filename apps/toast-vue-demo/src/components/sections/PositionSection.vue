<script setup lang="ts">
import { toastStore, useToaster } from '@retronew/toast-vue'
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const { defaultPosition } = useToaster(toastStore)
const {
  positions,
  lastOverridePosition,
  formatPositionName,
  handlePositionChange,
  handlePerToastPositionChange,
  sectionCodes,
} = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.position.title')" :description="t('sections.position.desc')">
    <div class="mt-3.5">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="pos in positions"
          :key="pos"
          class="demo-btn"
          :data-active="defaultPosition === pos"
          @click="handlePositionChange(pos)"
        >
          {{ formatPositionName(pos) }}
        </button>
      </div>
      <CodeBlock :code="sectionCodes.position" />
    </div>
    <div class="mt-5">
      <span class="inline-flex items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('position.override')
      }}</span>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="pos in positions"
          :key="`override-${pos}`"
          class="demo-btn"
          :data-active="lastOverridePosition === pos"
          @click="handlePerToastPositionChange(pos)"
        >
          {{ formatPositionName(pos) }}
        </button>
      </div>
      <CodeBlock :code="sectionCodes.positionOverride" />
    </div>
  </DemoSection>
</template>
