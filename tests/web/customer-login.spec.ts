import { test, expect } from '../../fixtures/pageFixtures';

test('Valid customer login flow @master @sanity @web', async ({ homePage }) => {
    const loginPage = await homePage.openLogin();
    await expect.poll(() => loginPage.isDisplayed()).toBeTruthy();

    const accountPage = await loginPage.login(
        process.env.APP_EMAIL ?? '',
        process.env.APP_PASSWORD ?? ''
    );
    await expect.poll(() => accountPage.isDisplayed()).toBeTruthy();
});

test('Invalid customer login flow @master @regression @web', async ({ homePage }) => {
    const loginPage = await homePage.openLogin();
    await loginPage.login('abcxyz@xyz.com', 'abcxyx');

    await expect(loginPage.warningText()).resolves.toMatch(
        /Warning: (No match for E-Mail Address and\/or Password\.|Your account has exceeded allowed number of login attempts\.)/
    );
    await expect.poll(() => loginPage.isDisplayed()).toBeTruthy();
});