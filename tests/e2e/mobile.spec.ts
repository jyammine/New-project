import { expect, test } from '@playwright/test'

test('mobile menu opens, navigates and closes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const menu = page.getByRole('dialog', { name: /menu/ })
  await expect(menu).toBeVisible()
  await menu.getByRole('link', { name: 'Knitwear' }).click()
  await expect(page).toHaveURL(/\/shop\/knitwear$/)
  await expect(menu).toBeHidden()
})

test('product page is usable on a phone', async ({ page }) => {
  await page.goto('/products/pom-pom-beanie-sage')
  await page.getByText('3–6 months').click()
  await page.getByRole('button', { name: 'Add to bag' }).click()
  await expect(page.getByRole('dialog', { name: /Your bag/ })).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(overflow).toBe(false)
})
