-- ============================================
-- CertChain Database - Security Fixes
-- Applies fixed search_path to all vulnerable functions
-- ============================================

BEGIN;

-- STEP 1: Fix update_user_dids_updated_at
CREATE OR REPLACE FUNCTION public.update_user_dids_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- STEP 2: Fix handle_api_keys_updated_at
CREATE OR REPLACE FUNCTION public.handle_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- STEP 3: Fix clean_expired_invitations
CREATE OR REPLACE FUNCTION public.clean_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE public.invitations
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- STEP 4: Fix handle_new_user_invitation
CREATE OR REPLACE FUNCTION public.handle_new_user_invitation()
RETURNS TRIGGER AS $$
DECLARE
    invitation_record RECORD;
    v_role_id UUID;
BEGIN
    SELECT * INTO invitation_record
    FROM public.invitations
    WHERE email = NEW.email
      AND status = 'pending'
      AND expires_at > NOW()
    LIMIT 1;

    IF FOUND THEN
        SELECT id INTO v_role_id
        FROM public.roles
        WHERE name = invitation_record.role;

        IF v_role_id IS NOT NULL THEN
            INSERT INTO public.profiles (
                id, email, full_name, institution_id, created_at, updated_at
            ) VALUES (
                NEW.id, NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
                invitation_record.institution_id, NOW(), NOW()
            ) ON CONFLICT (id) DO NOTHING;

            INSERT INTO public.user_roles (user_id, role_id, institution_id)
            VALUES (NEW.id, v_role_id, invitation_record.institution_id)
            ON CONFLICT (user_id, role_id) DO NOTHING;

            UPDATE public.invitations
            SET status = 'accepted', accepted_at = NOW()
            WHERE id = invitation_record.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- STEP 5: Fix get_certificates_secure
CREATE OR REPLACE FUNCTION public.get_certificates_secure(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    recipient_name TEXT,
    recipient_email TEXT,
    recipient_did TEXT,
    certificate_type TEXT,
    issue_date TIMESTAMP WITH TIME ZONE,
    ipfs_hash TEXT,
    token_id TEXT,
    hedera_transaction_id TEXT,
    issuer_did TEXT,
    institution_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_user_id UUID;
    v_user_role TEXT;
    v_institution_id UUID;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    SELECT r.name, ur.institution_id
    INTO v_user_role, v_institution_id
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = v_user_id
    LIMIT 1;

    IF v_user_role = 'super_admin' THEN
        RETURN QUERY SELECT cc.* FROM public.certificate_cache cc ORDER BY cc.created_at DESC;
    ELSIF v_user_role IN ('institution_admin', 'instructor') THEN
        RETURN QUERY SELECT cc.* FROM public.certificate_cache cc
        WHERE cc.institution_id = v_institution_id ORDER BY cc.created_at DESC;
    ELSIF v_user_role = 'candidate' THEN
        RETURN QUERY SELECT cc.* FROM public.certificate_cache cc
        WHERE cc.recipient_email = (SELECT email FROM public.profiles WHERE id = v_user_id)
        ORDER BY cc.created_at DESC;
    END IF;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp;

COMMIT;
