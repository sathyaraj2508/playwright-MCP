import { test, expect } from '../../fixtures/pageFixtures';

test('Add product to cart flow @master @sanity @web', async ({ homePage }) => {
    const productName = process.env.PRODUCT_NAME ?? 'MacBook';
    const quantity = Number(process.env.PRODUCT_QUANTITY ?? 1);
    const expectedPrice = process.env.TOTAL_PRICE ?? '$602.00';

    await homePage.searchFor(productName);
    const productPage = await homePage.openProduct(productName);
    await expect.poll(() => productPage.isDisplayed(productName)).toBeTruthy();
    await productPage.setQuantity(quantity);

    const cartPage = await productPage.addToCart();
    await expect(cartPage.productRow(productName)).toContainText(productName);
    await expect(cartPage.quantityField(productName)).toHaveValue(String(quantity));
    await expect(cartPage.linePrice(productName)).toHaveText(expectedPrice);
    await expect(cartPage.total()).toHaveText(expectedPrice);
});