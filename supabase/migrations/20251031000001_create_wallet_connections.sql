-- Create user_wallet_connections table for DApp wallet sync
-- This table stores the relationship between auth users and their Hedera wallets

CREATE TABLE IF NOT EXISTS user_wallet_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hedera_account_id TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, hedera_account_id)
);

-- Add index for quick lookups
CREATE INDEX idx_user_wallet_connections_user_id ON user_wallet_connections(user_id);
CREATE INDEX idx_user_wallet_connections_account_id ON user_wallet_connections(hedera_account_id);
CREATE INDEX idx_user_wallet_connections_last_connected ON user_wallet_connections(last_connected DESC);

-- Enable RLS
ALTER TABLE user_wallet_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own wallet connections
CREATE POLICY "Users can view own wallet connections"
    ON user_wallet_connections
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own wallet connections
CREATE POLICY "Users can insert own wallet connections"
    ON user_wallet_connections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own wallet connections
CREATE POLICY "Users can update own wallet connections"
    ON user_wallet_connections
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role can manage all connections (for edge functions)
CREATE POLICY "Service role can manage all connections"
    ON user_wallet_connections
    FOR ALL
    USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE TRIGGER update_user_wallet_connections_updated_at
    BEFORE UPDATE ON user_wallet_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE user_wallet_connections IS 'Stores relationships between authenticated users and their Hedera wallet accounts';
COMMENT ON COLUMN user_wallet_connections.user_id IS 'Reference to authenticated user';
COMMENT ON COLUMN user_wallet_connections.hedera_account_id IS 'Hedera account ID (e.g., 0.0.12345)';
COMMENT ON COLUMN user_wallet_connections.verified_at IS 'Timestamp when wallet ownership was verified';
COMMENT ON COLUMN user_wallet_connections.last_connected IS 'Last time this wallet was connected';
COMMENT ON COLUMN user_wallet_connections.metadata IS 'Additional wallet metadata (network, public key, etc.)';
