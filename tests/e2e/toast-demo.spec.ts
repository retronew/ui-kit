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
