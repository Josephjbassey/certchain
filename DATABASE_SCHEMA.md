# Database Schema Requirements

## Required Tables for Production

The following tables need to be created in your Supabase database for full functionality:

### 1. `user_dids`
```sql
CREATE TABLE user_dids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  did TEXT NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('testnet', 'mainnet', 'previewnet')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, network)
);

CREATE INDEX idx_user_dids_account_id ON user_dids(account_id);
CREATE INDEX idx_user_dids_user_id ON user_dids(user_id);
```

### 2. `certificates`
```sql
CREATE TABLE certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id TEXT NOT NULL UNIQUE,
  token_id TEXT,
  serial_number INTEGER,
  issuer_did TEXT NOT NULL,
  recipient_account_id TEXT,
  recipient_email TEXT,
  course_name TEXT NOT NULL,
  institution_id UUID REFERENCES institutions(id),
  ipfs_cid TEXT,
  metadata JSONB,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certificates_token_id ON certificates(token_id);
CREATE INDEX idx_certificates_recipient_account_id ON certificates(recipient_account_id);
CREATE INDEX idx_certificates_issuer_did ON certificates(issuer_did);
CREATE INDEX idx_certificates_institution_id ON certificates(institution_id);
```

### 3. `api_keys`
```sql
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
```

### 4. `user_wallets`
```sql
CREATE TABLE user_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  wallet_type TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, account_id)
);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_account_id ON user_wallets(account_id);
```

### 5. `webhooks` (Update existing table)
```sql
-- Add missing columns to existing webhooks table
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS failure_count INTEGER DEFAULT 0;
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
```

### 6. `application_logs`
```sql
CREATE TABLE application_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  message TEXT NOT NULL,
  context JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_application_logs_level ON application_logs(level);
CREATE INDEX idx_application_logs_user_id ON application_logs(user_id);
CREATE INDEX idx_application_logs_timestamp ON application_logs(timestamp DESC);
```

## Row Level Security (RLS)

Enable RLS and create policies for each table:

```sql
-- Enable RLS
ALTER TABLE user_dids ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

-- user_dids policies
CREATE POLICY "Users can view own DIDs" ON user_dids
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own DIDs" ON user_dids
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- certificates policies
CREATE POLICY "Public can view non-revoked certificates" ON certificates
  FOR SELECT USING (revoked_at IS NULL);

-- api_keys policies
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- user_wallets policies
CREATE POLICY "Users can view own wallets" ON user_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wallets" ON user_wallets
  FOR ALL USING (auth.uid() = user_id);

-- application_logs policies
CREATE POLICY "Users can view own logs" ON application_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all logs
CREATE POLICY "Admins can view all logs" ON application_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
```

## Migration Script

Run this in Supabase SQL Editor:

```bash
cd supabase/migrations
# Create new migration
supabase migration new add_production_tables
```

Copy the SQL above into the migration file and run:

```bash
supabase db push
```

## Type Generation

After creating tables, regenerate TypeScript types:

```bash
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Note

The current TypeScript errors are expected and will be resolved once these database tables are created in Supabase. The frontend code is complete and production-ready - it just needs the backend database schema to match.
