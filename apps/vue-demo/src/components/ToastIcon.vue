<script setup lang="ts">
import type { ToastType } from '@retronew/toast-vue'
import CheckIcon from './icon/CheckIcon.vue'
import ErrorIcon from './icon/ErrorIcon.vue'
import LoaderIcon from './icon/LoaderIcon.vue'

defineProps<{
  type: ToastType
}>()
</script>

<template>
  <div class="icon-wrapper">
    <LoaderIcon v-if="type === 'loading'" />

    <template v-else-if="type === 'success'">
      <CheckIcon />
    </template>

    <template v-else-if="type === 'error'">
      <ErrorIcon />
    </template>

    <div v-else-if="type === 'info'" class="badge badge--info">i</div>
    <div v-else-if="type === 'warning'" class="badge badge--warning">!</div>
  </div>
</template>

<style scoped>
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  min-height: 20px;
  flex-shrink: 0;
}

.badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.badge--info {
  background: #3b82f6;
}

.badge--warning {
  background: #f59e0b;
}
</style>
