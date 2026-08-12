<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const { duration, durationPresets, formatDuration, handleDurationChange, sectionCodes } =
  useToasts()
</script>

<template>
  <DemoSection :title="t('sections.duration.title')" :description="t('sections.duration.desc')">
    <template #buttons>
      <button
        v-for="d in durationPresets"
        :key="d"
        class="demo-btn"
        :data-active="duration === d"
        @click="handleDurationChange(d)"
      >
        {{ formatDuration(d) }}
      </button>
    </template>
    <template #code><CodeBlock :code="sectionCodes.duration" /></template>
  </DemoSection>
</template>
