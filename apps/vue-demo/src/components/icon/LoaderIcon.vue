<script setup lang="ts">
withDefaults(
  defineProps<{
    primary?: string
    secondary?: string
  }>(),
  {
    primary: '#616161',
    secondary: '#e0e0e0',
  },
)
</script>

<template>
  <div class="loader-icon" :style="{ '--primary': primary, '--secondary': secondary }" />
</template>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loader-icon {
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: var(--secondary);
  border-right-color: var(--primary);
  animation: rotate 1s linear infinite;
  flex-shrink: 0;
}
</style>
