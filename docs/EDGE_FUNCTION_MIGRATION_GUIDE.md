# Edge Function Migration Examples

This guide shows how to update existing edge functions to use the new shared utilities.

---

## Example 1: hedera-mint-certificate

### Before (Old Pattern)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  Client,
  PrivateKey,
  AccountId,
} from "https://esm.sh/@hashgraph/sdk@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientAccountId, metadataCid, userId } = await req.json();

    if (!recipientAccountId || !metadataCid) {
      throw new Error("recipientAccountId and metadataCid are required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ... rest of logic

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

### After (New Pattern)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  PrivateKey,
  AccountId,
} from "https://esm.sh/@hashgraph/sdk@2.75.0";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import { validateRequest, COMMON_SCHEMAS } from "../_shared/validators.ts";
import { createLogger, logTransaction } from "../_shared/logger.ts";
import {
  getAuthenticatedUser,
  createServiceClient,
} from "../_shared/supabase-auth.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger("hedera-mint-certificate", req);

  try {
    // Validate input
    const body = await validateRequest(req, COMMON_SCHEMAS.hederaMint);
    logger.info("Request validated", {
      recipientAccountId: body.recipientAccountId,
    });

    // Authenticate user
    const { user } = await getAuthenticatedUser(req, logger);

    // Create service client for elevated operations
    const supabase = createServiceClient();

    // ... rest of logic

    logTransaction(logger, "certificate_mint", transactionId, {
      tokenId,
      serialNumber,
      recipientAccountId: body.recipientAccountId,
    });

    return successResponse({
      success: true,
      tokenId,
      serialNumber,
      transactionId,
      explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`,
    });
  } catch (error) {
    logger.error("Minting failed", error);
    return handleError(error);
  }
});
```

**Benefits:**

- ✅ Automatic input validation with clear error messages
- ✅ Structured logging for better debugging
- ✅ Consistent error responses
- ✅ Authentication handled automatically
- ✅ Less boilerplate code (30% reduction)

---

## Example 2: hedera-create-did

### Before

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userAccountId, network = "testnet" } = await req.json();

    if (!userAccountId) {
      return new Response(
        JSON.stringify({ error: "userAccountId is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate account ID format
    const accountIdRegex = /^\d+\.\d+\.\d+$/;
    if (!accountIdRegex.test(userAccountId)) {
      return new Response(
        JSON.stringify({ error: "Invalid account ID format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const did = `did:hedera:${network}:${userAccountId}`;

    return new Response(
      JSON.stringify({ success: true, did, accountId: userAccountId, network }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
```

### After

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  handleError,
  successResponse,
  badRequestError,
} from "../_shared/error-handler.ts";
import {
  validateRequest,
  COMMON_SCHEMAS,
  isValidHederaAccountId,
} from "../_shared/validators.ts";
import { createLogger } from "../_shared/logger.ts";
import { getAuthenticatedUser } from "../_shared/supabase-auth.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger("hedera-create-did", req);

  try {
    // Validate input with schema
    const { userAccountId, network } = await validateRequest(
      req,
      COMMON_SCHEMAS.hederaDid
    );

    logger.info("Creating DID", { userAccountId, network });

    // Authenticate user (optional for DID creation)
    const { user } = await getAuthenticatedUser(req, logger);

    // Create DID
    const did = `did:hedera:${network}:${userAccountId}`;

    logger.info("DID created", { did, userId: user.id });

    return successResponse({
      success: true,
      did,
      accountId: userAccountId,
      network,
    });
  } catch (error) {
    logger.error("DID creation failed", error);
    return handleError(error);
  }
});
```

**Benefits:**

- ✅ Built-in account ID validation
- ✅ Structured logging
- ✅ User authentication tracking
- ✅ Consistent response format

---

## Example 3: send-invitation-email

### Before

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authorization } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { email, role, institutionId } = await req.json();

    if (!email || !role || !institutionId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if user is admin of institution
    const { data: staff } = await supabase
      .from("institution_staff")
      .select("role")
      .eq("user_id", user.id)
      .eq("institution_id", institutionId)
      .single();

    if (!staff || staff.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    // ... send email logic

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
```

### After

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleError, successResponse } from "../_shared/error-handler.ts";
import {
  validateRequest,
  isValidEmail,
  isValidUUID,
} from "../_shared/validators.ts";
import { createLogger, logExternalApiCall } from "../_shared/logger.ts";
import {
  getAuthenticatedUser,
  requireInstitutionMembership,
} from "../_shared/supabase-auth.ts";

const INVITATION_SCHEMA = {
  email: {
    type: "string" as const,
    required: true,
    validate: isValidEmail,
    errorMessage: "Invalid email address",
  },
  role: {
    type: "string" as const,
    required: true,
    enum: ["admin", "staff", "instructor"],
  },
  institutionId: {
    type: "string" as const,
    required: true,
    validate: isValidUUID,
    errorMessage: "Invalid institution ID",
  },
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger("send-invitation-email", req);

  try {
    // Validate input
    const { email, role, institutionId } = await validateRequest(
      req,
      INVITATION_SCHEMA
    );

    // Authenticate and get user
    const { user, supabase } = await getAuthenticatedUser(req, logger);

    // Verify institution membership
    await requireInstitutionMembership(
      supabase,
      user.id,
      institutionId,
      logger
    );

    logger.info("Sending invitation", { email, role, institutionId });

    // ... send email logic

    const startTime = Date.now();
    // ... actual email sending
    const duration = Date.now() - startTime;

    logExternalApiCall(logger, "Resend", "/emails", true, duration, {
      email,
      role,
    });

    return successResponse({ success: true, email });
  } catch (error) {
    logger.error("Invitation failed", error);
    return handleError(error);
  }
});
```

**Benefits:**

- ✅ Email validation built-in
- ✅ Institution membership check automated
- ✅ External API call logging
- ✅ Clean separation of concerns

---

## Example 4: Custom Schema with Complex Validation

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  handleError,
  successResponse,
  badRequestError,
} from "../_shared/error-handler.ts";
import {
  validateRequest,
  type ValidationSchema,
} from "../_shared/validators.ts";
import { createLogger } from "../_shared/logger.ts";
import { getAuthenticatedUser, requireRole } from "../_shared/supabase-auth.ts";

// Custom schema for batch certificate issuance
const BATCH_ISSUE_SCHEMA: ValidationSchema = {
  recipients: {
    type: "array",
    required: true,
    validate: (recipients: any[]) => {
      if (!Array.isArray(recipients)) return false;
      if (recipients.length === 0 || recipients.length > 100) return false;

      return recipients.every(
        (r) =>
          r.email &&
          r.name &&
          typeof r.email === "string" &&
          typeof r.name === "string"
      );
    },
    errorMessage:
      "Recipients must be an array of 1-100 objects with email and name",
  },
  templateId: {
    type: "string",
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    errorMessage: "Invalid template ID format",
  },
  institutionId: {
    type: "string",
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    errorMessage: "Invalid institution ID format",
  },
  scheduledFor: {
    type: "string",
    required: false,
    validate: (date: string) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed > new Date();
    },
    errorMessage: "Scheduled date must be in the future",
  },
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger("batch-issue-certificates", req);

  try {
    // Validate complex input
    const { recipients, templateId, institutionId, scheduledFor } =
      await validateRequest(req, BATCH_ISSUE_SCHEMA);

    logger.info("Batch issue initiated", {
      recipientCount: recipients.length,
      templateId,
      institutionId,
    });

    // Authenticate
    const { user, supabase } = await getAuthenticatedUser(req, logger);

    // Require institution admin role
    const userRole = await requireRole(
      supabase,
      user.id,
      ["institution_admin", "super_admin"],
      logger
    );

    // ... batch processing logic

    logger.info("Batch issue completed", {
      total: recipients.length,
      success: successCount,
      failed: failedCount,
    });

    return successResponse({
      success: true,
      total: recipients.length,
      processed: successCount,
      failed: failedCount,
      batchId,
    });
  } catch (error) {
    logger.error("Batch issue failed", error);
    return handleError(error);
  }
});
```

---

## Common Patterns

### Pattern 1: Public Endpoint (No Auth)

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger("public-endpoint", req);

  try {
    const body = await validateRequest(req, schema);

    // No authentication required

    // ... logic

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
});
```

### Pattern 2: Authenticated Endpoint

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger("authenticated-endpoint", req);

  try {
    const body = await validateRequest(req, schema);

    // Require authentication
    const { user, supabase } = await getAuthenticatedUser(req, logger);

    // ... logic with user context

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
});
```

### Pattern 3: Role-Protected Endpoint

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger("role-protected-endpoint", req);

  try {
    const body = await validateRequest(req, schema);

    const { user, supabase } = await getAuthenticatedUser(req, logger);

    // Require specific role
    await requireRole(supabase, user.id, "institution_admin", logger);

    // ... logic

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
});
```

### Pattern 4: API Key Endpoint

```typescript
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger("api-key-endpoint", req);

  try {
    const body = await validateRequest(req, schema);

    // Get API key from header
    const apiKey = req.headers.get("X-API-Key");
    if (!apiKey) {
      throw unauthorizedError("API key required");
    }

    // Verify API key
    const supabase = createServiceClient();
    const { userId, institutionId } = await verifyApiKey(
      supabase,
      apiKey,
      logger
    );

    logger.info("API key verified", { userId, institutionId });

    // ... logic

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
});
```

---

## Checklist for Migration

When updating an edge function, make sure to:

- [ ] Import shared utilities from `_shared/`
- [ ] Replace manual CORS with `corsHeaders` import
- [ ] Replace `try/catch` with `handleError()` and `successResponse()`
- [ ] Replace manual JSON parsing with `validateRequest()`
- [ ] Replace manual auth checks with `getAuthenticatedUser()`
- [ ] Replace console.log with structured `logger`
- [ ] Add JSDoc comments for the function
- [ ] Test the function locally
- [ ] Update function documentation
- [ ] Deploy and verify in production

---

## Testing Your Migrated Function

```bash
# Serve locally
supabase functions serve function-name --no-verify-jwt --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# Check logs
# Logs should now be structured JSON format
```

---

**Last Updated:** October 31, 2025  
**Applies To:** All Supabase Edge Functions
