# Database Linter Report - Additional Performance Issues

## Overview

This report documents additional performance warnings from the Supabase database linter for the CertChain database, focusing on unindexed foreign keys and unused indexes.

**Total Warnings:** 34  
**Report Date:** October 27, 2025  
**Severity Level:** INFO (Performance optimization opportunities)

---

## Issue Categories

### 1. Unindexed Foreign Keys - 1 warning

**Issue:** Foreign key constraints without covering indexes can cause performance degradation on JOIN operations and DELETE cascades.

**Impact:** Suboptimal query performance, especially on queries involving table joins.

**Documentation:** [Supabase Unindexed Foreign Keys Guide](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)

#### Affected Foreign Keys

| Table           | Foreign Key Name              | Columns               | Issue                    | Recommendation                      |
| --------------- | ----------------------------- | --------------------- | ------------------------ | ----------------------------------- |
| **invitations** | `invitations_invited_by_fkey` | invited_by (column 7) | No covering index exists | Create index on `invited_by` column |

**Fix:**

```sql
-- Add index for invitations.invited_by foreign key
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by
  ON public.invitations(invited_by);
```

**Why This Matters:**

- Speeds up queries that JOIN invitations with the referenced table
- Improves DELETE cascade performance
- Helps maintain referential integrity checks efficiently

---

### 2. Unused Indexes - 33 warnings

**Issue:** Indexes that have never been used consume storage space and slow down INSERT/UPDATE/DELETE operations without providing query benefits.

**Impact:**

- Wasted disk space
- Slower write operations (every write must update all indexes)
- Increased database maintenance overhead

**Documentation:** [Supabase Unused Index Guide](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)

#### Unused Indexes by Table

##### profiles (2 unused indexes)

| Index Name                       | Purpose                | Status         |
| -------------------------------- | ---------------------- | -------------- |
| `idx_profiles_institution_id`    | Institution lookups    | **Never used** |
| `idx_profiles_hedera_account_id` | Hedera account queries | **Never used** |

##### certificate_cache (4 unused indexes)

| Index Name                                   | Purpose               | Status         |
| -------------------------------------------- | --------------------- | -------------- |
| `idx_certificate_cache_token_id`             | Token lookups         | **Never used** |
| `idx_certificate_cache_recipient_account_id` | Recipient queries     | **Never used** |
| `idx_certificate_cache_issuer_did`           | Issuer lookups        | **Never used** |
| `idx_certificate_cache_institution_id`       | Institution filtering | **Never used** |

##### claim_tokens (2 unused indexes)

| Index Name                        | Purpose                | Status         |
| --------------------------------- | ---------------------- | -------------- |
| `idx_claim_tokens_token`          | Token lookups          | **Never used** |
| `idx_claim_tokens_certificate_id` | Certificate references | **Never used** |

##### instructor_candidates (3 unused indexes)

| Index Name                                 | Purpose               | Status         |
| ------------------------------------------ | --------------------- | -------------- |
| `idx_instructor_candidates_instructor_id`  | Instructor queries    | **Never used** |
| `idx_instructor_candidates_candidate_id`   | Candidate lookups     | **Never used** |
| `idx_instructor_candidates_institution_id` | Institution filtering | **Never used** |

##### audit_logs (3 unused indexes)

| Index Name                      | Purpose               | Status         |
| ------------------------------- | --------------------- | -------------- |
| `idx_audit_logs_user_id`        | User activity queries | **Never used** |
| `idx_audit_logs_institution_id` | Institution filtering | **Never used** |
| `idx_audit_logs_created_at`     | Time-based queries    | **Never used** |

##### hcs_events (2 unused indexes)

| Index Name                 | Purpose                   | Status         |
| -------------------------- | ------------------------- | -------------- |
| `idx_hcs_events_topic_id`  | Topic filtering           | **Never used** |
| `idx_hcs_events_processed` | Processing status queries | **Never used** |

##### webhooks (1 unused index)

| Index Name               | Purpose                  | Status         |
| ------------------------ | ------------------------ | -------------- |
| `idx_webhooks_is_active` | Active webhook filtering | **Never used** |

##### user_dids (6 unused indexes)

| Index Name                        | Purpose               | Status                     |
| --------------------------------- | --------------------- | -------------------------- |
| `idx_user_dids_account_id`        | Account lookups       | **Never used**             |
| `idx_user_dids_did_document_hash` | Document hash queries | **Never used** (duplicate) |
| `idx_user_dids_hcs_topic_id`      | Topic filtering       | **Never used** (duplicate) |
| `idx_user_dids_hash`              | Hash queries          | **Never used** (duplicate) |
| `idx_user_dids_hcs_topic`         | Topic queries         | **Never used** (duplicate) |

##### api_keys (3 unused indexes)

| Index Name                    | Purpose               | Status         |
| ----------------------------- | --------------------- | -------------- |
| `idx_api_keys_key_hash`       | Key hash lookups      | **Never used** |
| `idx_api_keys_institution_id` | Institution filtering | **Never used** |
| `idx_api_keys_is_active`      | Active key filtering  | **Never used** |

##### user_wallets (1 unused index)

| Index Name                    | Purpose         | Status         |
| ----------------------------- | --------------- | -------------- |
| `idx_user_wallets_account_id` | Account lookups | **Never used** |

##### application_logs (2 unused indexes)

| Index Name                       | Purpose             | Status         |
| -------------------------------- | ------------------- | -------------- |
| `idx_application_logs_level`     | Log level filtering | **Never used** |
| `idx_application_logs_timestamp` | Time-based queries  | **Never used** |

##### invitations (3 unused indexes)

| Index Name                | Purpose            | Status         |
| ------------------------- | ------------------ | -------------- |
| `idx_invitations_token`   | Token lookups      | **Never used** |
| `idx_invitations_email`   | Email searches     | **Never used** |
| `idx_invitations_expires` | Expiration queries | **Never used** |

---

## Recommended Actions

### Decision Framework: Keep or Drop?

Before dropping unused indexes, consider:

1. **Application is New/Low Traffic**

   - ✅ **Keep indexes** - They may be used as traffic grows
   - These indexes might be unused simply because the application hasn't had enough query patterns yet

2. **Index Supports Future Features**

   - ✅ **Keep indexes** - If you know queries will use them
   - Example: `idx_claim_tokens_token` will be used when claim feature is active

3. **Index Has No Clear Use Case**

   - ❌ **Drop index** - Especially duplicates
   - Example: `idx_user_dids_hash` (duplicate of `idx_user_dids_did_document_hash`)

4. **Index Was Created "Just in Case"**
   - ❌ **Drop index** - Can recreate later if needed
   - PostgreSQL can create indexes quickly if needed

### Priority 1: Fix Foreign Key Index (High Priority)

**Action:** Add missing index for foreign key constraint

```sql
-- Add index for invitations.invited_by foreign key
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by
  ON public.invitations(invited_by);

-- Verify the index was created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'invitations'
  AND indexname = 'idx_invitations_invited_by';
```

### Priority 2: Drop Duplicate Indexes (Medium Priority)

These indexes are confirmed duplicates from the previous report:

```sql
-- Drop duplicate indexes on user_dids (keep one of each pair)
DROP INDEX IF EXISTS idx_user_dids_hash;
-- Keep: idx_user_dids_did_document_hash

DROP INDEX IF EXISTS idx_user_dids_hcs_topic;
-- Keep: idx_user_dids_hcs_topic_id

-- Note: idx_user_dids_account_network was already addressed in previous report
```

### Priority 3: Monitor Usage (Low Priority - Wait & See)

**Recommendation:** Keep most unused indexes for now, monitor for 30-60 days

**Why?**

- Application is new/in development
- Some features may not be fully utilized yet
- Indexes are cheap to store, expensive to add later under load

**Indexes to Monitor:**

```sql
-- Query to check index usage over time
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as number_of_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0  -- Never used
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Monitor These Specifically:**

- `idx_claim_tokens_token` - Will be used when certificate claiming is active
- `idx_audit_logs_created_at` - Will be used for audit log time-based queries
- `idx_webhooks_is_active` - Will be used when webhook filtering is implemented
- `idx_api_keys_key_hash` - Critical for API key validation (keep even if unused now)

### Priority 4: Consider Dropping (After Monitoring)

**If these remain unused after 30-60 days:**

```sql
-- Indexes that might be safe to drop after monitoring period
-- RUN THESE ONLY AFTER CONFIRMING NO USAGE

-- Profiles (if queries always join through other columns)
DROP INDEX IF EXISTS idx_profiles_hedera_account_id;

-- Certificate cache (if queries use other indexes)
DROP INDEX IF EXISTS idx_certificate_cache_recipient_account_id;

-- HCS events (if events are queried differently)
DROP INDEX IF EXISTS idx_hcs_events_processed;

-- Application logs (if log queries are rare)
DROP INDEX IF EXISTS idx_application_logs_level;
```

---

## Migration Script

```sql
-- ============================================
-- CertChain Database - Index Optimization
-- ============================================

BEGIN;

-- STEP 1: Add missing foreign key index (HIGH PRIORITY)
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by
  ON public.invitations(invited_by);

-- STEP 2: Drop confirmed duplicate indexes (MEDIUM PRIORITY)
DROP INDEX IF EXISTS idx_user_dids_hash;
DROP INDEX IF EXISTS idx_user_dids_hcs_topic;

-- STEP 3: Verify changes
DO $$
DECLARE
    idx_count INTEGER;
BEGIN
    -- Check foreign key index was created
    SELECT COUNT(*) INTO idx_count
    FROM pg_indexes
    WHERE tablename = 'invitations'
      AND indexname = 'idx_invitations_invited_by';

    IF idx_count = 0 THEN
        RAISE EXCEPTION 'Foreign key index was not created!';
    END IF;

    RAISE NOTICE 'Foreign key index successfully created';
END $$;

COMMIT;

-- STEP 4: Monitor index usage (run separately after 30-60 days)
-- Uncomment and run this query periodically to track usage:

/*
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
*/
```

---

## Testing Checklist

### After Adding Foreign Key Index

- [ ] Verify index exists: `\d invitations` in psql
- [ ] Test JOIN query performance on invitations.invited_by
- [ ] Verify DELETE cascade operations are fast
- [ ] Check query execution plans use the new index

### After Dropping Duplicate Indexes

- [ ] Verify duplicate indexes are removed
- [ ] Confirm queries still perform well
- [ ] Check that remaining indexes are being used
- [ ] Monitor write operation performance (should be slightly faster)

### Ongoing Monitoring (Every 30 days)

- [ ] Run index usage query (see script above)
- [ ] Review application query patterns
- [ ] Check for new slow queries
- [ ] Identify indexes that have become active
- [ ] Consider dropping indexes that remain unused after 90 days

---

## Performance Impact

### Foreign Key Index Addition

- **Query Performance:** 10-100x faster on JOIN operations involving `invited_by`
- **Delete Performance:** Significantly faster cascade deletes
- **Storage Cost:** Minimal (~1-5 MB depending on table size)
- **Write Performance:** Negligible impact

### Duplicate Index Removal

- **Write Performance:** 5-10% faster INSERTs/UPDATEs/DELETEs on `user_dids`
- **Storage Savings:** 10-50 MB (depending on table size)
- **Query Performance:** No change (keeping one of each duplicate pair)

### Unused Index Removal (If Done Later)

- **Write Performance:** Up to 20% faster on heavily indexed tables
- **Storage Savings:** Potentially 100+ MB across all tables
- **Query Performance:** No impact (indexes weren't being used)

---

## Best Practices Going Forward

### 1. Index Creation Strategy

- ✅ **DO:** Create indexes for foreign keys automatically
- ✅ **DO:** Create indexes for frequently queried columns
- ✅ **DO:** Monitor index usage regularly
- ❌ **DON'T:** Create indexes "just in case" without query evidence
- ❌ **DON'T:** Create duplicate indexes on the same columns

### 2. Regular Maintenance

- Review index usage every 30-60 days
- Drop indexes unused for 90+ days (after verification)
- Add indexes when slow queries are identified
- Use `EXPLAIN ANALYZE` to verify index usage

### 3. Monitoring Queries

```sql
-- Find unused indexes larger than 1 MB
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND pg_relation_size(indexrelid) > 1024 * 1024  -- > 1 MB
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find most frequently used indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;
```

---

## Summary

**Immediate Actions Required:**

1. ✅ Add index for `invitations.invited_by` foreign key (1 command)
2. ✅ Drop 2 duplicate indexes on `user_dids` table (2 commands)

**Monitor for 30-60 days:**

- 31 unused indexes across 11 tables
- Most are likely fine to keep during development/early production
- Revisit after application has more query patterns

**Storage Impact:**

- Current unused indexes: ~50-100 MB (estimated)
- Can be reclaimed later if indexes remain unused
- Not a critical issue for modern systems

**Performance Impact:**

- Adding foreign key index: **High positive impact**
- Dropping duplicates: **Small positive impact**
- Keeping unused indexes: **Negligible negative impact** (for now)

---

## Additional Resources

- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [PostgreSQL Index Maintenance](https://www.postgresql.org/docs/current/sql-createindex.html)
- [Index Usage Statistics](https://www.postgresql.org/docs/current/monitoring-stats.html)
- [When to Drop Indexes](https://www.cybertec-postgresql.com/en/unused-indexes/)

---

**Related Reports:**

- See `DATABASE_LINTER_WARNINGS.md` for RLS performance issues (164 warnings)

**Last Updated:** October 27, 2025  
**Linter Version:** Supabase Database Linter (Latest)  
**Database:** CertChain Production
