<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'
import type { Settings } from './types'

const props = defineProps<{
  initial: Settings
  call: DemoCallContext<Settings | null>
}>()
const settings = ref<Settings>({ ...props.initial })
const entered = ref(false)
const drawer = useTemplateRef<HTMLElement>('drawer')
const opened = computed(() => entered.value && !props.call.ended)

function close() {
  props.call.end(null)
}
function save() {
  props.call.end({ ...settings.value })
}
function onPointer(event: MouseEvent) {
  if (drawer.value && !drawer.value.contains(event.target as Node)) close()
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}
function setNotifications(event: Event) {
  settings.value.notifications = (event.target as HTMLInputElement).checked
}
function setSyncOnLaunch(event: Event) {
  settings.value.syncOnLaunch = (event.target as HTMLInputElement).checked
}

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    entered.value = true
  })
  document.addEventListener('mousedown', onPointer)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onPointer)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Settings"
    class="fixed inset-0 z-50 flex justify-end bg-black/30 transition-opacity duration-300"
    :class="opened ? 'opacity-100' : 'opacity-0'"
  >
    <section
      ref="drawer"
      class="flex h-full w-full max-w-sm flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl transition-transform duration-300 ease-out"
      :class="opened ? 'translate-x-0' : 'translate-x-full'"
    >
      <header
        class="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4"
      >
        <h2 class="text-sm font-medium text-[var(--color-fg)]">Settings</h2>
        <button
          type="button"
          class="rounded p-1 text-lg leading-none text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          aria-label="Close settings"
          @click="close"
        >
          ×
        </button>
      </header>
      <div class="flex-1 space-y-6 px-5 py-6">
        <label class="flex cursor-pointer items-start justify-between gap-6">
          <span
            ><span class="block text-sm text-[var(--color-fg)]">Notifications</span
            ><span class="mt-1 block text-xs text-[var(--color-fg-muted)]"
              >Receive updates about your workspace.</span
            ></span
          >
          <input
            type="checkbox"
            class="mt-0.5 accent-[var(--color-accent)]"
            :checked="settings.notifications"
            @change="setNotifications"
          />
        </label>
        <label class="flex cursor-pointer items-start justify-between gap-6">
          <span
            ><span class="block text-sm text-[var(--color-fg)]">Sync on launch</span
            ><span class="mt-1 block text-xs text-[var(--color-fg-muted)]"
              >Refresh your data when the app opens.</span
            ></span
          >
          <input
            type="checkbox"
            class="mt-0.5 accent-[var(--color-accent)]"
            :checked="settings.syncOnLaunch"
            @change="setSyncOnLaunch"
          />
        </label>
        <label class="block">
          <span class="block text-sm text-[var(--color-fg)]">Theme</span>
          <select
            v-model="settings.theme"
            class="mt-2 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <footer class="flex justify-end gap-3 border-t border-[var(--color-border)] px-5 py-4">
        <button
          type="button"
          class="rounded-md px-3 py-2 text-sm text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-fg)]"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-accent-fg)] transition-[background-color] hover:bg-[var(--color-accent-hover)]"
          @click="save"
        >
          Save changes
        </button>
      </footer>
    </section>
  </div>
</template>
