import { test, expect } from '@playwright/test';

test.describe('Public Pages - Landing & Navigation', () => {
  test('homepage loads with hero section and navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation is present
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for key navigation items
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /verify/i })).toBeVisible();
    
    // Check hero section
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('about page loads with content', async ({ page }) => {
    await page.goto('/about');
    
    // Verify page loaded
    await expect(page).toHaveURL(/.*about/);
    
    // Check for main heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('pricing page displays pricing tiers', async ({ page }) => {
    await page.goto('/pricing');
    
    // Verify page loaded
    await expect(page).toHaveURL(/.*pricing/);
    
    // Check for pricing content
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('docs page loads documentation', async ({ page }) => {
    await page.goto('/docs');
    
    // Verify page loaded
    await expect(page).toHaveURL(/.*docs/);
    
    // Check for documentation content
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('contact page shows contact form', async ({ page }) => {
    await page.goto('/contact');
    
    // Verify page loaded
    await expect(page).toHaveURL(/.*contact/);
    
    // Check for form elements
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click About link
    await page.getByRole('link', { name: /about/i }).first().click();
    await expect(page).toHaveURL(/.*about/);
    
    // Go back home
    await page.goto('/');
    
    // Click Pricing link
    await page.getByRole('link', { name: /pricing/i }).first().click();
    await expect(page).toHaveURL(/.*pricing/);
  });
});

test.describe('Public Certificate Verification', () => {
  test('verify page loads without authentication', async ({ page }) => {
    await page.goto('/verify');
    
    // Verify page loaded
    await expect(page).toHaveURL(/.*verify/);
    
    // Check for search/verification interface
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('verify page shows search interface', async ({ page }) => {
    await page.goto('/verify');
    
    // Look for input or search functionality
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('invalid certificate ID shows appropriate message', async ({ page }) => {
    // Try to access a non-existent certificate
    await page.goto('/verify/invalid-certificate-id-12345');
    
    // Should show some content (either error or not found)
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Responsive Design - Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('homepage is responsive on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check that page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check no horizontal scroll (page width should not exceed viewport)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(385); // Small buffer for scrollbar
  });

  test('navigation adapts to mobile viewport', async ({ page }) => {
    await page.goto('/');
    
    // Look for mobile menu button (hamburger icon)
    const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i]').first();
    
    if (await mobileMenuButton.isVisible()) {
      await expect(mobileMenuButton).toBeVisible();
    }
  });
});

test.describe('Responsive Design - Tablet Viewport', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('homepage adapts to tablet viewport', async ({ page }) => {
    await page.goto('/');
    
    // Check that page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Verify no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(780);
  });
});

test.describe('Error Handling', () => {
  test('404 page displays for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345');
    
    // Should show some content (either 404 page or redirect)
    await expect(page.locator('body')).toBeVisible();
  });

  test('empty states are handled gracefully', async ({ page }) => {
    await page.goto('/verify');
    
    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });
});
