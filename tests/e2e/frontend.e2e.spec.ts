import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('homepage opens the notebook', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveURL(/\/prototype\.html/)
    await expect(page).toHaveTitle(/Iron Notebook/)
  })
})
