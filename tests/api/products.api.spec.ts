import { Paginated, Product } from '../../interfaces/interfaces';
import { expect, test } from '../../pages/testExtender';

test.describe('Products API', () => {
  test('GET /products returns a paginated list', { tag: '@smoke' }, async ({ api }) => {
    const response = await api.getProducts({ page: 1 });

    expect(response.status()).toBe(200);
    const body: Paginated<Product> = await response.json();
    expect(body.current_page).toBe(1);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.length).toBeLessThanOrEqual(body.per_page);
    for (const product of body.data) {
      expect(product).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          price: expect.any(Number),
        })
      );
    }
  });

  test('GET /products pages do not overlap', async ({ api }) => {
    const first: Paginated<Product> = await (await api.getProducts({ page: 1 })).json();
    const second: Paginated<Product> = await (await api.getProducts({ page: 2 })).json();

    const firstIds = new Set(first.data.map((p) => p.id));
    expect(second.data.some((p) => firstIds.has(p.id))).toBe(false);
  });

  test('GET /products/{id} returns the product', async ({ api }) => {
    const product = await api.getFirstInStockProduct();
    const response = await api.getProduct(product.id);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  });

  test('GET /products/{id} returns 404 for an unknown id', async ({ api }) => {
    expect((await api.getProduct('01NOSUCHPRODUCT00000000000')).status()).toBe(404);
  });

  test('GET /products/search finds products by name', async ({ api }) => {
    const response = await api.searchProducts('pliers');

    expect(response.status()).toBe(200);
    const body: Paginated<Product> = await response.json();
    expect(body.data.length).toBeGreaterThan(0);
    for (const product of body.data) expect(product.name.toLowerCase()).toContain('pliers');
  });

  test('GET /products?sort=price,asc sorts by price', async ({ api }) => {
    const body: Paginated<Product> = await (await api.getProducts({ sort: 'price,asc' })).json();
    const prices = body.data.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
