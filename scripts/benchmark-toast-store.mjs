import { performance } from 'node:perf_hooks'
import { ToastStore } from '../packages/toast-core/dist/index.mjs'

const SIZES = [1, 10, 100, 1000]
const SNAPSHOT_ITEMS = 20_000
const MAX_CREATE_MS = 2_000
const MAX_SNAPSHOT_MS_PER_TOAST = 0.05
const MAX_TRANSIENT_HEAP_BYTES = 64 * 1024 * 1024

function collectGarbage() {
  if (typeof globalThis.gc !== 'function') {
    throw new Error('Run this benchmark with node --expose-gc')
  }
  globalThis.gc()
}

function measure(size) {
  collectGarbage()
  const store = new ToastStore()
  const createStart = performance.now()
  for (let index = 0; index < size; index += 1) {
    store.create(`toast-${index}`, { duration: Infinity })
  }
  const createMs = performance.now() - createStart

  for (let index = 0; index < 5; index += 1) store.getState()
  collectGarbage()
  const heapBefore = process.memoryUsage().heapUsed
  const iterations = Math.max(10, Math.ceil(SNAPSHOT_ITEMS / size))
  let checksum = 0
  const snapshotStart = performance.now()
  for (let index = 0; index < iterations; index += 1) {
    checksum += store.getState().toasts.length
  }
  const snapshotMs = performance.now() - snapshotStart
  const transientHeapBytes = Math.max(process.memoryUsage().heapUsed - heapBefore, 0)
  const snapshotMsPerToast = snapshotMs / checksum
  store.destroy()

  return {
    createMs: Number(createMs.toFixed(3)),
    size,
    snapshotIterations: iterations,
    snapshotMs: Number(snapshotMs.toFixed(3)),
    snapshotMsPerToast: Number(snapshotMsPerToast.toFixed(6)),
    transientHeapKiB: Math.round(transientHeapBytes / 1024),
  }
}

async function verifyRefreshFrequency() {
  const ordinaryStore = new ToastStore()
  let ordinaryNotifications = 0
  ordinaryStore.subscribe(() => {
    ordinaryNotifications += 1
  })
  ordinaryStore.create('ordinary', { duration: 1000 })
  await new Promise((resolve) => setTimeout(resolve, 550))
  ordinaryStore.destroy()

  const progressStore = new ToastStore()
  let progressNotifications = 0
  progressStore.subscribe(
    () => {
      progressNotifications += 1
    },
    { progress: true },
  )
  progressStore.create('progress', { duration: 1000 })
  await new Promise((resolve) => setTimeout(resolve, 550))
  progressStore.destroy()

  if (ordinaryNotifications !== 1) {
    throw new Error(
      `Ordinary subscribers received ${ordinaryNotifications} notifications; expected exactly 1`,
    )
  }
  if (progressNotifications < 3 || progressNotifications > 4) {
    throw new Error(
      `Progress subscribers received ${progressNotifications} notifications; expected 3-4`,
    )
  }
  return { ordinaryNotifications, progressNotifications }
}

const results = SIZES.map(measure)
for (const result of results) {
  if (result.createMs > MAX_CREATE_MS) {
    throw new Error(`Creating ${result.size} toasts exceeded ${MAX_CREATE_MS}ms`)
  }
  if (result.snapshotMsPerToast > MAX_SNAPSHOT_MS_PER_TOAST) {
    throw new Error(
      `${result.size}-toast snapshots exceeded ${MAX_SNAPSHOT_MS_PER_TOAST}ms per toast`,
    )
  }
  if (result.transientHeapKiB * 1024 > MAX_TRANSIENT_HEAP_BYTES) {
    throw new Error(`${result.size}-toast snapshots allocated more than 64 MiB transient heap`)
  }
}

const refresh = await verifyRefreshFrequency()
console.table(results)
console.log('Refresh notifications:', refresh)
console.log('Toast store performance budgets passed.')
