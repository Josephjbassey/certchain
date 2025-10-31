-- Create transaction_logs table for Hedera blockchain transaction audit trail
-- This table stores all Hedera transactions executed through the dApp

CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL, -- Hedera transaction ID (e.g., "0.0.12345@1234567890.000000000")
  transaction_type TEXT NOT NULL, -- Type of transaction (e.g., "TOPIC_CREATE", "TOPIC_MESSAGE", "NFT_MINT")
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  transaction_hash TEXT, -- Hedera transaction hash
  error_message TEXT, -- Error message if failed
  metadata JSONB, -- Additional transaction metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for fast lookup of user transactions
CREATE INDEX idx_transaction_logs_user_id ON transaction_logs(user_id);

-- Create index on transaction_id for fast lookup
CREATE INDEX idx_transaction_logs_transaction_id ON transaction_logs(transaction_id);

-- Create index on status for filtering
CREATE INDEX idx_transaction_logs_status ON transaction_logs(status);

-- Create index on created_at for sorting
CREATE INDEX idx_transaction_logs_created_at ON transaction_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own transaction logs
CREATE POLICY "Users can view own transaction logs"
  ON transaction_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own transaction logs
CREATE POLICY "Users can insert own transaction logs"
  ON transaction_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Super admins can view all transaction logs
CREATE POLICY "Super admins can view all transaction logs"
  ON transaction_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transaction_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER set_transaction_logs_updated_at
  BEFORE UPDATE ON transaction_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_logs_updated_at();

-- Add comment to table
COMMENT ON TABLE transaction_logs IS 'Audit trail for all Hedera blockchain transactions executed by users';

-- Add comments to columns
COMMENT ON COLUMN transaction_logs.transaction_id IS 'Hedera transaction ID in format shard.realm.num@seconds.nanoseconds';
COMMENT ON COLUMN transaction_logs.transaction_type IS 'Type of Hedera transaction (TOPIC_CREATE, TOPIC_MESSAGE, NFT_MINT, etc.)';
COMMENT ON COLUMN transaction_logs.metadata IS 'JSON object containing transaction-specific data';
