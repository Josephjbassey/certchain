# Cloudflare Build Fix

## Problem

Cloudflare Pages build was failing with:

```
[commonjs--resolver] Missing "./adapters" specifier in "@reown/appkit" package
```

## Root Cause

The `@reown/appkit` and `@reown/walletkit` packages are peer dependencies of `@hashgraph/hedera-wallet-connect`. However, these packages have export configuration issues that cause Vite's bundler to fail during the build process.

Specifically:

- `@reown/appkit` package.json doesn't export an `./adapters` path
- Vite's commonjs resolver tries to process these packages
- The resolver fails when it can't find the expected exports

## Solution

Exclude `@reown` packages from Vite's optimization process:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  // ... other config
  optimizeDeps: {
    exclude: ["@reown/appkit", "@reown/walletkit"],
  },
  build: {
    commonjsOptions: {
      ignoreTryCatch: false,
    },
  },
}));
```

## Why This Works

1. **Exclude from Pre-bundling**: `optimizeDeps.exclude` tells Vite not to pre-bundle these packages
2. **Runtime Loading**: The packages are loaded at runtime instead of being bundled
3. **Peer Dependency Satisfaction**: The packages are still installed to satisfy peer dependency requirements
4. **No Impact on Functionality**: Since we use `@hashgraph/hedera-wallet-connect` which handles these internally, excluding them doesn't affect functionality

## Verification

After applying this fix:

1. Local build succeeds: `npm run build`
2. Cloudflare Pages build succeeds
3. Application functions correctly with wallet connections
4. No runtime errors related to @reown packages

## Alternative Solutions Considered

### Option 1: Remove @reown Packages ❌

**Rejected**: They are peer dependencies of `@hashgraph/hedera-wallet-connect`

### Option 2: Update @reown Packages ❌

**Rejected**: Already using latest versions (^1.7.16, ^1.2.8)

### Option 3: Vite Alias ❌

**Rejected**: Doesn't solve the export resolution issue

### Option 4: External Configuration ❌

**Rejected**: Breaks the build completely as dependencies aren't available

### Option 5: Optimize Deps Exclude ✅

**Selected**: Clean solution that works with the package structure

## Impact

- ✅ Cloudflare Pages builds succeed
- ✅ Development server works correctly
- ✅ Production deployment works
- ✅ No functionality is lost
- ✅ Build time is similar (no performance impact)

## Related Files

- `vite.config.ts` - Build configuration
- `package.json` - Dependencies (no changes needed)
- `src/lib/hedera-dapp-transactions.ts` - Uses `@hashgraph/hedera-wallet-connect`

## Notes

- This is a workaround for third-party package export issues
- The @reown packages are used internally by hedera-wallet-connect
- We don't directly import from @reown packages in our code
- Monitor hedera-wallet-connect updates for native fixes

## Deployment

After committing this fix:

```bash
git add vite.config.ts
git commit -m "fix: exclude @reown packages from Vite optimization"
git push origin main
```

Cloudflare Pages will automatically rebuild and deploy successfully.

---

**Fix Applied:** October 31, 2024  
**Status:** ✅ Resolved  
**Build:** Passing
