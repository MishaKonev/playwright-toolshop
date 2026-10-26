import { APIRequestContext, APIResponse, expect, request, test } from '@playwright/test';
import { API_URL } from '../../fixtures/creds';
import { Paginated, Product, User, UserPayload } from '../../interfaces/interfaces';
import { createUserPayload } from '../payloads';

export class ApiClient {
  private constructor(private readonly context: APIRequestContext) {}

  // Each client owns its request context, so call dispose() when done
  static async create(token?: string): Promise<ApiClient> {
    const context = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return new ApiClient(context);
  }

  async dispose(): Promise<void> {
    await this.context.dispose();
  }

  // ---------- Raw calls: return the response so API tests can assert on status codes ----------

  register(payload: Partial<UserPayload>): Promise<APIResponse> {
    return this.context.post('/users/register', { data: payload });
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.context.post('/users/login', { data: { email, password } });
  }

  getMe(): Promise<APIResponse> {
    return this.context.get('/users/me');
  }

  getUsers(): Promise<APIResponse> {
    return this.context.get('/users');
  }

  getProducts(params: Record<string, string | number> = {}): Promise<APIResponse> {
    return this.context.get('/products', { params });
  }

  getProduct(id: string): Promise<APIResponse> {
    return this.context.get(`/products/${id}`);
  }

  searchProducts(query: string): Promise<APIResponse> {
    return this.context.get('/products/search', { params: { q: query } });
  }

  // ---------- Helpers for test data setup ----------

  async createUser(overrides: Partial<UserPayload> = {}): Promise<User> {
    const payload = createUserPayload(overrides);
    return await test.step(`Register user "${payload.email}" via API`, async () => {
      const response = await this.register(payload);
      expect(response.status(), await response.text()).toBe(201);
      const user = await response.json();
      return { ...user, password: payload.password };
    });
  }

  async getToken(email: string, password: string): Promise<string> {
    return await test.step(`Get API token for "${email}"`, async () => {
      const response = await this.login(email, password);
      expect(response.status(), await response.text()).toBe(200);
      return (await response.json()).access_token;
    });
  }

  async getFirstInStockProduct(): Promise<Product> {
    return await test.step('Find an in-stock product via API', async () => {
      const response = await this.getProducts({ page: 1 });
      expect(response.ok()).toBeTruthy();
      const body: Paginated<Product> = await response.json();
      const product = body.data.find((p) => p.in_stock && !p.is_rental);
      expect(product, 'no in-stock product on the first page').toBeDefined();
      return product;
    });
  }
}
