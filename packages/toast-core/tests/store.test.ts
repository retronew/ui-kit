import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { ToastStore, createToastApi } from '../src/index.ts'

describe(ToastStore, () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('creates a visible toast and notifies subscribers', () => {
    const store = new ToastStore<string>()
    const listener = vi.fn()
    store.subscribe(listener)

    const id = store.create('hello', { type: 'success' })

    expect(listener).toHaveBeenCalledOnce()
    const { toasts } = store.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toMatchObject({
      id,
      message: 'hello',
      status: 'visible',
      type: 'success',
    })
  })

  it('publishes the viewport offset and updates it at runtime', () => {
    const store = new ToastStore<string>({ viewportOffset: '1.5rem' })
    const listener = vi.fn()
    store.subscribe(listener)

    expect(store.getState().viewportOffset).toBe('1.5rem')

    store.setViewportOffset(24)
    expect(store.getState().viewportOffset).toBe(24)
    expect(listener).toHaveBeenCalledOnce()

    store.setViewportOffset(24)
    expect(listener).toHaveBeenCalledOnce()
  })

  it('defaults the viewport offset to 16 pixels', () => {
    const store = new ToastStore<string>()
    expect(store.getState().viewportOffset).toBe(16)
  })

  it('carries action/cancel through create and update', () => {
    const store = new ToastStore<string>()
    const onUndo = vi.fn()
    const id = store.create('deleted', { action: { label: 'Undo', onClick: onUndo } })

    let toast = store.getState().toasts[0]
    expect(toast?.action?.label).toBe('Undo')
    toast?.action?.onClick?.(toast)
    expect(onUndo).toHaveBeenCalledWith(toast)

    const onCancel = vi.fn()
    store.update(id, { cancel: { label: 'Cancel', onClick: onCancel } })
    toast = store.getState().toasts[0]
    expect(toast?.cancel?.label).toBe('Cancel')
    expect(toast?.action?.label).toBe('Undo')
  })

  it('prepends newest toasts', () => {
    const store = new ToastStore<string>()
    store.create('first')
    store.create('second')
    expect(store.getState().toasts.map((t) => t.message)).toStrictEqual(['second', 'first'])
  })

  it("auto-dismisses after the type's default duration", () => {
    const store = new ToastStore<string>()
    store.create('bye', { type: 'success' }) // success → 3000ms
    expect(store.getState().toasts[0]?.status).toBe('visible')

    vi.advanceTimersByTime(3000)
    expect(store.getState().toasts[0]?.status).toBe('dismissed')
  })

  it('never auto-dismisses loading toasts', () => {
    const store = new ToastStore<string>()
    store.create('loading…', { type: 'loading' })
    vi.advanceTimersByTime(60_000)
    expect(store.getState().toasts[0]?.status).toBe('visible')
  })

  it('removes a dismissed toast after removeDelay', () => {
    const store = new ToastStore<string>({ removeDelay: 500 })
    const id = store.create('x', { duration: 1000 })
    vi.advanceTimersByTime(1000)
    expect(store.getState().toasts[0]?.status).toBe('dismissed')
    vi.advanceTimersByTime(500)
    expect(store.getState().toasts.find((t) => t.id === id)).toBeUndefined()
  })

  it('cancels stale removal when a dismissed toast is shown again', () => {
    const store = new ToastStore<string>({ removeDelay: 500 })
    store.create('old', { duration: Infinity, id: 'same' })
    store.dismiss('same')

    store.update('same', { duration: Infinity, message: 'shown again' })
    vi.advanceTimersByTime(500)

    expect(store.getState().toasts[0]).toMatchObject({
      id: 'same',
      message: 'shown again',
      status: 'visible',
    })
  })

  it('does not let an old removal delete a newly recreated id', () => {
    const store = new ToastStore<string>({ removeDelay: 500 })
    store.create('old', { duration: Infinity, id: 'same' })
    store.dismiss('same')
    store.remove('same')
    store.create('new', { duration: Infinity, id: 'same' })

    vi.advanceTimersByTime(500)
    expect(store.getState().toasts[0]?.message).toBe('new')
  })

  it('pauses and resumes the auto-dismiss timer', () => {
    const store = new ToastStore<string>()
    store.create('hover me', { duration: 1000 })

    vi.advanceTimersByTime(600)
    store.pause()
    expect(store.getState().toasts[0]?.paused).toBeTruthy()

    vi.advanceTimersByTime(5000)
    expect(store.getState().toasts[0]?.status).toBe('visible')

    store.resume()
    expect(store.getState().toasts[0]?.paused).toBeFalsy()
    vi.advanceTimersByTime(400)
    expect(store.getState().toasts[0]?.status).toBe('dismissed')
  })

  it('keeps manual pause when the visibility pause is released', () => {
    const listeners: ((event: Event) => void)[] = []
    const fakeDocument = {
      addEventListener: (_type: string, listener: (event: Event) => void) =>
        listeners.push(listener),
      hidden: false,
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('document', fakeDocument)
    const store = new ToastStore<string>()
    store.create('read me', { duration: 1000 })
    store.pause(undefined, 'manual')

    fakeDocument.hidden = true
    for (const listener of listeners) listener(new Event('visibilitychange'))
    fakeDocument.hidden = false
    for (const listener of listeners) listener(new Event('visibilitychange'))
    vi.advanceTimersByTime(5000)

    expect(store.getState().toasts[0]).toMatchObject({ paused: true, status: 'visible' })
    store.resume(undefined, 'manual')
    vi.advanceTimersByTime(1000)
    expect(store.getState().toasts[0]?.status).toBe('dismissed')
    store.destroy()
    vi.unstubAllGlobals()
  })

  it('keeps a toast paused when it is reshown while the page is hidden', () => {
    const fakeDocument = {
      addEventListener: vi.fn(),
      hidden: true,
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('document', fakeDocument)
    const store = new ToastStore<string>({ removeDelay: 500 })
    const id = store.create('first', { duration: 1000 })
    store.dismiss(id)
    store.update(id, { message: 'reshown' })
    vi.advanceTimersByTime(5000)

    expect(store.getState().toasts[0]).toMatchObject({ paused: true, status: 'visible' })
    store.destroy()
    vi.unstubAllGlobals()
  })

  it('reports remaining time, frozen while paused, undefined once removed', () => {
    const store = new ToastStore<string>()
    const id = store.create('x', { duration: 1000 })

    expect(store.getRemaining(id)).toBe(1000)
    vi.advanceTimersByTime(400)
    expect(store.getRemaining(id)).toBe(600)

    store.pause(id)
    expect(store.getRemaining(id)).toBe(600)
    vi.advanceTimersByTime(2000)
    expect(store.getRemaining(id)).toBe(600)

    store.resume(id)
    vi.advanceTimersByTime(600)
    expect(store.getState().toasts[0]?.status).toBe('dismissed')
    expect(store.getRemaining(id)).toBeUndefined()
  })

  it('has no remaining time for toasts without a finite duration', () => {
    const store = new ToastStore<string>()
    const id = store.create('sticky', { duration: Number.POSITIVE_INFINITY })
    expect(store.getRemaining(id)).toBeUndefined()
  })

  it('reports progress as a 1→0 fraction of the duration remaining', () => {
    const store = new ToastStore<string>()
    const id = store.create('x', { duration: 1000 })

    expect(store.getProgress(id)).toBe(1)
    vi.advanceTimersByTime(250)
    expect(store.getProgress(id)).toBe(0.75)
    vi.advanceTimersByTime(750)
    expect(store.getProgress(id)).toBeUndefined()
  })

  it('has no progress for toasts without a finite duration', () => {
    const store = new ToastStore<string>()
    const id = store.create('sticky', { duration: Number.POSITIVE_INFINITY })
    expect(store.getProgress(id)).toBeUndefined()
  })

  it('limits `max` per position, not across the whole app', () => {
    const store = new ToastStore<string>({ max: 1 })
    store.create('top a', { position: 'top-left' })
    store.create('top b', { position: 'top-left' })
    store.create('bottom a', { position: 'bottom-right' })

    const byMessage = new Map(store.getState().toasts.map((t) => [t.message, t.stacked]))
    expect(byMessage.get('top a')).toBe(true)
    expect(byMessage.get('top b')).toBe(false)
    expect(byMessage.get('bottom a')).toBe(false)
  })

  it('groups toasts with no explicit position into one shared default bucket', () => {
    const store = new ToastStore<string>({ max: 1 })
    store.create('a')
    store.create('b')

    const byMessage = new Map(store.getState().toasts.map((t) => [t.message, t.stacked]))
    expect(byMessage.get('a')).toBe(true)
    expect(byMessage.get('b')).toBe(false)
  })

  it('auto-pauses all toasts when the tab is hidden, resumes when visible again', () => {
    // Node test env (no DOM) — a minimal document fake stands in for jsdom.
    const listeners: ((event: Event) => void)[] = []
    const fakeDocument = {
      addEventListener: (_type: string, listener: (event: Event) => void) => {
        listeners.push(listener)
      },
      hidden: false,
      removeEventListener: (_type: string, listener: (event: Event) => void) => {
        const index = listeners.indexOf(listener)
        if (index !== -1) listeners.splice(index, 1)
      },
    }
    vi.stubGlobal('document', fakeDocument)

    const store = new ToastStore<string>()
    store.create('hi', { duration: 1000 })
    expect(store.getState().toasts[0]?.paused).toBe(false)

    fakeDocument.hidden = true
    for (const listener of listeners) listener(new Event('visibilitychange'))
    expect(store.getState().toasts[0]?.paused).toBe(true)
    vi.advanceTimersByTime(5000)
    expect(store.getState().toasts[0]?.status).toBe('visible')

    fakeDocument.hidden = false
    for (const listener of listeners) listener(new Event('visibilitychange'))
    expect(store.getState().toasts[0]?.paused).toBe(false)

    store.destroy()
    vi.unstubAllGlobals()
  })

  it('stops reacting to visibilitychange after destroy', () => {
    const listeners: ((event: Event) => void)[] = []
    const fakeDocument = {
      addEventListener: (_type: string, listener: (event: Event) => void) => {
        listeners.push(listener)
      },
      hidden: false,
      removeEventListener: (_type: string, listener: (event: Event) => void) => {
        const index = listeners.indexOf(listener)
        if (index !== -1) listeners.splice(index, 1)
      },
    }
    vi.stubGlobal('document', fakeDocument)

    const store = new ToastStore<string>()
    store.destroy()
    expect(listeners).toHaveLength(0)

    vi.unstubAllGlobals()
  })

  it('stacks (does not dismiss) toasts beyond max, newest active', () => {
    const store = new ToastStore<string>({ max: 2 })
    store.create('a')
    store.create('b')
    store.create('c') // newest

    const { toasts } = store.getState()
    expect(toasts).toHaveLength(3)
    expect(toasts.every((t) => t.status === 'visible')).toBe(true)
    expect(toasts.map((t) => `${t.message}:${t.stacked ? 'stacked' : 'active'}`)).toStrictEqual([
      'c:active',
      'b:active',
      'a:stacked',
    ])
  })

  it('suspends a stacked toast’s timer until it is promoted', () => {
    const store = new ToastStore<string>({ max: 1 })
    store.create('first', { duration: 1000 })
    // Keep the active toast alive so 'first' stays stacked during the window.
    store.create('second', { duration: Number.POSITIVE_INFINITY })

    vi.advanceTimersByTime(5000)
    let first = store.getState().toasts.find((t) => t.message === 'first')
    expect(first?.status).toBe('visible')
    expect(first?.stacked).toBe(true)

    const second = store.getState().toasts.find((t) => t.message === 'second')
    store.dismiss(second?.id)
    first = store.getState().toasts.find((t) => t.message === 'first')
    expect(first?.stacked).toBe(false)

    vi.advanceTimersByTime(1000)
    expect(store.getState().toasts.find((t) => t.message === 'first')?.status).toBe('dismissed')
  })

  it('restacks when max changes at runtime', () => {
    const store = new ToastStore<string>({ max: 0 })
    store.create('a', { duration: Number.POSITIVE_INFINITY })
    store.create('b', { duration: Number.POSITIVE_INFINITY })
    store.create('c', { duration: Number.POSITIVE_INFINITY })
    expect(store.getState().toasts.every((t) => !t.stacked)).toBe(true)

    store.setMax(1)
    expect(store.getState().toasts.filter((t) => t.stacked)).toHaveLength(2)

    store.setMax(0)
    expect(store.getState().toasts.every((t) => !t.stacked)).toBe(true)
  })

  it('deduplicates error toasts with the same message', () => {
    const store = new ToastStore<string>()
    const first = store.create('fail', { type: 'error' })
    const second = store.create('fail', { type: 'error' })

    expect(second).toBe(first)
    expect(store.getState().toasts).toHaveLength(1)
  })

  it('replaces message when a different error supersedes an existing one', () => {
    const store = new ToastStore<string>()
    const first = store.create('fail A', { type: 'error', duration: Number.POSITIVE_INFINITY })
    const second = store.create('fail B', { type: 'error', duration: Number.POSITIVE_INFINITY })

    expect(second).toBe(first)
    expect(store.getState().toasts).toHaveLength(1)
    expect(store.getState().toasts[0]?.message).toBe('fail B')
  })

  it('resets the timer on duplicate error', () => {
    const store = new ToastStore<string>()
    store.create('fail', { type: 'error', duration: 5000 })

    vi.advanceTimersByTime(4000)
    store.create('fail', { type: 'error', duration: 5000 })

    vi.advanceTimersByTime(1500)
    expect(store.getState().toasts[0]?.status).toBe('visible')

    vi.advanceTimersByTime(3500)
    expect(store.getState().toasts[0]?.status).toBe('dismissed')
  })

  it('emits a shake effect on each duplicate error, without touching the toast record', () => {
    const store = new ToastStore<string>()
    const effects: Array<{ type: string; id: string }> = []
    store.onEffect((effect) => effects.push(effect))

    store.create('fail', { type: 'error' })
    expect(effects).toHaveLength(0)

    store.create('fail', { type: 'error' })
    store.create('fail', { type: 'error' })
    const id = store.getState().toasts[0]?.id
    expect(effects).toEqual([
      { id, type: 'shake' },
      { id, type: 'shake' },
    ])

    expect(store.getState().toasts).toHaveLength(1)
    expect(store.getState().toasts[0]).not.toHaveProperty('shakeVersion')
  })

  it('unsubscribes onEffect listeners', () => {
    const store = new ToastStore<string>()
    const effects: Array<{ type: string; id: string }> = []
    const unsubscribe = store.onEffect((effect) => effects.push(effect))

    store.create('fail', { type: 'error' })
    store.create('fail', { type: 'error' })
    expect(effects).toHaveLength(1)

    unsubscribe()
    store.create('fail', { type: 'error' })
    expect(effects).toHaveLength(1)
  })

  it('can subscribe to effects for only one toast id', () => {
    const store = new ToastStore<string>()
    const effects: Array<{ type: string; id: string }> = []
    store.onEffect((effect) => effects.push(effect), 'target')
    store.create('first', { duration: Infinity, id: 'target', type: 'error' })
    store.create('first again', { duration: Infinity, type: 'error' })
    store.create('other', {
      duration: Infinity,
      position: 'bottom-right',
      type: 'error',
    })
    store.create('other again', {
      duration: Infinity,
      id: 'other',
      position: 'bottom-right',
      type: 'error',
    })

    expect(effects).toEqual([{ id: 'target', type: 'shake' }])
  })

  it('does not deduplicate non-error toasts', () => {
    const store = new ToastStore<string>()
    store.create('msg', { type: 'success' })
    store.create('msg', { type: 'success' })
    store.create('msg', { type: 'info' })

    expect(store.getState().toasts).toHaveLength(3)
  })

  it('deduplicates errors per position and applies the latest options', () => {
    const store = new ToastStore<string>()
    const first = store.create('first', {
      duration: 1000,
      position: 'top-left',
      type: 'error',
    })
    const second = store.create('second', {
      action: { label: 'Retry' },
      duration: 9000,
      meta: { source: 'network' },
      position: 'top-left',
      type: 'error',
    })
    const otherPosition = store.create('third', {
      duration: Infinity,
      position: 'bottom-right',
      type: 'error',
    })

    expect(second).toBe(first)
    expect(otherPosition).not.toBe(first)
    expect(store.getState().toasts).toHaveLength(2)
    expect(store.getState().toasts.find((toast) => toast.id === first)).toMatchObject({
      action: { label: 'Retry' },
      duration: 9000,
      message: 'second',
      meta: { source: 'network' },
    })
  })

  it('supports a custom error dedupe key', () => {
    const store = new ToastStore<string>({
      errorDedupeKey: (toast) => String(toast.meta?.requestId),
    })
    const first = store.create('first failure', {
      duration: Infinity,
      meta: { requestId: 'request-a' },
      position: 'top-left',
      type: 'error',
    })
    const distinct = store.create('second failure', {
      duration: Infinity,
      meta: { requestId: 'request-b' },
      position: 'top-left',
      type: 'error',
    })
    const duplicateAcrossPosition = store.create('latest first failure', {
      duration: Infinity,
      meta: { requestId: 'request-a' },
      position: 'bottom-right',
      type: 'error',
    })

    expect(distinct).not.toBe(first)
    expect(duplicateAcrossPosition).toBe(first)
    expect(store.getState().toasts).toHaveLength(2)
    expect(store.getState().toasts.find((toast) => toast.id === first)).toMatchObject({
      message: 'latest first failure',
      position: 'bottom-right',
    })
  })

  it('resets a duplicate error timer even when its visible fields are unchanged', () => {
    const store = new ToastStore<string>()
    store.create('fail', { duration: 1000, type: 'error' })
    vi.advanceTimersByTime(750)

    store.create('fail', { duration: 1000, type: 'error' })
    vi.advanceTimersByTime(750)

    expect(store.getState().toasts[0]?.status).toBe('visible')
    vi.advanceTimersByTime(250)
    expect(store.getState().toasts[0]?.status).toBe('dismissed')
  })

  it('returns snapshots that cannot mutate current or historical state', () => {
    const store = new ToastStore<string>()
    const id = store.create('original', {
      duration: Infinity,
      meta: { count: 1, nested: { safe: true } },
    })
    const before = store.getState()
    const exposed = before.toasts[0] as {
      message: string
      meta?: { count?: number; nested?: { safe?: boolean } }
    }
    exposed.message = 'external mutation'
    if (exposed.meta) exposed.meta.count = 99
    if (exposed.meta?.nested) exposed.meta.nested.safe = false

    expect(store.getState().toasts[0]).toMatchObject({
      message: 'original',
      meta: { count: 1, nested: { safe: true } },
    })
    const historical = store.getState()
    store.update(id, { message: 'updated' })
    expect(before.toasts[0]?.message).toBe('external mutation')
    expect(historical.toasts[0]?.message).toBe('original')
    expect(store.getState().toasts[0]?.message).toBe('updated')
  })

  it('clears optional fields with null updates', () => {
    const store = new ToastStore<string>()
    const id = store.create('with fields', {
      action: { label: 'Act' },
      cancel: { label: 'Cancel' },
      duration: Infinity,
      meta: { source: 'test' },
      position: 'top-left',
    })

    store.update(id, { action: null, cancel: null, meta: null, position: null })
    const toast = store.getState().toasts[0]
    expect(toast?.action).toBeUndefined()
    expect(toast?.cancel).toBeUndefined()
    expect(toast?.meta).toBeUndefined()
    expect(toast?.position).toBeUndefined()
  })

  it('validates configuration and durations', () => {
    expect(() => new ToastStore({ max: -1 })).toThrow(RangeError)
    expect(() => new ToastStore({ removeDelay: Number.NaN })).toThrow(RangeError)
    expect(() => new ToastStore({ removeDelay: Infinity })).toThrow(RangeError)
    expect(() => new ToastStore({ viewportOffset: -1 })).toThrow(RangeError)
    const store = new ToastStore<string>()
    expect(() => store.create('bad', { duration: -1 })).toThrow(RangeError)
    expect(() => store.setMax(1.5)).toThrow(RangeError)
    expect(() => store.setViewportOffset('')).toThrow(RangeError)
  })

  it('returns changed flags and does not emit for semantic no-ops', () => {
    const store = new ToastStore<string>()
    const listener = vi.fn()
    store.subscribe(listener)
    expect(store.update('missing', { message: 'no-op' })).toBe(false)
    expect(store.remove('missing')).toBe(false)
    expect(store.dismiss('missing')).toBe(false)
    const action = { label: 'Retry' }
    const id = store.create('one', {
      action,
      duration: Infinity,
      meta: { nested: { count: 1 } },
    })
    expect(store.update(id, {})).toBe(false)
    expect(
      store.update(id, {
        action,
        duration: Infinity,
        message: 'one',
        meta: { nested: { count: 1 } },
      }),
    ).toBe(false)
    expect(store.setHeight(id, 20)).toBe(true)
    expect(store.setHeight(id, 20)).toBe(false)
    expect(store.pause(id)).toBe(true)
    expect(store.pause(id)).toBe(false)
    expect(store.resume(id)).toBe(true)
    expect(store.resume(id)).toBe(false)
    expect(store.setMax(1)).toBe(true)
    expect(store.setMax(1)).toBe(false)
    expect(store.setViewportOffset(24)).toBe(true)
    expect(store.setViewportOffset(24)).toBe(false)
    expect(store.dismiss(id)).toBe(true)
    expect(store.dismiss(id)).toBe(false)
    expect(store.remove(id)).toBe(true)
    expect(store.remove(id)).toBe(false)

    expect(listener).toHaveBeenCalledTimes(8)
  })

  it('reports a subscriber error without skipping later subscribers', () => {
    const reportError = vi.fn()
    vi.stubGlobal('reportError', reportError)
    const store = new ToastStore<string>()
    const later = vi.fn()
    const error = new Error('listener failed')
    store.subscribe(() => {
      throw error
    })
    store.subscribe(later)

    store.create('still delivered', { duration: Infinity })
    expect(reportError).toHaveBeenCalledWith(error)
    expect(later).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
  })

  it('only sends periodic timer snapshots to progress subscribers', () => {
    const store = new ToastStore<string>()
    const ordinary = vi.fn()
    const progress = vi.fn()
    store.subscribe(ordinary)
    store.subscribe(progress, { progress: true })
    store.create('counting', { duration: 1000 })
    vi.advanceTimersByTime(500)

    expect(ordinary).toHaveBeenCalledTimes(1)
    expect(progress.mock.calls.length).toBeGreaterThan(1)
    expect(progress.mock.calls.at(-1)?.[0].toasts[0].remaining).toBe(500)
  })

  it('removes all toasts when called with no id', () => {
    const store = new ToastStore<string>()
    store.create('one')
    store.create('two')
    expect(store.remove()).toBe(true)
    expect(store.getState().toasts).toHaveLength(0)
    expect(store.remove()).toBe(false)
  })

  it('stops the progress ticker once no timed toast remains', () => {
    const store = new ToastStore<string>()
    const progress = vi.fn()
    store.subscribe(progress, { progress: true })
    store.create('counting', { duration: 1000 })
    vi.advanceTimersByTime(500)
    const callsWhileRunning = progress.mock.calls.length

    // Past duration (auto-dismiss) and past the default removeDelay (auto-remove).
    vi.advanceTimersByTime(1600)
    progress.mockClear()
    vi.advanceTimersByTime(1000)

    expect(callsWhileRunning).toBeGreaterThan(1)
    expect(store.getState().toasts).toHaveLength(0)
    expect(progress).not.toHaveBeenCalled()
  })

  it('falls back to queueMicrotask when reportError is unavailable', () => {
    vi.stubGlobal('reportError', undefined)
    const queueMicrotaskSpy = vi.spyOn(globalThis, 'queueMicrotask').mockImplementation(() => {})
    const store = new ToastStore<string>()
    const error = new Error('listener failed')
    store.subscribe(() => {
      throw error
    })

    store.create('boom')

    expect(queueMicrotaskSpy).toHaveBeenCalledTimes(1)
    const rethrow = queueMicrotaskSpy.mock.calls[0][0]
    expect(rethrow).toThrow(error)
  })

  it('clears all timers and rejects reuse after destroy', () => {
    const store = new ToastStore<string>({ removeDelay: 500 })
    store.create('one', { duration: 1000 })
    store.dismiss()
    expect(store.destroy()).toBe(true)

    expect(vi.getTimerCount()).toBe(0)
    expect(store.destroy()).toBe(false)
    expect(() => store.create('after destroy')).toThrow('ToastStore has been destroyed')
  })
})

describe(createToastApi, () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('exposes typed convenience methods', () => {
    const store = new ToastStore<string>()
    const toast = createToastApi(store)

    toast.error('nope')
    expect(store.getState().toasts[0]?.type).toBe('error')
  })

  it('exposes info, warning, loading, and custom convenience methods', () => {
    const store = new ToastStore<string>()
    const toast = createToastApi(store)

    toast.info('fyi')
    toast.warning('careful')
    toast.loading('working…')
    toast.custom('anything')

    expect(store.getState().toasts.map((t) => t.type)).toEqual([
      'custom',
      'loading',
      'warning',
      'info',
    ])
  })

  it('returns changed flags from update, dismiss, and remove', () => {
    const store = new ToastStore<string>()
    const toast = createToastApi(store)
    const id = toast('one', { duration: Infinity })

    expect(toast.update(id, {})).toBe(false)
    expect(toast.update(id, { message: 'two' })).toBe(true)
    expect(toast.dismiss(id)).toBe(true)
    expect(toast.dismiss(id)).toBe(false)
    expect(toast.remove(id)).toBe(true)
    expect(toast.remove(id)).toBe(false)
  })

  it('drives a toast through promise resolution', async () => {
    const store = new ToastStore<string>()
    const toast = createToastApi(store)

    const promise = Promise.resolve(42)
    void toast.promise(promise, {
      error: 'failed',
      loading: 'saving…',
      success: (v) => `saved ${v}`,
    })

    expect(store.getState().toasts[0]).toMatchObject({
      message: 'saving…',
      type: 'loading',
    })

    await promise
    expect(store.getState().toasts[0]).toMatchObject({
      message: 'saved 42',
      type: 'success',
    })
  })

  it('uses a static success message when resolved', async () => {
    const store = new ToastStore<string>()
    const toast = createToastApi(store)

    await toast.promise(Promise.resolve('ok'), {
      error: 'failed',
      loading: 'saving…',
      success: 'done',
    })

    expect(store.getState().toasts[0]).toMatchObject({
      message: 'done',
      type: 'success',
    })
  })

  it('settles the loading toast when a promise factory throws synchronously', async () => {
    const store = new ToastStore<string>()
    const toast = createToastApi(store)
    const error = new Error('factory failed')

    await expect(
      toast.promise(
        () => {
          throw error
        },
        { error: 'failed', loading: 'loading', success: 'done' },
      ),
    ).rejects.toBe(error)
    expect(store.getState().toasts[0]).toMatchObject({ message: 'failed', type: 'error' })
  })

  it('settles the toast even when the error message resolver throws', async () => {
    const store = new ToastStore<string>()
    const toast = createToastApi(store)
    const resolverError = new Error('resolver failed')

    await expect(
      toast.promise(Promise.reject(new Error('request failed')), {
        error: () => {
          throw resolverError
        },
        loading: 'loading',
        success: 'done',
      }),
    ).rejects.toBe(resolverError)
    expect(store.getState().toasts[0]).toMatchObject({ status: 'visible', type: 'error' })
  })
})
