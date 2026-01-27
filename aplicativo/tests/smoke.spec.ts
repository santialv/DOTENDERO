import { test, expect } from '@playwright/test';

test.describe('DonTendero Smoke Tests', () => {
    test('should load the login page', async ({ page, isMobile }) => {
        await page.goto('/login');

        // This is visible on both mobile and desktop
        await expect(page.locator('h1')).toContainText('Bienvenido de nuevo');

        // Check for copyright branding only on desktop (it is hidden on mobile by CSS)
        if (!isMobile) {
            await expect(page.locator('text=© 2026 DonTendero')).toBeVisible();
        }
    });

    test('should have meta title', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveTitle(/DonTendero/);
    });
});
