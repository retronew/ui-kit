# @retronew/toast-vue

[![npm version](https://img.shields.io/npm/v/%40retronew%2Ftoast-vue.svg)](https://www.npmjs.com/package/@retronew/toast-vue)
[![npm downloads](https://img.shields.io/npm/dm/%40retronew%2Ftoast-vue.svg)](https://www.npmjs.com/package/@retronew/toast-vue)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/%40retronew%2Ftoast-vue)](https://bundlephobia.com/package/@retronew/toast-vue)
[![License: MIT](https://img.shields.io/npm/l/%40retronew%2Ftoast-vue.svg)](../../LICENSE)

Headless toast for **Vue 3**. Provides a reactive `useToaster()` composable, a
renderless `<Toaster>` outlet, and a global `toast()` API — all rendering is
yours. Built on the framework-agnostic [`@retronew/toast-core`](../toast-core).

## Install

```bash
pnpm add @retronew/toast-vue
```

Add the `progress` prop only when the outlet renders a live countdown or
progress bar; periodic timer snapshots are disabled by default:

```vue
<Toaster progress v-slot="{ toasts, getProgress }">
  <!-- render progress here -->
</Toaster>
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
import { Toaster } from '@retronew/toast-vue'
</script>

<template>
  <Toaster v-slot="{ toasts, viewportOffset, dismiss, pause, resume }">
    <div
      class="toaster"
      :style="{ inset: typeof viewportOffset === 'number' ? `${viewportOffset}px` : viewportOffset }"
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
  </Toaster>
</template>
```

Prefer a composable instead of the component? Use `useToaster()`:

```ts
const { toasts, viewportOffset, dismiss, pause, resume } = useToaster()
```

## Scoped / multiple outlets

```ts
import { createToaster } from '@retronew/toast-vue'

const { store, toast } = createToaster<string>({ max: 3, viewportOffset: '1.5rem' })
// pass `store` to <Toaster :store="store"> or useToaster(store)
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
