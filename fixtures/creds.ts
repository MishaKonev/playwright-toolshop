// The admin account is the public demo account published by Practice Software Testing.
// Customers are not shared: every run registers its own users through the API
// (see helpers/api/apiClient.ts), so tests never depend on demo accounts someone else locked.
export const API_URL = process.env.API_URL || 'https://api.practicesoftwaretesting.com';

export const ADMIN_STORAGE_STATE = 'playwright/.auth/admin.json';
export const CUSTOMER_STORAGE_STATE = 'playwright/.auth/customer.json';
export const CUSTOMER_USER_FILE = 'playwright/.auth/customer-user.json';

export default {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@practicesoftwaretesting.com',
    password: process.env.ADMIN_PASSWORD || 'welcome01',
  },
  defaultPassword: process.env.CUSTOMER_PASSWORD || 'Str0ng!Pass#2026',
};
