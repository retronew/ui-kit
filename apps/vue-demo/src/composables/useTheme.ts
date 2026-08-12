import { computed, ref, watch } from 'vue'

export type ThemePreference = 'dark' | 'light' | 'system'

const THEME_STORAGE_KEY = 'toast-vue:theme'
const THEME_CYCLE: readonly ThemePreference[] = ['system', 'light', 'dark']
const colorSchemeQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : undefined

function storedTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system'
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'dark' || value === 'light' || value === 'system' ? value : 'system'
  } catch {
    return 'system'
  }
}

const theme = ref<ThemePreference>(storedTheme())
const systemIsDark = ref(colorSchemeQuery?.matches ?? false)
const nextTheme = computed(
  () => THEME_CYCLE[(THEME_CYCLE.indexOf(theme.value) + 1) % THEME_CYCLE.length],
)
const isDark = computed(() =>
  theme.value === 'system' ? systemIsDark.value : theme.value === 'dark',
)

watch(
  isDark,
  (dark) => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#111110' : '#fafafa')
  },
  { immediate: true },
)

if (colorSchemeQuery) {
  const handleChange = (event: MediaQueryListEvent): void => {
    systemIsDark.value = event.matches
  }
  if (typeof colorSchemeQuery.addEventListener === 'function') {
    colorSchemeQuery.addEventListener('change', handleChange)
  } else if (typeof colorSchemeQuery.addListener === 'function') {
    colorSchemeQuery.addListener(handleChange)
  }
}

export function useTheme() {
  function setTheme(preference: ThemePreference): void {
    theme.value = preference
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference)
    } catch {
      // Storage can be unavailable in restricted or private browsing contexts.
    }
  }

  function cycleTheme(): void {
    setTheme(nextTheme.value ?? 'system')
  }

  return {
    cycleTheme,
    isDark,
    nextTheme,
    setTheme,
    theme,
    toggleDark: cycleTheme,
    toggleTheme: cycleTheme,
  }
}
