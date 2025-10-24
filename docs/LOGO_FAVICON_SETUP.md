# Logo and Favicon Integration Guide

This guide explains how to add your custom logo and favicon to the CertChain application.

## Overview

The application currently uses placeholder branding with:

- **Logo**: Shield icon with "CertChain" text gradient
- **Favicon**: Default Vite/React favicon

You'll need to replace these with your custom branding assets.

---

## Required Files

### Logo Files

Prepare the following logo variations:

1. **Full Logo (Horizontal)**

   - Format: SVG (preferred) or PNG
   - Dimensions: ~200x50px (4:1 ratio)
   - Use: Main navigation, landing page header
   - File name: `logo.svg` or `logo.png`

2. **Logo Icon (Square)**

   - Format: SVG (preferred) or PNG
   - Dimensions: 32x32px or 64x64px
   - Use: Dashboard sidebar, mobile navigation
   - File name: `logo-icon.svg` or `logo-icon.png`

3. **Logo Dark Mode** (optional)
   - Format: SVG or PNG
   - Same dimensions as full logo
   - Use: Displayed when dark mode is active
   - File name: `logo-dark.svg` or `logo-dark.png`

### Favicon Files

Generate a complete favicon set using a tool like [favicon.io](https://favicon.io):

1. **favicon.ico** - 32x32px, multi-resolution ICO file
2. **favicon-16x16.png** - 16x16px PNG
3. **favicon-32x32.png** - 32x32px PNG
4. **apple-touch-icon.png** - 180x180px PNG (for iOS)
5. **android-chrome-192x192.png** - 192x192px PNG
6. **android-chrome-512x512.png** - 512x512px PNG

---

## Installation Steps

### Step 1: Add Logo Files

1. Create an `images` directory in the `public` folder (if it doesn't exist):

   ```bash
   mkdir -p public/images
   ```

2. Copy your logo files to the directory:
   ```bash
   cp /path/to/your/logo.svg public/images/
   cp /path/to/your/logo-icon.svg public/images/
   cp /path/to/your/logo-dark.svg public/images/  # optional
   ```

### Step 2: Add Favicon Files

1. Copy favicon files to the `public` directory:
   ```bash
   cp /path/to/favicon.ico public/
   cp /path/to/favicon-*.png public/
   cp /path/to/apple-touch-icon.png public/
   cp /path/to/android-chrome-*.png public/
   ```

### Step 3: Update HTML Metadata

Edit `index.html` to reference the new favicons:

```html
<!-- In the <head> section, replace existing favicon references with: -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### Step 4: Create Web App Manifest

Create `public/site.webmanifest`:

```json
{
  "name": "CertChain",
  "short_name": "CertChain",
  "description": "Blockchain-powered certificate management",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#8B5CF6",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

### Step 5: Update Logo Components

#### A. Navigation Header (DashboardLayout)

Edit `src/components/DashboardLayout.tsx`:

```tsx
// Replace the Shield icon logo with:
<Link to="/" className="flex items-center gap-2">
  <img src="/images/logo-icon.svg" alt="CertChain" className="h-6 w-6" />
  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
    CertChain
  </span>
</Link>
```

Or use the full logo:

```tsx
<Link to="/" className="flex items-center">
  <img src="/images/logo.svg" alt="CertChain" className="h-8" />
</Link>
```

#### B. Landing Page (Index.tsx)

Edit `src/pages/Index.tsx`:

```tsx
// Replace the Shield icon in the hero section:
<Link to="/" className="inline-flex items-center gap-2 mb-8">
  <img src="/images/logo.svg" alt="CertChain" className="h-12" />
</Link>
```

#### C. Authentication Pages (Login, Signup)

Edit `src/pages/auth/Login.tsx` and `src/pages/auth/Signup.tsx`:

```tsx
// Replace the Shield icon:
<Link to="/" className="inline-flex items-center gap-2 mb-8">
  <img src="/images/logo.svg" alt="CertChain" className="h-10" />
</Link>
```

#### D. Empty Dashboard Pages

The following pages have headers with the Shield icon:

- Already fixed! All pages now use the DashboardLayout component

---

## Component Locations Reference

Files that currently use the Shield icon logo:

| Component         | File Path                             | Line Numbers (approx) |
| ----------------- | ------------------------------------- | --------------------- |
| Dashboard Layout  | `src/components/DashboardLayout.tsx`  | ~23                   |
| Landing Page      | `src/pages/Index.tsx`                 | ~25, ~140             |
| Login Page        | `src/pages/auth/Login.tsx`            | ~50                   |
| Signup Page       | `src/pages/auth/Signup.tsx`           | ~100                  |
| Forgot Password   | `src/pages/auth/ForgotPassword.tsx`   | ~40                   |
| About Page        | `src/pages/About.tsx`                 | ~15                   |
| Pricing Page      | `src/pages/Pricing.tsx`               | ~15                   |
| Contact Page      | `src/pages/Contact.tsx`               | ~15                   |
| Dashboard Sidebar | `src/components/DashboardSidebar.tsx` | ~140                  |

---

## Dark Mode Support (Optional)

If you provided a dark mode variant of your logo, add theme-aware logo switching:

```tsx
import { useTheme } from "@/lib/theme-provider";

const LogoComponent = () => {
  const { theme } = useTheme();
  const logoSrc =
    theme === "dark" ? "/images/logo-dark.svg" : "/images/logo.svg";

  return <img src={logoSrc} alt="CertChain" className="h-8" />;
};
```

---

## Testing Checklist

After adding your logo and favicon:

- [ ] Logo displays correctly on landing page
- [ ] Logo displays correctly in navigation/header
- [ ] Logo displays correctly on login/signup pages
- [ ] Logo icon displays in browser tab (favicon)
- [ ] Favicon appears when bookmarking the site
- [ ] Logo is readable at small sizes (mobile)
- [ ] Logo looks good on both light and dark backgrounds
- [ ] Apple touch icon appears on iOS home screen
- [ ] Android icons appear correctly when adding to home screen
- [ ] Logo SVGs scale properly at different resolutions
- [ ] No console errors about missing images

---

## Branding Colors

If you want to update the brand colors to match your logo:

Edit `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#YOUR_PRIMARY_COLOR', // e.g., '#8B5CF6'
        foreground: '#FFFFFF',
      },
      accent: {
        DEFAULT: '#YOUR_ACCENT_COLOR', // e.g., '#EC4899'
        foreground: '#FFFFFF',
      },
      // ... other colors
    }
  }
}
```

Update CSS variables in `src/index.css`:

```css
:root {
  --primary: YOUR_COLOR;
  --accent: YOUR_ACCENT;
}
```

---

## Need Help?

If you encounter issues:

1. Check browser console for image loading errors
2. Verify file paths are correct (case-sensitive)
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Ensure image files are in the correct format (SVG or PNG)
5. Test in multiple browsers

For SVG issues, ensure:

- SVG has viewBox attribute
- Width/height are defined
- No embedded raster images
- Colors are defined (not references to undefined IDs)

---

## Quick Replace Command

Once your files are in place, use this search-and-replace pattern to update all logo instances:

**Find:** `<Shield className="h-\d+ w-\d+ text-primary" />`
**Replace with:** `<img src="/images/logo-icon.svg" alt="Logo" className="h-X w-X" />`

(Adjust dimensions as needed)

---

## Additional Resources

- [Favicon Generator](https://favicon.io)
- [SVG Optimizer](https://jakearchibald.github.io/svgomg/)
- [Logo Design Best Practices](https://www.smashingmagazine.com/2009/08/vital-tips-for-effective-logo-design/)
- [Responsive Logo Guidelines](https://www.designbombs.com/responsive-logo-design/)
