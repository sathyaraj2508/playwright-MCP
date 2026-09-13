import { Page, Locator } from '@playwright/test';
import { AccountPage } from './AccountPage';

export class LoginPage {
    private readonly page: Page;
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly continueButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailField = page.getByRole('textbox', { name: 'E-Mail Address' });
        this.passwordField = page.getByRole('textbox', { name: 'Password' });
        this.continueButton = page.getByRole('button', { name: 'Login', exact: true });
    }

    /** Verifies that the customer login page is displayed. */
    async isDisplayed(): Promise<boolean> {
        return this.page.getByRole('heading', { name: 'Returning Customer' }).isVisible();
    }

    /** Returns the visible authentication warning text. */
    async warningText(): Promise<string> {
        return this.page.getByText('Warning:', { exact: false }).innerText();
    }

    /** Submits valid customer credentials. */
    async login(email: string, password: string): Promise<AccountPage> {
        await this.emailField.fill(email);
        await this.passwordField.fill(password);
        await this.continueButton.click();
        return new AccountPage(this.page);
    }
}