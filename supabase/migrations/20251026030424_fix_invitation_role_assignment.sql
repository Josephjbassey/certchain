-- Fix user role assignment to use invitation role instead of default 'user'
-- This ensures users who sign up via invitation get the correct role assigned

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_role TEXT;
  invitation_institution_id UUID;
BEGIN
  -- Check if user signed up via invitation token
  IF NEW.raw_user_meta_data->>'invitation_token' IS NOT NULL THEN
    -- Get the role and institution from the invitation
    SELECT role, institution_id INTO invitation_role, invitation_institution_id
    FROM public.invitations
    WHERE token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
    AND used_at IS NOT NULL -- Should already be marked as used during signup
    LIMIT 1;

    -- If invitation found, use its role
    IF invitation_role IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, invitation_role);
      
      -- Also update the profile with institution_id if available
      IF invitation_institution_id IS NOT NULL THEN
        UPDATE public.profiles
        SET institution_id = invitation_institution_id
        WHERE id = NEW.id;
      END IF;
      
      RETURN NEW;
    END IF;
  END IF;

  -- Default role for non-invitation signups (candidates)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'candidate');
  
  RETURN NEW;
END;
$$;

-- Note: The trigger already exists, this just updates the function
-- Existing trigger: on_auth_user_created_role AFTER INSERT ON auth.users
