import creds from '../../fixtures/creds';
import { ApiClient } from '../../helpers/api/apiClient';
import { createUserPayload } from '../../helpers/payloads';
import { expect, test } from '../../pages/testExtender';

test.describe('Users API', () => {
  test('POST /users/register creates a user', { tag: '@smoke' }, async ({ api }) => {
    const payload = createUserPayload();
    const response = await api.register(payload);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
    });
    expect(body.id).toBeTruthy();
    expect(body).not.toHaveProperty('password');
  });

  test('POST /users/register validates required fields', async ({ api }) => {
    const response = await api.register({});

    expect(response.status()).toBe(422);
    const body = await response.json();
    for (const field of ['first_name', 'last_name', 'email', 'password']) {
      expect(body[field], `error for "${field}"`).toBeDefined();
    }
  });

  test('POST /users/register rejects a duplicate email', async ({ api, newCustomer }) => {
    const response = await api.register(createUserPayload({ email: newCustomer.email }));

    expect(response.status()).toBe(409);
    expect((await response.json()).email[0]).toContain('already exists');
  });

  test('POST /users/login returns a token for valid credentials', async ({ api, newCustomer }) => {
    const response = await api.login(newCustomer.email, newCustomer.password);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.access_token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    expect(body.token_type).toBe('bearer');
  });

  test('POST /users/login rejects a wrong password', async ({ api, newCustomer }) => {
    const response = await api.login(newCustomer.email, 'Wrong!Pass#123');

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  test('GET /users/me returns the signed-in user', async ({ api, newCustomer }) => {
    const token = await api.getToken(newCustomer.email, newCustomer.password);
    const customerApi = await ApiClient.create(token);
    try {
      const response = await customerApi.getMe();
      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({ id: newCustomer.id, email: newCustomer.email });
    } finally {
      await customerApi.dispose();
    }
  });

  test.describe('RBAC on GET /users', () => {
    test('guest gets 401', async ({ api }) => {
      expect((await api.getUsers()).status()).toBe(401);
    });

    test('customer gets 403', async ({ api, newCustomer }) => {
      const customerApi = await ApiClient.create(
        await api.getToken(newCustomer.email, newCustomer.password)
      );
      try {
        expect((await customerApi.getUsers()).status()).toBe(403);
      } finally {
        await customerApi.dispose();
      }
    });

    test('admin gets 200 and a user list', async ({ api }) => {
      const adminApi = await ApiClient.create(
        await api.getToken(creds.admin.email, creds.admin.password)
      );
      try {
        const response = await adminApi.getUsers();
        expect(response.status()).toBe(200);
        expect((await response.json()).data.length).toBeGreaterThan(0);
      } finally {
        await adminApi.dispose();
      }
    });
  });
});
