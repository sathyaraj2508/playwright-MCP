import dotenv from 'dotenv';
import { test as base } from '@playwright/test';
import { AccountPage } from '../pages/AccountPage';
import { AdminCustomerPage } from '../pages/AdminCustomerPage';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';

dotenv.config();

const APP_URL = process.env.WEB_APP_URL ?? 'http://localhost/opencart/upload/';

type PageFixtures = {
    homePage: HomePage;
    adminCustomerPage: AdminCustomerPage;
    registerPage: RegisterPage;
    loginPage: LoginPage;
    accountPage: AccountPage;
    productPage: ProductPage;
    cartPage: CartPage;
};

export const test = base.extend<PageFixtures>({
    homePage: async ({ page }, use) => {
        await page.goto(APP_URL);
        await use(new HomePage(page));
    },
    adminCustomerPage: async ({ page }, use) => use(new AdminCustomerPage(page)),
    registerPage: async ({ page }, use) => use(new RegisterPage(page)),
    loginPage: async ({ page }, use) => use(new LoginPage(page)),
    accountPage: async ({ page }, use) => use(new AccountPage(page)),
    productPage: async ({ page }, use) => use(new ProductPage(page)),
    cartPage: async ({ page }, use) => use(new CartPage(page))
});

export { expect } from '@playwright/test';