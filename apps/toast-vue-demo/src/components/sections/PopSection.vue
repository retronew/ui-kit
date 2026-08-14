<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const { popMotion, handlePopMotionChange, handlePopOverrideDemo, lastPopOverride, sectionCodes } =
  useToasts()
</script>

<template>
  <DemoSection :title="t('sections.pop.title')" :description="t('sections.pop.desc')">
    <div class="mt-3.5 flex flex-wrap gap-2">
      <button class="demo-btn" :data-active="!popMotion" @click="handlePopMotionChange(false)">
        {{ t('sections.pop.off') }}
      </button>
      <button class="demo-btn" :data-active="popMotion" @click="handlePopMotionChange(true)">
        {{ t('sections.pop.on') }}
      </button>
    </div>
    <CodeBlock :code="sectionCodes.pop" />
    <div class="mt-5">
      <span class="inline-flex items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('sections.pop.perToast')
      }}</span>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          class="demo-btn"
          :data-active="lastPopOverride === true"
          @click="handlePopOverrideDemo(true)"
        >
          {{ t('sections.pop.perToastOn') }}
        </button>
        <button
          class="demo-btn"
          :data-active="lastPopOverride === false"
          @click="handlePopOverrideDemo(false)"
        >
          {{ t('sections.pop.perToastOff') }}
        </button>
      </div>
      <CodeBlock :code="sectionCodes.popOverride" />
    </div>
  </DemoSection>
</template>
