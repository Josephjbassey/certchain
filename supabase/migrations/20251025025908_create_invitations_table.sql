-- Create invitations table for managing institution and issuer invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('institution_admin', 'instructor', 'candidate')),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_institution ON public.invitations(institution_id);
CREATE INDEX idx_invitations_expires ON public.invitations(expires_at) WHERE used_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins and institution admins can manage invitations
CREATE POLICY "Admins can manage invitations"
  ON public.invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'institution_admin')
    )
  );

-- Policy: Anyone can view their own invitation by email (even if not logged in)
CREATE POLICY "Users can view their own invitation"
  ON public.invitations
  FOR SELECT
  TO anon, authenticated
  USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Create function to clean up expired invitations
CREATE OR REPLACE FUNCTION clean_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.invitations
  WHERE expires_at < NOW()
  AND used_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON TABLE public.invitations IS 'Stores invitation tokens for onboarding institution admins and instructors';
