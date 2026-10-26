import { expect, test } from '../../pages/testExtender';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test(
    'Customer can log in with valid credentials',
    { tag: '@smoke' },
    async ({ loginPage, newCustomer, page }) => {
      await loginPage.login(newCustomer.email, newCustomer.password);
      await expect(page).toHaveURL(/\/account$/);
      await loginPage.verifyPageTitle('My account');
      await loginPage.verifySignedInAs(`${newCustomer.first_name} ${newCustomer.last_name}`);
    }
  );

  test('Customer cannot log in with a wrong password', async ({ loginPage, newCustomer }) => {
    await loginPage.login(newCustomer.email, 'Wrong!Pass#123');
    await loginPage.verifyLoginError('Invalid email or password');
  });

  test('Login form requires email and password', async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.verifyRequiredFieldErrors();
  });

  test('Customer can sign out', async ({ loginPage, newCustomer }) => {
    await loginPage.login(newCustomer.email, newCustomer.password);
    await loginPage.verifyPageTitle('My account');
    await loginPage.signOut();
    await loginPage.verifyLoginFormVisible();
    await loginPage.verifySignedOut();
  });
});
