import { Page, Locator } from '@playwright/test';

export class CartPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /** Returns the cart row for a product. */
    productRow(productName: string): Locator {
        return this.page.getByRole('row').filter({ hasText: productName }).first();
    }

    /** Returns the quantity input for a product row. */
    quantityField(productName: string): Locator {
        return this.productRow(productName).getByRole('textbox');
    }

    /** Returns the displayed line price for a product row. */
    linePrice(productName: string): Locator {
        return this.productRow(productName).getByRole('cell').last();
    }

    /** Returns the displayed cart total. */
    total(): Locator {
        return this.page.getByRole('row').filter({ hasText: 'Total:' }).getByRole('cell').last();
    }
}