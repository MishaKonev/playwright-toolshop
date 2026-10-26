import { expect, Locator, Page, test } from '@playwright/test';
import { Address } from '../interfaces/interfaces';
import { utils } from '../utils/utils';
import BasePage from './basePage.page';

export type PaymentMethod =
  | 'cash-on-delivery'
  | 'bank-transfer'
  | 'credit-card'
  | 'buy-now-pay-later'
  | 'gift-card';

export default class CheckoutPage extends BasePage {
  private cart: {
    rows: Locator;
    productTitle: (name: string) => Locator;
    lineQuantity: (name: string) => Locator;
    linePrice: (name: string) => Locator;
    cartTotal: Locator;
    proceedFromCart: Locator;
  };

  private signInStep: {
    loggedInMessage: Locator;
    proceed: Locator;
  };

  private addressStep: {
    country: Locator;
    postalCode: Locator;
    houseNumber: Locator;
    street: Locator;
    city: Locator;
    state: Locator;
    proceed: Locator;
  };

  private paymentStep: {
    paymentMethod: Locator;
    finishButton: Locator;
    successMessage: Locator;
  };

  constructor(page: Page) {
    super(page);
    const row = (name: string) =>
      page.locator('tr').filter({ has: page.getByTestId('product-title').getByText(name) });
    this.cart = {
      rows: page.locator('tbody tr').filter({ has: page.getByTestId('product-title') }),
      productTitle: (name) => row(name).getByTestId('product-title'),
      lineQuantity: (name) => row(name).getByTestId('product-quantity'),
      linePrice: (name) => row(name).getByTestId('line-price'),
      cartTotal: page.getByTestId('cart-total'),
      proceedFromCart: page.getByTestId('proceed-1'),
    };
    this.signInStep = {
      loggedInMessage: page.getByText('you are already logged in', { exact: false }),
      proceed: page.getByTestId('proceed-2'),
    };
    this.addressStep = {
      country: page.getByTestId('country'),
      postalCode: page.getByTestId('postal_code'),
      houseNumber: page.getByTestId('house_number'),
      street: page.getByTestId('street'),
      city: page.getByTestId('city'),
      state: page.getByTestId('state'),
      proceed: page.getByTestId('proceed-3'),
    };
    this.paymentStep = {
      paymentMethod: page.getByTestId('payment-method'),
      finishButton: page.getByTestId('finish'),
      successMessage: page.getByTestId('payment-success-message'),
    };
  }

  async getLinePrice(name: string): Promise<number> {
    return utils.parsePrice(await this.cart.linePrice(name).innerText());
  }

  async getCartTotal(): Promise<number> {
    return utils.parsePrice(await this.cart.cartTotal.innerText());
  }

  async verifyCartLine(name: string, quantity: number, unitPrice: number): Promise<void> {
    await test.step(`Verify cart line "${name}" x${quantity}`, async () => {
      await expect(this.cart.productTitle(name)).toBeVisible();
      await expect(this.cart.lineQuantity(name)).toHaveValue(String(quantity));
      expect(await this.getLinePrice(name)).toBeCloseTo(unitPrice * quantity, 2);
    });
  }

  async verifyCartTotalIsSumOfLines(): Promise<void> {
    await test.step('Verify cart total equals the sum of line prices', async () => {
      const lines = await this.cart.rows.getByTestId('line-price').allInnerTexts();
      const sum = lines.map(utils.parsePrice).reduce((a, b) => a + b, 0);
      expect(await this.getCartTotal()).toBeCloseTo(sum, 2);
    });
  }

  async proceedToSignIn(): Promise<void> {
    await test.step('Proceed from cart to sign-in step', async () => {
      await this.cart.proceedFromCart.click();
    });
  }

  async proceedAsLoggedInUser(): Promise<void> {
    await test.step('Proceed past sign-in step as a logged-in user', async () => {
      await expect(this.signInStep.loggedInMessage).toBeVisible();
      await this.signInStep.proceed.click();
    });
  }

  async fillBillingAddress(address: Address & { house_number?: string }): Promise<void> {
    await test.step('Fill billing address', async () => {
      await expect(this.addressStep.street).toBeVisible();
      const fields: [Locator, string][] = [
        [this.addressStep.postalCode, address.postal_code ?? ''],
        [this.addressStep.houseNumber, address.house_number ?? '1'],
        [this.addressStep.street, address.street ?? ''],
        [this.addressStep.city, address.city ?? ''],
        [this.addressStep.state, address.state ?? ''],
      ];
      // The form is prefilled from the user's profile asynchronously and that can overwrite
      // values typed a moment earlier, so refill until every value sticks
      await expect(async () => {
        if (address.country) await this.addressStep.country.selectOption(address.country);
        for (const [input, value] of fields) await input.fill(value);
        for (const [input, value] of fields)
          await expect(input).toHaveValue(value, { timeout: 1000 });
        await expect(this.addressStep.proceed).toBeEnabled({ timeout: 1000 });
      }).toPass({ timeout: 15_000 });
      await this.addressStep.proceed.click();
    });
  }

  async payWith(method: PaymentMethod): Promise<void> {
    await test.step(`Pay with "${method}"`, async () => {
      await this.paymentStep.paymentMethod.selectOption(method);
      await this.paymentStep.finishButton.click();
    });
  }

  async verifyPaymentSuccessful(): Promise<void> {
    await test.step('Verify payment was successful', async () => {
      await expect(this.paymentStep.successMessage).toContainText('Payment was successful');
    });
  }
}
