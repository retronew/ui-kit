import { toastStore } from '@retronew/toast-vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { useToasts } from '../src/composables/useToasts.ts'

describe(useToasts, () => {
  beforeEach(() => {
    vi.useFakeTimers()
    toastStore.remove()
  })

  afterEach(() => {
    toastStore.remove()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('handles a rejected promise demo without an unhandled rejection', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    useToasts().handlePromiseClick()

    await vi.advanceTimersByTimeAsync(2000)
    expect(toastStore.getState().toasts[0]).toMatchObject({
      message: 'Error: Save failed',
      type: 'error',
    })
  })

  it('cancels scheduled burst work when dismiss-all is requested', () => {
    const { handleDismissAllClick, handleSameErrorBurst } = useToasts()
    handleSameErrorBurst()
    handleDismissAllClick()

    vi.advanceTimersByTime(5000)
    expect(toastStore.getState().toasts).toHaveLength(0)
  })

  it('toggles pop motion, updates its code sample, and announces the change', () => {
    const { handlePopMotionChange, popMotion, sectionCodes } = useToasts()

    handlePopMotionChange(true)
    expect(popMotion.value).toBe(true)
    expect(sectionCodes.pop).toContain('pop="true"')
    expect(toastStore.getState().toasts[0]).toMatchObject({ message: 'Pop motion → on' })

    handlePopMotionChange(false)
    expect(popMotion.value).toBe(false)
    expect(sectionCodes.pop).toContain('pop="false"')
    expect(toastStore.getState().toasts[0]).toMatchObject({ message: 'Pop motion → off' })
  })
})
