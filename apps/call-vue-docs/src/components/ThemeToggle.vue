<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')

function readTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function applyTheme(value: Theme) {
  document.documentElement.classList.toggle('dark', value === 'dark')
  try {
    localStorage.setItem('theme', value)
  } catch {
    // Persistence is optional when storage is unavailable.
  }
}

function toggle() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(theme.value)
}

onMounted(() => {
  theme.value = readTheme()
})
</script>

<template>
  <button
    type="button"
    class="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] transition-[color,border-color,background-color,transform] hover:border-[var(--color-border-strong)] hover:text-[var(--color-fg)] after:absolute after:-inset-1 after:content-['']"
    :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
    @click="toggle"
  >
    <svg
      v-if="theme === 'dark'"
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
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
    <svg
      v-else
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>
