<script setup lang="ts">
import { NotFoundCall } from './not-found-callable'

const props = defineProps<{ pathname: string }>()

async function ask() {
  const action = await NotFoundCall.call({ pathname: props.pathname })
  if (action === 'home') window.location.assign('/')
}
</script>

<template>
  <NotFoundCall />
  <section
    class="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center"
  >
    <p class="font-mono text-sm text-[var(--color-accent)]">404</p>
    <h1 class="mt-3 text-4xl font-medium tracking-tight text-[var(--color-fg)] md:text-6xl">
      No call answered.
    </h1>
    <p class="mt-5 max-w-lg text-base leading-7 text-[var(--color-fg-muted)]">
      This page does not exist. The button below does, and it uses the same awaitable component
      model documented throughout the site.
    </p>
    <button
      type="button"
      class="mt-8 inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-brand)] px-4 text-sm font-medium text-[var(--color-brand-fg)] transition-[background-color,transform] hover:bg-[var(--color-brand-hover)]"
      @click="ask"
    >
      Call the 404 dialog
    </button>
  </section>
</template>
