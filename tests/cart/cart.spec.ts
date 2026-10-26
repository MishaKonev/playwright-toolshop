import { CUSTOMER_STORAGE_STATE } from '../../fixtures/creds';
import { Product } from '../../interfaces/interfaces';
import { expect, test } from '../../pages/testExtender';

test.describe('Cart', () => {
  let product: Product;

  // Pick the product through the API instead of hard-coding one that may go out of stock
  test.beforeEach(async ({ api }) => {
    product = await api.getFirstInStockProduct();
  });

  test(
    'Guest can add a product to the cart',
    { tag: '@smoke' },
    async ({ productDetailsPage, checkoutPage }) => {
      await productDetailsPage.navigate(product.id);
      await productDetailsPage.verifyProduct(product.name, product.price);
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyCartQuantity(1);

      await productDetailsPage.openCart();
      await checkoutPage.verifyCartLine(product.name, 1, product.price);
      await checkoutPage.verifyCartTotalIsSumOfLines();
    }
  );

  test('Line price is unit price multiplied by quantity', async ({
    productDetailsPage,
    checkoutPage,
  }) => {
    await productDetailsPage.navigate(product.id);
    await productDetailsPage.increaseQuantity(2);
    await productDetailsPage.verifyQuantity(3);
    await productDetailsPage.addToCart();
    await productDetailsPage.verifyCartQuantity(3);

    await productDetailsPage.openCart();
    await checkoutPage.verifyCartLine(product.name, 3, product.price);
    await checkoutPage.verifyCartTotalIsSumOfLines();
  });

  test.describe('as a signed-in customer', () => {
    test.use({ storageState: CUSTOMER_STORAGE_STATE });

    test(
      'Customer can complete checkout',
      { tag: '@smoke' },
      async ({ productDetailsPage, checkoutPage, page }) => {
        await productDetailsPage.navigate(product.id);
        await productDetailsPage.addToCart();
        await productDetailsPage.openCart();

        await checkoutPage.proceedToSignIn();
        await checkoutPage.proceedAsLoggedInUser();
        await checkoutPage.fillBillingAddress({
          country: 'IT',
          postal_code: '39100',
          house_number: '1',
          street: 'Via Roma',
          city: 'Bolzano',
          state: 'BZ',
        });
        await checkoutPage.payWith('cash-on-delivery');
        await checkoutPage.verifyPaymentSuccessful();
        await expect(page).toHaveURL(/\/checkout/);
      }
    );
  });
});
