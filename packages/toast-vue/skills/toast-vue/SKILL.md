---
name: toast-vue
description: Use this skill whenever working with @retronew/toast-vue in a Vue 3 app — firing toasts with `toast()`/`toast.success()`/`toast.promise()`, wiring up the renderless `<Toaster>` outlet, `useToaster()`, `<ToastWrapper>`, styling toasts (it's headless — no default CSS ships), positioning/stacking toasts, configuring the viewport edge offset, scoped toasters via `createToaster`, or the error-dedup shake behavior. Trigger it any time the user mentions toast-vue, `<Toaster>`, `useToaster()`, toast notifications in a Vue project, or asks why their toasts aren't animating/stacking/positioning correctly. Also use it if a toast rendered with this library shows no styling at all — that's expected (headless), not a bug, and this skill explains what you still need to author yourself.
---

# @retronew/toast-vue

Headless toast composable + renderless outlet for Vue 3, built on `@retronew/toast-core`. "Headless" here is load-bearing: **this library ships zero default CSS**. It gives you reactive state, motion primitives, and stacking math — you author every visual style yourself. If you mount `<Toaster>` and see unstyled text with no animation, that's the intended starting point, not a bug.

## Quick start

```ts
// anywhere — no component needed
import { toast } from '@retronew/toast-vue'

toast.success('Saved!')
toast.promise(api.save(), { loading: 'Saving…', success: 'Saved!', error: 'Something went wrong' })
```

```vue
<!-- once, near your app root -->
<script setup lang="ts">
import { Toaster, ToastWrapper } from '@retronew/toast-vue'
</script>

<template>
  <Toaster
    v-slot="{
      toasts,
      viewportOffset,
      dismiss,
      pause,
      resume,
      updateHeight,
      calculateOffset,
      getStackMetrics,
    }"
  >
    <div
      class="fixed pointer-events-none"
      :style="{ inset: typeof viewportOffset === 'number' ? `${viewportOffset}px` : viewportOffset }"
    >
      <ToastWrapper
        v-for="t in toasts"
        :id="t.id"
        :key="t.id"
        :status="t.status"
        :toast-position="t.position ?? 'top-center'"
        :offset="calculateOffset(t, { defaultPosition: 'top-center' })"
        :z-index="getStackMetrics(t, { defaultPosition: 'top-center' }).zIndex"
        :style="{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }"
        @height-update="updateHeight"
      >
        <div style="pointer-events: auto" @click="dismiss(t.id)">{{ t.message }}</div>
      </ToastWrapper>
    </div>
  </Toaster>
</template>
```

That's the minimum wiring to get toasts appearing, stacking, and animating in/out. Everything visual (colors, radius, shadow, icons) is yours to add on top of `<div>{{ t.message }}</div>`.

For a fuller worked example — multi-position support, stack-vs-queue stacking modes, custom message rendering, dark mode — read `apps/toast-vue-demo/src/composables/useToasts.ts` and `apps/toast-vue-demo/src/components/ToastOutlet.vue` in this monorepo (or the equivalent files if this skill is being used from an installed copy of the package).

## What `<ToastWrapper>` owns

| Piece | Owns |
| --- | --- |
| `<Toaster>` | Subscribes to the store, exposes `toasts`, `viewportOffset`, and control handlers via its default slot. Renders nothing itself. |
| `<ToastWrapper>` | Everything about a toast's motion — one element, one `transform`: cumulative stacking offset, per-depth scale, enter/exit (driven by `status`), and the error-dedup shake effect. One instance per toast. |

Stacking offset and enter/exit live on one `<ToastWrapper>` element with one combined `transform` string, animated by one `transition` (`TOAST_TRANSITION`, exported from `ToastWrapper`) — the browser interpolates a single matrix per change. If you build a custom wrapper, reuse `TOAST_TRANSITION` (or match its timing) and keep the whole toast's motion on one element.

**Layout vs. motion split**: `<ToastWrapper>` sets `transform`/`opacity`/`transition`/`z-index` internally from its props (`status`, `offset`, `scale`, `stackOpacity`, `zIndex`). It does **not** set `position`, `top`/`left`/`right`, `display`, or `justify-content` — that's layout, and stays entirely in your `:style` binding on the same element (Vue merges the two style sources onto the rendered root automatically). Don't fight this split by trying to override `transform` from the outside; pass the right `offset`/`scale` props instead.

**`centerAlign` prop** (default `false`): controls where the stack-depth `scale` (piled-up background cards) anchors. Off, it anchors to the edge implied by `toastPosition` — correct when your toasts have variable width (a corner toast's content-fit width), since a center anchor would make its outer edge visibly recede as it scales down. On, it anchors to center, matching Sonner's own model — but Sonner gets away with center anchoring because **all its toasts share one fixed width**; if your toasts don't too, turn this on and you'll still see misaligned edges between piled cards of different widths, just for a different reason (mismatched centers instead of mismatched edges). Pick one: either leave this off with variable-width content, or turn it on *and* give every toast the same width.

**`pop` prop** (default `false`): swaps the default subtle slide + fade for a more pronounced entrance/exit — a bigger scale pop (`0.6 → 1`), asymmetric enter/exit distance and opacity, and distinct enter/exit easing curves (not mirror images of each other). `transform`/`opacity` duration still reads `--toast-motion-duration`, same as the default motion, so one speed control governs both; `filter` (the blur) intentionally runs 1.4x longer so it stays legible against the bigger, faster motion, and defaults to a stronger `6px` (vs. the default motion's `2px`) via the same `--toast-motion-blur` custom property. Toggle it per-instance from your outlet (e.g. `:pop="popMotion"` bound to a ref) — it's not global state.

## `useToaster()` — the composable form

If you're not using the `<Toaster>` slot pattern (e.g. building your own outlet component), call `useToaster()` directly:

```ts
import { useToaster } from '@retronew/toast-vue'

const {
  toasts,
  viewportOffset,
  dismiss,
  remove,
  pause,
  resume,
  updateHeight,
  calculateOffset,
  getStackMetrics,
} = useToaster()
```

- **`calculateOffset(toast, opts?)`** — cumulative pixel offset of `toast` within its position group, computed from the heights you've reported via `updateHeight`. Requires `<ToastWrapper>` (or your own height-measuring logic) to call `updateHeight` on mount/resize, or every offset comes back `0`.
- **`getStackMetrics(toast, opts?)`** — `{ index, isFront, zIndex }` for `toast` within its group. Use this instead of hand-rolling depth/z-index math per app — it's the one place that logic lives.

## Viewport offset comes from core

Set the global edge gap when creating a scoped toaster with `createToaster({ viewportOffset: 16 })`, or change it at runtime with `store.setViewportOffset('1.5rem')`. Numbers represent pixels. Both `useToaster()` and the `<Toaster>` slot expose it reactively as `viewportOffset`.

The outlet is renderless, so it cannot apply the value by itself. Bind it to the fixed outlet container's CSS `inset`, as shown in the quick start. Do not confuse this global edge gap with `calculateOffset({ gutter })`, which controls spacing between adjacent toasts.

## Wiring `@height-update` is not optional

`<ToastWrapper>` measures its rendered height with `ResizeObserver` (coalesced to one animation frame) and emits `height-update`. If you don't wire `@height-update="updateHeight"` back to the slot's `updateHeight` handler, `calculateOffset` never has height data to sum, and every toast renders at offset `0`.

## `--toast-stack-gap` must match your `gutter`

`<ToastWrapper>` injects a small hover-bridge (a pseudo-element that keeps adjacent toasts one continuous hover surface for `expanded` stacks) sized from the CSS custom property `--toast-stack-gap` (default `8px`). This is a separate value from the `gutter` you pass to `calculateOffset({ gutter })` — nothing keeps them in sync automatically. If you use a non-default gutter, set `--toast-stack-gap` to the same number (e.g. on your outlet container's `:style`), or the hover bridge will be the wrong size and the "hover anywhere in the stack keeps it expanded" behavior will have a gap it can slip through.

## Scoped / multiple toasters

For an isolated toast region (a modal's own notifications, a test, multiple independent stacks on one page), don't reuse the shared singleton:

```ts
import { createToaster } from '@retronew/toast-vue'

const { store, toast } = createToaster<MyMessageType>({ max: 3, viewportOffset: 16 })
// <Toaster :store="store"> or useToaster(store)
```

`<ToastWrapper>` also takes a `store` prop (defaults to the shared singleton) — pass the same scoped `store` to it so the error-dedup shake effect is heard on the right instance.

## Error dedup shakes automatically — no manual API

Calling `toast.error(...)` while an error toast is already visible re-emphasizes the existing one (message updates, `<ToastWrapper>` plays a shake) instead of stacking a duplicate — this is `toast-core`'s dedup behavior, not something you opt into per-call. See the `@retronew/toast-core` skill for the underlying mechanism (`ToastStore.onEffect`).

## Swipe-to-dismiss

`<ToastWrapper>` handles the pointer gesture itself (1:1 tracking past a ~10px hysteresis, velocity/distance-based commit, WAAPI fling on commit, spring-back on cancel via the shared `TOAST_TRANSITION`) and emits the same `dismiss-request` event Escape uses — wire it once, both work.

Every axis only engages *outward*, toward the edge the toast already sits at: vertical swipe is up for `top-*`, down for `bottom-*` — never the direction the toast entered from. Horizontal swipe only exists at a corner (`top-left`, `bottom-right`, etc.), never on a `*-center` toast, and even then only toward that corner's own edge — `bottom-right` swipes right, not left. Dragging any "wrong" direction just doesn't engage as a gesture at all (no partial drag, no spring-back) — it's simply not a gesture this toast supports in that direction.

The fling-out speed on commit continues at roughly the release velocity (clamped to a sane range) rather than a fixed duration — a fast flick flies out fast, a slow drag-past-the-distance-threshold eases out at a normal pace. A fixed duration made a large toast (or a slow release) look like it teleported to the edge instead of continuing its motion.

Corner toasts use `touch-action: none` because they support both outward horizontal and vertical swipes. Center toasts use `touch-action: pan-x`, preserving native horizontal panning while reserving their vertical dismiss gesture. Do not override this on the content root.

## Keyboard accessibility

`<ToastWrapper>` is `tabindex="0"` and emits `dismiss-request` on `Escape` — wire `@dismiss-request="dismiss(t.id)"` next to `@height-update`. This is the keyboard-only equivalent of hover-to-pause/click-to-dismiss: a mouse user can hover and click; a keyboard user needs to Tab to a toast and press Escape instead.

`useToastHotkey({ keys? })` is a separate composable (call it once, e.g. alongside your outlet) that focuses the frontmost `[data-toast-wrapper]` element on a global combo — default `Alt+T`, matching Sonner's `hotkey`. It's the on-ramp: without it, a keyboard user has no way to discover or reach the toast stack at all short of tabbing through the whole page.

## Positions and directions

`ToastPosition` is one of `top-left | top-center | top-right | bottom-left | bottom-center | bottom-right`. `calculateOffset`'s `reverseOrder` option controls stack direction (newest-on-top vs. newest-at-bottom) within a position group — most UIs want `reverseOrder: false` for top positions and may want `true` for bottom ones so newer toasts don't require the older ones to shift.
