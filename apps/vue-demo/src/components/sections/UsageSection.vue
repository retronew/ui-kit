<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import CodeBlock from '../CodeBlock.vue'
import DemoSection from '../DemoSection.vue'

const { t } = useI18n()

const usageCode = [
  `import { Toaster, ToastWrapper, toast } from '@retronew/toast-vue'`,
  ``,
  `// Render the headless outlet in your app root`,
  `<Toaster v-slot="{ toasts, viewportOffset, updateHeight, calculateOffset }">`,
  `  <div :style="{ position: 'fixed', inset: typeof viewportOffset === 'number' ? viewportOffset + 'px' : viewportOffset }">`,
  `    <ToastWrapper v-for="t in toasts" :key="t.id" :id="t.id"`,
  `      :style="{ transform: 'translateY(' + calculateOffset(t) + 'px)' }"`,
  `      @height-update="updateHeight">`,
  `      {{ t.message }}`,
  `    </ToastWrapper>`,
  `  </div>`,
  `</Toaster>`,
  ``,
  `// Fire a toast from anywhere`,
  `toast('My first toast')`,
].join('\n')
</script>

<template>
  <DemoSection :title="t('sections.usage.title')" :description="t('sections.usage.desc')">
    <template #code><CodeBlock :code="usageCode" /></template>
  </DemoSection>
</template>
