<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const { popMotion, handlePopMotionChange, handlePopOverrideDemo, sectionCodes } = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.pop.title')" :description="t('sections.pop.desc')">
    <template #buttons>
      <button class="demo-btn" :data-active="!popMotion" @click="handlePopMotionChange(false)">
        {{ t('sections.pop.off') }}
      </button>
      <button class="demo-btn" :data-active="popMotion" @click="handlePopMotionChange(true)">
        {{ t('sections.pop.on') }}
      </button>
      <span class="inline-flex basis-full items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('sections.pop.perToast')
      }}</span>
      <button class="demo-btn" @click="handlePopOverrideDemo">
        {{ t('sections.pop.perToastDemo') }}
      </button>
    </template>
    <template #code><CodeBlock :code="sectionCodes.pop" /></template>
  </DemoSection>
</template>
