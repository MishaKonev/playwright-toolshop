import { test as base } from '@playwright/test';
import { ApiClient } from '../helpers/api/apiClient';
import { User } from '../interfaces/interfaces';
import AdminPage from './admin.page';
import BasePage from './basePage.page';
import CatalogPage from './catalog.page';
import CheckoutPage from './checkout.page';
import LoginPage from './login.page';
import ProductDetailsPage from './productDetails.page';

type MyPages = {
  basePage: BasePage;
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  productDetailsPage: ProductDetailsPage;
  checkoutPage: CheckoutPage;
  adminPage: AdminPage;
};

type MyFixtures = {
  // Anonymous API client, disposed after the test
  api: ApiClient;
  // A brand-new customer registered via API for this test only
  newCustomer: User;
};

export const test = base.extend<MyPages & MyFixtures>({
  basePage: async ({ page }, use) => await use(new BasePage(page)),
  loginPage: async ({ page }, use) => await use(new LoginPage(page)),
  catalogPage: async ({ page }, use) => await use(new CatalogPage(page)),
  productDetailsPage: async ({ page }, use) => await use(new ProductDetailsPage(page)),
  checkoutPage: async ({ page }, use) => await use(new CheckoutPage(page)),
  adminPage: async ({ page }, use) => await use(new AdminPage(page)),

  api: async ({}, use) => {
    const api = await ApiClient.create();
    await use(api);
    await api.dispose();
  },

  newCustomer: async ({ api }, use) => {
    await use(await api.createUser());
  },
});

export { expect } from '@playwright/test';
