// @vitest-environment jsdom
import { type VueWrapper, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
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
    document.body.innerHTML = ''
    vi.useRealTimers()
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

  it('traps focus, closes with Escape, and restores focus to the trigger', async () => {
    wrapper = mount(App, { attachTo: document.body })
    const trigger = wrapper.find('.scene .demo-btn-strong')
    const triggerElement = trigger.element as HTMLButtonElement
    triggerElement.focus()
    await trigger.trigger('click')
    await nextTick()

    const cancel = wrapper.find('.dialog .demo-btn')
    const confirm = wrapper.find('.dialog .demo-btn-strong')
    expect(document.activeElement).toBe(cancel.element)

    const confirmElement = confirm.element as HTMLButtonElement
    confirmElement.focus()
    await confirm.trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(cancel.element)

    await cancel.trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(confirm.element)

    const dialog = wrapper.find('.dialog')
    expect(dialog.attributes('aria-labelledby')).toBe(wrapper.find('.title').attributes('id'))
    expect(dialog.attributes('aria-describedby')).toBe(wrapper.find('.message').attributes('id'))

    vi.useFakeTimers()
    await confirm.trigger('keydown', { key: 'Escape' })
    // ConfirmDialog's exit transition keeps the dialog mounted for
    // `unmountingDelay` (150ms) after `call.end()` before it's removed.
    await vi.advanceTimersByTimeAsync(150)
    await nextTick()

    expect(wrapper.find('.dialog').exists()).toBe(false)
    expect(document.activeElement).toBe(triggerElement)
    expect(wrapper.text()).toContain('cancelled')
  })

  it('finishes the void upload flow without leaving a toast behind', async () => {
    vi.useFakeTimers()
    wrapper = mount(App)
    const uploadButton = wrapper
      .findAll('.demo-btn')
      .find((button) => button.text() === 'Simulate upload')
    expect(uploadButton).toBeTruthy()

    await uploadButton?.trigger('click')
    await vi.runAllTimersAsync()
    await nextTick()

    expect(wrapper.findAll('.toast')).toHaveLength(0)
  })
})
