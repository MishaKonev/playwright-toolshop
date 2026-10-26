import { mocks } from '../../helpers/mocks';
import { expect, test } from '../../pages/testExtender';

// These tests replace backend responses with page.route(), so the UI can be checked
// in states that are hard to get from a real shared environment.
test.describe('Catalog with mocked API', () => {
  test('renders exactly the products returned by the API', async ({ catalogPage, page }) => {
    const products = [
      { name: 'Mocked Golden Hammer', price: 999.99 },
      { name: 'Mocked Silver Saw', price: 12.5 },
    ];
    await mocks.productList(page, products);

    await catalogPage.navigate();
    await catalogPage.verifyProductsShown(products.map((p) => p.name));
    expect(await catalogPage.getProductPrices()).toEqual([999.99, 12.5]);
  });

  test('shows no product cards when the API returns an empty list', async ({ page }) => {
    await mocks.productList(page, []);
    // Without this wait "0 cards" would pass before the mocked response even arrives
    const loaded = page.waitForResponse((r) => r.url().endsWith('/products'));
    await page.goto('/');
    await loaded;
    await expect(page.getByTestId('search-query')).toBeVisible();
    await expect(page.locator('a[data-test^="product-"]')).toHaveCount(0);
  });

  test('does not crash when the product API returns 500', async ({ page }) => {
    await mocks.productListError(page, 500);
    const failed = page.waitForResponse((r) => r.url().includes('/products') && r.status() === 500);
    await page.goto('/');
    await failed;
    // The shell of the page (navigation and search) must survive a backend error
    await expect(page.getByTestId('nav-home')).toBeVisible();
    await expect(page.getByTestId('search-query')).toBeVisible();
    await expect(page.locator('a[data-test^="product-"]')).toHaveCount(0);
  });
});
