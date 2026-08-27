<script setup lang="ts">
import { ref } from 'vue'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'
import CopyCommand from '../CopyCommand.vue'
import InstallCommand from '../InstallCommand.vue'

type Mode = 'lib' | 'skill'

const mode = ref<Mode>('lib')
const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const tabs = () => [
  { id: 'lib' as const, label: landingMessages[props.locale].hero.install },
  { id: 'skill' as const, label: landingMessages[props.locale].hero.skill },
]
const skillCommand = 'npx skills add retronew/ui-kit --skill call-vue'
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div
      role="tablist"
      aria-label="Install method"
      class="inline-flex items-center gap-4 font-mono text-xs"
    >
      <button
        v-for="tab in tabs()"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="mode === tab.id"
        class="relative border-b-2 pb-0.5 transition-[color,border-color,transform] after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']"
        :class="
          mode === tab.id
            ? 'border-[var(--color-accent)] text-[var(--color-fg)]'
            : 'border-transparent text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)]'
        "
        @click="mode = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="grid w-full grid-cols-1">
      <div
        class="col-start-1 row-start-1 flex min-w-0 items-center justify-center"
        :class="mode === 'lib' ? '' : 'pointer-events-none invisible'"
        :aria-hidden="mode !== 'lib'"
      >
        <InstallCommand />
      </div>
      <div
        class="col-start-1 row-start-1 flex min-w-0 items-center justify-center"
        :class="mode === 'skill' ? '' : 'pointer-events-none invisible'"
        :aria-hidden="mode !== 'skill'"
      >
        <CopyCommand :command="skillCommand" label="Install the call-vue agent skill" />
      </div>
    </div>
  </div>
</template>
