import { expect, test } from '@playwright/test'

test('home page loads the DevPockit tool catalog', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /your essential dev tools at your fingertips/i })).toBeVisible()
  await expect(page.getByText('JSON Formatter', { exact: true }).first()).toBeVisible()
})

test('JSON Formatter accepts an example and formats it', async ({ page }) => {
  await page.goto('/tools/formatters/json-formatter/1/')

  await expect(page.getByRole('heading', { name: 'JSON Formatter' })).toBeVisible()
  await page.getByRole('button', { name: 'Load Examples' }).click()
  await page.getByRole('menuitem', { name: 'Load Valid Example' }).click()
  await page.getByRole('button', { name: 'Format', exact: true }).click()

  await expect(page.getByText(/\d+ total keys/)).toBeVisible()
})
