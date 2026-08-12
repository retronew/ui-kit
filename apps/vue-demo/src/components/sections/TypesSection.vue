<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useToasts } from '../../composables/useToasts'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()
const { activeType, typeDemos, sectionCodes } = useToasts()
</script>

<template>
  <DemoSection :title="t('sections.types.title')" :description="t('sections.types.desc')">
    <template #buttons>
      <button
        v-for="demo in typeDemos"
        :key="demo.key"
        class="demo-btn"
        :data-active="activeType === demo.key"
        @click="demo.run()"
      >
        {{ t(`types.${demo.key}`) }}
      </button>
    </template>
    <template #code><CodeBlock :code="sectionCodes.types" /></template>
  </DemoSection>
</template>
