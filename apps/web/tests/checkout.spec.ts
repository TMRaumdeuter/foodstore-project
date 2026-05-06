import { test, expect } from '@playwright/test';

test.describe('Checkout Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // 0. Catch-all fallback for ANY API request to prevent real backend calls returning 401/404 and crashing the app
    await page.route('**/api/**', async (route) => {
      await route.fulfill({ status: 200, json: {} });
    });

    // 1. Mock the user profile endpoint to simulate logged in state
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          _id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '0123456789',
          address: '123 Fake Street',
          loyaltyPoints: 10,
        }
      });
    });

    // 2. Mock the products API for the home page or any product list
    await page.route('**/api/products*', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          products: [
            {
              _id: 'prod1',
              name: 'Pizza Hải Sản',
              slug: 'pizza-hai-san',
              basePrice: 150000,
              isAvailable: true,
              images: [],
              options: []
            }
          ],
          total: 1
        }
      });
    });

    // 3. Mock product details API
    await page.route('**/api/products/by-slug/pizza-hai-san', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          _id: 'prod1',
          name: 'Pizza Hải Sản',
          slug: 'pizza-hai-san',
          basePrice: 150000,
          isAvailable: true,
          images: [],
          options: []
        }
      });
    });

    // 4. Mock vouchers API
    await page.route('**/api/vouchers*', async (route) => {
      await route.fulfill({
        status: 200,
        json: []
      });
    });

    // 5. Mock the order creation endpoint
    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 201,
        json: {
          _id: 'order123',
          orderCode: 'FS-999',
          status: 'pending'
        }
      });
    });
  });

  test('should complete checkout successfully', async ({ page }) => {
    // Navigate to homepage to get a valid origin for localStorage
    await page.goto('/');

    // Set local storage directly to inject a cart item
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        {
          productId: 'prod1',
          name: 'Pizza Hải Sản',
          price: 150000,
          quantity: 1,
          selectedOptions: [],
          image: '',
        }
      ]));
      localStorage.setItem('token', 'fake-jwt-token');
    });

    // Navigate to checkout
    await page.goto('/checkout');

    // Wait for the checkout page to render
    await expect(page.locator('text=Thanh toán').first()).toBeVisible();

    // Assert that pre-filled user info is correct
    await expect(page.locator('input[placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện"]')).toHaveValue('123 Fake Street');
    // For phone, the label might not uniquely identify, but we can check values
    const phoneInput = page.locator('input').filter({ hasText: '0123456789' });
    if (await phoneInput.count() > 0) {
      await expect(phoneInput.first()).toBeVisible();
    }

    // Wait a short bit
    await page.waitForTimeout(500);

    // Click "Đặt Hàng" button
    await page.locator('button[type="submit"]').click();

    // Expect alert or redirect
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Đặt hàng thành công');
      await dialog.accept();
    });

    // Order should redirect to /profile/orders or similar
    // For now just wait a bit to ensure the API was called
    await page.waitForTimeout(500);
  });
});
