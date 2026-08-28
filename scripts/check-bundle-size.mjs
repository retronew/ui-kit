import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

const budgets = [
  // Headroom accounts for the `defaultPosition` config + `setDefaultPosition`/`getDefaultPosition`
  // on `ToastStore`, which added position-resolution logic to `create`/`update`/`recomputeStacking`.
  { label: 'toast-core JavaScript', path: 'packages/toast-core/dist/index.mjs', bytes: 23 * 1024 },
  // Headroom accounts for the `swipeDismiss`/`escapeDismiss` props on <ToastWrapper>
  // (drag-cancel handling + prop-toggle watcher).
  { label: 'toast-vue JavaScript', path: 'packages/toast-vue/dist/index.mjs', bytes: 24 * 1024 },
]

async function findAsset(directory, extension) {
  const files = await readdir(directory)
  const file = files.find((candidate) => candidate.endsWith(extension))
  if (!file) throw new Error(`No ${extension} asset found in ${directory}`)
  return join(directory, file)
}

budgets.push(
  {
    label: 'toast-vue-demo JavaScript',
    path: await findAsset('apps/toast-vue-demo/dist/assets', '.js'),
    bytes: 280 * 1024,
  },
  {
    label: 'toast-vue-demo CSS',
    path: await findAsset('apps/toast-vue-demo/dist/assets', '.css'),
    bytes: 45 * 1024,
  },
)

let failed = false
for (const budget of budgets) {
  const size = (await stat(budget.path)).size
  const limit = budget.bytes
  const status = size <= limit ? 'pass' : 'fail'
  console.log(
    `${status}: ${budget.label} ${(size / 1024).toFixed(2)} KiB / ${(limit / 1024).toFixed(0)} KiB`,
  )
  failed ||= size > limit
}

if (failed) process.exitCode = 1
