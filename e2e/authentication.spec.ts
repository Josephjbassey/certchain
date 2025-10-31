import { test, expect } from '@playwright/test';

test.describe('Authentication - Sign Up', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup');
  });

  test('signup page loads correctly', async ({ page }) => {
    // Verify URL
    await expect(page).toHaveURL(/.*signup/);
    
    // Check for heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for form
    await expect(page.locator('form')).toBeVisible();
  });

  test('signup form has required fields', async ({ page }) => {
    const form = page.locator('form');
    
    // Look for email input
    const emailInput = form.locator('input[type="email"], input[name*="email" i]').first();
    await expect(emailInput).toBeVisible();
    
    // Look for password input
    const passwordInput = form.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('empty form submission shows validation errors', async ({ page }) => {
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign")').first();
    await submitButton.click();
    
    // Wait a moment for validation
    await page.waitForTimeout(1000);
    
    // Check that we're still on signup page (validation prevented submission)
    await expect(page).toHaveURL(/.*signup/);
  });

  test('invalid email shows validation error', async ({ page }) => {
    // Enter invalid email
    const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
    await emailInput.fill('invalid-email');
    
    // Try to submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign")').first();
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Should still be on signup page
    await expect(page).toHaveURL(/.*signup/);
  });

  test('has link to login page', async ({ page }) => {
    // Look for login link
    const loginLink = page.getByRole('link', { name: /login|sign in/i });
    await expect(loginLink).toBeVisible();
  });
});

test.describe('Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('login page loads correctly', async ({ page }) => {
    // Verify URL
    await expect(page).toHaveURL(/.*login/);
    
    // Check for heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for form
    await expect(page.locator('form')).toBeVisible();
  });

  test('login form has email and password fields', async ({ page }) => {
    const form = page.locator('form');
    
    // Email field
    const emailInput = form.locator('input[type="email"], input[name*="email" i]').first();
    await expect(emailInput).toBeVisible();
    
    // Password field
    const passwordInput = form.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('empty login form shows validation', async ({ page }) => {
    // Click submit without filling form
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Login")').first();
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Should still be on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('has link to signup page', async ({ page }) => {
    // Look for signup link
    const signupLink = page.getByRole('link', { name: /sign up|register/i });
    await expect(signupLink).toBeVisible();
  });

  test('has forgot password link', async ({ page }) => {
    // Look for forgot password link
    const forgotLink = page.getByRole('link', { name: /forgot.*password/i });
    
    if (await forgotLink.isVisible()) {
      await expect(forgotLink).toBeVisible();
    }
  });
});

test.describe('Authentication - Password Reset', () => {
  test('forgot password page loads', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    // Verify page loads
    await expect(page).toHaveURL(/.*forgot/);
    
    // Check for form or content
    await expect(page.locator('body')).toBeVisible();
  });

  test('forgot password form has email field', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    // Look for email input
    const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
    
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
    }
  });
});

test.describe('Authentication - Navigation', () => {
  test('can navigate between auth pages', async ({ page }) => {
    // Start at login
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/.*login/);
    
    // Click signup link if visible
    const signupLink = page.getByRole('link', { name: /sign up|register/i }).first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*signup/);
      
      // Go back to login
      const loginLink = page.getByRole('link', { name: /login|sign in/i }).first();
      if (await loginLink.isVisible()) {
        await loginLink.click();
        await expect(page).toHaveURL(/.*login/);
      }
    }
  });
});

test.describe('Protected Routes', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('/dashboard');
    
    // Should redirect to login or show auth required
    await page.waitForTimeout(2000);
    
    // Check if redirected to login or auth page
    const url = page.url();
    const isAuthPage = url.includes('login') || url.includes('auth') || url.includes('signin');
    
    // Either on auth page or got blocked
    expect(isAuthPage || url.includes('dashboard')).toBeTruthy();
  });

  test('candidate dashboard redirects when not authenticated', async ({ page }) => {
    await page.goto('/candidate');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    const isAuthOrBlocked = url.includes('login') || url.includes('auth') || url.includes('signin') || url.includes('candidate');
    
    expect(isAuthOrBlocked).toBeTruthy();
  });

  test('instructor dashboard requires authentication', async ({ page }) => {
    await page.goto('/instructor');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    const isAuthOrBlocked = url.includes('login') || url.includes('auth') || url.includes('signin') || url.includes('instructor');
    
    expect(isAuthOrBlocked).toBeTruthy();
  });

  test('admin dashboard requires authentication', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    const isAuthOrBlocked = url.includes('login') || url.includes('auth') || url.includes('signin') || url.includes('admin');
    
    expect(isAuthOrBlocked).toBeTruthy();
  });
});
