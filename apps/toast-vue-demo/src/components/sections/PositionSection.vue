<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const {
  position,
  positions,
  perToastPosition,
  formatPositionName,
  handlePositionChange,
  handlePerToastPositionChange,
  sectionCodes,
} = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.position.title')" :description="t('sections.position.desc')">
    <template #buttons>
      <button
        v-for="pos in positions"
        :key="pos"
        class="demo-btn"
        :data-active="position === pos"
        @click="handlePositionChange(pos)"
      >
        {{ formatPositionName(pos) }}
      </button>
      <span class="inline-flex basis-full items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('position.override')
      }}</span>
      <button
        class="demo-btn"
        :data-active="perToastPosition === null"
        @click="handlePerToastPositionChange(null)"
      >
        {{ t('position.useGlobal') }}
      </button>
      <button
        v-for="pos in positions"
        :key="`override-${pos}`"
        class="demo-btn"
        :data-active="perToastPosition === pos"
        @click="handlePerToastPositionChange(pos)"
      >
        {{ formatPositionName(pos) }}
      </button>
    </template>
    <template #code><CodeBlock :code="sectionCodes.position" /></template>
  </DemoSection>
</template>
