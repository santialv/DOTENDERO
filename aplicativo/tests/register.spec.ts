import { test, expect } from '@playwright/test';

test.describe('DonTendero Registration Tests', () => {
    test('should allow a user to fill the registration form', async ({ page }) => {
        await page.goto('/register');

        // Check if registration is allowed or blocked
        const isBlocked = await page.locator('text=Registros Pausados por el Momento').isVisible();

        if (isBlocked) {
            console.log('Registration is currently blocked by app settings.');
            await expect(page.locator('h1')).toContainText('Impulsando el corazón de nuestros barrios');
            return;
        }

        // If not blocked, fill the form
        await page.fill('#name', 'Tienda Test Automation');
        const randomEmail = `test-${Date.now()}@example.com`;
        await page.fill('#email', randomEmail);
        await page.fill('#password', 'TestPassword123!');
        await page.fill('#confirm-password', 'TestPassword123!');

        // Click checkbox
        await page.click('#terms');

        // Click register (use role button to be more robust)
        await page.click('button:has-text("Crear Cuenta")');

        // Check for success or error toast
        // Depending on Supabase settings, it might redirect to /login with a success toast
        await expect(page).toHaveURL(/\/login/);
        // await expect(page.locator('text=Cuenta creada con éxito')).toBeVisible();
    });

    test('should show error if passwords do not match', async ({ page }) => {
        await page.goto('/register');

        const isBlocked = await page.locator('text=Registros Pausados por el Momento').isVisible();
        if (isBlocked) return;

        await page.fill('#name', 'Test Error');
        await page.fill('#email', 'error@example.com');
        await page.fill('#password', 'Password123!');
        await page.fill('#confirm-password', 'WrongPassword!');
        await page.click('#terms');
        await page.click('button:has-text("Crear Cuenta")');

        // Check for error toast text
        await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
    });
});
