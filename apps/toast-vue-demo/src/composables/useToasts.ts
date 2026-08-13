import { resolveValue, toast, toastStore } from '@retronew/toast-vue'
import type {
  CalculateOffsetOptions,
  StackMetrics,
  Toast,
  ToastPauseReason,
  ToastPosition,
  ValueOrFunction,
} from '@retronew/toast-vue'
import { h, reactive, ref, watch } from 'vue'
import type { Component } from 'vue'
import { i18n } from '../i18n'

/**
 * Singleton state + handlers for the toast playground. Module-scoped, so every
 * `useToasts()` call shares one instance.
 */

export type StackMode = 'queue' | 'stack'

const activeType = ref('success')
const dedupActive = ref<'same' | 'different' | 'single'>('same')
const scheduledTimers = new Set<ReturnType<typeof setTimeout>>()

function schedule(callback: () => void, delay: number): void {
  const handle = setTimeout(() => {
    scheduledTimers.delete(handle)
    callback()
  }, delay)
  scheduledTimers.add(handle)
}

function clearScheduledTimers(): void {
  for (const handle of scheduledTimers) clearTimeout(handle)
  scheduledTimers.clear()
}

const sectionCodes = reactive({
  types: `toast.success('Operation completed successfully!')`,
  position: `toast('Hello', { position: 'top-center' })`,
  stacking: `toastStore.setMax(3)`,
  duration: `toast('Hello', { duration: 3000 })`,
  animation: `:root {\n  --toast-motion-duration: 300ms;\n}`,
  pop: `<ToastWrapper :pop="false" ... />`,
  offset: `toastStore.setViewportOffset(16)`,
  dedup: `toast.error('Network request failed')\n// identical errors shake & reset, never stack`,
})

const positions: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]
const position = ref<ToastPosition>('top-center')
const perToastPosition = ref<ToastPosition | null>(null)
const direction = ref(true)

function formatPositionName(pos: string) {
  return i18n.global.t(`positions.${pos}`)
}

const durationPresets = [1000, 2000, 3000, 5000, Infinity]
const duration = ref(3000)

function formatDuration(d: number) {
  return d === Infinity ? '∞' : `${d / 1000}s`
}

// Controls the `--toast-motion-duration` CSS variable that `ToastWrapper` reads.

const motionDurationPresets = [150, 300, 500, 800]
const motionDuration = ref(300)

function formatMotionDuration(d: number) {
  return `${d}ms`
}

function handleMotionDurationChange(d: number) {
  motionDuration.value = d
  sectionCodes.animation = `:root {\n  --toast-motion-duration: ${d}ms;\n}`
  toast(`Animation speed → ${d}ms`, { position: resolvedPosition() })
}

// `pop` opts a toast into the react-hot-toast-style scale pop instead of the default subtle slide + fade.
// Shares `--toast-motion-duration`/`motionDuration` with the default motion — only the distance/opacity/easing differ.
const popMotion = ref(false)

function handlePopMotionChange(enabled: boolean) {
  popMotion.value = enabled
  sectionCodes.pop = `<ToastWrapper :pop="${enabled}" ... />`
  toast(`Pop motion → ${enabled ? 'on' : 'off'}`, { position: resolvedPosition() })
}

// The gap between the toast stack and the screen edge is owned by toast-core; exposed here as `inset`.

const offsetPresets = [8, 16, 24, 40]

function formatOffset(px: number) {
  return `${px}px`
}

function handleOffsetChange(px: number) {
  toastStore.setViewportOffset(px)
  sectionCodes.offset = `toastStore.setViewportOffset(${px})`
}

// Both modes stack overflow toasts (timer paused); mode only controls display: queue hides extras until room frees up, stack piles them into one that fans out on hover.

const stackModes: { value: StackMode }[] = [{ value: 'queue' }, { value: 'stack' }]
const stackMode = ref<StackMode>('queue')
const maxPresets = [3, 5, Infinity]
const maxToasts = ref(3)
// Position group currently hovered/expanded; each corner/edge stack expands independently.
const hoveredPosition = ref<ToastPosition | null>(null)
// Off by default; enabling it also forces `needsFixedWidth` so every piled toast shares one width.
const centerAlignStack = ref(false)

/** Code snippet for the active stacking configuration. */
function stackingCode(mode: StackMode, max: number, centerAlign: boolean): string {
  if (mode === 'stack') {
    const align = centerAlign
      ? `<ToastWrapper center-align />\n// requires a fixed toast width to look right`
      : `<ToastWrapper />`
    return `toastStore.setMax(1) // stack: only the front toast counts down\n${align}`
  }
  const m = max === Infinity ? 0 : max
  return `toastStore.setMax(${m})${m === 0 ? ' // unlimited' : ''}`
}

// Push the effective core `max` on mode/limit change (stack mode = 1).
watch(
  [stackMode, maxToasts],
  ([mode, max]) => {
    toastStore.setMax(mode === 'stack' ? 1 : max === Infinity ? 0 : max)
  },
  { immediate: true },
)

const STACK_GUTTER = 8
/** How many cards peek out of the pile before the rest hide behind it. */
const STACKED_VISIBLE = 3

/** Toasts sharing `t`'s position, newest first, still on screen. */
/**
 * Whether the toast renders at a fixed width (Stack mode + `centerAlignStack`), so all cards
 * share one width for center-anchored scaling and don't jump width when fanning out on hover.
 */
function needsFixedWidth(): boolean {
  return stackMode.value === 'stack' && centerAlignStack.value
}

/** Stacking motion props for `<ToastWrapper>`: offset/scale/opacity/z-index. */
export interface ToastMotion {
  offset: number
  scale: number
  stackOpacity: number
  zIndex: number
}

/** Extra push (px) an overflow-evicted toast gets on top of its last stacking offset, so it keeps receding instead of springing back toward the edge. */
const DROP_DISTANCE = 40
/** Same idea for stack mode's overflow cards — smaller since it's added to the pile's fixed edge offset, not a growing `depth`-based one. */
const STACK_DROP_DISTANCE = 20

// Offset each queue-evicted toast is frozen at when bumped, keyed by id. `calculateOffset` depends
// on other toasts' async-measured height, so recalculating on every render would split the
// recede-and-fade into two motions; freezing keeps it a single transition.
const stackedOffsets = new Map<string, number>()
let stackedOffsetsSource: readonly Toast[] | undefined

function toastMotion(
  t: Toast,
  all: readonly Toast[],
  calculateOffset: (toast: Toast, opts?: CalculateOffsetOptions) => number,
  getStackMetrics: (toast: Toast, opts?: { defaultPosition?: ToastPosition }) => StackMetrics,
): ToastMotion {
  const pos = effectivePosition(t)
  if (stackedOffsetsSource !== all) {
    stackedOffsetsSource = all
    const currentIds = new Set(all.map((toast) => toast.id))
    for (const id of stackedOffsets.keys()) {
      if (!currentIds.has(id)) stackedOffsets.delete(id)
    }
  }

  if (stackMode.value === 'queue') {
    if (t.stacked) {
      let offset = stackedOffsets.get(t.id)
      if (offset === undefined) {
        // Reusing the last stacking offset (vs. resetting to a constant) keeps it moving away
        // from the edge as it fades, rather than snapping back toward it.
        offset = calculateOffset(t, getOffsetOptions(t)) + DROP_DISTANCE
        stackedOffsets.set(t.id, offset)
      }
      return { offset, scale: 0.92, stackOpacity: 0, zIndex: 0 }
    }
    stackedOffsets.delete(t.id)
    const offset = calculateOffset(t, getOffsetOptions(t))
    const { zIndex } = getStackMetrics(t, { defaultPosition: pos })
    return { offset, scale: 1, stackOpacity: 1, zIndex }
  }

  // Stack mode.
  const { index: depth } = getStackMetrics(t, { defaultPosition: pos })
  const cap = maxToasts.value

  if (depth < 0) {
    // Mid-exit: let the exit animation play in place.
    return { offset: 0, scale: 1, stackOpacity: 1, zIndex: 0 }
  }
  if (depth >= cap) {
    // Exceeds the cap: recede one step further than the pile's own capped edge
    // offset/scale, not the raw (unbounded) `depth` — keeps the exit distance
    // constant regardless of stack history, and keeps shrinking instead of
    // popping back toward full size on the way out.
    return {
      offset: (STACKED_VISIBLE - 1) * 14 + STACK_DROP_DISTANCE,
      scale: 1 - STACKED_VISIBLE * 0.05,
      stackOpacity: 0,
      zIndex: 100 - depth,
    }
  }
  if (hoveredPosition.value === pos) {
    // Fanned out into a readable list.
    const offset = calculateOffset(t, {
      ...getOffsetOptions(t),
      includeStacked: true,
      reverseOrder: true,
    })
    // Newest on top so lower toasts don't flash in front during expansion.
    return { offset, scale: 1, stackOpacity: 1, zIndex: 100 - depth }
  }
  // Piled up: front card in place; each behind peeks 14px and shrinks 0.05/level; deeper cards hide.
  if (depth >= STACKED_VISIBLE) {
    const edge = STACKED_VISIBLE - 1
    return { offset: edge * 14, scale: 1 - edge * 0.05, stackOpacity: 0, zIndex: 100 - depth }
  }
  return { offset: depth * 14, scale: 1 - depth * 0.05, stackOpacity: 1, zIndex: 100 - depth }
}

// The whole stack is one hover region via ToastWrapper's `::after` bridge, so a relatedTarget check suffices.
function handlePointerEnter(t: Toast, pause: (id?: string, reason?: ToastPauseReason) => void) {
  hoveredPosition.value = effectivePosition(t)
  pause(undefined, 'interaction')
}

function handlePointerLeave(
  event: MouseEvent,
  resume: (id?: string, reason?: ToastPauseReason) => void,
) {
  const target = event.relatedTarget as HTMLElement | null
  if (target?.closest?.('[data-toast-wrapper]')) {
    return
  }
  hoveredPosition.value = null
  resume(undefined, 'interaction')
}

// Always resolve to a concrete position (never `undefined`) — `toast-core` caps `max`
// per distinct `position` value, so leaving it unset here would silently drop the toast
// into its own `'__default__'` bucket, uncoupled from whatever position is actually shown.
function resolvedPosition(): ToastPosition {
  return perToastPosition.value ?? position.value
}

function toastOptions() {
  return {
    position: resolvedPosition(),
    duration: duration.value,
  }
}

function effectivePosition(t: Toast): ToastPosition {
  return t.position ?? position.value
}

/** Resolve a custom toast's render function/value to renderable content. */
function resolveCustomMessage(t: Toast) {
  return resolveValue(t.message as ValueOrFunction<Component | string, Toast>, t)
}

function getOffsetOptions(t: Toast): CalculateOffsetOptions {
  return {
    defaultPosition: effectivePosition(t),
    gutter: 8,
    reverseOrder: direction.value,
  }
}

/** Layout only — position/alignment/hit-area. `ToastWrapper` owns the motion, merged onto the same element. */
function layoutStyle(pos: ToastPosition): Record<string, string> {
  const isTop = pos.includes('top')
  const isCenter = pos.includes('center')
  const isRight = pos.includes('right') && !isCenter

  return {
    position: 'absolute',
    display: 'flex',
    // Full-width row must not intercept clicks — only the toast content re-enables `pointer-events: auto`.
    pointerEvents: 'none',
    ...(isTop ? { top: '0' } : { bottom: '0' }),
    // Center positions span the viewport for flex-centering; corners shrink to the card so
    // `ToastWrapper`'s `'center'` transform-origin refers to the card, not the page.
    ...(isCenter
      ? { left: '0', right: '0', justifyContent: 'center' }
      : isRight
        ? { right: '0' }
        : { left: '0' }),
  }
}

function handleHeroClick() {
  toast('Hello there!', { position: resolvedPosition() })
}

function handleSuccessClick() {
  activeType.value = 'success'
  sectionCodes.types = `toast.success('Operation completed successfully!')`
  toast.success('Operation completed successfully!', toastOptions())
}

function handleErrorClick() {
  activeType.value = 'error'
  sectionCodes.types = `toast.error('Something went wrong. Please try again.')`
  toast.error('Something went wrong. Please try again.', toastOptions())
}

function handleInfoClick() {
  activeType.value = 'info'
  sectionCodes.types = `toast.info('Here is some information for you.')`
  toast.info('Here is some information for you.', toastOptions())
}

function handleWarningClick() {
  activeType.value = 'warning'
  sectionCodes.types = `toast.warning('Storage is almost full!')`
  toast.warning('Storage is almost full!', toastOptions())
}

function handleLoadingClick() {
  activeType.value = 'loading'
  sectionCodes.types = `toast.loading('Processing your request…')`
  const id = toast.loading('Processing your request…', toastOptions())
  schedule(() => {
    toast.update(id, { message: 'Process completed!', type: 'success' })
  }, 2000)
}

function handlePromiseClick() {
  activeType.value = 'promise'
  sectionCodes.types = [
    `toast.promise(factory, {`,
    `  loading: 'Saving data…',`,
    `  success: (data) => \`Saved: \${data.name}\`,`,
    `  error: (err) => \`Error: \${err.message}\`,`,
    `})`,
  ].join('\n')
  const factory = () =>
    new Promise<{ name: string }>((resolve, reject) =>
      setTimeout(() => {
        if (Math.random() > 0.5) resolve({ name: 'Project' })
        else reject(new Error('Save failed'))
      }, 2000),
    )

  void toast
    .promise<{ name: string }>(factory, {
      error: (err: unknown) => `Error: ${(err as Error).message}`,
      loading: 'Saving data…',
      success: (data: { name: string }) => `Saved: ${data.name}`,
    })
    .catch(() => {
      // The toast already communicates the failure; keep the interactive demo console clean.
    })
}

// Infinity has no countdown to show — fall back to a finite default; message reads live `t.remaining`/`t.progress`.
function handleCountdownClick() {
  activeType.value = 'countdown'
  const totalMs = duration.value === Infinity ? 5000 : duration.value
  sectionCodes.types = [
    `toast(`,
    `  (t) =>`,
    `    h('div', { class: 'flex min-w-[160px] flex-col gap-1.5' }, [`,
    `      h('span', \`Closing in \${Math.ceil((t.remaining ?? 0) / 1000)}s…\`),`,
    `      h('div', { class: 'h-1 w-full overflow-hidden rounded-full bg-border' }, [`,
    `        h('div', {`,
    `          class: 'h-full rounded-full bg-fg transition-[width] duration-200 ease-linear',`,
    `          style: { width: \`\${(t.progress ?? 0) * 100}%\` },`,
    `        }),`,
    `      ]),`,
    `    ]),`,
    `  { duration: ${totalMs} },`,
    `)`,
  ].join('\n')

  toast(
    (t: Toast) =>
      h('div', { class: 'flex min-w-[160px] flex-col gap-1.5' }, [
        h('span', `Closing in ${Math.ceil((t.remaining ?? 0) / 1000)}s…`),
        h('div', { class: 'h-1 w-full overflow-hidden rounded-full bg-border' }, [
          h('div', {
            class: 'h-full rounded-full bg-fg transition-[width] duration-200 ease-linear',
            style: { width: `${(t.progress ?? 0) * 100}%` },
          }),
        ]),
      ]),
    { ...toastOptions(), duration: totalMs },
  )
}

function handleCustomClick() {
  activeType.value = 'custom'
  sectionCodes.types = [
    `toast.custom((t) =>`,
    `  h('div', { class: 'group flex max-w-[350px] transform-gpu items-center gap-3 overflow-hidden rounded-3xl border border-white/40 bg-white/95 px-5 py-3.5 text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),var(--toast-shadow)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/10 dark:text-white' }, [`,
    `    h('span', { class: 'grid size-8 shrink-0 place-items-center rounded-full bg-white/50 text-base dark:bg-white/10' }, '🎉'),`,
    `    h('div', { class: 'min-w-0 flex-1' }, [`,
    `      h('p', { class: 'font-semibold leading-tight' }, 'Welcome to Toast Vue!'),`,
    `      h('p', { class: 'text-sm text-black/60 dark:text-white/65' }, 'Notifications that adapt to your theme'),`,
    `    ]),`,
    `    h('button', { class: 'opacity-0 group-hover:opacity-100 ...', onClick: () => toast.dismiss(t.id) }, [`,
    `      h('span', { class: 'i-lucide-x size-3' }),`,
    `    ]),`,
    `  ]),`,
    `)`,
  ].join('\n')
  toast.custom((t: Toast) => {
    return h(
      'div',
      {
        // Liquid glass: translucent, blurred layer with a light-catching top highlight.
        class:
          'group pointer-events-auto flex max-w-[350px] transform-gpu cursor-default items-center gap-3 overflow-hidden rounded-3xl border border-white/40 bg-white/95 px-5 py-3.5 text-[#1d1d1f] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),var(--toast-shadow)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/10 dark:text-white',
      },
      [
        h(
          'span',
          {
            class:
              'grid size-8 shrink-0 place-items-center rounded-full bg-white/50 text-base dark:bg-white/10',
          },
          '🎉',
        ),
        h('div', { class: 'min-w-0 flex-1' }, [
          h('p', { class: 'font-semibold leading-tight' }, 'Welcome to Toast Vue!'),
          h(
            'p',
            { class: 'text-sm text-black/60 dark:text-white/65' },
            'Notifications that adapt to your theme',
          ),
        ]),
        h(
          'button',
          {
            'aria-label': 'Dismiss',
            type: 'button',
            class:
              "relative grid size-[22px] shrink-0 cursor-pointer place-items-center rounded-full text-black/55 opacity-0 transition-[opacity,background-color,color,scale] duration-150 before:absolute before:-inset-[9px] before:content-[''] group-hover:opacity-100 hover:bg-black/10 hover:text-[#1d1d1f] active:scale-[0.96] dark:text-white/65 dark:hover:bg-white/15 dark:hover:text-white",
            onClick: () => toast.dismiss(t.id),
          },
          [h('span', { class: 'i-lucide-x size-3' })],
        ),
      ],
    )
  }, toastOptions())
}

function handlePersistentClick() {
  activeType.value = 'persistent'
  sectionCodes.types = `toast("📌 Won't auto-dismiss", { duration: Infinity })`
  // ToastBar already renders a dismiss button — no need for a second "✕".
  toast("📌 Won't auto-dismiss", { ...toastOptions(), duration: Infinity })
}

// `cancel` has no `onClick` — ToastBar's default dismiss stands in for the close icon hidden via `meta.hideDismiss`.
function handleActionClick() {
  activeType.value = 'action'
  sectionCodes.types = [
    `toast('File deleted', {`,
    `  action: {`,
    `    label: 'Undo',`,
    `    onClick: (t) =>`,
    `      toast.update(t.id, { message: 'Restored', type: 'success', duration: 2000 }),`,
    `  },`,
    `  cancel: { label: 'Dismiss' }, // no onClick needed — cancel just closes it`,
    `  meta: { hideDismiss: true }, // hide ToastBar's own close icon`,
    `})`,
  ].join('\n')

  toast('File deleted', {
    ...toastOptions(),
    action: {
      label: 'Undo',
      onClick: (t: Toast) => {
        toast.update(t.id, {
          duration: 2000,
          message: 'Restored',
          type: 'success',
        })
      },
    },
    cancel: { label: 'Dismiss' },
    meta: { hideDismiss: true },
  })
}

function handleBatchClick() {
  activeType.value = 'batch'
  sectionCodes.types = [
    `;['First', 'Second', 'Third'].forEach((msg, i) => {`,
    `  setTimeout(() => toast(msg), i * 150)`,
    `})`,
  ].join('\n')
  ;['First notification', 'Second notification', 'Third notification'].forEach((msg, i) => {
    schedule(() => toast(msg, toastOptions()), i * 150)
  })
}

function handleDismissAllClick() {
  clearScheduledTimers()
  sectionCodes.dedup = `toast.dismiss()`
  toast.dismiss()
}

function handleDurationChange(d: number) {
  duration.value = d
  sectionCodes.duration =
    d === Infinity ? `toast('Hello', { duration: Infinity })` : `toast('Hello', { duration: ${d} })`
  toast(`Duration → ${formatDuration(d)}`, { duration: d, position: resolvedPosition() })
}

function handlePositionChange(pos: ToastPosition) {
  position.value = pos
  sectionCodes.position = `toast('Hello', { position: '${pos}' })`
  toast('Hello', { position: pos, duration: duration.value })
}

function handlePerToastPositionChange(pos: ToastPosition | null) {
  perToastPosition.value = pos
  sectionCodes.position =
    pos === null
      ? `toast('Hello') // uses the global position`
      : `toast('Hello', { position: '${pos}' })`
  toast('Hello', toastOptions())
}

function handleDirectionChange(newDirection: boolean) {
  direction.value = newDirection
  sectionCodes.stacking = `calculateOffset(toast, { reverseOrder: ${newDirection} })`
  toast(`Stack direction → ${newDirection ? 'ltr' : 'rtl'}`, { position: resolvedPosition() })
}

// Repeated identical errors are not queued — the existing toast is re-emphasized (shake + timer reset).

let errorCounter = 0

const typeDemos: { key: string; run: () => void }[] = [
  { key: 'success', run: handleSuccessClick },
  { key: 'error', run: handleErrorClick },
  { key: 'info', run: handleInfoClick },
  { key: 'warning', run: handleWarningClick },
  { key: 'loading', run: handleLoadingClick },
  { key: 'promise', run: handlePromiseClick },
  { key: 'custom', run: handleCustomClick },
  { key: 'persistent', run: handlePersistentClick },
  { key: 'countdown', run: handleCountdownClick },
  { key: 'action', run: handleActionClick },
  { key: 'batch', run: handleBatchClick },
]

function handleSameErrorBurst() {
  dedupActive.value = 'same'
  sectionCodes.dedup = `toast.error('Network request failed')\n// identical errors shake & reset, never stack`
  // Only one toast shows; each call shakes it and resets its countdown.
  for (let i = 0; i < 5; i += 1) {
    schedule(() => toast.error('Network request failed', toastOptions()), i * 300)
  }
}

function handleDifferentErrors() {
  dedupActive.value = 'different'
  sectionCodes.dedup = `toast.error('Connection timed out')\n// distinct errors replace the visible one in place`
  // Distinct errors replace the visible one in place (still one toast), each swap with a shake.
  const messages = ['Connection timed out', 'Server returned 500', 'Request aborted']
  messages.forEach((msg, i) => {
    schedule(() => toast.error(msg, toastOptions()), i * 600)
  })
}

function handleSingleError() {
  dedupActive.value = 'single'
  sectionCodes.dedup = `toast.error('Error #N: validation failed')`
  errorCounter += 1
  toast.error(`Error #${errorCounter}: validation failed`, toastOptions())
}

function handleStackModeChange(mode: StackMode) {
  stackMode.value = mode
  sectionCodes.stacking = stackingCode(mode, maxToasts.value, centerAlignStack.value)
}

function handleMaxChange(max: number) {
  maxToasts.value = max
  sectionCodes.stacking = stackingCode(stackMode.value, max, centerAlignStack.value)
}

function handleCenterAlignToggle() {
  centerAlignStack.value = !centerAlignStack.value
  sectionCodes.stacking = stackingCode(stackMode.value, maxToasts.value, centerAlignStack.value)
}

export function useToasts() {
  return {
    activeType,
    // Bound to ToastWrapper's `--toast-stack-gap` so the visual gap and offset math never drift apart.
    stackGutter: STACK_GUTTER,
    dedupActive,
    sectionCodes,
    positions,
    position,
    perToastPosition,
    direction,
    formatPositionName,
    durationPresets,
    duration,
    formatDuration,
    motionDurationPresets,
    motionDuration,
    formatMotionDuration,
    handleMotionDurationChange,
    popMotion,
    handlePopMotionChange,
    offsetPresets,
    formatOffset,
    handleOffsetChange,
    stackModes,
    stackMode,
    maxPresets,
    maxToasts,
    hoveredPosition,
    toastMotion,
    needsFixedWidth,
    centerAlignStack,
    handleCenterAlignToggle,
    layoutStyle,
    handlePointerEnter,
    handlePointerLeave,
    toastOptions,
    effectivePosition,
    resolveCustomMessage,
    handleHeroClick,
    typeDemos,
    handleSuccessClick,
    handleErrorClick,
    handleInfoClick,
    handleWarningClick,
    handleLoadingClick,
    handlePromiseClick,
    handleCustomClick,
    handlePersistentClick,
    handleCountdownClick,
    handleActionClick,
    handleBatchClick,
    handleDismissAllClick,
    handleDurationChange,
    handlePositionChange,
    handlePerToastPositionChange,
    handleDirectionChange,
    handleStackModeChange,
    handleMaxChange,
    handleSameErrorBurst,
    handleDifferentErrors,
    handleSingleError,
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(clearScheduledTimers)
}
