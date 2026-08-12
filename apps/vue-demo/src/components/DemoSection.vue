<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="pt-9">
    <h2 class="text-xl font-semibold tracking-tight">{{ title }}</h2>
    <p class="mt-1.5 text-[15px] text-fg-muted">{{ description }}</p>
    <div v-if="$slots.buttons" class="mt-3.5 flex flex-wrap gap-2">
      <slot name="buttons" />
    </div>
    <slot name="code" />
  </section>
</template>
