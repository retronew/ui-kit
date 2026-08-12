<script setup lang="ts">
withDefaults(
  defineProps<{
    primary?: string
    secondary?: string
  }>(),
  {
    primary: '#ff4b4b',
    secondary: '#fff',
  },
)
</script>

<template>
  <div class="error-icon" :style="{ '--primary': primary, '--secondary': secondary }" />
</template>

<style scoped>
@keyframes circleAnimation {
  from {
    transform: scale(0) rotate(45deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(45deg);
    opacity: 1;
  }
}

@keyframes firstLineAnimation {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes secondLineAnimation {
  from {
    transform: scale(0) rotate(90deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(90deg);
    opacity: 1;
  }
}

.error-icon {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: var(--primary);
  position: relative;
  transform: rotate(45deg);
  opacity: 0;
  animation: circleAnimation 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: 100ms;
  flex-shrink: 0;
}

.error-icon::after,
.error-icon::before {
  content: '';
  animation: firstLineAnimation 0.15s ease-out forwards;
  animation-delay: 150ms;
  position: absolute;
  border-radius: 3px;
  opacity: 0;
  background: var(--secondary);
  bottom: 9px;
  left: 4px;
  height: 2px;
  width: 12px;
}

.error-icon::before {
  animation: secondLineAnimation 0.15s ease-out forwards;
  animation-delay: 180ms;
  transform: rotate(90deg);
}
</style>
