import { Page } from '@playwright/test';
import { Paginated, Product } from '../interfaces/interfaces';

// The app loads the catalog with an HTTP QUERY request to /products (filters go in the body),
// so the pattern matches the bare path and leaves /products/{id} and /products/search alone
const PRODUCT_LIST = /api\.practicesoftwaretesting\.com\/products(\?.*)?$/;

export const mocks = {
  // Patches the real response instead of inventing one from scratch: the UI needs fields
  // (images, category, brand...) that a hand-written product would miss, so each override
  // is merged into a real product and only the fields under test are changed.
  async productList(page: Page, overrides: Partial<Product>[]): Promise<void> {
    await page.route(PRODUCT_LIST, async (route) => {
      const response = await route.fetch();
      const body: Paginated<Product> = await response.json();
      const data = overrides.map((override, i) => ({ ...body.data[i], ...override }));
      await route.fulfill({
        response,
        json: {
          ...body,
          data,
          from: data.length ? 1 : 0,
          to: data.length,
          total: data.length,
          last_page: 1,
        },
      });
    });
  },

  async productListError(page: Page, status = 500): Promise<void> {
    await page.route(PRODUCT_LIST, (route) =>
      route.fulfill({ status, json: { message: 'Server Error' } })
    );
  },
};
