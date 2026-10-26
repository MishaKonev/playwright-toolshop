import { expect, Locator, Page, test } from '@playwright/test';

export default class BasePage {
  protected readonly page: Page;

  private header: {
    signInLink: Locator;
    userMenu: Locator;
    signOutLink: Locator;
    cartLink: Locator;
    cartQuantity: Locator;
    pageTitle: Locator;
    toast: Locator;
  };

  constructor(page: Page) {
    this.page = page;
    this.header = {
      signInLink: page.getByTestId('nav-sign-in'),
      userMenu: page.getByTestId('nav-menu'),
      signOutLink: page.getByTestId('nav-sign-out'),
      cartLink: page.getByTestId('nav-cart'),
      cartQuantity: page.getByTestId('cart-quantity'),
      pageTitle: page.getByTestId('page-title'),
      toast: page.getByRole('alert'),
    };
  }

  async open(path: string): Promise<void> {
    await test.step(`Open "${path}"`, async () => {
      await this.page.goto(path);
    });
  }

  async openCart(): Promise<void> {
    await test.step('Open the cart', async () => {
      await this.header.cartLink.click();
      await expect(this.page).toHaveURL(/\/checkout/);
    });
  }

  async signOut(): Promise<void> {
    await test.step('Sign out', async () => {
      await this.header.userMenu.click();
      await this.header.signOutLink.click();
    });
  }

  async verifyPageTitle(title: string): Promise<void> {
    await test.step(`Verify page title is "${title}"`, async () => {
      await expect(this.header.pageTitle).toHaveText(title);
    });
  }

  async verifySignedInAs(fullName: string): Promise<void> {
    await test.step(`Verify user "${fullName}" is signed in`, async () => {
      await expect(this.header.userMenu).toContainText(fullName);
      await expect(this.header.signInLink).toBeHidden();
    });
  }

  async verifySignedOut(): Promise<void> {
    await test.step('Verify no user is signed in', async () => {
      await expect(this.header.signInLink).toBeVisible();
      await expect(this.header.userMenu).toBeHidden();
    });
  }

  async verifyCartQuantity(quantity: number): Promise<void> {
    await test.step(`Verify cart badge shows ${quantity}`, async () => {
      await expect(this.header.cartQuantity).toHaveText(String(quantity));
    });
  }

  async verifyToast(text: string): Promise<void> {
    await test.step(`Verify toast "${text}"`, async () => {
      await expect(this.header.toast.filter({ hasText: text })).toBeVisible();
    });
  }
}
