<script setup lang="ts">
import { Lightbox } from './callable'
const images = [
  {
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=160&h=120&fit=crop',
    full: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
    alt: 'Circuit board macro',
  },
  {
    thumb: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=160&h=120&fit=crop',
    full: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=1200',
    alt: 'Forest path',
  },
  {
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=160&h=120&fit=crop',
    full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    alt: 'Mountains at dusk',
  },
] as const
</script>
<template>
  <div class="flex flex-col items-center gap-3">
    <div class="flex gap-2">
      <button
        v-for="image in images"
        :key="image.thumb"
        type="button"
        class="overflow-hidden rounded-md border border-[var(--color-border)] transition-transform hover:scale-105"
        @click="Lightbox.call({ src: image.full, alt: image.alt })"
      >
        <img :src="image.thumb" :alt="image.alt" class="h-20 w-28 object-cover" />
      </button>
    </div>
    <span class="font-mono text-xs text-[var(--color-fg-subtle)]"
      >click a thumbnail → lightbox</span
    >
  </div>
</template>
