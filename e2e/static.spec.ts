import { expect, test } from '@playwright/test'

test('static export serves the home page and its app assets', async ({ page }) => {
  const failedAssets: string[] = []
  page.on('response', (response) => {
    const url = new URL(response.url())
    if (url.origin === 'http://127.0.0.1:3101' && response.status() >= 400) {
      failedAssets.push(`${response.status()} ${url.pathname}`)
    }
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: /your essential dev tools at your fingertips/i })).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          performance
            .getEntriesByType('resource')
            .filter((entry) => /\/_next\/static\/.+\.(js|css)(\?|$)/.test(entry.name)).length
      )
    )
    .toBeGreaterThan(0)
  expect(failedAssets, `Failed static app assets: ${failedAssets.join(', ')}`).toEqual([])
})

test('static export serves the JSON Formatter route and assets', async ({ page }) => {
  const response = await page.goto('/tools/formatters/json-formatter/1/')

  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveTitle(/JSON Formatter/)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          performance.getEntriesByType('resource').filter((entry) => /\/_next\/static\/.+\.js(\?|$)/.test(entry.name))
            .length
      )
    )
    .toBeGreaterThan(0)
})
