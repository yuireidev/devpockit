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

test('CSV to Markdown converter loads an example and swaps direction', async ({ page }) => {
  await page.goto('/tools/converters/csv-markdown-converter/1/')

  await expect(page.getByRole('heading', { name: 'CSV ↔ Markdown Table Converter' })).toBeVisible()
  await page.getByRole('button', { name: 'Load Example' }).click()
  await page.getByRole('menuitem', { name: 'Raw CSV' }).click()

  await expect(page.getByText('detected: csv')).toBeVisible()
  await expect(page.getByText(/2 rows × 3 cols/).first()).toBeVisible()
  await expect(page.getByText('| Name | Age | City |').first()).toBeVisible()

  await page.getByRole('button', { name: 'Swap' }).click()

  await expect(page.getByText(/Output \(CSV\)/)).toBeVisible()
  await expect(page.getByText('detected: markdown')).toBeVisible()
})
