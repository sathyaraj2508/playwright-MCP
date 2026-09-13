import { Page, Locator } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { ProductPage } from './ProductPage';
import { RegisterPage } from './RegisterPage';

export class HomePage {
    private readonly page: Page;
    private readonly myAccountLink: Locator;
    private readonly searchField: Locator;

    constructor(page: Page) {
        this.page = page;
        this.myAccountLink = page.getByRole('link', { name: /My Account/ }).first();
        this.searchField = page.getByRole('textbox', { name: 'Search' });
    }

    /** Opens the registration page from the account menu. */
    async openRegistration(): Promise<RegisterPage> {
        await this.myAccountLink.click();
        await this.page.getByRole('link', { name: 'Register', exact: true }).click();
        return new RegisterPage(this.page);
    }

    /** Opens the login page from the account menu. */
    async openLogin(): Promise<LoginPage> {
        await this.myAccountLink.click();
        await this.page.getByRole('link', { name: 'Login', exact: true }).click();
        return new LoginPage(this.page);
    }

    /** Searches for a product by its visible name. */
    async searchFor(productName: string): Promise<void> {
        await this.searchField.fill(productName);
        await this.searchField.press('Enter');
    }

    /** Verifies that a product appears in the search results. */
    async isProductResultDisplayed(productName: string): Promise<boolean> {
        return this.page.getByRole('link', { name: productName, exact: true }).first().isVisible();
    }

    /** Opens a product from the current search results. */
    async openProduct(productName: string): Promise<ProductPage> {
        await this.page.getByRole('link', { name: productName, exact: true }).first().click();
        return new ProductPage(this.page);
    }
}