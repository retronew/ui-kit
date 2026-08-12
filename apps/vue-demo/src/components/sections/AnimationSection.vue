<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const {
  motionDuration,
  motionDurationPresets,
  formatMotionDuration,
  handleMotionDurationChange,
  sectionCodes,
} = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.animation.title')" :description="t('sections.animation.desc')">
    <template #buttons>
      <button
        v-for="d in motionDurationPresets"
        :key="d"
        class="demo-btn"
        :data-active="motionDuration === d"
        @click="handleMotionDurationChange(d)"
      >
        {{ formatMotionDuration(d) }}
      </button>
    </template>
    <template #code><CodeBlock :code="sectionCodes.animation" /></template>
  </DemoSection>
</template>
