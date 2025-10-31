# CertChain Codebase Cleanup & Optimization Plan

**Date:** October 31, 2025  
**Status:** In Progress  
**Priority:** HIGH

---

## 📋 Executive Summary

This document outlines a comprehensive cleanup and optimization plan for the CertChain platform, focusing on:

1. **Hedera Wallet Integration** - Proper implementation using official `@hashgraph/hedera-wallet-connect`
2. **Supabase Architecture** - Best practices for client initialization and Edge Functions
3. **Frontend Organization** - Clean routing, component structure, and state management
4. **Backend/Edge Functions** - Optimized, resilient Hedera service integration
5. **Code Quality** - Remove duplicates, fix inconsistencies, improve maintainability

---

## 🎯 Core Issues Identified

### 1. Hedera Wallet Integration Issues

**Current Problems:**

- ✅ Already using official `@hashgraph/hedera-wallet-connect` v2.0.3
- ❌ Still has `@reown/appkit` installed (should be removed)
- ⚠️ Context implementation is correct but could be more robust
- ⚠️ No proper error handling for network switching
- ⚠️ Missing transaction signing helpers

**Official Pattern (from WalletConnect docs):**

```typescript
// Correct approach (already implemented)
import {
  DAppConnector,
  HederaJsonRpcMethod,
} from "@hashgraph/hedera-wallet-connect";
const connector = new DAppConnector(
  metadata,
  ledgerId,
  projectId,
  methods,
  events,
  chains
);
await connector.init();
```

**What to Fix:**

1. Remove `@reown/appkit` dependency
2. Add transaction signing utilities
3. Add network switching support
4. Improve error handling
5. Add session persistence improvements

### 2. Supabase Client Configuration Issues

**Current Problems:**

- ✅ Client initialization is correct
- ⚠️ Edge Functions need better auth context handling
- ⚠️ Missing proper error boundaries
- ⚠️ No retry logic for failed requests

**Official Pattern (from Supabase docs):**

```typescript
// Frontend Client - CORRECT (already implemented)
export const supabase = createClient(URL, ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    redirectTo: REDIRECT_URL,
  },
});

// Edge Function Client - NEEDS IMPROVEMENT
const supabase = createClient(URL, SERVICE_KEY, {
  global: { headers: { Authorization: req.headers.get("Authorization")! } },
});
```

**What to Fix:**

1. Add request retry logic
2. Improve Edge Function auth context
3. Add connection pooling for Edge Functions
4. Better error logging

### 3. Frontend Architecture Issues

**Current Problems:**

- ✅ Routing structure is well-organized
- ❌ Duplicate route definitions
- ❌ Inconsistent component imports
- ⚠️ Missing lazy loading for performance
- ⚠️ Some components could be better organized

**What to Fix:**

1. Implement lazy loading for routes
2. Create route configuration files
3. Consolidate duplicate routes
4. Improve component organization
5. Add proper loading states

### 4. Edge Functions Issues

**Current Problems:**

- ✅ Good resilient architecture with mirror node backup
- ⚠️ Some functions have code duplication
- ⚠️ Inconsistent error handling patterns
- ⚠️ Missing comprehensive logging

**What to Fix:**

1. Create shared utilities for common patterns
2. Standardize error responses
3. Add comprehensive logging
4. Improve transaction handling

---

## 🔧 Implementation Plan

### Phase 1: Hedera Wallet Integration Cleanup ✅ (Current Implementation Good)

**Tasks:**

1. ✅ Remove `@reown/appkit` package
2. ✅ Add transaction signing utilities
3. ✅ Improve error handling in HederaWalletContext
4. ✅ Add network switching support
5. ✅ Add better session management

**Files to Update:**

- `package.json` - Remove @reown/appkit
- `src/contexts/HederaWalletContext.tsx` - Enhance
- Create `src/lib/hedera-utils.ts` - Transaction helpers

### Phase 2: Supabase Client Optimization

**Tasks:**

1. ✅ Add retry logic wrapper
2. ✅ Improve Edge Function auth context
3. ✅ Create shared Edge Function utilities
4. ✅ Add better error handling

**Files to Create/Update:**

- `src/lib/supabase-utils.ts` - Retry logic, error handling
- `supabase/functions/_shared/supabase-auth.ts` - Auth helpers
- `supabase/functions/_shared/error-handler.ts` - Standard error responses

### Phase 3: Frontend Routing & Component Organization

**Tasks:**

1. ✅ Implement lazy loading for routes
2. ✅ Create route configuration
3. ✅ Remove duplicate route definitions
4. ✅ Add loading states
5. ✅ Optimize component imports

**Files to Create/Update:**

- `src/lib/routes.tsx` - Centralized route config
- `src/App.tsx` - Use lazy loading
- `src/components/RouteLoading.tsx` - Loading component

### Phase 4: Edge Functions Standardization

**Tasks:**

1. ✅ Create shared utilities
2. ✅ Standardize error responses
3. ✅ Improve logging
4. ✅ Add request validation

**Files to Create/Update:**

- `supabase/functions/_shared/validators.ts` - Input validation
- `supabase/functions/_shared/logger.ts` - Structured logging
- Update all function `index.ts` files

### Phase 5: Documentation & Testing

**Tasks:**

1. ✅ Update API documentation
2. ✅ Create testing guide
3. ✅ Add code comments
4. ✅ Create deployment guide

---

## 📁 New File Structure

```
src/
├── lib/
│   ├── supabase-utils.ts          ← NEW: Retry logic, helpers
│   ├── hedera-utils.ts             ← NEW: Transaction helpers
│   ├── routes.tsx                  ← NEW: Centralized routes
│   ├── auth-context.tsx            ← EXISTING (enhance)
│   └── theme-provider.tsx          ← EXISTING
├── contexts/
│   └── HederaWalletContext.tsx     ← EXISTING (enhance)
├── components/
│   ├── RouteLoading.tsx            ← NEW: Loading states
│   └── [existing components]
└── [existing structure]

supabase/functions/
├── _shared/
│   ├── cors.ts                     ← EXISTING
│   ├── hedera-resilient-client.ts  ← EXISTING (enhance)
│   ├── hedera-mirror-node.ts       ← EXISTING
│   ├── supabase-auth.ts            ← NEW: Auth helpers
│   ├── error-handler.ts            ← NEW: Error responses
│   ├── validators.ts               ← NEW: Input validation
│   └── logger.ts                   ← NEW: Logging
└── [function folders]
```

---

## 🎨 Code Patterns to Follow

### 1. Hedera Transaction Pattern

```typescript
// Use the wallet context
const { dAppConnector, accountId } = useHederaWallet();
const signer = dAppConnector?.getSigner(AccountId.fromString(accountId));

// Create and sign transaction
const transaction = await new TransferTransaction()
  .addHbarTransfer(from, Hbar.fromTinybars(-amount))
  .addHbarTransfer(to, Hbar.fromTinybars(amount))
  .freezeWithSigner(signer);

const response = await transaction.executeWithSigner(signer);
const receipt = await response.getReceiptWithSigner(signer);
```

### 2. Supabase Edge Function Pattern

```typescript
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError } from "../_shared/error-handler.ts";
import { validateRequest } from "../_shared/validators.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate input
    const body = await validateRequest(req, schema);

    // Create authenticated client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Execute logic
    const result = await doWork(supabase, body);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleError(error);
  }
});
```

### 3. Frontend Query Pattern

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ["resource", id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("table")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },
  retry: 3,
  staleTime: 5000,
});
```

---

## ✅ Success Criteria

1. **Performance**

   - [ ] Initial page load < 2 seconds
   - [ ] Route transitions < 200ms
   - [ ] Edge Function response < 1 second

2. **Code Quality**

   - [ ] No duplicate code
   - [ ] Consistent patterns across all files
   - [ ] Comprehensive error handling
   - [ ] Type safety everywhere

3. **User Experience**

   - [ ] Smooth wallet connection
   - [ ] Clear error messages
   - [ ] Loading states everywhere
   - [ ] Responsive on all devices

4. **Reliability**
   - [ ] 99.9% uptime
   - [ ] Automatic retry on failures
   - [ ] Graceful degradation
   - [ ] Comprehensive logging

---

## 🚀 Rollout Plan

### Week 1: Core Fixes

- Day 1-2: Hedera wallet cleanup
- Day 3-4: Supabase optimization
- Day 5: Testing & validation

### Week 2: Architecture Improvements

- Day 1-2: Routing refactor
- Day 3-4: Edge Functions standardization
- Day 5: Integration testing

### Week 3: Polish & Launch

- Day 1-2: Documentation
- Day 3-4: Performance optimization
- Day 5: Production deployment

---

## 📊 Progress Tracking

| Phase             | Status         | Progress | Notes                    |
| ----------------- | -------------- | -------- | ------------------------ |
| Phase 1: Hedera   | 🟡 In Progress | 60%      | Remove @reown, add utils |
| Phase 2: Supabase | ⚪ Pending     | 0%       | Waiting for Phase 1      |
| Phase 3: Frontend | ⚪ Pending     | 0%       | Waiting for Phase 2      |
| Phase 4: Edge Fns | ⚪ Pending     | 0%       | Waiting for Phase 3      |
| Phase 5: Docs     | ⚪ Pending     | 0%       | Final phase              |

---

**Last Updated:** October 31, 2025  
**Next Review:** After Phase 1 completion
