import { Page, Locator } from '@playwright/test';
import { CartPage } from './CartPage';

export class ProductPage {
    private readonly page: Page;
    private readonly quantityField: Locator;
    private readonly addToCartButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.quantityField = page.getByRole('textbox', { name: 'Qty' });
        this.addToCartButton = page.getByRole('button', { name: 'Add to Cart', exact: true });
    }

    /** Verifies that the requested product detail page is displayed. */
    async isDisplayed(productName: string): Promise<boolean> {
        return this.page.getByRole('heading', { name: productName, exact: true }).isVisible();
    }

    /** Sets the requested quantity for the product. */
    async setQuantity(quantity: number): Promise<void> {
        await this.quantityField.fill(String(quantity));
    }

    /** Adds the product to the cart and opens the cart page. */
    async addToCart(): Promise<CartPage> {
        await this.addToCartButton.click();
        await this.page.getByRole('button', { name: /1 item\(s\)/ }).waitFor();
        await this.page.goto(`${process.env.WEB_APP_URL}index.php?route=checkout/cart`);
        return new CartPage(this.page);
    }
}