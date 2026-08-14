import type { ToastEffect, ToastPosition, ToastStatus, ToastStore } from '@retronew/toast-core'
import { prefersReducedMotion, subscribeReducedMotion } from '@retronew/toast-core'
import { computed, defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue'
import type { CSSProperties, PropType } from 'vue'
import { toastStore } from './toast'

/**
 * Shared transition for the wrapper's `transform`/`opacity`/`filter`. Duration
 * reads from the `--toast-motion-duration` CSS custom property (default `300ms`).
 */
export const TOAST_TRANSITION =
  'transform var(--toast-motion-duration, 300ms) cubic-bezier(0.22, 1, 0.36, 1), opacity var(--toast-motion-duration, 300ms) cubic-bezier(0.22, 1, 0.36, 1), filter var(--toast-motion-duration, 300ms) cubic-bezier(0.22, 1, 0.36, 1)'

const SHAKE_KEYFRAMES: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(4px)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(4px)' },
  { transform: 'translateX(-2px)' },
  { transform: 'translateX(2px)' },
  { transform: 'translateX(0)' },
]

/**
 * `pop` prop transitions — react-hot-toast-style: bigger scale pop, asymmetric
 * enter/exit distance and opacity, distinct enter/exit easing. `transform`/`opacity`
 * duration shares the same `--toast-motion-duration` custom property as the default
 * motion, so the same speed control governs both. `filter` (the blur) runs 1.4x
 * longer than that — the pop's bigger, faster motion otherwise blows past the blur
 * before it reads as motion blur rather than a flash.
 */
const POP_ENTER_TRANSITION =
  'transform var(--toast-motion-duration, 300ms) cubic-bezier(0.21, 1.02, 0.73, 1), opacity var(--toast-motion-duration, 300ms) cubic-bezier(0.21, 1.02, 0.73, 1), filter calc(var(--toast-motion-duration, 300ms) * 1.4) cubic-bezier(0.21, 1.02, 0.73, 1)'
const POP_EXIT_TRANSITION =
  'transform var(--toast-motion-duration, 300ms) cubic-bezier(0.06, 0.71, 0.55, 1), opacity var(--toast-motion-duration, 300ms) cubic-bezier(0.06, 0.71, 0.55, 1), filter calc(var(--toast-motion-duration, 300ms) * 1.4) cubic-bezier(0.06, 0.71, 0.55, 1)'
/** Blur amount while hidden in `pop` mode — stronger than the default `2px` so it reads against the bigger scale/distance. */
const POP_BLUR = 'var(--toast-motion-blur, 6px)'
/** Scale a toast starts/ends at while entering/exiting in `pop` mode, before the stacking `props.scale` multiplies in. */
const POP_SCALE = 0.6
/** Enter travels further than exit (200% vs 150%) — matches react-hot-toast's asymmetric keyframes. */
const POP_ENTER_OFFSET_PERCENT = 200
const POP_EXIT_OFFSET_PERCENT = 150
/** Entering starts partially visible (opacity .5); exiting fades all the way to 0. */
const POP_ENTER_HIDDEN_OPACITY = 0.5

/** Pointer movement (px) before a press becomes a drag. */
const SWIPE_HYSTERESIS_PX = 10
/** Drag distance (px) past which a release always commits. */
const SWIPE_COMMIT_DISTANCE_PX = 80
/** Release speed (px/ms) past which a release commits even below the distance threshold. */
const SWIPE_COMMIT_VELOCITY = 0.5
/** Fling duration (ms) when release velocity is too small to project from. */
const SWIPE_FLING_FALLBACK_MS = 220
/** Clamp bounds (ms) for the velocity-projected fling duration. */
const SWIPE_FLING_MIN_MS = 150
const SWIPE_FLING_MAX_MS = 320

/**
 * The single per-toast DOM element: measures its own height for stacking
 * offsets, drives stacking/enter/exit through one `transform`, plays a
 * one-shot shake on error dedup, and supports swipe-to-dismiss (toggle via
 * `swipeDismiss`) alongside `Escape`-to-dismiss (toggle via `escapeDismiss`).
 */
export const ToastWrapper = defineComponent({
  name: 'ToastWrapper',
  emits: {
    'height-update': (id: string, height: number) => typeof id === 'string' && height >= 0,
    /** `Escape` pressed while this toast (or a descendant) has focus. */
    'dismiss-request': (id: string) => typeof id === 'string',
  },
  props: {
    id: {
      required: true,
      type: String,
    },
    /** Lifecycle status; drives the enter/exit transform. */
    status: {
      required: true,
      type: String as PropType<ToastStatus>,
    },
    /** Adds a CSS `::after` bridge to neighbours for a continuous hover surface. */
    expanded: {
      default: false,
      type: Boolean,
    },
    /** Logical toast position; determines which direction the stack/enter offset applies. */
    toastPosition: {
      default: undefined,
      type: String as PropType<ToastPosition>,
    },
    /** Cumulative stacking offset in px (e.g. from `calculateOffset`). Unsigned; the sign is derived from `toastPosition`. */
    offset: {
      default: 0,
      type: Number,
    },
    /** Per-depth scale for piled-up stacks. `1` = full size. */
    scale: {
      default: 1,
      type: Number,
    },
    /** Anchor the stack-depth scale to the toast's center instead of the edge implied by `toastPosition`. */
    centerAlign: {
      default: false,
      type: Boolean,
    },
    /** Visual opacity for overflow/queued toasts — independent of the enter/exit opacity. */
    stackOpacity: {
      default: 1,
      type: Number,
    },
    /**
     * Opt into a react-hot-toast-style entrance/exit: a pronounced scale pop
     * (0.6 → 1) with asymmetric enter/exit distance, opacity, and easing.
     * Duration still reads from `--toast-motion-duration`, same as the
     * default motion. Off by default — the default motion is a subtler
     * slide + fade with no scale change.
     */
    pop: {
      default: false,
      type: Boolean,
    },
    zIndex: {
      default: 0,
      type: Number,
    },
    /** Store to listen for shake effects on. Defaults to the shared singleton. */
    store: {
      default: () => toastStore,
      type: Object as PropType<ToastStore>,
    },
    /**
     * Enable pointer-drag swipe-to-dismiss. Reactive — flipping to `false`
     * mid-drag cancels the in-progress gesture and springs the toast back.
     */
    swipeDismiss: {
      default: true,
      type: Boolean,
    },
    /** Enable `Escape`-to-dismiss while the toast is focused. Reactive. */
    escapeDismiss: {
      default: true,
      type: Boolean,
    },
  },
  setup(props, { slots, emit }) {
    const wrapperRef = ref<HTMLDivElement | null>(null)
    // Flip to entered on the next frame so the enter transition plays instead of snapping to rest.
    const mounted = ref(false)
    let observer: ResizeObserver | null = null
    let observesWindowResize = false
    let measureFrame: number | null = null
    let mountFrame: number | null = null
    let disposed = false
    let shakeAnimation: Animation | null = null

    // Swipe-to-dismiss: 1:1 pointer tracking past `SWIPE_HYSTERESIS_PX` so taps aren't intercepted.
    // Gated by the `swipeDismiss` prop (see `onPointerdown`).
    const dragX = ref(0)
    const dragY = ref(0)
    const dragging = ref(false)
    let dragAxis: 'x' | 'y' | null = null
    let pointerId: number | null = null
    let startX = 0
    let startY = 0
    let lastMoveX = 0
    let lastMoveY = 0
    let lastMoveTime = 0
    let velocityX = 0
    let velocityY = 0
    let suppressNextClick: ((event: MouseEvent) => void) | null = null
    let flingAnimation: Animation | null = null
    let restoreFocusTarget: HTMLElement | null = null
    const reduceMotion = ref(prefersReducedMotion())
    let unsubscribeReducedMotion: (() => void) | null = null

    const stopEffectSubscription = watch(
      [() => props.store, () => props.id] as const,
      ([store, id], _previous, onCleanup) => {
        const unsubscribe = store.onEffect((effect: ToastEffect) => {
          if (effect.type !== 'shake') return
          if (reduceMotion.value || !wrapperRef.value?.animate) return
          shakeAnimation?.cancel()
          shakeAnimation = wrapperRef.value.animate(SHAKE_KEYFRAMES, {
            composite: 'add',
            duration: 500,
            easing: 'cubic-bezier(.36,.07,.19,.97)',
          })
        }, id)
        onCleanup(unsubscribe)
      },
      { immediate: true },
    )

    /** `-1` (swipe up) for a `top-*` toast, `1` (swipe down) for `bottom-*`. */
    function allowedVerticalDirection(): -1 | 1 {
      return props.toastPosition?.includes('bottom') ? 1 : -1
    }

    /** Allowed horizontal swipe direction, or `null` for `*-center` toasts. Outward only: `-1` left, `1` right. */
    function allowedHorizontalDirection(): -1 | 1 | null {
      if (props.toastPosition?.includes('center')) {
        return null
      }
      return props.toastPosition?.includes('right') ? 1 : -1
    }

    function clearClickSuppression(): void {
      if (suppressNextClick && wrapperRef.value) {
        wrapperRef.value.removeEventListener('click', suppressNextClick, true)
      }
      suppressNextClick = null
    }

    function onPointerdown(event: PointerEvent): void {
      if (!props.swipeDismiss) {
        return
      }
      // Left-click only for a mouse; any touch/pen point is fine.
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return
      }
      clearClickSuppression()
      flingAnimation?.cancel()
      flingAnimation = null
      pointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      lastMoveX = event.clientX
      lastMoveY = event.clientY
      lastMoveTime = event.timeStamp
      velocityX = 0
      velocityY = 0
      // No capture here — it would retarget the compatibility `click`, breaking buttons on a plain tap.
    }

    function onPointermove(event: PointerEvent): void {
      if (pointerId === null || event.pointerId !== pointerId) {
        return
      }
      const dx = event.clientX - startX
      const dy = event.clientY - startY

      if (!dragging.value) {
        const past = Math.max(Math.abs(dx), Math.abs(dy)) >= SWIPE_HYSTERESIS_PX
        if (!past) {
          return
        }
        const horizontalDirection = allowedHorizontalDirection()
        if (Math.abs(dy) > Math.abs(dx) && Math.sign(dy) === allowedVerticalDirection()) {
          dragAxis = 'y'
        } else if (
          Math.abs(dx) >= Math.abs(dy) &&
          horizontalDirection !== null &&
          Math.sign(dx) === horizontalDirection
        ) {
          dragAxis = 'x'
        } else {
          // Unsupported gesture direction — don't hijack it.
          return
        }
        dragging.value = true
        // Capture only once confirmed, so tracking survives the pointer leaving the element.
        wrapperRef.value?.setPointerCapture?.(event.pointerId)
        suppressNextClick = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation()
          clickEvent.preventDefault()
        }
        wrapperRef.value?.addEventListener('click', suppressNextClick, {
          capture: true,
          once: true,
        })
      }

      const dt = event.timeStamp - lastMoveTime
      if (dt > 0) {
        velocityX = (event.clientX - lastMoveX) / dt
        velocityY = (event.clientY - lastMoveY) / dt
      }
      lastMoveX = event.clientX
      lastMoveY = event.clientY
      lastMoveTime = event.timeStamp
      if (dragAxis === 'x') {
        dragX.value = dx
      } else {
        dragY.value = dy
      }
      event.preventDefault()
    }

    function endDrag(releaseTime: number): void {
      const capturedPointer = pointerId
      pointerId = null
      if (capturedPointer !== null && wrapperRef.value?.hasPointerCapture?.(capturedPointer)) {
        wrapperRef.value.releasePointerCapture(capturedPointer)
      }

      if (!dragging.value) {
        return
      }
      dragging.value = false

      const axis = dragAxis
      dragAxis = null
      const distance = axis === 'x' ? dragX.value : dragY.value
      const recentVelocity = releaseTime - lastMoveTime <= 80
      const velocity = recentVelocity ? (axis === 'x' ? velocityX : velocityY) : 0
      const committed =
        Math.abs(distance) > SWIPE_COMMIT_DISTANCE_PX || Math.abs(velocity) > SWIPE_COMMIT_VELOCITY
      if (!committed) {
        // Spring back through the shared transition.
        dragX.value = 0
        dragY.value = 0
        return
      }

      const direction = distance !== 0 ? Math.sign(distance) : Math.sign(velocity) || 1
      if (reduceMotion.value || !wrapperRef.value?.animate) {
        emit('dismiss-request', props.id)
        return
      }
      const extent = axis === 'x' ? wrapperRef.value.offsetWidth : wrapperRef.value.offsetHeight
      const flingDistance = direction * ((extent || 300) + 80)
      const prop = axis === 'x' ? 'translateX' : 'translateY'
      // Match the fling duration to release speed; fall back when velocity is too small to project from.
      const speed = Math.abs(velocity)
      const projectedDuration =
        speed > 0.05 ? Math.abs(flingDistance) / speed : SWIPE_FLING_FALLBACK_MS
      const duration = Math.min(Math.max(projectedDuration, SWIPE_FLING_MIN_MS), SWIPE_FLING_MAX_MS)
      flingAnimation = wrapperRef.value.animate(
        [{ transform: `${prop}(0)` }, { transform: `${prop}(${flingDistance}px)` }],
        {
          composite: 'add',
          duration,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          // Hold the flung position until the element is removed.
          fill: 'forwards',
        },
      )
      if (!flingAnimation.finished) {
        // Environments without a real Web Animations finished promise (e.g. a
        // partial animate() polyfill) can't notify us when the fling ends.
        emit('dismiss-request', props.id)
        return
      }
      void flingAnimation.finished
        .then(() => emit('dismiss-request', props.id))
        .catch(() => {
          // Cancelled (e.g. unmounted mid-fling) — nothing to clean up.
        })
    }

    function onPointerup(event: PointerEvent): void {
      if (event.pointerId !== pointerId) {
        return
      }
      endDrag(event.timeStamp)
    }

    /** Resets in-progress drag state without emitting a dismiss. */
    function cancelDrag(): void {
      const capturedPointer = pointerId
      if (capturedPointer !== null && wrapperRef.value?.hasPointerCapture?.(capturedPointer)) {
        wrapperRef.value.releasePointerCapture(capturedPointer)
      }
      dragX.value = 0
      dragY.value = 0
      dragging.value = false
      dragAxis = null
      pointerId = null
      clearClickSuppression()
    }

    function onPointercancel(event: PointerEvent): void {
      if (event.pointerId !== pointerId) {
        return
      }
      cancelDrag()
    }

    // `swipeDismiss` toggled off mid-drag: spring back instead of leaving the
    // gesture half-committed with no way to complete or cancel it.
    watch(
      () => props.swipeDismiss,
      (enabled) => {
        if (!enabled && dragging.value) cancelDrag()
      },
    )

    function onLostPointerCapture(event: PointerEvent): void {
      if (event.pointerId === pointerId) endDrag(event.timeStamp)
    }

    function onFocusin(event: FocusEvent): void {
      const previous = event.relatedTarget
      if (
        previous instanceof HTMLElement &&
        wrapperRef.value !== null &&
        !wrapperRef.value.contains(previous)
      ) {
        restoreFocusTarget = previous
      }
    }

    function restoreFocus(): void {
      const target = restoreFocusTarget
      restoreFocusTarget = null
      if (target === null) return
      queueMicrotask(() => {
        if (target.isConnected) target.focus()
      })
    }

    function measureAndEmit(): void {
      if (wrapperRef.value) {
        // `offsetHeight` is unaffected by `transform`, unlike `getBoundingClientRect()`.
        emit('height-update', props.id, wrapperRef.value.offsetHeight)
      }
    }

    function scheduleMeasure(): void {
      if (disposed || measureFrame !== null) return
      measureFrame = requestAnimationFrame(() => {
        measureFrame = null
        measureAndEmit()
      })
    }

    onMounted(() => {
      if (wrapperRef.value) {
        measureAndEmit()

        if (typeof ResizeObserver !== 'undefined') {
          observer = new ResizeObserver(scheduleMeasure)
          observer.observe(wrapperRef.value)
        } else {
          observesWindowResize = true
          window.addEventListener('resize', scheduleMeasure)
        }
        void document.fonts?.ready.then(scheduleMeasure)
      }

      mountFrame = requestAnimationFrame(() => {
        mounted.value = true
      })

      unsubscribeReducedMotion = subscribeReducedMotion((reduced) => {
        reduceMotion.value = reduced
      })
    })

    onUnmounted(() => {
      disposed = true
      observer?.disconnect()
      if (observesWindowResize) window.removeEventListener('resize', scheduleMeasure)
      if (mountFrame != null) cancelAnimationFrame(mountFrame)
      if (measureFrame != null) cancelAnimationFrame(measureFrame)
      stopEffectSubscription()
      unsubscribeReducedMotion?.()
      shakeAnimation?.cancel()
      flingAnimation?.cancel()
      clearClickSuppression()
    })

    const motionStyle = computed<CSSProperties>(() => {
      const isTop = props.toastPosition?.includes('top') ?? true
      const isCenter = props.toastPosition?.includes('center') ?? false
      const isRight = (props.toastPosition?.includes('right') ?? false) && !isCenter
      const dir = isTop ? 1 : -1
      const isVisible = mounted.value && props.status === 'visible'
      // Anchor `scale()` to the toast's own center when `centerAlign` (piles
      // in corners then collapse around the same center line as center piles),
      // otherwise to the screen edge implied by `toastPosition` — the edge the
      // piled toasts sit flush against.
      // `centerAlign` anchors scale to the toast's own center; otherwise to the edge implied by `toastPosition`.
      const originX = props.centerAlign || isCenter ? 'center' : isRight ? 'right' : 'left'
      const originY = props.centerAlign ? 'center' : isTop ? 'top' : 'bottom'
      const transformOrigin = `${originX} ${originY}`
      // 'none' so a touch drag never competes with native panning; skipped
      // entirely when swipe-to-dismiss is off, so touch scrolling behaves normally.
      const touchAction = !props.swipeDismiss ? 'auto' : isCenter ? 'pan-x' : 'none'

      if (reduceMotion.value) {
        const opacity = isVisible ? props.stackOpacity : 0
        return { opacity, touchAction, transition: 'none', zIndex: props.zIndex }
      }

      const exiting = props.status === 'dismissed'
      let enterExitOffset: string
      let enterExitScale: number
      let hiddenOpacity: number
      let baseTransition: string
      if (props.pop) {
        const magnitude = exiting ? POP_EXIT_OFFSET_PERCENT : POP_ENTER_OFFSET_PERCENT
        enterExitOffset = isVisible ? '0%' : `${dir * -magnitude}%`
        enterExitScale = isVisible ? 1 : POP_SCALE
        hiddenOpacity = exiting ? 0 : POP_ENTER_HIDDEN_OPACITY
        baseTransition = exiting ? POP_EXIT_TRANSITION : POP_ENTER_TRANSITION
      } else {
        // Default: a subtler slide + fade, no scale change. Exit keeps the
        // original symmetric ±60% (own-height-relative) offset. Entering uses
        // an exact length instead — `own height + gap` — so it travels the
        // same distance neighbours are reflowing by, over the same shared
        // transition, keeping a constant gap between them the whole time
        // instead of the two sliding through each other.
        enterExitScale = 1
        hiddenOpacity = 0
        baseTransition = TOAST_TRANSITION
        if (isVisible) {
          enterExitOffset = '0%'
        } else if (exiting) {
          enterExitOffset = `${dir * -60}%`
        } else {
          enterExitOffset =
            dir === 1
              ? 'calc(-100% - var(--toast-stack-gap, 8px))'
              : 'calc(100% + var(--toast-stack-gap, 8px))'
        }
      }
      const opacity = isVisible ? props.stackOpacity : hiddenOpacity
      // Blur keyed off opacity so any fade-to-hidden (enter/exit or overflow) gets the same soften treatment.
      const filter =
        opacity < 1 ? `blur(${props.pop ? POP_BLUR : 'var(--toast-motion-blur, 2px)'})` : 'blur(0)'

      return {
        filter,
        opacity,
        touchAction,
        transform: `translateX(${dragX.value}px) translateY(${dragY.value}px) translateY(${dir * props.offset}px) translateY(${enterExitOffset}) scale(${props.scale * enterExitScale})`,
        transformOrigin,
        // No transition while dragging — direct manipulation must track the pointer 1:1.
        transition: dragging.value ? 'none' : baseTransition,
        ...(!mounted.value || props.status === 'dismissed' || dragging.value
          ? { willChange: 'transform, opacity, filter' }
          : {}),
        zIndex: props.zIndex,
      }
    })

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape' && props.escapeDismiss) {
        // Let page-level Escape handlers (e.g. modals) still see the event.
        emit('dismiss-request', props.id)
        restoreFocus()
      }
    }

    watch(
      () => props.status,
      (status, previous) => {
        if (
          status === 'dismissed' &&
          previous === 'visible' &&
          wrapperRef.value?.contains(document.activeElement)
        ) {
          restoreFocus()
        }
      },
    )

    return () =>
      h(
        'div',
        {
          ref: wrapperRef,
          'data-toast-wrapper': props.id,
          'data-toast-expanded': props.expanded ? 'true' : 'false',
          'data-toast-status': props.status,
          ...(props.toastPosition ? { 'data-toast-position': props.toastPosition } : {}),
          style: motionStyle.value,
          // Makes the toast Tab-reachable (and thus Escape-dismissible).
          tabindex: '0',
          onFocusin,
          onKeydown,
          onPointerdown,
          onPointermove,
          onPointerup,
          onPointercancel,
          onLostpointercapture: onLostPointerCapture,
        },
        slots.default?.(),
      )
  },
})

/**
 * Gap bridge: a 1px-overlap pseudo-element between adjacent toasts makes the
 * stack one continuous hover surface. Injected once into the document.
 */
if (typeof document !== 'undefined') {
  const STYLE_ID = '__toast-wrapper-styles__'
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `
[data-toast-expanded="true"]::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: calc(var(--toast-stack-gap, 8px) + 1px);
  pointer-events: auto;
}

[data-toast-expanded="true"][data-toast-position*="top"]::after {
  bottom: 100%;
}

[data-toast-expanded="true"][data-toast-position*="bottom"]::after {
  top: 100%;
}
`.trim()
    document.head.appendChild(style)
  }
}
