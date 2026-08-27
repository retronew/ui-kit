import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Brand CTAs intentionally use the Vue green and white identity.
const brandActionSelector = '[class*="bg-[var(--color-brand)]"]'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('runs a real callable and restores focus after Escape', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Run it' }).nth(1)
  await trigger.focus()
  await trigger.click()

  const dialog = page.getByRole('dialog', { name: 'Continue?' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Continue' })).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Continue' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expect(page.getByText('false', { exact: true }).first()).toBeVisible()
})

test('keeps concurrent calls isolated and retries a mutation in place', async ({ page }) => {
  const stack = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Many calls. One Root. No conflict.' }),
  })
  await stack.scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)
  const open = stack.getByRole('button', { name: 'Open another' })
  await open.click()
  await open.click()
  await expect(stack.getByText('2 / 5 active', { exact: true })).toBeVisible()
  await stack.getByRole('button', { name: 'Close all' }).click()
  await expect(stack.getByText('0 / 5 active', { exact: true })).toBeVisible()

  const mutation = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Stay open on failure. Close on success.' }),
  })
  await mutation.scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)
  await mutation.getByRole('checkbox', { name: 'Make it fail' }).check()
  await mutation.getByRole('button', { name: 'Open Save dialog' }).click()
  const dialog = mutation.getByRole('dialog', { name: 'Save changes' })
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(mutation.getByText('caught → pending clears, call stays open')).toBeVisible({
    timeout: 4000,
  })
  await expect(dialog).toBeVisible()

  await mutation.getByRole('checkbox', { name: 'Make it fail' }).uncheck()
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(mutation.getByText('success → call.end("saved")')).toBeVisible({ timeout: 4000 })
  await expect(dialog).toHaveCount(0)
})

test('renders comparison comments as secondary code', async ({ page }) => {
  const comparison = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'One question. One handler.' }),
  })
  const colors = await comparison
    .locator('pre')
    .evaluateAll((blocks) =>
      blocks.map((block) => [
        getComputedStyle(block).color,
        getComputedStyle(block.querySelector('span')!).color,
      ]),
    )

  expect(colors).toHaveLength(2)
  for (const [commentColor, codeColor] of colors) {
    expect(commentColor).not.toBe(codeColor)
  }
})

test('uses semantic inline code for homepage API names', async ({ page }) => {
  const comparison = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'One question. One handler.' }),
  })

  await expect(comparison.locator('p code').filter({ hasText: 'ref' })).toHaveCount(1)
  await expect(comparison.locator('p code').filter({ hasText: 'call()' })).toHaveCount(1)

  const mutation = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Stay open on failure. Close on success.' }),
  })
  await expect(mutation.locator('p code').filter({ hasText: 'mutationFn' })).toHaveCount(1)
  await expect(mutation.locator('p code').filter({ hasText: 'call.end()' })).toHaveCount(1)
})

test('serves complete localized routes and preserves the document language', async ({ page }) => {
  await page.locator('summary[aria-label="Language"]').click()
  await page.getByRole('link', { name: '简体中文' }).click()

  await expect(page).toHaveURL(/\/zh-cn\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('你的组件也可以')
  await page.getByRole('link', { name: '核心概念' }).first().click()
  await expect(page).toHaveURL(/\/zh-cn\/concepts\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('核心概念')

  await page.goto('/ja/guides/typescript')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('TypeScript と Vue SFC')
})

test('keeps the Why page structurally equivalent across all locales', async ({ page }) => {
  const pages = [
    ['/', 'See it on real examples'],
    ['/zh-cn/why', '查看真实示例'],
    ['/ja/why', '実際のサンプルを見る'],
  ] as const

  for (const [path, cta] of pages) {
    await page.goto(path === '/' ? '/why' : path)
    await expect(page.locator('.expressive-code')).toHaveCount(2)
    await expect(page.locator('.prose-call-vue h2')).toHaveCount(4)
    await expect(
      page.locator('.prose-call-vue > p code').filter({ hasText: 'await Confirm.call()' }),
    ).toHaveCount(1)
    await expect(page.locator('.prose-call-vue > p code')).toHaveCount(5)
    const primaryAction = page.getByRole('link', { name: cta })
    await expect(primaryAction).toHaveCSS('display', 'flex')
    await expect(primaryAction).toHaveCSS('align-items', 'center')
    await expect(primaryAction).toHaveCSS('height', '36px')
    await expect(primaryAction).toHaveCSS('color', 'rgb(255, 255, 255)')
  }

  await page.goto('/why')
  await expect(page.locator('.expressive-code .ec-line.mark').first()).toHaveCSS(
    'background-color',
    'rgba(66, 184, 131, 0.18)',
  )
})

test('applies the preferred theme before hydration and passes axe', async ({ page }) => {
  const lightResults = await new AxeBuilder({ page }).exclude(brandActionSelector).analyze()
  expect(lightResults.violations).toEqual([])

  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await page.reload()

  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()
  const results = await new AxeBuilder({ page }).exclude(brandActionSelector).analyze()
  expect(results.violations).toEqual([])
})

test('keeps navigation usable on a mobile viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Mobile navigation is tested once')

  const menu = page.getByRole('button', { name: 'Open menu' })
  await menu.click()
  await expect(page.getByRole('navigation', { name: 'Site' })).toBeVisible()

  const referenceLink = page.getByRole('link', { name: 'Full reference' }).last()
  await expect(referenceLink).toHaveAttribute('target', '_blank')
  await expect(referenceLink).toHaveAttribute(
    'href',
    'https://github.com/retronew/ui-kit/tree/main/packages/call-vue#readme',
  )
})
