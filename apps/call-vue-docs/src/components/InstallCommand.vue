<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']
const commands: Record<PackageManager, string> = {
  npm: 'npm install @retronew/call-vue',
  pnpm: 'pnpm add @retronew/call-vue',
  yarn: 'yarn add @retronew/call-vue',
  bun: 'bun add @retronew/call-vue',
}
const storageKey = 'pm'
const eventName = 'pm-change'
const packageManager = ref<PackageManager>('npm')
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined

const command = computed(() => commands[packageManager.value])

function readPackageManager(): PackageManager {
  try {
    const stored = localStorage.getItem(storageKey)
    if (packageManagers.includes(stored as PackageManager)) return stored as PackageManager
  } catch {
    // Storage is optional.
  }
  return 'npm'
}

function select(value: PackageManager) {
  packageManager.value = value
  try {
    localStorage.setItem(storageKey, value)
  } catch {
    // Storage is optional.
  }
  window.dispatchEvent(new CustomEvent<PackageManager>(eventName, { detail: value }))
}

async function copy() {
  try {
    await navigator.clipboard.writeText(command.value)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copied.value = false), 1500)
  } catch {
    copied.value = false
  }
}

function sync(event: Event) {
  const value = (event as CustomEvent<PackageManager>).detail
  if (packageManagers.includes(value)) packageManager.value = value
}

onMounted(() => {
  packageManager.value = readPackageManager()
  window.addEventListener(eventName, sync)
})

onBeforeUnmount(() => {
  window.removeEventListener(eventName, sync)
  clearTimeout(copiedTimer)
})
</script>

<template>
  <div
    class="inline-flex max-w-full flex-col overflow-hidden rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-left"
  >
    <div
      role="tablist"
      aria-label="Package manager"
      class="flex border-b border-[var(--color-border)]"
    >
      <button
        v-for="name in packageManagers"
        :key="name"
        type="button"
        role="tab"
        :aria-selected="packageManager === name"
        class="relative px-3 py-1.5 font-mono text-xs transition-[color,transform] after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']"
        :class="
          packageManager === name
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]'
        "
        @click="select(name)"
      >
        {{ name }}
      </button>
    </div>
    <div class="flex min-w-0 items-center gap-2 px-4 py-3 font-mono text-sm text-[var(--color-fg)]">
      <span class="text-[var(--color-fg-subtle)]">$</span>
      <span tabindex="0" class="flex-1 overflow-x-auto whitespace-nowrap">{{ command }}</span>
      <button
        type="button"
        class="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[var(--color-fg-subtle)] transition-[color,background-color,transform] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-fg)] after:absolute after:-inset-2.5 after:content-['']"
        :aria-label="copied ? 'Copied' : 'Copy command'"
        @click="copy"
      >
        <svg
          v-if="copied"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-[var(--color-accent)]"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <span class="sr-only" aria-live="polite">{{ copied ? 'Command copied' : '' }}</span>
    </div>
  </div>
</template>
