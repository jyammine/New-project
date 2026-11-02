import { expect, test } from '@playwright/test'

test.describe('storefront', () => {
  test('home page shows the hero, categories and featured products', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Soft beginnings for your little one' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Shop by category' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Little favourites' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Organic Cotton Bodysuit' }).first()).toBeVisible()
  })

  test('main navigation leads to category pages', async ({ page }) => {
    await page.goto('/')
    await page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Sleepwear' })
      .click()
    await expect(page).toHaveURL(/\/shop\/sleepwear$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Sleepwear' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Starry Night Zip Sleepsuit' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Chunky Knit Cardigan' })).toHaveCount(0)
  })

  test('search and size filters narrow the product list', async ({ page }) => {
    await page.goto('/shop')
    await page.getByRole('searchbox', { name: 'Search products' }).fill('sleepsuit')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page).toHaveURL(/q=sleepsuit/)
    await expect(page.getByText('2 products')).toBeVisible()

    await page.goto('/shop')
    await page.getByLabel('Size').selectOption('2-3y')
    await expect(page).toHaveURL(/size=2-3y/)
    await expect(page.getByText('1 product', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Chunky Knit Cardigan' })).toBeVisible()
  })

  test('product page has structured data and size selection', async ({ page }) => {
    await page.goto('/products/organic-cotton-bodysuit-oat')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Organic Cotton Bodysuit' }),
    ).toBeVisible()
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    const product = jsonLd
      .map((text) => JSON.parse(text))
      .find((data) => data['@type'] === 'Product')
    expect(product).toMatchObject({ name: 'Organic Cotton Bodysuit', offers: expect.any(Array) })
    expect(product.offers[0]).toMatchObject({ price: '22.00', priceCurrency: 'USD' })
  })

  test('sold-out sizes cannot be selected', async ({ page }) => {
    await page.goto('/products/polka-dot-bodysuit-cloud')
    await expect(page.getByRole('radio', { name: /Newborn/ })).toBeDisabled()
    await expect(page.getByText('Sale', { exact: true })).toHaveCount(0) // badge is only on cards
    await expect(page.getByText('Original price')).toBeAttached()
  })

  test('add to bag, change quantity and review the cart', async ({ page }) => {
    await page.goto('/products/frill-sleeve-romper-blush')
    await page.getByRole('button', { name: 'Add to bag' }).click()
    await expect(page.getByText('Please choose a size.')).toBeVisible()

    await page.getByText('6–12 months').click()
    await page.getByRole('button', { name: 'Increase quantity' }).click()
    await page.getByRole('button', { name: 'Add to bag' }).click()

    const drawer = page.getByRole('dialog', { name: /Your bag/ })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText('Frill Sleeve Romper')).toBeVisible()
    await expect(drawer.getByText('$72.00').first()).toBeVisible()
    await expect(drawer.getByText(/away from free shipping/)).toBeVisible()

    await drawer.getByRole('link', { name: /View bag/ }).click()
    await expect(page).toHaveURL(/\/cart$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Your bag' })).toBeVisible()
    await expect(page.getByText('$5.95')).toBeVisible()
    await expect(page.getByText('$77.95')).toBeVisible()

    await page
      .getByRole('group', { name: 'Quantity of Frill Sleeve Romper' })
      .getByRole('button', { name: 'Increase quantity' })
      .click()
    await expect(page.getByText('Free', { exact: true })).toBeVisible()
    await expect(page.getByText('$108.00').first()).toBeVisible()

    // The bag survives a reload.
    await page.reload()
    await expect(page.getByRole('link', { name: 'Frill Sleeve Romper' }).first()).toBeVisible()

    await page.getByRole('button', { name: 'Remove' }).click()
    await expect(page.getByRole('heading', { name: 'Your bag is empty' })).toBeVisible()
  })

  test('unknown pages show a friendly 404', async ({ page }) => {
    const response = await page.goto('/products/does-not-exist')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'This page has wandered off' })).toBeVisible()
  })
})

test.describe('forms', () => {
  test('contact form validates and saves the message', async ({ page }) => {
    await page.goto('/contact')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Please tell us your name.')).toBeVisible()

    await page.getByLabel('Name', { exact: true }).fill('E2E Parent')
    await page.getByLabel('Email', { exact: true }).fill('e2e@example.com')
    await page.getByLabel('Subject').fill('Sizing question')
    await page.getByLabel('Message').fill('Does the cardigan run large? Thank you!')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible()
  })

  test('newsletter signup in the footer', async ({ page }) => {
    await page.goto('/about')
    const footer = page.getByRole('contentinfo')
    await footer.getByPlaceholder('Your email address').fill(`e2e-${Date.now()}@example.com`)
    await footer.getByRole('button', { name: 'Subscribe' }).click()
    await expect(footer.getByText(/Thanks for subscribing/)).toBeVisible()
  })
})

test.describe('platform', () => {
  test('health check, robots and sitemap', async ({ request }) => {
    expect((await request.get('/api/health')).ok()).toBe(true)
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /admin')
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/products/organic-cotton-bodysuit-oat')
    expect(sitemap).toContain('/shop/sleepwear')
  })

  test('security headers are set', async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['x-powered-by']).toBeUndefined()
  })

  test('private data is not exposed through the API', async ({ request }) => {
    for (const collection of ['orders', 'inquiries', 'subscribers', 'users']) {
      const response = await request.get(`/api/${collection}`)
      expect(response.status(), collection).toBe(403)
    }
    expect((await request.post('/api/revalidate')).status()).toBe(401)
    const products = await (await request.get('/api/products?limit=100&depth=0')).json()
    expect(products.docs.every((p: { status: string }) => p.status === 'active')).toBe(true)
  })

  test('admin panel requires a login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/(login|create-first-user)/)
  })
})
