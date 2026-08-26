// @vitest-environment jsdom
import { type VueWrapper, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import App from '../src/App.vue'

describe('App', () => {
  // The demo's Callables (Confirm/Stack/Toast) are module-level singletons —
  // each only allows one mounted <Root> at a time — so every mounted App
  // must be torn down before the next test mounts a new one.
  let wrapper: VueWrapper | undefined
  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('runs the confirm scene end to end', async () => {
    wrapper = mount(App)

    await wrapper.find('.demo-btn-strong').trigger('click')
    await nextTick()

    const confirmButton = wrapper.find('.dialog .demo-btn-strong')
    expect(confirmButton.exists()).toBe(true)

    await confirmButton.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('confirmed')
  })

  it('stacks multiple cards from the stacking scene', async () => {
    wrapper = mount(App)

    const pushButton = wrapper.findAll('.demo-btn').find((w) => w.text() === 'Push a card')
    expect(pushButton).toBeTruthy()

    await pushButton?.trigger('click')
    await pushButton?.trigger('click')
    await nextTick()

    expect(wrapper.findAll('.stack-card')).toHaveLength(2)
  })
})
