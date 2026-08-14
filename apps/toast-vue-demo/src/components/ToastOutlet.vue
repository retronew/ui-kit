<script setup lang="ts">
import {
  ToasterProvider,
  ToastWrapper,
  toViewportOffsetCss,
  useToastHotkey,
} from '@retronew/toast-vue'
import { useToasts } from '../composables/useToasts'
import ToastBar from './ToastBar.vue'

const {
  stackMode,
  hoveredPosition,
  effectivePosition,
  resolveCustomMessage,
  toastMotion,
  needsFixedWidth,
  centerAlignStack,
  layoutStyle,
  handlePointerEnter,
  handlePointerLeave,
  motionDuration,
  stackGutter,
  resolvePop,
  resolveSwipeDismiss,
  resolveEscapeDismiss,
} = useToasts()

// Alt+T focuses the frontmost toast; Tab reaches its buttons, Escape dismisses it.
useToastHotkey()
</script>

<template>
  <ToasterProvider
    progress
    v-slot="{
      toasts,
      viewportOffset,
      dismiss,
      pause,
      resume,
      updateHeight,
      calculateOffset,
      getStackMetrics,
    }"
  >
    <div
      class="fixed z-9999 pointer-events-none"
      :style="{
        inset: toViewportOffsetCss(viewportOffset),
        '--toast-motion-duration': `${motionDuration}ms`,
        '--toast-stack-gap': `${stackGutter}px`,
      }"
    >
      <ToastWrapper
        v-for="t in toasts"
        :id="t.id"
        :key="t.id"
        :status="t.status"
        :expanded="stackMode === 'stack' && hoveredPosition === effectivePosition(t)"
        :toast-position="effectivePosition(t)"
        :center-align="centerAlignStack"
        :pop="resolvePop(t)"
        :swipe-dismiss="resolveSwipeDismiss(t)"
        :escape-dismiss="resolveEscapeDismiss(t)"
        v-bind="toastMotion(t, toasts, calculateOffset, getStackMetrics)"
        :style="layoutStyle(effectivePosition(t))"
        @height-update="updateHeight"
        @dismiss-request="dismiss(t.id)"
        @mouseenter="handlePointerEnter(t, pause)"
        @mouseleave="handlePointerLeave($event, resume)"
      >
        <component :is="resolveCustomMessage(t)" v-if="t.type === 'custom'" />
        <ToastBar v-else :toast="t" :fixed-width="needsFixedWidth()" @dismiss="dismiss(t.id)" />
      </ToastWrapper>
    </div>
  </ToasterProvider>
</template>
