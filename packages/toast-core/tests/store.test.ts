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

  it('does not deduplicate non-error toasts', () => {
    const store = new ToastStore<string>()
    store.create('msg', { type: 'success' })
    store.create('msg', { type: 'success' })
    store.create('msg', { type: 'info' })

    expect(store.getState().toasts).toHaveLength(3)
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
})
