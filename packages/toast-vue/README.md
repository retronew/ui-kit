# @retronew/toast-vue

[![npm version](https://img.shields.io/npm/v/%40retronew%2Ftoast-vue.svg)](https://www.npmjs.com/package/@retronew/toast-vue)
[![npm downloads](https://img.shields.io/npm/dm/%40retronew%2Ftoast-vue.svg)](https://www.npmjs.com/package/@retronew/toast-vue)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/%40retronew%2Ftoast-vue)](https://bundlephobia.com/package/@retronew/toast-vue)
[![License: MIT](https://img.shields.io/npm/l/%40retronew%2Ftoast-vue.svg)](../../LICENSE)

Headless toast for **Vue 3**. Provides a reactive `useToaster()` composable, a
renderless `<ToasterProvider>` outlet, and a global `toast()` API — all
rendering is yours. Built on the framework-agnostic
[`@retronew/toast-core`](../toast-core).

## Features

- 🎯 **Renderless** — `<ToasterProvider>` outlet + `useToaster()` composable; you own all markup and CSS
- 🧲 **One-transform motion** — stacking offset, per-depth scale, and enter/exit all live on a single `<ToastWrapper>` `transform`/`transition`
- 🫳 **Swipe-to-dismiss** — 1:1 pointer tracking with velocity-based commit and a Web Animations fling; toggle live via `swipeDismiss`/`escapeDismiss` props
- 🫨 **Shake-on-dedup** — a visual nudge when a duplicate error re-emphasizes instead of stacking
- 🎛️ **Two motion presets** — a subtle slide + fade by default, or opt into a bigger `pop` entrance/exit
- ⌨️ **Keyboard accessible** — Tab to reach a toast, `Escape` to dismiss, focus restored on close
- ♿ **Respects reduced motion** — transitions, shake, and fling all skip when `prefers-reduced-motion` is set
- 🧵 **Scoped toasters** — `createToaster()` for isolated stores per instance

## Install

```bash
pnpm add @retronew/toast-vue
```

Add the `progress` prop only when the outlet renders a live countdown or
progress bar; periodic timer snapshots are disabled by default:

```vue
<ToasterProvider progress v-slot="{ toasts, getProgress }">
  <!-- render progress here -->
</ToasterProvider>
```

## Quick start

Trigger toasts from anywhere:

```ts
import { toast } from '@retronew/toast-vue'

toast.success('Saved!')
toast.promise(api.save(), {
  loading: 'Saving…',
  success: 'Saved!',
  error: 'Something went wrong',
})
```

Render them with the renderless outlet (you own the markup & styles):

```vue
<script setup lang="ts">
import { ToasterProvider, toViewportOffsetCss } from '@retronew/toast-vue'
</script>

<template>
  <ToasterProvider v-slot="{ toasts, viewportOffset, dismiss, pause, resume }">
    <div
      class="toaster"
      :style="{ inset: toViewportOffsetCss(viewportOffset) }"
      @mouseenter="pause()"
      @mouseleave="resume()"
    >
      <article
        v-for="t in toasts"
        :key="t.id"
        :data-type="t.type"
        :data-status="t.status"
        @click="dismiss(t.id)"
      >
        {{ t.message }}
      </article>
    </div>
  </ToasterProvider>
</template>
```

Prefer a composable instead of the component? Use `useToaster()`:

```ts
const { toasts, viewportOffset, defaultPosition, dismiss, pause, resume } = useToaster()
```

`defaultPosition` reactively mirrors the store's fallback `position` for
toasts created without an explicit one — see `@retronew/toast-core`'s
`setDefaultPosition()`.

Want a fuller, styled reference implementation — icons, dark mode, action/cancel/dismiss buttons, stack-vs-queue modes — instead of writing one from scratch? Read `apps/toast-vue-demo/src/composables/useToasts.ts` and `apps/toast-vue-demo/src/components/ToastOutlet.vue`/`ToastBar.vue` in this monorepo and adapt them; this package intentionally ships no default styling of its own.

## Scoped / multiple outlets

```ts
import { createToaster } from '@retronew/toast-vue'

const { store, toast } = createToaster<string>({ max: 3, viewportOffset: '1.5rem' })
// pass `store` to <ToasterProvider :store="store"> or useToaster(store)
```

## Claude Code skill

This package ships a [Claude Code skill](skills/toast-vue/SKILL.md) covering
`<ToastWrapper>`'s motion contract, `calculateOffset`/
`getStackMetrics`, and common wiring mistakes (like forgetting
`@height-update`). Claude Code doesn't auto-discover skills inside
`node_modules` yet, so after installing, copy or symlink it into your project:

```bash
mkdir -p .claude/skills
cp -r node_modules/@retronew/toast-vue/skills/toast-vue .claude/skills/toast-vue
```
