-- Fix security warning: Add RLS policies for hcs_events and webhooks tables
CREATE POLICY "Admins can manage HCS events"
ON public.hcs_events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage webhooks"
ON public.webhooks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix security warning: Set search_path for mutable functions
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;