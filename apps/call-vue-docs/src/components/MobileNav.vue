<script setup lang="ts">
import { onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'

interface NavLink {
  href: string
  label: string
  external?: boolean
}

defineProps<{ links: NavLink[] }>()

const open = ref(false)
const panelId = `mobile-nav-${useId()}`
const container = useTemplateRef<HTMLDivElement>('container')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  open.value = false
  trigger.value?.focus()
}

function onPointerdown(event: PointerEvent) {
  if (!container.value?.contains(event.target as Node)) open.value = false
}

watch(open, (value) => {
  if (value) {
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('pointerdown', onPointerdown)
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('pointerdown', onPointerdown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerdown)
})
</script>

<template>
  <div ref="container" class="relative">
    <button
      ref="trigger"
      type="button"
      class="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] transition-[color,border-color,background-color,transform] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)] after:absolute after:-inset-1 after:content-['']"
      :aria-label="open ? 'Close menu' : 'Open menu'"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path v-if="open" d="M18 6 6 18M6 6l12 12" />
        <path v-else d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>

    <nav
      v-show="open"
      :id="panelId"
      aria-label="Site"
      class="absolute top-full right-0 z-50 mt-2 min-w-44 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-1.5 shadow-lg shadow-black/5"
    >
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        :target="link.external ? '_blank' : undefined"
        :rel="link.external ? 'noopener noreferrer' : undefined"
        class="block whitespace-nowrap rounded px-3 py-2 text-sm text-[var(--color-fg-muted)] transition-[color,background-color,transform] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)]"
      >
        {{ link.label }}
      </a>
    </nav>
  </div>
</template>
