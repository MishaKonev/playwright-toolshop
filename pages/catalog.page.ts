import { expect, Locator, Page, test } from '@playwright/test';
import { utils } from '../utils/utils';
import BasePage from './basePage.page';

export type SortOption = 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';

export default class CatalogPage extends BasePage {
  private catalog: {
    searchInput: Locator;
    searchSubmit: Locator;
    searchReset: Locator;
    searchCaption: Locator;
    noResults: Locator;
    sortSelect: Locator;
    productCards: Locator;
    productNames: Locator;
    productPrices: Locator;
    productCard: (name: string) => Locator;
  };

  constructor(page: Page) {
    super(page);
    const productCards = page.locator('a[data-test^="product-"]');
    this.catalog = {
      searchInput: page.getByTestId('search-query'),
      searchSubmit: page.getByTestId('search-submit'),
      searchReset: page.getByTestId('search-reset'),
      searchCaption: page.getByTestId('search-caption'),
      noResults: page.getByTestId('no-results'),
      sortSelect: page.getByTestId('sort'),
      productCards,
      productNames: productCards.getByTestId('product-name'),
      productPrices: productCards.getByTestId('product-price'),
      productCard: (name: string) =>
        productCards.filter({
          has: page.getByTestId('product-name').getByText(name, { exact: true }),
        }),
    };
  }

  async navigate(): Promise<void> {
    await this.open('/');
    await expect(this.catalog.productCards.first()).toBeVisible();
  }

  async search(query: string): Promise<void> {
    await test.step(`Search for "${query}"`, async () => {
      const response = this.page.waitForResponse(/\/products\/search/);
      await this.catalog.searchInput.fill(query);
      await this.catalog.searchSubmit.click();
      await response;
    });
  }

  async sortBy(option: SortOption): Promise<void> {
    await test.step(`Sort products by "${option}"`, async () => {
      // The catalog uses an HTTP QUERY request with the sort order in the body, not the URL
      const response = this.page.waitForResponse(
        (r) => r.url().endsWith('/products') && (r.request().postData() ?? '').includes(option)
      );
      await this.catalog.sortSelect.selectOption(option);
      await response;
    });
  }

  async openProduct(name: string): Promise<void> {
    await test.step(`Open product "${name}"`, async () => {
      await this.catalog.productCard(name).click();
      await expect(this.page).toHaveURL(/\/product\//);
    });
  }

  async getProductNames(): Promise<string[]> {
    await expect(this.catalog.productNames.first()).toBeVisible();
    return (await this.catalog.productNames.allInnerTexts()).map((n) => n.trim());
  }

  async getProductPrices(): Promise<number[]> {
    await expect(this.catalog.productPrices.first()).toBeVisible();
    return (await this.catalog.productPrices.allInnerTexts()).map(utils.parsePrice);
  }

  async verifyAllProductNamesContain(text: string): Promise<void> {
    await test.step(`Verify every result contains "${text}"`, async () => {
      await expect(this.catalog.searchCaption).toContainText(text);
      const names = await this.getProductNames();
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) expect(name.toLowerCase()).toContain(text.toLowerCase());
    });
  }

  async verifyNoResults(): Promise<void> {
    await test.step('Verify "no products" message', async () => {
      await expect(this.catalog.noResults).toHaveText('There are no products found.');
      await expect(this.catalog.productCards).toHaveCount(0);
    });
  }

  async verifyProductsShown(names: string[]): Promise<void> {
    await test.step(`Verify the catalog shows exactly: ${names.join(', ')}`, async () => {
      await expect(this.catalog.productNames).toHaveText(names);
    });
  }
}
