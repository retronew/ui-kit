import { describe, expect, it, vi } from 'vite-plus/test'
import { ref } from 'vue'
import { useMutationFlow } from '../src/mutation-flow/index.ts'
import type { MutationFn } from '../src/mutation-flow/index.ts'

const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve))

describe('useMutationFlow', () => {
  it('tracks pending and ignores synchronous re-entry', async () => {
    let settle!: () => void
    const end = vi.fn()
    const mutationFn = vi.fn<MutationFn<boolean>>(
      () =>
        new Promise<void>((resolve) => {
          settle = resolve
        }),
    )
    const submit = useMutationFlow({ end }, mutationFn)

    submit()
    submit()

    expect(submit.pending).toBe(true)
    expect(mutationFn).toHaveBeenCalledTimes(1)

    settle()
    await flushMicrotasks()

    expect(submit.pending).toBe(false)
  })

  it('closes with an optional mutation fallback', () => {
    const end = vi.fn()
    const submit = useMutationFlow<boolean>({ end }, undefined)

    submit().orEnd(true)

    expect(end).toHaveBeenCalledWith(true)
    expect(submit.pending).toBe(false)
  })

  it('ignores the fallback while an optional mutation is present', async () => {
    const end = vi.fn()
    const mutationFn = vi.fn<MutationFn<boolean>>(async (call) => {
      call.end(false)
    })
    const source = ref<MutationFn<boolean> | undefined>(mutationFn)
    const submit = useMutationFlow({ end }, source)

    submit().orEnd(true)
    await flushMicrotasks()

    expect(mutationFn).toHaveBeenCalledTimes(1)
    expect(end).toHaveBeenCalledWith(false)
    expect(end).not.toHaveBeenCalledWith(true)
  })

  it('uses a replacement mutation from a reactive source on the next submit', async () => {
    const end = vi.fn()
    const first = vi.fn<MutationFn<boolean>>(async () => {})
    const second = vi.fn<MutationFn<boolean>>(async (call) => {
      call.end(true)
    })
    const source = ref<MutationFn<boolean> | undefined>(first)
    const submit = useMutationFlow({ end }, source)

    submit().orEnd(false)
    await flushMicrotasks()
    source.value = second
    submit().orEnd(false)
    await flushMicrotasks()

    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
    expect(end).toHaveBeenCalledWith(true)
  })

  it('forwards a payload to the mutation handler', async () => {
    const end = vi.fn()
    const mutationFn = vi.fn<MutationFn<string, { choice: 'A' | 'B' }>>(async (call, payload) => {
      call.end(payload.choice)
    })
    const submit = useMutationFlow({ end }, mutationFn)

    submit({ choice: 'B' })
    await flushMicrotasks()

    expect(mutationFn).toHaveBeenCalledWith({ end }, { choice: 'B' })
    expect(end).toHaveBeenCalledWith('B')
  })
})
