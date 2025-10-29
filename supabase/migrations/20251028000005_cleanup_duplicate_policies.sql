-- ================================================
-- CLEANUP DUPLICATE RLS POLICIES
-- ================================================
-- This migration removes old duplicate policies that have been
-- consolidated into single "manage" policies for better performance

BEGIN;

-- ============================================
-- API KEYS TABLE - Remove old CRUD policies
-- ============================================
-- These are now consolidated into "Users can manage own API keys"
DROP POLICY IF EXISTS "Users can view own api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can view own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can create own api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON public.api_keys;

-- Keep only:
-- - "Users can manage own API keys" (covers all CRUD)
-- - "Institution admins can view institution api keys" (for admin oversight)

-- ============================================
-- USER_DIDS TABLE - Remove old CRUD policies
-- ============================================
-- These are now consolidated into "Users can manage own DIDs"
DROP POLICY IF EXISTS "Users can view own DIDs" ON public.user_dids;
DROP POLICY IF EXISTS "Users manage own DIDs" ON public.user_dids;

-- Keep only:
-- - "Users can manage own DIDs" (covers all CRUD)
-- - "Service role can manage all DIDs" (for backend operations)
-- - "Public can read DID documents" (for DID resolution)

-- ============================================
-- USER_WALLETS TABLE - Remove duplicate view policy
-- ============================================
DROP POLICY IF EXISTS "Users can view own wallets" ON public.user_wallets;

-- Keep only:
-- - "Users can manage own wallets" (covers all operations including SELECT)

-- ============================================
-- WEBHOOKS TABLE - Keep consolidated policies
-- ============================================
-- Already optimal with:
-- - "Users can manage own webhooks"
-- - "Super admins can manage webhooks"

-- ============================================
-- CERTIFICATE_CACHE TABLE - Remove duplicates
-- ============================================
-- Remove old separate insert policies
DROP POLICY IF EXISTS "Issuers can insert certificates" ON public.certificate_cache;

-- Keep:
-- - "Instructors can issue certificates" (covers INSERT with role check)
-- - All other existing SELECT policies for different access levels

-- ============================================
-- INVITATIONS TABLE - Already optimized
-- ============================================
-- Policies were recreated in previous migration:
-- - "Admins can manage invitations"
-- - "Users can view their own invitation"

-- ============================================
-- PROFILES TABLE - Remove duplicate aggregated view
-- ============================================
DROP POLICY IF EXISTS "Super admins can view aggregated profiles" ON public.profiles;

-- Keep only:
-- - "Users can view their own profile"
-- - "Users can update their own profile"
-- - "Super admins can view all profiles" (covers aggregation)
-- - "Super admins can update all profiles"
-- - "Institution admins can view profiles in their institution"
-- - "Institution admins can update profiles in their institution"
-- - "Instructors can view their candidates"

-- ============================================
-- CERTIFICATE_CACHE TABLE - Remove duplicate aggregated view
-- ============================================
DROP POLICY IF EXISTS "Super admins can view aggregated certificate data" ON public.certificate_cache;

-- Keep:
-- - "Certificates are viewable by all"
-- - "Users can view their own certificates"
-- - "Instructors can view certificates they issued"
-- - "Instructors can issue certificates"
-- - "Institution admins can view certificates in their institution"
-- Note: Super admins can view all through "Institution admins" policy with is_super_admin check

COMMIT;
