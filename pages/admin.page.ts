import { expect, Locator, Page, test } from '@playwright/test';
import BasePage from './basePage.page';

export type AdminSection =
  | 'dashboard'
  | 'brands'
  | 'categories'
  | 'products'
  | 'orders'
  | 'users'
  | 'messages';

export default class AdminPage extends BasePage {
  private adminNav: {
    link: (section: AdminSection) => Locator;
  };

  private customerNav: {
    myAccount: Locator;
  };

  constructor(page: Page) {
    super(page);
    this.adminNav = {
      link: (section) => page.getByTestId(`nav-admin-${section}`),
    };
    this.customerNav = {
      myAccount: page.getByTestId('nav-my-account'),
    };
  }

  async navigate(section: AdminSection = 'dashboard'): Promise<void> {
    await this.open(`/admin/${section}`);
  }

  async verifyAdminMenu(sections: AdminSection[]): Promise<void> {
    await test.step('Verify admin menu items are available', async () => {
      await this.page.getByTestId('nav-menu').click();
      for (const section of sections) await expect(this.adminNav.link(section)).toBeVisible();
      await expect(this.customerNav.myAccount).toBeHidden();
    });
  }

  async verifyCustomerMenuOnly(): Promise<void> {
    await test.step('Verify the menu has customer items and no admin items', async () => {
      await this.page.getByTestId('nav-menu').click();
      await expect(this.customerNav.myAccount).toBeVisible();
      await expect(this.adminNav.link('dashboard')).toBeHidden();
    });
  }
}
