import { Locator, Page } from '@playwright/test';

export type AdminCustomerDetails = {
    firstName: string;
    lastName: string;
    email: string;
    status: string;
};

export class AdminCustomerPage {
    private readonly page: Page;
    private readonly usernameField: Locator;
    private readonly passwordField: Locator;
    private readonly loginButton: Locator;
    private readonly emailFilter: Locator;
    private readonly filterButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameField = page.getByRole('textbox', { name: 'Username' });
        this.passwordField = page.getByRole('textbox', { name: 'Password' });
        this.loginButton = page.getByRole('button', { name: /Login/ });
        this.emailFilter = page.getByRole('textbox', { name: 'E-Mail' });
        this.filterButton = page.getByRole('button', { name: /Filter/ });
    }

    async login(username: string, password: string): Promise<void> {
        await this.page.goto(`${process.env.ADMIN_URL ?? 'http://localhost/opencart/upload/admin/index.php'}?route=common/login`);
        await this.usernameField.fill(username);
        await this.passwordField.fill(password);
        await this.loginButton.click();
    }

    async openCustomerList(): Promise<void> {
        const token = new URL(this.page.url()).searchParams.get('user_token');
        if (!token) {
            throw new Error('Admin user token was not found after login.');
        }
        const adminUrl = process.env.ADMIN_URL ?? 'http://localhost/opencart/upload/admin/index.php';
        await this.page.goto(`${adminUrl}?route=customer/customer&user_token=${token}`);
    }

    async filterByEmail(email: string): Promise<void> {
        await this.emailFilter.fill(email);
        await this.filterButton.click();
    }

    customerRow(email: string): Locator {
        return this.page.getByRole('row').filter({ hasText: email });
    }

    async openCustomer(email: string): Promise<void> {
        await this.customerRow(email).getByRole('link').last().click();
    }

    async getCustomerDetails(): Promise<AdminCustomerDetails> {
        return {
            firstName: await this.page.getByRole('textbox', { name: '* First Name' }).inputValue(),
            lastName: await this.page.getByRole('textbox', { name: '* Last Name' }).inputValue(),
            email: await this.page.getByRole('textbox', { name: '* E-Mail' }).inputValue(),
            status: await this.page.getByRole('combobox', { name: 'Status' }).inputValue()
        };
    }
}