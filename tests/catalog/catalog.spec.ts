import { expect, test } from '../../pages/testExtender';

test.describe('Catalog', () => {
  test.beforeEach(async ({ catalogPage }) => {
    await catalogPage.navigate();
  });

  test('Search returns only matching products', { tag: '@smoke' }, async ({ catalogPage }) => {
    await catalogPage.search('Hammer');
    await catalogPage.verifyAllProductNamesContain('Hammer');
  });

  test('Search with no matches shows an empty state', async ({ catalogPage }) => {
    await catalogPage.search('zzz-no-such-tool');
    await catalogPage.verifyNoResults();
  });

  const sortCases = [
    { option: 'price,asc', label: 'price low to high' },
    { option: 'price,desc', label: 'price high to low' },
  ] as const;

  for (const { option, label } of sortCases) {
    test(`Products can be sorted by ${label}`, async ({ catalogPage }) => {
      await catalogPage.sortBy(option);
      const prices = await catalogPage.getProductPrices();
      const expected = [...prices].sort((a, b) => (option === 'price,asc' ? a - b : b - a));
      expect(prices).toEqual(expected);
    });
  }

  test('Products can be sorted by name A-Z', async ({ catalogPage }) => {
    await catalogPage.sortBy('name,asc');
    const names = await catalogPage.getProductNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
