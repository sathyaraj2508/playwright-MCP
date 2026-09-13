import { Page, Locator } from '@playwright/test';
import { AccountPage } from './AccountPage';

export type CustomerDetails = {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
};

export class RegisterPage {
    private readonly page: Page;
    private readonly firstNameField: Locator;
    private readonly lastNameField: Locator;
    private readonly emailField: Locator;
    private readonly telephoneField: Locator;
    private readonly passwordField: Locator;
    private readonly passwordConfirmField: Locator;
    private readonly privacyCheckbox: Locator;
    private readonly continueControl: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameField = page.getByRole('textbox', { name: '* First Name' });
        this.lastNameField = page.getByRole('textbox', { name: '* Last Name' });
        this.emailField = page.getByRole('textbox', { name: '* E-Mail' });
        this.telephoneField = page.getByRole('textbox', { name: '* Telephone' });
        this.passwordField = page.getByRole('textbox', { name: '* Password', exact: true });
        this.passwordConfirmField = page.getByRole('textbox', { name: '* Password Confirm' });
        this.privacyCheckbox = page.getByRole('checkbox');
        this.continueControl = page.getByRole('button', { name: 'Continue', exact: true });
    }

    /** Completes and submits the customer registration form. */
    async register(customer: CustomerDetails): Promise<void> {
        await this.firstNameField.fill(customer.firstName);
        await this.lastNameField.fill(customer.lastName);
        await this.emailField.fill(customer.email);
        await this.telephoneField.fill(customer.telephone);
        await this.passwordField.fill(customer.password);
        await this.passwordConfirmField.fill(customer.password);
        await this.privacyCheckbox.check();
        await this.continueControl.click();
    }

    /** Verifies that the customer registration page is displayed. */
    async isDisplayed(): Promise<boolean> {
        return this.page.getByRole('heading', { name: 'Register Account' }).isVisible();
    }

    /** Verifies that account creation succeeded. */
    async isAccountCreated(): Promise<boolean> {
        return this.page.getByRole('heading', { name: 'Your Account Has Been Created!' }).isVisible();
    }

    /** Returns to the authenticated account area. */
    async continueToAccount(): Promise<AccountPage> {
        await this.page.getByRole('link', { name: 'Continue', exact: true }).click();
        return new AccountPage(this.page);
    }
}