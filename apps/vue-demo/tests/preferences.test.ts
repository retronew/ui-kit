import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'

describe('demo preferences', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('persists a manual theme and does not let system changes overwrite it', async () => {
    let systemListener: ((event: { matches: boolean }) => void) | undefined
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
          systemListener = listener
        },
        matches: false,
      })),
    )
    const { useTheme } = await import('../src/composables/useTheme.ts')
    const theme = useTheme()
    theme.setTheme('dark')
    await nextTick()

    expect(theme.isDark.value).toBe(true)
    expect(window.localStorage.getItem('toast-vue:theme')).toBe('dark')
    systemListener?.({ matches: false })
    expect(theme.isDark.value).toBe(true)
  })

  it('supports system, light, and dark theme preferences', async () => {
    let systemListener: ((event: { matches: boolean }) => void) | undefined
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
          systemListener = listener
        },
        matches: false,
      })),
    )
    const { useTheme } = await import('../src/composables/useTheme.ts')
    const preference = useTheme()

    expect(preference.theme.value).toBe('system')
    preference.setTheme('dark')
    await nextTick()
    expect(preference.isDark.value).toBe(true)
    expect(window.localStorage.getItem('toast-vue:theme')).toBe('dark')

    preference.setTheme('system')
    systemListener?.({ matches: false })
    await nextTick()
    expect(preference.isDark.value).toBe(false)
    expect(window.localStorage.getItem('toast-vue:theme')).toBe('system')

    systemListener?.({ matches: true })
    await nextTick()
    expect(preference.isDark.value).toBe(true)

    preference.setTheme('light')
    systemListener?.({ matches: true })
    await nextTick()
    expect(preference.isDark.value).toBe(false)

    preference.setTheme('system')
    expect(preference.nextTheme.value).toBe('light')
    preference.cycleTheme()
    expect(preference.theme.value).toBe('light')
    preference.cycleTheme()
    expect(preference.theme.value).toBe('dark')
    preference.cycleTheme()
    expect(preference.theme.value).toBe('system')
  })

  it('keeps locale switching usable when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked')
    })
    const { i18n, setLocale } = await import('../src/i18n.ts')

    expect(i18n.global.locale.value).toBe('en')
    expect(() => setLocale('zh-CN')).not.toThrow()
    expect(i18n.global.locale.value).toBe('zh-CN')
    expect(document.documentElement.lang).toBe('zh-CN')
  })
})
