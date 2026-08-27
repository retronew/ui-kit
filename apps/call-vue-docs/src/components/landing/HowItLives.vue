<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { landingMessages } from '~/i18n'
import type { Locale } from '~/i18n'

type Phase = 'idle' | 'calling' | 'rendering' | 'resolving'

const phases: Phase[] = ['idle', 'calling', 'rendering', 'resolving']
const props = withDefaults(defineProps<{ locale?: Locale }>(), { locale: 'en' })
const t = computed(() => landingMessages[props.locale].flow)
const phase = ref<Phase>('idle')
const autoplay = ref(true)
let interval: ReturnType<typeof setInterval> | undefined

const phaseIndex = computed(() => phases.indexOf(phase.value))

function start() {
  clearInterval(interval)
  if (!autoplay.value) return
  interval = setInterval(() => {
    phase.value = phases[(phaseIndex.value + 1) % phases.length] ?? 'idle'
  }, 2000)
}

function toggleAutoplay() {
  autoplay.value = !autoplay.value
  start()
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) autoplay.value = false
  start()
})

onBeforeUnmount(() => clearInterval(interval))
</script>

<template>
  <section class="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <div class="text-center">
        <p class="font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
          {{ t.eyebrow }}
        </p>
        <h2 class="mt-3 text-3xl font-medium tracking-tight text-[var(--color-fg)] md:text-4xl">
          {{ t.title }}
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--color-fg-muted)]">
          {{ t.description }}
        </p>
      </div>

      <div class="mt-14 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
          <p class="mb-4 font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
            {{ t.tree }}
          </p>
          <div class="font-mono text-sm leading-7 text-[var(--color-fg-muted)]">
            <div>&lt;App&gt;</div>
            <div class="pl-6">&lt;Header /&gt;</div>
            <div class="pl-6">&lt;RouterView /&gt;</div>
            <div
              class="rounded pl-6 transition-[color,background-color] duration-200"
              :class="
                phase === 'rendering'
                  ? 'bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-fg)]'
                  : ''
              "
            >
              &lt;<span class="text-[var(--color-accent)]">Confirm</span> /&gt;<span
                class="ml-2 text-[var(--color-fg-subtle)]"
                >← the Root</span
              >
            </div>
            <div>&lt;/App&gt;</div>
          </div>
          <p class="mt-4 text-xs leading-5 text-[var(--color-fg-subtle)]">{{ t.treeNote }}</p>
        </div>

        <div class="flex flex-col items-stretch justify-center gap-5 lg:min-w-[160px]">
          <div
            v-for="row in [
              { phase: 'calling', label: '.call()', direction: 'forward' },
              { phase: 'rendering', label: 'Render', direction: 'backward' },
              { phase: 'resolving', label: 'Response', direction: 'forward' },
            ]"
            :key="row.phase"
            class="flex flex-col items-center gap-1"
          >
            <span
              class="font-mono text-[11px] uppercase tracking-wider transition-colors duration-200"
              :class="
                phase === row.phase ? 'text-[var(--color-accent)]' : 'text-[var(--color-fg-subtle)]'
              "
              >{{ row.label }}</span
            >
            <svg width="140" height="14" viewBox="0 0 140 14" fill="none" aria-hidden="true">
              <defs>
                <marker
                  :id="`head-${row.direction}-${phase === row.phase ? 'on' : 'off'}`"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <path
                    d="M0,0 L0,6 L8,3 z"
                    :fill="
                      phase === row.phase ? 'var(--color-accent)' : 'var(--color-border-strong)'
                    "
                  />
                </marker>
              </defs>
              <path
                v-if="row.direction === 'forward'"
                d="M 5 7 L 132 7"
                :stroke="phase === row.phase ? 'var(--color-accent)' : 'var(--color-border-strong)'"
                stroke-width="2"
                :marker-end="`url(#head-forward-${phase === row.phase ? 'on' : 'off'})`"
                :class="phase === row.phase ? 'animate-pulse' : ''"
              />
              <path
                v-else
                d="M 135 7 L 8 7"
                :stroke="phase === row.phase ? 'var(--color-accent)' : 'var(--color-border-strong)'"
                stroke-width="2"
                :marker-end="`url(#head-backward-${phase === row.phase ? 'on' : 'off'})`"
                :class="phase === row.phase ? 'animate-pulse' : ''"
              />
            </svg>
          </div>
        </div>

        <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
          <p class="mb-4 font-mono text-xs uppercase tracking-wider text-[var(--color-fg-subtle)]">
            {{ t.anywhere }}
          </p>
          <div
            tabindex="0"
            class="overflow-x-auto font-mono text-sm leading-7 text-[var(--color-fg-muted)]"
          >
            <div class="text-[var(--color-fg-subtle)]">
              // inside any handler, composable, or domain action
            </div>
            <div>
              <span
                class="transition-[color,background-color] duration-200"
                :class="
                  phase === 'resolving'
                    ? 'rounded bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] px-1 text-[var(--color-accent)]'
                    : 'text-[var(--color-fg)]'
                "
                >const accepted</span
              >
              =
              <span
                class="transition-[color,background-color] duration-200"
                :class="
                  phase === 'calling'
                    ? 'rounded bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] px-1 text-[var(--color-accent)]'
                    : 'text-[var(--color-fg)]'
                "
                >await Confirm.call()</span
              >
            </div>
            <div>if (accepted) await api.delete(id)</div>
          </div>
          <p class="mt-4 text-xs leading-5 text-[var(--color-fg-subtle)]">{{ t.codeNote }}</p>
        </div>
      </div>

      <div
        class="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--color-fg-subtle)]"
      >
        <span
          v-for="item in phases"
          :key="item"
          class="font-mono"
          :class="phase === item ? 'text-[var(--color-accent)]' : ''"
          >{{ item }}</span
        >
        <button
          type="button"
          class="ml-3 inline-flex h-9 items-center justify-center rounded border border-[var(--color-border)] px-3 font-mono text-[10px] text-[var(--color-fg-muted)] transition-[color,transform] hover:text-[var(--color-fg)]"
          @click="toggleAutoplay"
        >
          {{ autoplay ? t.pause : t.play }}
        </button>
      </div>
    </div>
  </section>
</template>
