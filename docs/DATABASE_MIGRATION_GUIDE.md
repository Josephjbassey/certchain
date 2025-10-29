# Database Migration Application Guide

## Current Status

✅ Applied: `20251028000002_fix_rls_performance.sql`  
✅ Applied: `20251028000003_configure_hedera.sql`

⏳ **Pending**: 4 migrations need to be applied

**Note**: Migration `20251028000000` must be applied before `20251028000001`

---

## Migrations to Apply (In Order)

### 1. Fix Security Vulnerabilities (Function Search Path)

**File**: `supabase/migrations/20251028000000_fix_security_vulnerabilities.sql`

**What it does**:

- Fixes `function_search_path_mutable` warnings by adding `SET search_path` to:
  - `update_user_dids_updated_at()` trigger function
  - `handle_api_keys_updated_at()` trigger function
  - `clean_expired_invitations()` scheduled function
  - `handle_new_user_invitation()` trigger function
  - `get_certificates_secure()` query function

**Expected outcome**: Resolves 2 `function_search_path_mutable` WARN security issues

**Security impact**: Prevents search path manipulation attacks where malicious users could create functions in other schemas to hijack execution

**To apply**:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20251028000000_fix_security_vulnerabilities.sql
-- Into Supabase Dashboard > SQL Editor > Run
```

---

### 2. Fix Database Performance (Index Optimization)

**File**: `supabase/migrations/20251028000001_fix_database_performance.sql`

**What it does**:

- Adds missing foreign key index on `invitations.invited_by`
- Removes duplicate indexes: `idx_user_dids_hash`, `idx_user_dids_hcs_topic`
- Removes duplicate indexes: `idx_certificate_cache_issuer_did`, `user_dids_account_id_network_key`

**Expected outcome**: Resolves 2 `duplicate_index` warnings

**To apply**:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20251028000001_fix_database_performance.sql
-- Into Supabase Dashboard > SQL Editor > Run
```

---

### 2. Fix Database Performance (Index Optimization)

**File**: `supabase/migrations/20251028000004_fix_remaining_rls_issues.sql`

**What it does**:

- Fixes remaining `auth_rls_initplan` warnings for:
  - `invitations` table (2 policies)
  - `user_dids` service role policy
  - `user_dids` public read policy
- Removes redundant API keys policies

**Expected outcome**: Resolves remaining 10 `auth_rls_initplan` warnings

**To apply**:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20251028000004_fix_remaining_rls_issues.sql
-- Into Supabase Dashboard > SQL Editor > Run
```

---

### 3. Fix Remaining RLS Issues

**File**: `supabase/migrations/20251028000005_cleanup_duplicate_policies.sql`

**What it does**:

Consolidates ALL multiple permissive policies into single efficient policies using OR conditions:

- **application_logs**: 2 SELECT policies → 1 consolidated ("Users can view relevant application logs")
- **audit_logs**: 3 SELECT policies → 1 consolidated ("Users can view relevant audit logs")
- **certificate_cache**: 4 SELECT policies → 1 consolidated with public access
- **institutions**: 4 SELECT + 2 UPDATE policies → 1 each consolidated
- **instructor_candidates**: 4 SELECT + 2 INSERT policies → 1 each consolidated
- **invitations**: 2 SELECT policies → 1 consolidated + 1 management policy
- **profiles**: 4 SELECT + 3 UPDATE policies → 1 each consolidated
- **user_dids**: 3 SELECT + 2 each for CRUD → 1 SELECT + 1 ALL policy
- **user_roles**: 2 SELECT policies → 1 consolidated + 1 management policy
- **user_scopes**: 3 SELECT + 2 each for CRUD → 1 SELECT + 1 ALL policy
- **webhooks**: 2 policies per action (8 total) → 1 ALL policy

**Expected outcome**: Resolves **~200+ `multiple_permissive_policies` warnings**

**Key improvements**:

- Single policy with OR conditions is more efficient than multiple policies
- Maintains all access patterns (users, instructors, admins, super admins)
- Reduces RLS evaluation overhead significantly

**To apply**:

```sql
-- Copy and paste the entire contents of:
-- supabase/migrations/20251028000005_cleanup_duplicate_policies.sql
-- Into Supabase Dashboard > SQL Editor > Run
```

---

## Post-Migration Verification

After applying all 4 migrations, run the Supabase Linter again:

1. Go to **Supabase Dashboard** > **Database** > **Linter**
2. Click **Run Linter**
3. Verify results:

**Expected warnings remaining**:

- ✅ **0 function_search_path_mutable** warnings (fixed by migration 20251028000000)
- ✅ **0 multiple_permissive_policies** warnings (fixed by migration 20251028000005)
- ✅ **0 auth_rls_initplan** warnings (fixed by migration 20251028000005)
- ⚠️ **~30 unused_index** INFO warnings (expected - indexes unused until production)
- ⚠️ **1 auth_leaked_password_protection** WARN (requires Auth config, not migration)

All critical database linter warnings should be resolved!

**Why migrations work**:

- ✅ Migration 20251028000000 adds `SET search_path` to all vulnerable functions
- ✅ Migration 20251028000005 consolidates ALL duplicate policies across all tables
- ✅ Uses efficient OR conditions in single policies instead of multiple policies
- ✅ PostgreSQL only evaluates one policy per role/action instead of 2-4
- ✅ Maintains exact same access control logic with better performance

## Performance Impact

Before migrations:

- ~200+ multiple_permissive_policies warnings
- 2 function_search_path_mutable security warnings
- PostgreSQL evaluating 2-4 policies per query on many tables
- Suboptimal RLS performance

After migrations:

- 0 multiple_permissive_policies warnings expected
- 0 function_search_path_mutable warnings expected
- Single consolidated policy per role/action
- Significantly improved query performance
- Same security guarantees maintained
- ✅ Only necessary policies remain for different access levels (user/admin/super admin)

---

## Migration Order Summary

```
┌─────────────────────────────────────────────────────────────┐
│ Migration Application Order                                  │
├─────────────────────────────────────────────────────────────┤
│ ✅ 20251028000000_fix_security_vulnerabilities.sql         │
│ ⏳ 20251028000001_fix_database_performance.sql    <- NEXT  │
│ ✅ 20251028000002_fix_rls_performance.sql                  │
│ ✅ 20251028000003_configure_hedera.sql                     │
│ ⏳ 20251028000004_fix_remaining_rls_issues.sql             │
│ ⏳ 20251028000005_cleanup_duplicate_policies.sql           │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### If you encounter errors:

**Error: "policy already exists"**

- Solution: The policy was already created in a previous migration. Safe to ignore or add `IF EXISTS` to the DROP statement.

**Error: "index does not exist"**

- Solution: The index was already dropped or never existed. Safe to ignore with `IF EXISTS`.

**Error: "cannot change return type of existing function"**

- Solution: Add `DROP FUNCTION IF EXISTS function_name()` before `CREATE FUNCTION` (like we did with `clean_expired_invitations`).

---

## Final State

After all migrations:

- ✅ All search_path security vulnerabilities fixed
- ✅ All RLS policies optimized with `(SELECT auth.uid())` pattern
- ✅ All duplicate indexes removed
- ✅ All duplicate policies consolidated
- ✅ Hedera resource IDs configured
- ✅ Database performance optimized
- ✅ Production-ready database schema

---

## Next Steps After Migrations

1. **Test DID Creation**: Try creating an institutional DID (was failing due to user_id NOT NULL constraint - fixed in earlier migrations)
2. **Monitor Performance**: Check query performance improvements from index and RLS optimizations
3. **Deploy**: All code is ready, database is optimized - ready for production use

---

**Total time to apply**: ~5-10 minutes
**Risk level**: Low (all migrations use `IF EXISTS` for safety)
**Rollback**: Each migration is in a `BEGIN`/`COMMIT` transaction block
