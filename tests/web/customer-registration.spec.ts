import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import type { CustomerDetails } from '../../pages/RegisterPage';

test('Customer registration flow @master @sanity @web', async ({ homePage }) => {
    const customer: CustomerDetails = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: `customer-${Date.now()}@example.com`,
        telephone: '5551234567',
        password: RandomDataUtil.getPassword(12)
    };

    const registerPage = await homePage.openRegistration();
    await expect.poll(() => registerPage.isDisplayed()).toBeTruthy();
    await registerPage.register(customer);
    await expect.poll(() => registerPage.isAccountCreated()).toBeTruthy();

    const accountPage = await registerPage.continueToAccount();
    await expect.poll(() => accountPage.isDisplayed()).toBeTruthy();
});