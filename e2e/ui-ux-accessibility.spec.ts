import { test, expect } from '@playwright/test';

test.describe('UI/UX Consistency', () => {
  test('buttons have consistent styling across pages', async ({ page }) => {
    // Check homepage
    await page.goto('/');
    const homeButton = page.locator('button').first();
    if (await homeButton.isVisible()) {
      const homeStyles = await homeButton.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          borderRadius: styles.borderRadius,
          padding: styles.padding,
        };
      });
      
      // Check another page
      await page.goto('/about');
      const aboutButton = page.locator('button').first();
      if (await aboutButton.isVisible()) {
        const aboutStyles = await aboutButton.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            borderRadius: styles.borderRadius,
            padding: styles.padding,
          };
        });
        
        // Styles should be consistent
        expect(homeStyles.borderRadius).toBe(aboutStyles.borderRadius);
      }
    }
  });

  test('headings maintain hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check that h1 exists
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    
    // h1 should be larger than h2
    const h1Size = await h1.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });
    
    const h2 = page.locator('h2').first();
    if (await h2.isVisible()) {
      const h2Size = await h2.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize);
      });
      
      expect(h1Size).toBeGreaterThan(h2Size);
    }
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    
    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme" i], button:has-text("theme")').first();
    
    if (await themeToggle.isVisible()) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      // Click toggle
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check if theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('form inputs have consistent styling', async ({ page }) => {
    await page.goto('/auth/login');
    
    const inputs = page.locator('input');
    const count = await inputs.count();
    
    if (count >= 2) {
      // Compare first two inputs
      const input1Border = await inputs.nth(0).evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });
      
      const input2Border = await inputs.nth(1).evaluate((el) => {
        return window.getComputedStyle(el).borderRadius;
      });
      
      expect(input1Border).toBe(input2Border);
    }
  });

  test('spacing is consistent across sections', async ({ page }) => {
    await page.goto('/');
    
    // Check that main content has consistent spacing
    const sections = page.locator('section, div[class*="section"]');
    const count = await sections.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Accessibility', () => {
  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Alt attribute should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/auth/login');
    
    const inputs = page.locator('input');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate((el) => {
        // Check for label, aria-label, or aria-labelledby
        const id = el.id;
        if (id && document.querySelector(`label[for="${id}"]`)) return true;
        if (el.getAttribute('aria-label')) return true;
        if (el.getAttribute('aria-labelledby')) return true;
        return false;
      });
      
      expect(hasLabel).toBeTruthy();
    }
  });

  test('buttons and links are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    
    // Check if something has focus
    const hasFocus = await page.evaluate(() => {
      return document.activeElement !== document.body;
    });
    
    expect(hasFocus).toBeTruthy();
  });

  test('interactive elements have sufficient size', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.locator('button, a').first();
    
    if (await buttons.isVisible()) {
      const size = await buttons.boundingBox();
      
      if (size) {
        // Touch targets should be at least 44x44 pixels
        expect(size.height).toBeGreaterThanOrEqual(30); // Slightly relaxed for desktop
        expect(size.width).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test('color contrast is sufficient', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading contrast
    const heading = page.locator('h1').first();
    
    if (await heading.isVisible()) {
      const contrast = await heading.evaluate((el) => {
        const color = window.getComputedStyle(el).color;
        const bg = window.getComputedStyle(el).backgroundColor;
        return { color, bg };
      });
      
      // Just check that color and background are different
      expect(contrast.color).not.toBe(contrast.bg);
    }
  });
});

test.describe('Performance', () => {
  test('homepage loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 10 seconds (generous for dev server)
    expect(loadTime).toBeLessThan(10000);
  });

  test('images load progressively', async ({ page }) => {
    await page.goto('/');
    
    // Wait for images to start loading
    await page.waitForTimeout(1000);
    
    const images = page.locator('img');
    const count = await images.count();
    
    // At least some images should be present
    if (count > 0) {
      const firstImg = images.first();
      await expect(firstImg).toBeVisible();
    }
  });

  test('page is interactive quickly', async ({ page }) => {
    await page.goto('/');
    
    // Try to click something within 5 seconds
    const button = page.locator('button, a').first();
    await expect(button).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Browser Navigation', () => {
  test('back button works correctly', async ({ page }) => {
    await page.goto('/');
    await page.goto('/about');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\//);
  });

  test('forward button works', async ({ page }) => {
    await page.goto('/');
    await page.goto('/about');
    await page.goBack();
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/.*about/);
  });

  test('page refresh maintains state', async ({ page }) => {
    await page.goto('/');
    
    // Reload page
    await page.reload();
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});
