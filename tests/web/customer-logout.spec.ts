import { test, expect } from '../../fixtures/pageFixtures';

test('Customer logout flow @master @sanity @web', async ({ homePage, page }) => {
    const loginPage = await homePage.openLogin();
    const accountPage = await loginPage.login(
        process.env.APP_EMAIL ?? '',
        process.env.APP_PASSWORD ?? ''
    );
    await expect.poll(() => accountPage.isDisplayed()).toBeTruthy();

    await accountPage.logoutToConfirmation();
    await expect.poll(() => accountPage.isLogoutConfirmationDisplayed()).toBeTruthy();
    await accountPage.continueAfterLogout();
    await expect(page).toHaveURL(/index\.php\?route=common\/home/);
});