import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { prefersReducedMotion, resolveValue, subscribeReducedMotion } from '../src/utils'

describe('resolveValue', () => {
  it('returns a plain value unchanged', () => {
    expect(resolveValue('hello', undefined)).toBe('hello')
  })

  it('calls a function with the given argument and returns its result', () => {
    const fn = vi.fn((arg: number) => arg * 2)
    expect(resolveValue(fn, 21)).toBe(42)
    expect(fn).toHaveBeenCalledWith(21)
  })
})

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when window is unavailable', () => {
    expect(prefersReducedMotion()).toBe(false)
  })

  it('returns false when matchMedia is unavailable', () => {
    vi.stubGlobal('window', {})
    expect(prefersReducedMotion()).toBe(false)
  })

  it('returns the matchMedia result when available', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    vi.stubGlobal('window', { matchMedia })
    expect(prefersReducedMotion()).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })
})

describe('subscribeReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns a no-op unsubscribe when window is unavailable', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeReducedMotion(listener)
    expect(() => unsubscribe()).not.toThrow()
    expect(listener).not.toHaveBeenCalled()
  })

  it('returns a no-op unsubscribe when matchMedia is unavailable', () => {
    vi.stubGlobal('window', {})
    const unsubscribe = subscribeReducedMotion(vi.fn())
    expect(() => unsubscribe()).not.toThrow()
  })

  it('subscribes and unsubscribes via addEventListener when available', () => {
    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    const matchMedia = vi.fn().mockReturnValue({ addEventListener, removeEventListener })
    vi.stubGlobal('window', { matchMedia })

    const listener = vi.fn()
    const unsubscribe = subscribeReducedMotion(listener)

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    const handler = addEventListener.mock.calls[0][1] as (event: { matches: boolean }) => void
    handler({ matches: true })
    expect(listener).toHaveBeenCalledWith(true)

    unsubscribe()
    expect(removeEventListener).toHaveBeenCalledWith('change', handler)
  })

  it('falls back to addListener/removeListener when addEventListener is unavailable', () => {
    const addListener = vi.fn()
    const removeListener = vi.fn()
    const matchMedia = vi.fn().mockReturnValue({ addListener, removeListener })
    vi.stubGlobal('window', { matchMedia })

    const listener = vi.fn()
    const unsubscribe = subscribeReducedMotion(listener)

    expect(addListener).toHaveBeenCalledWith(expect.any(Function))
    const handler = addListener.mock.calls[0][0] as (event: { matches: boolean }) => void
    handler({ matches: false })
    expect(listener).toHaveBeenCalledWith(false)

    unsubscribe()
    expect(removeListener).toHaveBeenCalledWith(handler)
  })

  it('returns a no-op unsubscribe when neither listener API is available', () => {
    const matchMedia = vi.fn().mockReturnValue({})
    vi.stubGlobal('window', { matchMedia })
    const unsubscribe = subscribeReducedMotion(vi.fn())
    expect(() => unsubscribe()).not.toThrow()
  })
})
