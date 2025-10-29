-- Create contact_submissions table for storing contact form data
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at 
  ON public.contact_submissions(submitted_at DESC);

-- Add index on email for searching
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email 
  ON public.contact_submissions(email);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Super admins can view all contact submissions
CREATE POLICY "Super admins can view all contact submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (is_super_admin((SELECT auth.uid())));

-- Service role can insert contact submissions (for edge function)
CREATE POLICY "Service role can insert contact submissions"
  ON public.contact_submissions
  FOR INSERT
  WITH CHECK ((SELECT (SELECT auth.jwt())->>'role') = 'service_role');

COMMENT ON TABLE public.contact_submissions IS 'Stores contact form submissions from the website';
