import fs from 'fs';
import path from 'path';
import creds, {
  ADMIN_STORAGE_STATE,
  CUSTOMER_STORAGE_STATE,
  CUSTOMER_USER_FILE,
} from '../fixtures/creds';
import { expect, test as setup } from '../pages/testExtender';

// The app keeps its JWT in localStorage["auth-token"]. Logging in through the API and writing
// that value into a storageState file is much faster than going through the login form,
// and every UI test that uses the file starts already signed in.
async function saveSession(file: string, baseURL: string, token: string): Promise<void> {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const state = {
    cookies: [],
    origins: [{ origin: baseURL, localStorage: [{ name: 'auth-token', value: token }] }],
  };
  fs.writeFileSync(file, JSON.stringify(state, null, 2));
}

setup('authenticate as admin', async ({ api, baseURL, browser }) => {
  const token = await api.getToken(creds.admin.email, creds.admin.password);
  await saveSession(ADMIN_STORAGE_STATE, baseURL, token);

  const context = await browser.newContext({ storageState: ADMIN_STORAGE_STATE });
  const page = await context.newPage();
  await page.goto('/admin/dashboard');
  await expect(page.getByTestId('page-title')).toHaveText('Sales over the years');
  await context.close();
});

setup('authenticate as customer', async ({ api, baseURL, browser }) => {
  const customer = await api.createUser({ first_name: 'Session', last_name: 'Customer' });
  const token = await api.getToken(customer.email, customer.password);
  await saveSession(CUSTOMER_STORAGE_STATE, baseURL, token);
  fs.writeFileSync(CUSTOMER_USER_FILE, JSON.stringify(customer, null, 2));

  const context = await browser.newContext({ storageState: CUSTOMER_STORAGE_STATE });
  const page = await context.newPage();
  await page.goto('/account');
  await expect(page.getByTestId('page-title')).toHaveText('My account');
  await context.close();
});
