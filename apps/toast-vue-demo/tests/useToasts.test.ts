import { toastStore } from '@retronew/toast-vue'
import type { Toast } from '@retronew/toast-vue'
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

  it('recedes an overflowing stack-mode toast at a fixed, ever-shrinking offset/scale instead of growing with its depth', () => {
    const { toastMotion, stackMode, maxToasts } = useToasts()
    stackMode.value = 'stack'
    maxToasts.value = 3

    const overflowing = { id: 't1' } as Toast
    // depth (4) is past the cap (3) — an overflow card several toasts deep in history.
    const motion = toastMotion(
      overflowing,
      [overflowing],
      () => 0,
      () => ({ index: 4, isFront: false, zIndex: 0 }),
    )

    // Fixed regardless of `depth`: (STACKED_VISIBLE - 1) * 14 + STACK_DROP_DISTANCE = 2 * 14 + 20.
    expect(motion.offset).toBe(48)
    // Continues the pile's -0.05/level shrink one step past the visible edge: 1 - 3 * 0.05.
    expect(motion.scale).toBeCloseTo(0.85)
    expect(motion.stackOpacity).toBe(0)
  })

  it('groups toasts fired without a per-toast override under the currently shown position, not a separate default bucket', () => {
    // `toast-core` caps `max` per distinct `position` value — an unset position
    // silently drops a toast into its own `'__default__'` bucket, uncoupled from
    // whatever position is actually being shown, so overflow limits stop being
    // shared with position-explicit toasts (e.g. from the position picker).
    const { handleSuccessClick, handleHeroClick, position } = useToasts()

    handleSuccessClick()
    handleHeroClick()

    const toasts = toastStore.getState().toasts
    expect(toasts).toHaveLength(2)
    for (const t of toasts) {
      expect(t.position).toBe(position.value)
    }
  })

  it('routes new toasts to a per-toast position override once one is set', () => {
    const { handleSuccessClick, handlePerToastPositionChange } = useToasts()
    handlePerToastPositionChange('bottom-left')

    handleSuccessClick()

    expect(toastStore.getState().toasts[0]).toMatchObject({ position: 'bottom-left' })
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
