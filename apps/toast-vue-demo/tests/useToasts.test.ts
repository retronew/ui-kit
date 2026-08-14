import { toastStore } from '@retronew/toast-vue'
import type { Toast } from '@retronew/toast-vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { useToasts } from '../src/composables/useToasts.ts'

/** Minimal `Toast` fixture — only the fields `resolveSwipeDismiss`/`resolveEscapeDismiss` read. */
const baseToast: Toast = {
  createdAt: 0,
  duration: 4000,
  id: 't1',
  message: 'hi',
  paused: false,
  stacked: false,
  status: 'visible',
  type: 'blank',
  updatedAt: 0,
}

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

  it('fires a toast from the easter egg, deterministic on Math.random', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    useToasts().handleEasterEggClick()

    expect(toastStore.getState().toasts[0]?.message).toBe('🎉 You found it!')
  })

  it('cancels scheduled burst work when dismiss-all is requested', () => {
    const { handleDismissAllClick, handleSameErrorBurst } = useToasts()
    handleSameErrorBurst()
    handleDismissAllClick()

    vi.advanceTimersByTime(5000)
    expect(toastStore.getState().toasts).toHaveLength(0)
  })

  it('clears both action buttons after undoing the action demo', () => {
    useToasts().handleActionClick()

    const toast = toastStore.getState().toasts[0]
    toast?.action?.onClick?.(toast)

    expect(toastStore.getState().toasts[0]).toMatchObject({
      action: undefined,
      cancel: undefined,
      message: 'Restored',
      type: 'success',
    })
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

  it('resolves toasts fired without an explicit position through toastStore.defaultPosition', () => {
    const { handleSuccessClick, handleHeroClick } = useToasts()

    handleSuccessClick()
    handleHeroClick()

    const toasts = toastStore.getState().toasts
    expect(toasts).toHaveLength(2)
    for (const t of toasts) {
      expect(t.position).toBe(toastStore.getDefaultPosition())
    }
  })

  it('fires a one-off toast at the override position without changing the global default', () => {
    const { handleSuccessClick, handlePerToastPositionChange } = useToasts()
    const defaultPosition = toastStore.getDefaultPosition()
    expect(defaultPosition).not.toBe('bottom-left')

    handlePerToastPositionChange('bottom-left')

    // Newest toast is unshifted to the front — see `store.ts`'s `[toast, ...this.toasts]`.
    expect(toastStore.getState().toasts[0]).toMatchObject({ position: 'bottom-left' })
    expect(toastStore.getDefaultPosition()).toBe(defaultPosition)

    handleSuccessClick()

    expect(toastStore.getState().toasts[0]).toMatchObject({ position: defaultPosition })
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

  it('resolves pop from a toast’s own meta, falling back to the global toggle', () => {
    const { resolvePop, handlePopMotionChange } = useToasts()

    expect(resolvePop({ ...baseToast, meta: undefined })).toBe(false)
    expect(resolvePop({ ...baseToast, meta: { pop: true } })).toBe(true)

    handlePopMotionChange(true)
    expect(resolvePop({ ...baseToast, meta: undefined })).toBe(true)
    expect(resolvePop({ ...baseToast, meta: { pop: false } })).toBe(false)
    handlePopMotionChange(false)
  })

  it('fires a toast with an explicit pop override via meta, regardless of the global toggle', () => {
    const { handlePopOverrideDemo, handlePopMotionChange, popMotion, sectionCodes, resolvePop } =
      useToasts()

    expect(popMotion.value).toBe(false)
    handlePopOverrideDemo(true)
    const fired = toastStore.getState().toasts[0]!
    expect(fired).toMatchObject({ meta: { pop: true } })
    expect(resolvePop(fired)).toBe(true)
    expect(sectionCodes.popOverride).toContain('meta: { pop: true }')

    handlePopMotionChange(true)
    handlePopOverrideDemo(false)
    const secondFired = toastStore.getState().toasts[0]!
    expect(secondFired).toMatchObject({ meta: { pop: false } })
    expect(sectionCodes.popOverride).toContain('meta: { pop: false }')
    handlePopMotionChange(false)
  })

  it('toggles swipe dismiss independently of escape dismiss, updating the shared code sample', () => {
    const { handleSwipeDismissChange, swipeDismissEnabled, escapeDismissEnabled, sectionCodes } =
      useToasts()

    handleSwipeDismissChange(false)
    expect(swipeDismissEnabled.value).toBe(false)
    expect(escapeDismissEnabled.value).toBe(true)
    expect(sectionCodes.dismiss).toContain('swipe-dismiss="false"')
    expect(sectionCodes.dismiss).toContain('escape-dismiss="true"')
    expect(toastStore.getState().toasts[0]).toMatchObject({ message: 'Swipe dismiss → off' })

    handleSwipeDismissChange(true)
    expect(swipeDismissEnabled.value).toBe(true)
    expect(sectionCodes.dismiss).toContain('swipe-dismiss="true"')
  })

  it('toggles escape dismiss independently of swipe dismiss, updating the shared code sample', () => {
    const { handleEscapeDismissChange, escapeDismissEnabled, swipeDismissEnabled, sectionCodes } =
      useToasts()

    handleEscapeDismissChange(false)
    expect(escapeDismissEnabled.value).toBe(false)
    expect(swipeDismissEnabled.value).toBe(true)
    expect(sectionCodes.dismiss).toContain('escape-dismiss="false"')
    expect(sectionCodes.dismiss).toContain('swipe-dismiss="true"')
    expect(toastStore.getState().toasts[0]).toMatchObject({ message: 'Escape dismiss → off' })

    handleEscapeDismissChange(true)
    expect(escapeDismissEnabled.value).toBe(true)
    expect(sectionCodes.dismiss).toContain('escape-dismiss="true"')
  })

  it('resolves swipe/escape dismiss from a toast’s own meta, falling back to the global toggle', () => {
    const { resolveSwipeDismiss, resolveEscapeDismiss, handleSwipeDismissChange } = useToasts()

    // No meta override: follows the global toggle.
    const plain: Toast = { ...baseToast, meta: undefined }
    expect(resolveSwipeDismiss(plain)).toBe(true)
    expect(resolveEscapeDismiss(plain)).toBe(true)

    // Meta override wins regardless of the global toggle's value.
    const locked: Toast = { ...baseToast, meta: { escapeDismiss: false, swipeDismiss: false } }
    expect(resolveSwipeDismiss(locked)).toBe(false)
    expect(resolveEscapeDismiss(locked)).toBe(false)

    handleSwipeDismissChange(false)
    expect(resolveSwipeDismiss(plain)).toBe(false)
    expect(resolveSwipeDismiss({ ...baseToast, meta: { swipeDismiss: true } })).toBe(true)
    handleSwipeDismissChange(true)
  })

  it('fires an infinite-duration toast that ignores swipe via meta, independent of escape', () => {
    const { handleSwipeOverrideDemo, sectionCodes } = useToasts()

    handleSwipeOverrideDemo()

    expect(toastStore.getState().toasts[0]).toMatchObject({
      duration: Number.POSITIVE_INFINITY,
      meta: { swipeDismiss: false },
    })
    expect(sectionCodes.dismissOverride).toContain('meta: { swipeDismiss: false }')
  })

  it('fires an infinite-duration toast that ignores Escape via meta, independent of swipe', () => {
    const { handleEscapeOverrideDemo, sectionCodes } = useToasts()

    handleEscapeOverrideDemo()

    expect(toastStore.getState().toasts[0]).toMatchObject({
      duration: Number.POSITIVE_INFINITY,
      meta: { escapeDismiss: false },
    })
    expect(sectionCodes.dismissOverride).toContain('meta: { escapeDismiss: false }')
  })
})
