import path from 'path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';

type LoginData = {
    testName: string;
    email: string;
    password: string;
    expected: 'success' | 'failure';
};

const loginData = DataProvider.readJson(
    path.resolve(__dirname, '../../testdata/opencart_logindata.json')
) as LoginData[];

for (const [index, data] of loginData.entries()) {
    test(`${data.testName} [row ${index + 1}] @master @datadriven @web`, async ({ homePage }) => {
        const loginPage = await homePage.openLogin();
        const accountPage = await loginPage.login(data.email.trim(), data.password.trim());

        if (data.expected === 'success') {
            await expect.poll(() => accountPage.isDisplayed()).toBeTruthy();
        } else if (data.email.trim() && data.password.trim()) {
            await expect(loginPage.warningText()).resolves.toMatch(
                /Warning: (No match for E-Mail Address and\/or Password\.|Your account has exceeded allowed number of login attempts\.)/
            );
        } else {
            await expect.poll(() => loginPage.isDisplayed()).toBeTruthy();
        }
    });
}