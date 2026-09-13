import Ajv from 'ajv';
import dotenv from 'dotenv';
import { test, expect } from '@playwright/test';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config({ override: true });

type Product = {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating?: { rate: number; count: number };
};

type User = {
    id: number;
    email: string;
    username: string;
    password: string;
    name: { firstname: string; lastname: string };
    address: Record<string, unknown>;
    phone: string;
};

type Cart = {
    id: number;
    userId: number;
    date: string;
    products: Array<{ productId: number; quantity: number }>;
};

const BASE_URL = process.env.API_BASE_URL ?? Routes.BASE_URL;
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const USER_ID = Number(process.env.USER_ID ?? 1);
const CART_ID = Number(process.env.CART_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);
const START_DATE = process.env.START_DATE ?? '2019-12-10';
const END_DATE = process.env.END_DATE ?? '2020-10-10';
const validLogin = {
    username: process.env.USERNAME ?? 'mor_2314',
    password: process.env.PASSWORD ?? '83r5^_'
};
const productPayload = {
    title: 'Playwright API Product',
    price: 29.99,
    description: 'Deterministic Playwright API product',
    image: 'https://i.pravatar.cc',
    category: 'electronics'
};
const updatedProductPayload = { ...productPayload, title: 'Updated Playwright API Product' };
const userPayload = {
    ...RandomDataUtil.generateUserPayload(),
    email: 'playwright-api-user@example.com',
    username: 'playwright_api_user'
};
const updatedUserPayload = { ...userPayload, username: 'updated_playwright_api_user' };
const cartPayload = {
    userId: USER_ID,
    date: '2020-01-01',
    products: [{ productId: PRODUCT_ID, quantity: 2 }]
};
const updatedCartPayload = {
    ...cartPayload,
    products: [{ productId: PRODUCT_ID, quantity: 5 }]
};

function route(template: string, values: Record<string, string | number>): string {
    return Object.entries(values).reduce(
        (url, [key, value]) => url.replace(`{${key}}`, encodeURIComponent(String(value))),
        template
    );
}

function apiUrl(path: string): string {
    return `${BASE_URL}${path}`;
}

function expectSortedIds(items: Array<{ id: number }>, direction: 'asc' | 'desc'): void {
    const ids = items.map((item) => item.id);
    const sorted = [...ids].sort((left, right) => direction === 'asc' ? left - right : right - left);
    expect(ids, `${direction}ending IDs`).toEqual(sorted);
}

function assertProduct(product: Product): void {
    expect(product.id, 'Product id').toEqual(expect.any(Number));
    expect(product.title, 'Product title').toEqual(expect.any(String));
    expect(product.price, 'Product price').toEqual(expect.any(Number));
    expect(product.category, 'Product category').toEqual(expect.any(String));
    expect(product.image, 'Product image').toEqual(expect.any(String));
}

function assertUser(user: User): void {
    expect(user.id, 'User id').toEqual(expect.any(Number));
    expect(user.email, 'User email').toEqual(expect.any(String));
    expect(user.username, 'User username').toEqual(expect.any(String));
    expect(user.name.firstname, 'User first name').toEqual(expect.any(String));
    expect(user.name.lastname, 'User last name').toEqual(expect.any(String));
}

function assertCart(cart: Cart): void {
    expect(cart.id, 'Cart id').toEqual(expect.any(Number));
    expect(cart.userId, 'Cart user id').toEqual(expect.any(Number));
    expect(cart.products, 'Cart products').toEqual(expect.any(Array));
    expect(cart.products.length, 'Cart product count').toBeGreaterThan(0);
}

function assertOptionalDeletedBody(body: string, id: number): void {
    if (!body.trim()) return;
    const deleted = JSON.parse(body) as { id?: number } | null;
    if (deleted) expect(deleted.id).toBe(id);
}

test.describe('FakeStore authentication API', () => {
    test('POST - Successful login @master @sanity @api', async ({ request }) => {
        const response = await request.post(apiUrl(Routes.AUTH_LOGIN), { data: validLogin });
        expect(response.status(), 'Successful login status').toBe(201);
        const body = await response.json();
        expect(body.token, 'Authentication token').toEqual(expect.any(String));
        expect(body.token.length, 'Authentication token length').toBeGreaterThan(0);
    });

    test('POST - Invalid login @master @regression @api', async ({ request }) => {
        const response = await request.post(apiUrl(Routes.AUTH_LOGIN), {
            data: { username: 'invalid_user', password: 'invalid_password' }
        });
        expect(response.status(), 'Invalid login status').toBe(401);
        expect(await response.text(), 'Invalid login message').toBe('username or password is incorrect');
    });
});

test.describe('FakeStore products API', () => {
    test('GET - All products @master @sanity @api', async ({ request }) => {
        const response = await request.get(apiUrl(Routes.GET_ALL_PRODUCTS));
        expect(response.status()).toBe(200);
        const products = await response.json() as Product[];
        expect(products.length, 'Product count').toBeGreaterThan(0);
        products.forEach(assertProduct);
    });

    test('GET - Product by id @master @sanity @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_PRODUCT_BY_ID, { id: PRODUCT_ID })));
        expect(response.status()).toBe(200);
        const product = await response.json() as Product;
        expect(product.id).toBe(PRODUCT_ID);
        assertProduct(product);
    });

    test('GET - Products with limit @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_PRODUCTS_WITH_LIMIT, { limit: LIMIT })));
        expect(response.status()).toBe(200);
        const products = await response.json() as Product[];
        expect(products).toHaveLength(LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Products sorted ${order} @master @regression @api`, async ({ request }) => {
            const response = await request.get(apiUrl(route(Routes.GET_PRODUCTS_SORTED, { order })));
            expect(response.status()).toBe(200);
            expectSortedIds(await response.json() as Product[], order);
        });
    }

    test('GET - All product categories @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(Routes.GET_ALL_CATEGORIES));
        expect(response.status()).toBe(200);
        const categories = await response.json() as string[];
        expect(categories.length).toBeGreaterThan(0);
        categories.forEach((category) => expect(category).toEqual(expect.any(String)));
    });

    test('GET - Products by category @master @regression @api', async ({ request }) => {
        const category = 'electronics';
        const response = await request.get(apiUrl(route(Routes.GET_PRODUCTS_BY_CATEGORY, { category })));
        expect(response.status()).toBe(200);
        const products = await response.json() as Product[];
        products.forEach((product) => expect(product.category).toBe(category));
    });

    test('POST - Create product @master @regression @api', async ({ request }) => {
        const response = await request.post(apiUrl(Routes.CREATE_PRODUCT), { data: productPayload });
        expect(response.status()).toBe(201);
        const product = await response.json() as Product;
        expect(product.id).toEqual(expect.any(Number));
        expect(product.title).toBe(productPayload.title);
        expect(product.price).toBe(productPayload.price);
        expect(product.category).toBe(productPayload.category);
    });

    test('PUT - Update product @master @regression @api', async ({ request }) => {
        const response = await request.put(apiUrl(route(Routes.UPDATE_PRODUCT, { id: PRODUCT_ID })), {
            data: updatedProductPayload
        });
        expect(response.status()).toBe(200);
        const product = await response.json() as Product;
        expect(product.id).toBe(PRODUCT_ID);
        expect(product.title).toBe(updatedProductPayload.title);
        expect(product.price).toBe(updatedProductPayload.price);
    });

    test('DELETE - Product @master @regression @api', async ({ request }) => {
        const response = await request.delete(apiUrl(route(Routes.DELETE_PRODUCT, { id: PRODUCT_ID })));
        expect(response.status()).toBe(200);
        assertOptionalDeletedBody(await response.text(), PRODUCT_ID);
    });
});

test.describe('FakeStore users API', () => {
    test('GET - All users @master @sanity @api', async ({ request }) => {
        const response = await request.get(apiUrl(Routes.GET_ALL_USERS));
        expect(response.status()).toBe(200);
        const users = await response.json() as User[];
        expect(users.length).toBeGreaterThan(0);
        users.forEach(assertUser);
    });

    test('GET - User by id @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_USER_BY_ID, { id: USER_ID })));
        expect(response.status()).toBe(200);
        const user = await response.json() as User;
        expect(user.id).toBe(USER_ID);
        assertUser(user);
    });

    test('GET - Users with limit @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_USERS_WITH_LIMIT, { limit: LIMIT })));
        expect(response.status()).toBe(200);
        expect(await response.json()).toHaveLength(LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Users sorted ${order} @master @regression @api`, async ({ request }) => {
            const response = await request.get(apiUrl(route(Routes.GET_USERS_SORTED, { order })));
            expect(response.status()).toBe(200);
            expectSortedIds(await response.json() as User[], order);
        });
    }

    test('POST - Create user @master @regression @api', async ({ request }) => {
        const response = await request.post(apiUrl(Routes.CREATE_USER), { data: userPayload });
        expect(response.status()).toBe(201);
        const user = await response.json() as User;
        expect(user.id).toEqual(expect.any(Number));
    });

    test('PUT - Update user @master @regression @api', async ({ request }) => {
        const response = await request.put(apiUrl(route(Routes.UPDATE_USER, { id: USER_ID })), {
            data: updatedUserPayload
        });
        expect(response.status()).toBe(200);
        const user = await response.json() as Partial<User>;
        expect(user.username).toBe(updatedUserPayload.username);
    });

    test('DELETE - User @master @regression @api', async ({ request }) => {
        const response = await request.delete(apiUrl(route(Routes.DELETE_USER, { id: USER_ID })));
        expect(response.status()).toBe(200);
        assertOptionalDeletedBody(await response.text(), USER_ID);
    });
});

test.describe('FakeStore carts API', () => {
    test('GET - All carts @master @sanity @api', async ({ request }) => {
        const response = await request.get(apiUrl(Routes.GET_ALL_CARTS));
        expect(response.status()).toBe(200);
        const carts = await response.json() as Cart[];
        expect(carts.length).toBeGreaterThan(0);
        carts.forEach(assertCart);
    });

    test('GET - Cart by id @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_CART_BY_ID, { id: CART_ID })));
        expect(response.status()).toBe(200);
        const cart = await response.json() as Cart;
        expect(cart.id).toBe(CART_ID);
        assertCart(cart);
    });

    test('GET - Carts by date range @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_CARTS_BY_DATE_RANGE, {
            startdate: START_DATE,
            enddate: END_DATE
        })));
        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual(expect.any(Array));
    });

    test('GET - User cart @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_USER_CART, { userId: USER_ID })));
        expect(response.status()).toBe(200);
        const carts = await response.json() as Cart[];
        carts.forEach((cart) => expect(cart.userId).toBe(USER_ID));
    });

    test('GET - Carts with limit @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_CARTS_WITH_LIMIT, { limit: LIMIT })));
        expect(response.status()).toBe(200);
        expect(await response.json()).toHaveLength(LIMIT);
    });

    for (const order of ['asc', 'desc'] as const) {
        test(`GET - Carts sorted ${order} @master @regression @api`, async ({ request }) => {
            const response = await request.get(apiUrl(route(Routes.GET_CARTS_SORTED, { order })));
            expect(response.status()).toBe(200);
            expectSortedIds(await response.json() as Cart[], order);
        });
    }

    test('POST - Create cart @master @regression @api', async ({ request }) => {
        const response = await request.post(apiUrl(Routes.CREATE_CART), { data: cartPayload });
        expect(response.status()).toBe(201);
        const cart = await response.json() as Cart;
        expect(cart.id).toEqual(expect.any(Number));
        expect(cart.userId).toBe(cartPayload.userId);
        expect(cart.products).toEqual(cartPayload.products);
    });

    test('PUT - Update cart @master @regression @api', async ({ request }) => {
        const response = await request.put(apiUrl(route(Routes.UPDATE_CART, { id: CART_ID })), {
            data: updatedCartPayload
        });
        expect(response.status()).toBe(200);
        const cart = await response.json() as Cart;
        expect(cart.id).toBe(CART_ID);
        expect(cart.products).toEqual(updatedCartPayload.products);
    });

    test('DELETE - Cart @master @regression @api', async ({ request }) => {
        const response = await request.delete(apiUrl(route(Routes.DELETE_CART, { id: CART_ID })));
        expect(response.status()).toBe(200);
        assertOptionalDeletedBody(await response.text(), CART_ID);
    });
});

test.describe('FakeStore response schemas', () => {
    const ajv = new Ajv();

    test('GET - Product response schema @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_PRODUCT_BY_ID, { id: PRODUCT_ID })));
        expect(response.status()).toBe(200);
        const valid = ajv.compile(DataProvider.readJson('./api/schemas/product_api_schema.json'))(await response.json());
        expect(valid, 'Product response schema validation').toBeTruthy();
    });

    test('GET - User response schema @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_USER_BY_ID, { id: USER_ID })));
        expect(response.status()).toBe(200);
        const valid = ajv.compile(DataProvider.readJson('./api/schemas/user_api_schema.json'))(await response.json());
        expect(valid, 'User response schema validation').toBeTruthy();
    });

    test('GET - Cart response schema @master @regression @api', async ({ request }) => {
        const response = await request.get(apiUrl(route(Routes.GET_CART_BY_ID, { id: CART_ID })));
        expect(response.status()).toBe(200);
        const valid = ajv.compile(DataProvider.readJson('./api/schemas/cart_api_schema.json'))(await response.json());
        expect(valid, 'Cart response schema validation').toBeTruthy();
    });
});

test.describe.serial('FakeStore CRUD workflows', () => {
    test('POST, PUT, DELETE - Product workflow @master @end-to-end @api', async ({ request }) => {
        const createResponse = await request.post(apiUrl(Routes.CREATE_PRODUCT), { data: productPayload });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json() as Product;
        const id = created.id;

        const updateResponse = await request.put(apiUrl(route(Routes.UPDATE_PRODUCT, { id })), { data: updatedProductPayload });
        expect(updateResponse.status()).toBe(200);
        expect((await updateResponse.json()).title).toBe(updatedProductPayload.title);

        const deleteResponse = await request.delete(apiUrl(route(Routes.DELETE_PRODUCT, { id })));
        expect(deleteResponse.status()).toBe(200);
        assertOptionalDeletedBody(await deleteResponse.text(), id);
    });

    test('POST, PUT, DELETE - User workflow @master @end-to-end @api', async ({ request }) => {
        const createResponse = await request.post(apiUrl(Routes.CREATE_USER), { data: userPayload });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json() as User;
        const id = created.id;

        const updateResponse = await request.put(apiUrl(route(Routes.UPDATE_USER, { id })), { data: updatedUserPayload });
        expect(updateResponse.status()).toBe(200);
        expect((await updateResponse.json()).username).toBe(updatedUserPayload.username);

        const deleteResponse = await request.delete(apiUrl(route(Routes.DELETE_USER, { id })));
        expect(deleteResponse.status()).toBe(200);
        assertOptionalDeletedBody(await deleteResponse.text(), id);
    });

    test('POST, PUT, DELETE - Cart workflow @master @end-to-end @api', async ({ request }) => {
        const createResponse = await request.post(apiUrl(Routes.CREATE_CART), { data: cartPayload });
        expect(createResponse.status()).toBe(201);
        const created = await createResponse.json() as Cart;
        const id = created.id;
        expect(created.userId).toBe(cartPayload.userId);
        expect(created.products).toEqual(cartPayload.products);

        const updateResponse = await request.put(apiUrl(route(Routes.UPDATE_CART, { id })), { data: updatedCartPayload });
        expect(updateResponse.status()).toBe(200);
        expect((await updateResponse.json()).products).toEqual(updatedCartPayload.products);

        const deleteResponse = await request.delete(apiUrl(route(Routes.DELETE_CART, { id })));
        expect(deleteResponse.status()).toBe(200);
        assertOptionalDeletedBody(await deleteResponse.text(), id);
    });
});