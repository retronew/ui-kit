<script setup lang="ts">
import { ref } from 'vue'
import { Confirm } from './callables/confirm'
import { Stack } from './callables/stack'
import { Toast } from './callables/toast'

const confirmResult = ref<string>('—')
async function askConfirm() {
  confirmResult.value = 'waiting…'
  const accepted = await Confirm.call({
    title: 'Delete this file?',
    message: 'This action cannot be undone.',
  })
  confirmResult.value = accepted ? 'confirmed ✅' : 'cancelled ❌'
}

let stackCount = 0
const activeStackCount = ref(0)
function pushStackCard() {
  stackCount += 1
  activeStackCount.value += 1
  void Stack.call({ label: `Card #${stackCount}` }).finally(() => {
    activeStackCount.value -= 1
  })
}

let uploadToken = 0
async function simulateUpload() {
  const token = ++uploadToken
  const promise = Toast.upsert({ text: 'Uploading… 0%' })
  for (let pct = 10; pct <= 100; pct += 10) {
    await new Promise((resolve) => setTimeout(resolve, 120))
    if (token !== uploadToken) return
    Toast.update(promise, { text: pct === 100 ? 'Upload complete ✔' : `Uploading… ${pct}%` })
  }
  await new Promise((resolve) => setTimeout(resolve, 700))
  if (token === uploadToken) Toast.end(promise, undefined)
}
</script>

<template>
  <!-- Confirm's own dialog is `position: fixed`, so its <Root> can live
       anywhere; Stack/Toast render into position-relative/-fixed boxes
       further down, so each of those two mounts where its cards should
       actually appear. Every Callable is still mounted exactly once. -->
  <Confirm />

  <main class="page">
    <header class="hero">
      <h1>@retronew/call-vue</h1>
      <p>
        Call & await Vue components like async functions — a Vue 3 port of
        <a href="https://github.com/desko27/react-call" target="_blank" rel="noopener noreferrer"
          >react-call</a
        >.
      </p>
    </header>

    <section class="scene">
      <h2>call() — confirm dialog</h2>
      <p class="desc">
        <code>await Confirm.call({{ '{' }} title, message {{ '}' }})</code> resolves once the
        dialog's own <code>call.end(response)</code> runs.
      </p>
      <div class="controls">
        <button class="demo-btn-strong" type="button" @click="askConfirm">
          Ask for confirmation
        </button>
        <span class="result">result: {{ confirmResult }}</span>
      </div>
    </section>

    <section class="scene">
      <h2>stacking — concurrent call()s</h2>
      <p class="desc">
        Every <code>Stack.call(...)</code> while previous ones are still open stacks on top; each
        card reads its own <code>call.index</code>/<code>call.stackSize</code>, plus a shared
        <code>accent</code> color via <code>call.root</code>.
      </p>
      <div class="controls">
        <button class="demo-btn" type="button" @click="pushStackCard">Push a card</button>
      </div>
      <div class="stack-area">
        <Stack accent="#6366f1" />
        <p v-if="activeStackCount === 0" class="stack-placeholder">
          No cards yet — push one to see it stack.
        </p>
      </div>
    </section>

    <section class="scene">
      <h2>upsert() + update() — progress toast</h2>
      <p class="desc">
        <code>Toast.upsert(...)</code> reuses one instance instead of stacking a new one each time;
        <code>Toast.update(promise, partialProps)</code> patches it mid-flight, and the 220ms
        <code>unmountingDelay</code> lets the exit transition (driven by <code>call.ended</code>)
        finish before the toast is removed.
      </p>
      <div class="controls">
        <button class="demo-btn" type="button" @click="simulateUpload">Simulate upload</button>
      </div>
      <div class="toast-area">
        <Toast />
      </div>
    </section>

    <footer class="footer">
      <p>
        <a href="https://github.com/retronew/ui-kit" target="_blank" rel="noopener noreferrer"
          >@retronew/ui-kit</a
        >
      </p>
    </footer>
  </main>
</template>

<style scoped>
.page {
  position: relative;
  margin: 0 auto;
  max-width: 640px;
  padding: 48px 20px 80px;
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.hero p {
  margin: 0;
  color: var(--fg-muted);
}

.hero a {
  color: inherit;
}

.scene {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.scene h2 {
  margin: 0 0 8px;
  font-size: 16px;
}

.desc {
  margin: 0 0 14px;
  color: var(--fg-muted);
  font-size: 13px;
  line-height: 1.6;
}

.desc code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result {
  font-size: 13px;
  color: var(--fg-muted);
}

.stack-area {
  position: relative;
  height: 120px;
  margin-top: 16px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--surface-hover);
}

.stack-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0 16px;
  color: var(--fg-muted);
  font-size: 12px;
  text-align: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.toast-area {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 260px;
  z-index: 40;
}

.footer {
  margin-top: 56px;
  text-align: center;
  color: var(--fg-muted);
  font-size: 13px;
}

.footer a {
  color: inherit;
}
</style>
