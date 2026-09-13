import { test, expect } from '../../fixtures/pageFixtures';

test('Product search flow @master @sanity @web', async ({ homePage }) => {
    const productName = process.env.PRODUCT_NAME ?? 'MacBook';

    await homePage.searchFor(productName);
    await expect.poll(() => homePage.isProductResultDisplayed(productName)).toBeTruthy();
});