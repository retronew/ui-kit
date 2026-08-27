<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import type { DemoCallContext } from '~/components/call-context'
import type { Command } from './types'

const props = defineProps<{ commands: readonly Command[]; call: DemoCallContext<string | null> }>()
const query = ref('')
const active = ref(0)
const input = useTemplateRef<HTMLInputElement>('input')
const palette = useTemplateRef<HTMLElement>('palette')
const filtered = computed(() => {
  const normalized = query.value.trim().toLowerCase()
  return normalized
    ? props.commands.filter((command) => command.label.toLowerCase().includes(normalized))
    : props.commands
})

function choose(command: Command) {
  props.call.end(command.id)
}
function onInput() {
  active.value = 0
}
function onPointer(event: MouseEvent) {
  if (palette.value && !palette.value.contains(event.target as Node)) props.call.end(null)
}
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') props.call.end(null)
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = Math.min(filtered.value.length - 1, active.value + 1)
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = Math.max(0, active.value - 1)
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const command = filtered.value[active.value]
    if (command) choose(command)
  }
}

onMounted(async () => {
  await nextTick()
  input.value?.focus()
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
    aria-label="Command palette"
    class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-32 backdrop-blur-sm"
  >
    <div
      ref="palette"
      class="w-full max-w-md overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl"
    >
      <input
        ref="input"
        v-model="query"
        type="text"
        placeholder="Type a command…"
        class="w-full border-b border-[var(--color-border)] bg-transparent px-4 py-3 text-base text-[var(--color-fg)] focus:outline-none md:text-sm"
        @input="onInput"
      />
      <ul class="max-h-72 overflow-y-auto p-1">
        <li v-if="filtered.length === 0" class="px-3 py-2 text-sm text-[var(--color-fg-subtle)]">
          No matches
        </li>
        <li v-for="(command, index) in filtered" v-else :key="command.id">
          <button
            type="button"
            :class="
              index === active
                ? 'flex w-full items-center justify-between gap-3 rounded-md bg-[var(--color-bg-subtle)] px-3 py-2 text-left text-sm text-[var(--color-fg)]'
                : 'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-[var(--color-fg-muted)]'
            "
            @mouseenter="active = index"
            @click="choose(command)"
          >
            <span>{{ command.label }}</span
            ><span
              v-if="command.shortcut"
              class="font-mono text-xs text-[var(--color-fg-subtle)]"
              >{{ command.shortcut }}</span
            >
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
