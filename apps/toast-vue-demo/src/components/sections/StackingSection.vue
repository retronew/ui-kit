<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const {
  stackModes,
  stackMode,
  maxPresets,
  maxToasts,
  centerAlignStack,
  direction,
  handleStackModeChange,
  handleMaxChange,
  handleCenterAlignToggle,
  handleDirectionChange,
  sectionCodes,
} = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.stacking.title')" :description="t('sections.stacking.desc')">
    <div class="mt-3.5 flex flex-wrap gap-2">
      <button
        v-for="m in stackModes"
        :key="m.value"
        class="demo-btn"
        :data-active="stackMode === m.value"
        @click="handleStackModeChange(m.value)"
      >
        {{ t(`stacking.${m.value}`) }}
      </button>
      <span class="inline-flex items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('stacking.max')
      }}</span>
      <button
        v-for="m in maxPresets"
        :key="m"
        class="demo-btn"
        :data-active="maxToasts === m"
        @click="handleMaxChange(m)"
      >
        {{ m === Infinity ? '∞' : m }}
      </button>
      <template v-if="stackMode === 'stack'">
        <span
          class="inline-flex basis-full items-center px-0.5 text-xs font-medium text-fg-muted"
          >{{ t('stacking.align') }}</span
        >
        <button class="demo-btn" :data-active="centerAlignStack" @click="handleCenterAlignToggle">
          {{ t('stacking.centerAlign') }}
        </button>
        <p v-if="centerAlignStack" class="mt-1 basis-full text-[13px] text-fg-muted">
          {{ t('stacking.centerAlignHint') }}
        </p>
      </template>
    </div>
    <CodeBlock :code="sectionCodes.stacking" />
    <div class="mt-5">
      <span class="inline-flex items-center px-0.5 text-xs font-medium text-fg-muted">{{
        t('stacking.direction')
      }}</span>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="dir in [true, false]"
          :key="String(dir)"
          class="demo-btn"
          :data-active="direction === dir"
          @click="handleDirectionChange(dir)"
        >
          {{ dir ? 'ltr' : 'rtl' }}
        </button>
      </div>
      <CodeBlock :code="sectionCodes.stackingDirection" />
    </div>
  </DemoSection>
</template>
