import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('End-to-end shopping flow @master @sanity @end-to-end @web', async ({ homePage }) => {
    const password = RandomDataUtil.getPassword(12);
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: `customer-${Date.now()}@example.com`,
        telephone: '5551234567',
        password
    };
    const productName = 'MacBook';
    const quantity = 1;

    const registerPage = await homePage.openRegistration();
    await test.step('1) Register a new customer', async () => {
        await registerPage.register(customer);
        await expect.poll(() => registerPage.isAccountCreated()).toBeTruthy();
    });

    await test.step('2) Log out and log in again', async () => {
        const registeredAccountPage = await registerPage.continueToAccount();
        await expect.poll(() => registeredAccountPage.isDisplayed()).toBeTruthy();
        await registeredAccountPage.logout();
        const loginPage = await homePage.openLogin();
        const accountPage = await loginPage.login(customer.email, customer.password);
        await expect.poll(() => accountPage.isDisplayed()).toBeTruthy();
        await accountPage.logout();
    });

    await test.step('3) Search for MacBook and add it to the cart', async () => {
        await homePage.searchFor(productName);
        const productPage = await homePage.openProduct(productName);
        await expect.poll(() => productPage.isDisplayed(productName)).toBeTruthy();
        await productPage.setQuantity(quantity);
        const cartPage = await productPage.addToCart();

        await expect(cartPage.productRow(productName)).toContainText(productName);
        await expect(cartPage.quantityField(productName)).toHaveValue(String(quantity));
        await expect(cartPage.linePrice(productName)).toHaveText('$602.00');
        await expect(cartPage.total()).toHaveText('$602.00');
    });
});