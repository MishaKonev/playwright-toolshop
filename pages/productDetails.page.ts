import { expect, Locator, Page, test } from '@playwright/test';
import { utils } from '../utils/utils';
import BasePage from './basePage.page';

export default class ProductDetailsPage extends BasePage {
  private details: {
    name: Locator;
    unitPrice: Locator;
    quantityInput: Locator;
    increaseQuantity: Locator;
    decreaseQuantity: Locator;
    addToCartButton: Locator;
    addToFavoritesButton: Locator;
  };

  constructor(page: Page) {
    super(page);
    this.details = {
      name: page.getByTestId('product-name'),
      unitPrice: page.getByTestId('unit-price'),
      quantityInput: page.getByTestId('quantity'),
      increaseQuantity: page.getByTestId('increase-quantity'),
      decreaseQuantity: page.getByTestId('decrease-quantity'),
      addToCartButton: page.getByTestId('add-to-cart'),
      addToFavoritesButton: page.getByTestId('add-to-favorites'),
    };
  }

  async navigate(productId: string): Promise<void> {
    await this.open(`/product/${productId}`);
    await expect(this.details.name).toBeVisible();
  }

  async getUnitPrice(): Promise<number> {
    return utils.parsePrice(await this.details.unitPrice.innerText());
  }

  async setQuantity(quantity: number): Promise<void> {
    await test.step(`Set quantity to ${quantity}`, async () => {
      await this.details.quantityInput.fill(String(quantity));
    });
  }

  async increaseQuantity(times = 1): Promise<void> {
    await test.step(`Increase quantity ${times} time(s)`, async () => {
      for (let i = 0; i < times; i++) await this.details.increaseQuantity.click();
    });
  }

  async addToCart(): Promise<void> {
    await test.step('Add product to cart', async () => {
      await this.details.addToCartButton.click();
      await this.verifyToast('Product added to shopping cart.');
    });
  }

  async addToFavorites(): Promise<void> {
    await test.step('Add product to favorites', async () => {
      await this.details.addToFavoritesButton.click();
    });
  }

  async verifyProduct(name: string, price: number): Promise<void> {
    await test.step(`Verify product "${name}" costs ${price}`, async () => {
      await expect(this.details.name).toHaveText(name);
      expect(await this.getUnitPrice()).toBe(price);
    });
  }

  async verifyQuantity(quantity: number): Promise<void> {
    await expect(this.details.quantityInput).toHaveValue(String(quantity));
  }
}
