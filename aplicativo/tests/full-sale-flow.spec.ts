import { test, expect } from '@playwright/test';

test.describe('Full Sales Flow (Create Product -> Sell -> Verify Debt)', () => {

    // Use a unique ID for this test run to avoid collisions
    const timestamp = Date.now();
    const productName = `Producto Auto ${timestamp}`;
    const productPrice = '5000';
    const customerName = `Cliente Auto ${timestamp}`;
    const customerEmail = `auto${timestamp}@test.com`;

    test('should complete a full sales cycle with credit (Fiado)', async ({ page, isMobile }) => {
        // Increase timeout for this long test
        test.setTimeout(60000);

        // 1. Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'costosrb@gmail.com');
        await page.fill('input[name="password"]', '123456');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/venta', { timeout: 15000 });

        // Ensure Shift is Open (if "Abrir Caja" is visible, click it)
        try {
            // Short timeout check
            const openShiftBtn = page.getByRole('button', { name: 'Abrir Caja' });
            if (await openShiftBtn.isVisible({ timeout: 3000 })) {
                await openShiftBtn.click();
                await page.fill('input[placeholder="Monto base en caja"]', '0');
                await page.click('button:has-text("Abrir Turno")');
                await expect(page.getByRole('button', { name: 'Cerrar Caja' })).toBeVisible();
            }
        } catch (e) {
            // Shift likely already open, continue
        }

        // 2 Create New Customer
        // Try creating, but if it fails/exists, just proceed to use it
        await page.goto('/clientes');

        // Check if customer exists first to save time
        const customerExists = await page.getByText(customerName).isVisible().catch(() => false);

        if (!customerExists) {
            await page.getByRole('button', { name: 'Nuevo Cliente' }).click();
            await expect(page.locator('text=Registrar Cliente')).toBeVisible();
            await page.fill('input[placeholder="Nombre completo"]', customerName);
            await page.fill('input[placeholder="ejemplo@correo.com"]', customerEmail);
            await page.getByRole('button', { name: 'Guardar Cliente' }).click();
            // Wait for toast or list update
            await page.waitForTimeout(1000);
        }

        // 3. Create Product
        await page.goto('/inventario');
        // It's a Link, not a button, so we use getByRole link or text
        await page.click('text=Nuevo Producto');
        await expect(page.locator('text=Crear Producto')).toBeVisible();

        await page.fill('input[placeholder="Ej. Arroz Diana 500g"]', productName);
        // Price inputs might need specific locators if placeholders are generic "0.00"
        // Assuming first 0.00 is price, second is cost. Or use name if available.
        // Let's use simple tab navigation or exact placeholder matching if possible.
        // Better strategy: locate by nearby label text
        await page.locator('label:has-text("Precio de Venta")').locator('..').locator('input').fill(productPrice);
        await page.locator('label:has-text("Costo (Opcional)")').locator('..').locator('input').fill('3000');

        await page.locator('label:has-text("Stock Actual")').locator('..').locator('input').fill('100');

        await page.click('button:has-text("Guardar Producto")');
        // Wait for redirect to inventory or toast
        await page.waitForTimeout(2000);

        // 4. Make a Sale (Fiado)
        await page.goto('/venta');

        // Search for product
        await page.fill('input[placeholder*="Buscar"]', productName);
        // Click product card to add to cart
        await page.locator(`h3:has-text("${productName}")`).first().click();

        // Select Customer
        // Trigger generic customer modal
        if (isMobile) {
            // Mobile specific header button
            await page.click('header button:has(.material-symbols-outlined:text("person"))');
        } else {
            await page.click('button:has-text("Cliente")');
        }

        await page.fill('input[placeholder*="Buscar cliente"]', customerName);
        await page.click(`div:has-text("${customerName}")`); // Select the new customer

        // Checkout
        if (isMobile) {
            // Mobile floating button
            await page.click('button:has-text("Ver Pedido")'); // Open bottom sheet
            await page.waitForTimeout(500);
            await page.click('button:has-text("COBRAR AHORA")');
        } else {
            // Desktop Sidebar Button
            await page.click('button:has-text("Cobrar")');
        }

        await expect(page.locator('text=Confirmar Venta')).toBeVisible();

        // Select Payment Method: Fiado
        await page.click('button:has-text("Fiado / Crédito")');

        // Confirm
        await page.click('button:has-text("Confirmar Venta")');

        // Success Modal Check
        await expect(page.locator('text=¡Venta Exitosa!')).toBeVisible();

        // Close Modal
        await page.click('button:has-text("Nueva Venta")');

        // 5. Verify Debt in Customer Profile
        await page.goto('/clientes');

        // Click on customer to see details
        await page.click(`text=${customerName}`);

        // Check deb in detail view (assuming it shows "Deuda Actual" or similar)
        await expect(page.locator(`text=$${productPrice}`)).toBeVisible(); // 5.000 format

        console.log('Test Completed Successfully: Customer owes ' + productPrice);
    });
});
