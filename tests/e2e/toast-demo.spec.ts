import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('has no detectable accessibility violations in the default page and toast state', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Render a toast' }).click()
  await expect(page.getByRole('status')).toContainText('Hello there!')
  const wrapper = page.locator('[data-toast-wrapper]').first()
  await expect(wrapper).toHaveCSS('filter', 'blur(0px)')
  await expect(wrapper).toHaveCSS('will-change', 'auto')

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('focuses, dismisses, and restores focus with the keyboard', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Render a toast' })
  await trigger.focus()
  await trigger.click()
  await page.keyboard.press('Alt+t')

  const wrapper = page.locator('[data-toast-wrapper]').first()
  await expect(wrapper).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-toast-wrapper][data-toast-status="visible"]')).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test('follows reduced motion and keeps the live-region semantics', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Render a toast' }).click()

  const wrapper = page.locator('[data-toast-wrapper]').first()
  await expect(wrapper).toHaveCSS('transition-property', 'none')
  await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite')
})

test('persists explicit themes and resumes following the system theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  const themeButton = page.locator('[data-theme-preference]')
  await expect(themeButton).toHaveAccessibleName(/Current theme: System/)

  await themeButton.click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(themeButton).toHaveAccessibleName(/Current theme: Light/)
  await page.reload()
  await expect(themeButton).toHaveAccessibleName(/Current theme: Light/)

  await themeButton.click()
  await expect(themeButton).toHaveAccessibleName(/Current theme: Dark/)
  await expect(page.locator('html')).toHaveClass(/dark/)
  await themeButton.click()
  await expect(themeButton).toHaveAccessibleName(/Current theme: System/)
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('dismisses a toast with an outward touch swipe', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile-chromium',
    'Touch regression runs on the mobile project',
  )
  await page.getByRole('button', { name: 'Render a toast' }).click()
  const wrapper = page.locator('[data-toast-wrapper]').first()
  await expect(wrapper).toBeVisible()
  const box = await wrapper.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  const x = box.x + box.width / 2
  const startY = box.y + box.height / 2
  await wrapper.dispatchEvent('pointerdown', {
    button: 0,
    clientX: x,
    clientY: startY,
    pointerId: 1,
    pointerType: 'touch',
  })
  await wrapper.dispatchEvent('pointermove', {
    clientX: x,
    clientY: startY - 45,
    pointerId: 1,
    pointerType: 'touch',
  })
  await wrapper.dispatchEvent('pointermove', {
    clientX: x,
    clientY: startY - 120,
    pointerId: 1,
    pointerType: 'touch',
  })
  await wrapper.dispatchEvent('pointerup', {
    clientX: x,
    clientY: startY - 120,
    pointerId: 1,
    pointerType: 'touch',
  })

  await expect(page.locator('[data-toast-wrapper][data-toast-status="visible"]')).toHaveCount(0)
})

test('ignores a swipe once swipe-dismiss is turned off, and resumes once back on', async ({
  page,
}) => {
  const dismissSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Dismiss gestures' }),
  })
  // Toggling fires its own announcement toast, so scope every later
  // assertion to this toast's own id rather than a plain `.first()`.
  await dismissSection.getByRole('button', { name: 'Off' }).first().click()

  await page.getByRole('button', { name: 'Render a toast' }).click()
  const id = await page.locator('[data-toast-wrapper]').first().getAttribute('data-toast-wrapper')
  const testToast = page.locator(`[data-toast-wrapper="${id}"]`)
  await expect(testToast).toBeVisible()
  const box = await testToast.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return
  const x = box.x + box.width / 2
  const startY = box.y + box.height / 2

  await testToast.dispatchEvent('pointerdown', {
    button: 0,
    clientX: x,
    clientY: startY,
    pointerId: 1,
    pointerType: 'touch',
  })
  await testToast.dispatchEvent('pointermove', { clientX: x, clientY: startY - 120, pointerId: 1 })
  await testToast.dispatchEvent('pointerup', { clientX: x, clientY: startY - 120, pointerId: 1 })

  await expect(testToast).toHaveAttribute('data-toast-status', 'visible')
  await expect(testToast).toHaveCSS('touch-action', 'auto')

  await dismissSection.getByRole('button', { name: 'On' }).first().click()
  await testToast.dispatchEvent('pointerdown', {
    button: 0,
    clientX: x,
    clientY: startY,
    pointerId: 2,
    pointerType: 'touch',
  })
  // Two incremental moves (matching the baseline swipe test) give the
  // gesture a measurable velocity instead of one instantaneous jump.
  await testToast.dispatchEvent('pointermove', { clientX: x, clientY: startY - 45, pointerId: 2 })
  await testToast.dispatchEvent('pointermove', { clientX: x, clientY: startY - 120, pointerId: 2 })
  await testToast.dispatchEvent('pointerup', { clientX: x, clientY: startY - 120, pointerId: 2 })

  await expect(testToast).toHaveCount(0)
})

test('ignores Escape once escape-dismiss is turned off, and resumes once back on', async ({
  page,
}) => {
  const dismissSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Dismiss gestures' }),
  })
  await dismissSection.getByRole('button', { name: 'Off' }).nth(1).click()

  const trigger = page.getByRole('button', { name: 'Render a toast' })
  await trigger.click()
  await page.keyboard.press('Alt+t')
  // Alt+T focuses the frontmost toast — the one just rendered, not the
  // toggle's own announcement toast (older, so no longer frontmost).
  const testToast = page.locator('[data-toast-wrapper]').first()
  await expect(testToast).toBeFocused()
  const id = await testToast.getAttribute('data-toast-wrapper')
  const scopedToast = page.locator(`[data-toast-wrapper="${id}"]`)

  await page.keyboard.press('Escape')
  await expect(scopedToast).toHaveAttribute('data-toast-status', 'visible')

  await dismissSection.getByRole('button', { name: 'On' }).nth(1).click()
  await scopedToast.focus()
  await page.keyboard.press('Escape')
  await expect(scopedToast).toHaveCount(0)
})

test('ignores swipe via a per-toast meta override, independent of Escape and the global toggle', async ({
  page,
}) => {
  const dismissSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Dismiss gestures' }),
  })
  // Global toggle stays at its default `on` — the per-toast override should win regardless.
  await dismissSection.getByRole('button', { name: 'No swipe' }).click()
  const testToast = page.locator('[data-toast-wrapper]').first()
  await expect(testToast).toBeVisible()

  const box = await testToast.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return
  const x = box.x + box.width / 2
  const startY = box.y + box.height / 2
  await testToast.dispatchEvent('pointerdown', {
    button: 0,
    clientX: x,
    clientY: startY,
    pointerId: 1,
    pointerType: 'touch',
  })
  await testToast.dispatchEvent('pointermove', { clientX: x, clientY: startY - 45, pointerId: 1 })
  await testToast.dispatchEvent('pointermove', { clientX: x, clientY: startY - 120, pointerId: 1 })
  await testToast.dispatchEvent('pointerup', { clientX: x, clientY: startY - 120, pointerId: 1 })
  await expect(testToast).toHaveAttribute('data-toast-status', 'visible')

  // Escape isn't overridden on this toast, so it still works.
  await testToast.focus()
  await page.keyboard.press('Escape')
  await expect(testToast).toHaveCount(0)
})

test('ignores Escape via a per-toast meta override, independent of swipe and the global toggle', async ({
  page,
}) => {
  const dismissSection = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Dismiss gestures' }),
  })
  await dismissSection.getByRole('button', { name: 'No escape' }).click()
  const testToast = page.locator('[data-toast-wrapper]').first()
  await expect(testToast).toBeVisible()

  await testToast.focus()
  await page.keyboard.press('Escape')
  await expect(testToast).toHaveAttribute('data-toast-status', 'visible')

  // Only the toast's own dismiss button can close it once Escape is out of the picture.
  await testToast.getByRole('button', { name: 'Dismiss' }).click()
  await expect(testToast).toHaveCount(0)
})
