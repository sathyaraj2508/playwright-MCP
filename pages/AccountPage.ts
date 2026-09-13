import { Page, Locator } from '@playwright/test';

export class AccountPage {
    private readonly page: Page;
    private readonly accountHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.accountHeading = page.locator('#content').getByRole('heading', { name: 'My Account' });
    }

    /** Verifies that the authenticated account dashboard is displayed. */
    async isDisplayed(): Promise<boolean> {
        return this.accountHeading.isVisible();
    }

    /** Logs the customer out through the account menu. */
    async logout(): Promise<void> {
        await this.page.getByRole('link', { name: 'Logout', exact: true }).click();
        await this.page.getByRole('link', { name: 'Continue', exact: true }).click();
    }

    /** Logs out and leaves the logout confirmation page open. */
    async logoutToConfirmation(): Promise<void> {
        await this.page.getByRole('link', { name: 'Logout', exact: true }).click();
    }

    /** Verifies that the logout confirmation page is displayed. */
    async isLogoutConfirmationDisplayed(): Promise<boolean> {
        return this.page.getByRole('heading', { name: 'Account Logout' }).isVisible();
    }

    /** Continues from the logout confirmation page to the storefront. */
    async continueAfterLogout(): Promise<void> {
        await this.page.getByRole('link', { name: 'Continue', exact: true }).click();
    }
}