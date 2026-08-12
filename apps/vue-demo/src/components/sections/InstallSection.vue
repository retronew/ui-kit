<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()

const installCode = 'pnpm add @retronew/toast-vue'
</script>

<template>
  <DemoSection :title="t('sections.install.title')" :description="t('sections.install.desc')">
    <template #code><CodeBlock :code="installCode" /></template>
  </DemoSection>
</template>
