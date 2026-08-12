import { ref, watch } from 'vue'

/** Singleton dark-mode state: follows the system initially, exposes a manual toggle, syncs `.dark` on `<html>`. */
const isDark = ref(
  typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
)

watch(
  isDark,
  (val) => {
    document.documentElement.classList.toggle('dark', val)
  },
  { immediate: true },
)

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDark.value = e.matches
  })
}

export function useTheme() {
  function toggleDark() {
    isDark.value = !isDark.value
  }

  function toggleTheme() {
    toggleDark()
  }

  return { isDark, toggleDark, toggleTheme }
}
