# Apply API Keys Migration - Quick Guide

## ⚠️ **REQUIRED STEP BEFORE USING API KEYS**

The API keys feature requires a database migration to create the `api_keys` table.

---

## Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**

   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Navigate to **SQL Editor**

2. **Copy Migration SQL**

   - Open: `supabase/migrations/20240122000000_create_api_keys.sql`
   - Copy the entire contents

3. **Execute Migration**

   - Paste into SQL Editor
   - Click **Run** button
   - Wait for success message: "Success. No rows returned"

4. **Verify**
   - Go to **Table Editor**
   - Look for new table: `api_keys`
   - Should have columns: id, user_id, institution_id, name, key_hash, key_prefix, scopes, etc.

---

## Option 2: Supabase CLI

```bash
# Navigate to project root
cd c:\Users\josep\Code\repo\certchain

# Push migration to Supabase
npx supabase db push

# If that fails, try applying specific migration
npx supabase migration up
```

---

## Option 3: Manual SQL Execution

If both above fail, run this SQL directly in Supabase Dashboard SQL Editor:

```sql
-- Create api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_institution_id ON public.api_keys(institution_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON public.api_keys(is_active);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own api keys"
  ON public.api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own api keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys"
  ON public.api_keys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys"
  ON public.api_keys FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Institution admins can view institution api keys"
  ON public.api_keys FOR SELECT
  USING (
    institution_id IN (
      SELECT id FROM public.institutions
      WHERE id IN (
        SELECT institution_id FROM public.profiles
        WHERE id = auth.uid() AND role IN ('institution_admin', 'super_admin')
      )
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_api_keys_updated_at();
```

---

## Verification

After applying migration, verify it worked:

1. **Check Table Exists**

   ```sql
   SELECT * FROM public.api_keys LIMIT 1;
   ```

   Should return: No rows (empty table is correct)

2. **Check RLS Policies**

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'api_keys';
   ```

   Should show 5 policies

3. **Test in App**
   - Go to Settings > API Keys
   - Click "Create New Key"
   - Should NOT see error about migration
   - Key should be created successfully

---

## Troubleshooting

### Error: "relation api_keys does not exist"

**Solution:** Migration hasn't been applied yet. Use Option 1 (Dashboard) or Option 3 (Manual SQL).

### Error: "permission denied for table api_keys"

**Solution:** RLS policies not created. Run the RLS policy SQL from Option 3.

### Error: "function handle_api_keys_updated_at() does not exist"

**Solution:** Run the trigger function SQL from Option 3.

---

## What This Migration Does

Creates infrastructure for API key management:

- ✅ `api_keys` table with secure storage (only hashes stored)
- ✅ Indexes for performance (user_id, institution_id, key_hash, is_active)
- ✅ Row Level Security policies (users can only see their own keys)
- ✅ Auto-updating timestamps (updated_at trigger)
- ✅ Cascade deletion (keys deleted when user deleted)
- ✅ Institution-level access control (admins see all institution keys)

---

## After Migration is Applied

You can now:

1. **Create API Keys** (Settings > API Keys)

   - Generate secure keys: `ck_[32-char-uuid]`
   - Set custom scopes
   - Keys shown only once

2. **Use Keys Programmatically**

   ```bash
   curl -H "Authorization: Bearer ck_abc123..." \
        https://your-api.com/certificates
   ```

3. **Manage Keys**
   - View all your keys
   - See last used timestamp
   - Delete old keys
   - Toggle active/inactive

---

## Security Notes

- 🔒 Keys are SHA-256 hashed before storage
- 🔒 Full keys never stored in database
- 🔒 Keys shown only once during creation
- 🔒 Row Level Security prevents unauthorized access
- 🔒 Keys can be revoked anytime

---

**Migration File:** `supabase/migrations/20240122000000_create_api_keys.sql`
**Status:** Ready to apply ✅
