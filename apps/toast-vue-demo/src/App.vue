<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import HeroSection from './components/HeroSection.vue'
import AnimationSection from './components/sections/AnimationSection.vue'
import DedupSection from './components/sections/DedupSection.vue'
import DismissSection from './components/sections/DismissSection.vue'
import DurationSection from './components/sections/DurationSection.vue'
import InstallSection from './components/sections/InstallSection.vue'
import OffsetSection from './components/sections/OffsetSection.vue'
import PopSection from './components/sections/PopSection.vue'
import PositionSection from './components/sections/PositionSection.vue'
import StackingSection from './components/sections/StackingSection.vue'
import TypesSection from './components/sections/TypesSection.vue'
import UsageSection from './components/sections/UsageSection.vue'
import ToastOutlet from './components/ToastOutlet.vue'
import TopBar from './components/TopBar.vue'
import { GITHUB_URL } from './constants'

const { t } = useI18n()
</script>

<template>
  <ToastOutlet />

  <main class="mx-auto max-w-[692px] px-6 pt-3 pb-10">
    <TopBar />
    <HeroSection />
    <InstallSection />
    <UsageSection />
    <TypesSection />
    <PositionSection />
    <StackingSection />
    <DurationSection />
    <AnimationSection />
    <PopSection />
    <DismissSection />
    <OffsetSection />
    <DedupSection />

    <footer class="mt-14 border-t border-border pt-6">
      <p class="m-0 text-center text-sm text-fg-muted">
        {{ t('footer.builtWith') }} ·
        <a
          class="font-medium text-fg-muted underline decoration-[1.5px] decoration-border underline-offset-[3px] transition-colors hover:text-fg hover:decoration-fg-muted"
          :href="GITHUB_URL"
          target="_blank"
          rel="noopener noreferrer"
          >@retronew/ui-kit</a
        >
      </p>
    </footer>
  </main>
</template>
