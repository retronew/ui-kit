import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173'
const outputDir = resolve('output/playwright')
const tracePath = resolve(outputDir, 'toast-motion-trace.zip')

await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext()
await context.tracing.start({ screenshots: true, snapshots: true, sources: true })
const page = await context.newPage()
await page.goto(baseURL)
await page.getByRole('button', { name: 'Render a toast' }).click()
const wrapper = page.locator('[data-toast-wrapper][data-toast-status="visible"]').first()
await wrapper.hover()
await page.waitForTimeout(500)
await page.keyboard.press('Alt+t')
await page.keyboard.press('Escape')
await page.waitForTimeout(500)
await context.tracing.stop({ path: tracePath })
await browser.close()
console.log(`Motion trace written to ${tracePath}`)
