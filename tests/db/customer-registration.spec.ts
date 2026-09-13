import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { executeQuery } from '../../utils/dbClient';
import type { CustomerDetails } from '../../pages/RegisterPage';

test('Register customer and verify Admin and MySQL records @master @regression @end-to-end @db', async ({ homePage, adminCustomerPage }) => {
    const customer: CustomerDetails = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: `customer-${Date.now()}@example.com`,
        telephone: '5551234567',
        password: RandomDataUtil.getPassword(12)
    };

    await test.step('1) Register a unique customer through the storefront', async () => {
        const registerPage = await homePage.openRegistration();
        await expect(registerPage.isAccountCreated()).resolves.toBe(false);
        await registerPage.register(customer);
        await expect.poll(() => registerPage.isAccountCreated()).toBeTruthy();
    });

    await test.step('2) Verify the customer in the Admin Portal', async () => {
        await adminCustomerPage.login(process.env.ADMIN_USERNAME ?? '', process.env.ADMIN_PASSWORD ?? '');
        await adminCustomerPage.openCustomerList();
        await adminCustomerPage.filterByEmail(customer.email);

        const row = adminCustomerPage.customerRow(customer.email);
        await expect(row).toHaveCount(1);
        await expect(row).toContainText(`${customer.firstName} ${customer.lastName}`);
        await expect(row).toContainText('Enabled');

        await adminCustomerPage.openCustomer(customer.email);
        const details = await adminCustomerPage.getCustomerDetails();
        expect(details.firstName, 'Admin first name').toBe(customer.firstName);
        expect(details.lastName, 'Admin last name').toBe(customer.lastName);
        expect(details.email, 'Admin email').toBe(customer.email);
        expect(details.status, 'Admin status').toBe('1');
    });

    await test.step('3) Verify the customer in MySQL', async () => {
        const [rows] = await executeQuery(
            'SELECT firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?',
            [customer.email]
        ) as [Array<{ firstname: string; lastname: string; email: string; status: number; date_added: string | null }>, unknown];

        expect(rows, 'Exactly one database customer record').toHaveLength(1);
        const record = rows[0];
        expect(record.firstname, 'Database first name').toBe(customer.firstName);
        expect(record.lastname, 'Database last name').toBe(customer.lastName);
        expect(record.email, 'Database email').toBe(customer.email);
        expect(record.status, 'Database status').toBe(1);
        expect(record.date_added, 'Database date_added').toBeTruthy();
    });
});