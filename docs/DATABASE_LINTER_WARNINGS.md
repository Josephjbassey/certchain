# Supabase Database Linter Report

## Overview

This report contains warnings from the Supabase database linter for the CertChain database. The issues are categorized by type and severity.

**Total Warnings:** 164  
**Report Date:** October 27, 2025

---

## Issue Categories

### 1. Auth RLS Initialization Plan (Performance) - 54 warnings

**Issue:** Calls to `auth.<function>()` in RLS policies are being re-evaluated for each row, causing suboptimal query performance at scale.

**Solution:** Replace `auth.<function>()` with `(select auth.<function>())` to prevent re-evaluation per row.

**Documentation:** [Supabase RLS Performance Guide](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)

#### Affected Tables & Policies

| Table                                  | Policy Name                                                        | Issue                                  |
| -------------------------------------- | ------------------------------------------------------------------ | -------------------------------------- |
| **profiles** (8 policies)              |
|                                        | Users can view their own profile                                   | Re-evaluates `auth.uid()` for each row |
|                                        | Users can update their own profile                                 | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can view all profiles                                 | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can update all profiles                               | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can view profiles in their institution          | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can update profiles in their institution        | Re-evaluates `auth.uid()` for each row |
|                                        | Instructors can view their candidates                              | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can view aggregated profiles                          | Re-evaluates `auth.uid()` for each row |
| **user_roles** (2 policies)            |
|                                        | Users can view their own roles                                     | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can manage roles                                      | Re-evaluates `auth.uid()` for each row |
| **institutions** (4 policies)          |
|                                        | Users can view their institution                                   | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can view their institution                      | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can update their institution                    | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can manage all institutions                           | Re-evaluates `auth.uid()` for each row |
| **certificate_cache** (5 policies)     |
|                                        | Users can view their own certificates                              | Re-evaluates `auth.uid()` for each row |
|                                        | Instructors can view certificates they issued                      | Re-evaluates `auth.uid()` for each row |
|                                        | Instructors can issue certificates                                 | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can view certificates in their institution      | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can view aggregated certificate data                  | Re-evaluates `auth.uid()` for each row |
| **audit_logs** (5 policies)            |
|                                        | Users can view their own audit logs                                | Re-evaluates `auth.uid()` for each row |
|                                        | All authenticated users can insert audit logs                      | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can view logs in their institution              | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can view all audit logs                               | Re-evaluates `auth.uid()` for each row |
| **claim_tokens** (1 policy)            |
|                                        | Users can view their own claim tokens                              | Re-evaluates `auth.uid()` for each row |
| **instructor_candidates** (5 policies) |
|                                        | Instructors can view their candidates                              | Re-evaluates `auth.uid()` for each row |
|                                        | Instructors can enroll candidates                                  | Re-evaluates `auth.uid()` for each row |
|                                        | Candidates can view their instructor relationship                  | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can view all relationships in their institution | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can manage all relationships                          | Re-evaluates `auth.uid()` for each row |
| **user_scopes** (3 policies)           |
|                                        | Users can view their own scopes                                    | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can manage scopes in their institution          | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can manage all scopes                                 | Re-evaluates `auth.uid()` for each row |
| **hcs_events** (1 policy)              |
|                                        | Super admins can manage HCS events                                 | Re-evaluates `auth.uid()` for each row |
| **webhooks** (2 policies)              |
|                                        | Users can manage own webhooks                                      | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can manage webhooks                                   | Re-evaluates `auth.uid()` for each row |
| **user_dids** (5 policies)             |
|                                        | Users can view own DIDs                                            | Re-evaluates `auth.uid()` for each row |
|                                        | Users can manage own DIDs                                          | Re-evaluates `auth.uid()` for each row |
|                                        | Users manage own DIDs                                              | Re-evaluates `auth.uid()` for each row |
|                                        | Service role can manage all DIDs                                   | Re-evaluates `auth.uid()` for each row |
| **api_keys** (5 policies)              |
|                                        | Users can view own API keys                                        | Re-evaluates `auth.uid()` for each row |
|                                        | Users can manage own API keys                                      | Re-evaluates `auth.uid()` for each row |
|                                        | Users can view own api keys                                        | Re-evaluates `auth.uid()` for each row |
|                                        | Users can create own api keys                                      | Re-evaluates `auth.uid()` for each row |
|                                        | Users can update own api keys                                      | Re-evaluates `auth.uid()` for each row |
|                                        | Users can delete own api keys                                      | Re-evaluates `auth.uid()` for each row |
|                                        | Institution admins can view institution api keys                   | Re-evaluates `auth.uid()` for each row |
| **user_wallets** (2 policies)          |
|                                        | Users can view own wallets                                         | Re-evaluates `auth.uid()` for each row |
|                                        | Users can manage own wallets                                       | Re-evaluates `auth.uid()` for each row |
| **application_logs** (3 policies)      |
|                                        | Users can insert own logs                                          | Re-evaluates `auth.uid()` for each row |
|                                        | Users can view own logs                                            | Re-evaluates `auth.uid()` for each row |
|                                        | Super admins can view all logs                                     | Re-evaluates `auth.uid()` for each row |
| **invitations** (2 policies)           |
|                                        | Admins can manage invitations                                      | Re-evaluates `auth.uid()` for each row |
|                                        | Users can view their own invitation                                | Re-evaluates `auth.uid()` for each row |

---

### 2. Multiple Permissive Policies (Performance) - 107 warnings

**Issue:** Multiple permissive RLS policies exist for the same role and action, causing all policies to execute for every query. This is suboptimal for performance.

**Solution:** Consolidate multiple permissive policies into a single policy with OR conditions.

**Documentation:** [Supabase Multiple Policies Guide](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies)

#### Critical Duplication Issues

| Table                     | Role                             | Action               | Duplicate Policies                                                                                                                                                                                                                                             |
| ------------------------- | -------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **api_keys**              | anon/authenticated/authenticator | SELECT               | 4 policies: "Institution admins can view institution api keys", "Users can manage own API keys", "Users can view own API keys", "Users can view own api keys"                                                                                                  |
| **api_keys**              | anon/authenticated/authenticator | INSERT               | 2 policies: "Users can create own api keys", "Users can manage own API keys"                                                                                                                                                                                   |
| **api_keys**              | anon/authenticated/authenticator | UPDATE               | 2 policies: "Users can manage own API keys", "Users can update own api keys"                                                                                                                                                                                   |
| **api_keys**              | anon/authenticated/authenticator | DELETE               | 2 policies: "Users can delete own api keys", "Users can manage own API keys"                                                                                                                                                                                   |
| **user_dids**             | anon/authenticated/authenticator | SELECT               | 5 policies: "Public can read DID documents", "Service role can manage all DIDs", "Users can manage own DIDs", "Users can view own DIDs", "Users manage own DIDs"                                                                                               |
| **user_dids**             | anon/authenticated/authenticator | INSERT/UPDATE/DELETE | 3 policies: "Service role can manage all DIDs", "Users can manage own DIDs", "Users manage own DIDs"                                                                                                                                                           |
| **profiles**              | anon/authenticated/authenticator | SELECT               | 5 policies: "Institution admins can view profiles in their institution", "Instructors can view their candidates", "Super admins can view aggregated profiles", "Super admins can view all profiles", "Users can view their own profile"                        |
| **profiles**              | anon/authenticated/authenticator | UPDATE               | 3 policies: "Institution admins can update profiles in their institution", "Super admins can update all profiles", "Users can update their own profile"                                                                                                        |
| **certificate_cache**     | anon/authenticated/authenticator | SELECT               | 5 policies: "Certificates are viewable by all", "Institution admins can view certificates in their institution", "Instructors can view certificates they issued", "Super admins can view aggregated certificate data", "Users can view their own certificates" |
| **institutions**          | anon/authenticated/authenticator | SELECT               | 4 policies: "Institution admins can view their institution", "Institutions are viewable by all authenticated users", "Super admins can manage all institutions", "Users can view their institution"                                                            |
| **institutions**          | anon/authenticated/authenticator | UPDATE               | 2 policies: "Institution admins can update their institution", "Super admins can manage all institutions"                                                                                                                                                      |
| **audit_logs**            | anon/authenticated/authenticator | SELECT               | 3 policies: "Institution admins can view logs in their institution", "Super admins can view all audit logs", "Users can view their own audit logs"                                                                                                             |
| **application_logs**      | anon/authenticated/authenticator | SELECT               | 2 policies: "Super admins can view all logs", "Users can view own logs"                                                                                                                                                                                        |
| **instructor_candidates** | anon/authenticated/authenticator | SELECT               | 4 policies: "Candidates can view their instructor relationship", "Institution admins can view all relationships in their institution", "Instructors can view their candidates", "Super admins can manage all relationships"                                    |
| **instructor_candidates** | anon/authenticated/authenticator | INSERT               | 2 policies: "Instructors can enroll candidates", "Super admins can manage all relationships"                                                                                                                                                                   |
| **user_scopes**           | anon/authenticated/authenticator | SELECT               | 3 policies: "Institution admins can manage scopes in their institution", "Super admins can manage all scopes", "Users can view their own scopes"                                                                                                               |
| **user_scopes**           | anon/authenticated/authenticator | INSERT/UPDATE/DELETE | 2 policies: "Institution admins can manage scopes in their institution", "Super admins can manage all scopes"                                                                                                                                                  |
| **user_roles**            | anon/authenticated/authenticator | SELECT               | 2 policies: "Super admins can manage roles", "Users can view their own roles"                                                                                                                                                                                  |
| **user_wallets**          | anon/authenticated/authenticator | SELECT               | 2 policies: "Users can manage own wallets", "Users can view own wallets"                                                                                                                                                                                       |
| **webhooks**              | anon/authenticated/authenticator | ALL                  | 2 policies: "Super admins can manage webhooks", "Users can manage own webhooks"                                                                                                                                                                                |
| **invitations**           | authenticated                    | SELECT               | 2 policies: "Admins can manage invitations", "Users can view their own invitation"                                                                                                                                                                             |

**Note:** All 5 default roles are affected: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

---

### 3. Duplicate Indexes (Performance) - 3 warnings

**Issue:** Multiple identical indexes exist on the same columns, wasting storage and slowing down write operations.

**Solution:** Drop all duplicate indexes except one.

**Documentation:** [Supabase Duplicate Index Guide](https://supabase.com/docs/guides/database/database-linter?lint=0009_duplicate_index)

| Table         | Duplicate Indexes                                                   | Recommendation                                   |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| **user_dids** | `idx_user_dids_did_document_hash`, `idx_user_dids_hash`             | Drop one index (both index the same column)      |
| **user_dids** | `idx_user_dids_hcs_topic`, `idx_user_dids_hcs_topic_id`             | Drop one index (both index HCS topic)            |
| **user_dids** | `idx_user_dids_account_network`, `user_dids_account_id_network_key` | Drop one index (both index account_id + network) |

---

## Recommended Fixes

### Priority 1: Fix Auth RLS Performance (High Impact)

**Example Fix** for profiles table:

```sql
-- BEFORE (slow - re-evaluates for each row)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- AFTER (fast - evaluates once)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id);
```

**Apply to all 54 policies** by wrapping `auth.uid()` with `(SELECT ...)`.

### Priority 2: Consolidate Multiple Policies (Medium Impact)

**Example Fix** for api_keys table SELECT policies:

```sql
-- BEFORE (4 separate policies)
CREATE POLICY "Users can view own api keys" ...
CREATE POLICY "Users can view own API keys" ...
CREATE POLICY "Users can manage own API keys" ... (SELECT part)
CREATE POLICY "Institution admins can view institution api keys" ...

-- AFTER (1 consolidated policy)
CREATE POLICY "api_keys_select_policy"
  ON public.api_keys FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- User's own keys
    OR
    institution_id IN (  -- Institution admin can see institution keys
      SELECT id FROM public.institutions
      WHERE id IN (
        SELECT institution_id FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role IN ('institution_admin', 'super_admin')
      )
    )
  );
```

**Apply similar consolidation** to all tables with multiple policies.

### Priority 3: Remove Duplicate Indexes (Low Impact)

```sql
-- Drop duplicate indexes on user_dids table
DROP INDEX IF EXISTS idx_user_dids_hash;  -- Keep idx_user_dids_did_document_hash
DROP INDEX IF EXISTS idx_user_dids_hcs_topic;  -- Keep idx_user_dids_hcs_topic_id
DROP INDEX IF EXISTS idx_user_dids_account_network;  -- Keep user_dids_account_id_network_key
```

---

## Performance Impact Estimates

### Auth RLS Optimization

- **Current:** O(n) evaluations per query (n = rows)
- **After Fix:** O(1) evaluation per query
- **Expected Improvement:** 10-100x faster on large tables (1000+ rows)

### Policy Consolidation

- **Current:** Multiple policy evaluations per row per role
- **After Fix:** Single policy evaluation per row per role
- **Expected Improvement:** 2-5x faster query execution

### Index Deduplication

- **Current:** Duplicate index maintenance on writes
- **After Fix:** Single index maintenance
- **Expected Improvement:** Slightly faster writes, reduced storage

---

## Migration Script Template

```sql
-- ============================================
-- CertChain Database Performance Optimization
-- ============================================

BEGIN;

-- Step 1: Drop all existing RLS policies
-- (List all DROP POLICY commands here)

-- Step 2: Recreate policies with optimized auth.uid() calls
-- (Use (SELECT auth.uid()) instead of auth.uid())

-- Step 3: Consolidate duplicate policies
-- (Combine multiple policies into single policies with OR conditions)

-- Step 4: Remove duplicate indexes
DROP INDEX IF EXISTS idx_user_dids_hash;
DROP INDEX IF EXISTS idx_user_dids_hcs_topic;
DROP INDEX IF EXISTS idx_user_dids_account_network;

-- Step 5: Verify policies work correctly
-- (Add test queries here)

COMMIT;
```

---

## Testing Checklist

After applying fixes:

- [ ] Test all role-based queries (super_admin, institution_admin, instructor, candidate)
- [ ] Verify RLS policies still enforce correct access control
- [ ] Run EXPLAIN ANALYZE on slow queries to confirm performance improvement
- [ ] Test edge cases (users with multiple roles, cross-institution queries)
- [ ] Monitor query performance in production for 24-48 hours
- [ ] Verify no duplicate indexes remain: `SELECT * FROM pg_indexes WHERE schemaname = 'public'`

---

## Additional Resources

- [Supabase RLS Performance Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Database Linter Reference](https://supabase.com/docs/guides/database/database-linter)

---

**Last Updated:** October 27, 2025  
**Linter Version:** Supabase Database Linter (Latest)  
**Database:** CertChain Production
