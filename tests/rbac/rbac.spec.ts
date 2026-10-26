import { ADMIN_STORAGE_STATE, CUSTOMER_STORAGE_STATE } from '../../fixtures/creds';
import { AdminSection } from '../../pages/admin.page';
import { expect, test } from '../../pages/testExtender';

const adminSections: AdminSection[] = ['dashboard', 'products', 'orders', 'users'];

test.describe('Role-based access control', () => {
  test.describe('Admin', () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    test('sees the admin menu and no customer menu', { tag: '@smoke' }, async ({ adminPage }) => {
      await adminPage.navigate('dashboard');
      await adminPage.verifyAdminMenu(adminSections);
    });

    for (const section of adminSections) {
      test(`can open admin "${section}"`, async ({ adminPage, page }) => {
        await adminPage.navigate(section);
        await expect(page).toHaveURL(new RegExp(`/admin/${section}`));
        await expect(page.getByTestId('page-title')).toBeVisible();
      });
    }
  });

  test.describe('Customer', () => {
    test.use({ storageState: CUSTOMER_STORAGE_STATE });

    test('sees only the customer menu', async ({ adminPage }) => {
      await adminPage.open('/account');
      await adminPage.verifyCustomerMenuOnly();
    });

    for (const section of adminSections) {
      test(`is redirected away from admin "${section}"`, async ({ adminPage, page }) => {
        await adminPage.navigate(section);
        await expect(page).not.toHaveURL(/\/admin\//);
      });
    }
  });

  test.describe('Guest', () => {
    for (const path of ['/account', '/admin/dashboard']) {
      test(`is sent to login when opening "${path}"`, async ({ loginPage }) => {
        await loginPage.open(path);
        await loginPage.verifyLoginFormVisible();
      });
    }
  });
});
