/**
 * Supabase Auth Helpers for Edge Functions
 * 
 * Utilities for handling authentication and authorization in edge functions.
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { unauthorizedError, forbiddenError } from './error-handler.ts';
import type { Logger } from './logger.ts';

/**
 * Create a Supabase client with service role key
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Create a Supabase client with user's auth context (for RLS)
 */
export function createUserClient(req: Request): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase credentials');
  }

  const authorization = req.headers.get('Authorization');

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authorization ? { Authorization: authorization } : {},
    },
  });
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(req: Request, logger?: Logger) {
  const supabase = createUserClient(req);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    logger?.error('Authentication failed', error);
    throw unauthorizedError('Authentication required');
  }

  if (!user) {
    logger?.warn('No user found in request');
    throw unauthorizedError('Authentication required');
  }

  logger?.debug('User authenticated', { userId: user.id });

  return { user, supabase };
}

/**
 * Check if user has a specific role
 */
export async function requireRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRole: string | string[],
  logger?: Logger
): Promise<string> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    logger?.error('Failed to fetch user profile', error);
    throw forbiddenError('Unable to verify user permissions');
  }

  const userRole = profile.role as string;
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!allowedRoles.includes(userRole)) {
    logger?.warn('Insufficient permissions', {
      userId,
      userRole,
      requiredRole: allowedRoles,
    });
    throw forbiddenError(`This action requires ${allowedRoles.join(' or ')} role`);
  }

  logger?.debug('Role check passed', { userId, role: userRole });

  return userRole;
}

/**
 * Check if user belongs to an institution
 */
export async function requireInstitutionMembership(
  supabase: SupabaseClient,
  userId: string,
  institutionId: string,
  logger?: Logger
): Promise<boolean> {
  const { data: membership, error } = await supabase
    .from('institution_staff')
    .select('id, role')
    .eq('user_id', userId)
    .eq('institution_id', institutionId)
    .eq('status', 'active')
    .single();

  if (error || !membership) {
    logger?.warn('Institution membership check failed', {
      userId,
      institutionId,
      error: error?.message,
    });
    throw forbiddenError('You do not have access to this institution');
  }

  logger?.debug('Institution membership verified', {
    userId,
    institutionId,
    role: membership.role,
  });

  return true;
}

/**
 * Get user's institution ID (for institution admins/staff)
 */
export async function getUserInstitution(
  supabase: SupabaseClient,
  userId: string,
  logger?: Logger
): Promise<string | null> {
  const { data: memberships, error } = await supabase
    .from('institution_staff')
    .select('institution_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    logger?.error('Failed to fetch user institution', error);
    return null;
  }

  if (!memberships || memberships.length === 0) {
    logger?.debug('User has no institution membership', { userId });
    return null;
  }

  return memberships[0].institution_id;
}

/**
 * Check if user owns a resource
 */
export async function requireResourceOwnership(
  supabase: SupabaseClient,
  tableName: string,
  recordId: string,
  userId: string,
  ownerField: string = 'user_id',
  logger?: Logger
): Promise<boolean> {
  const { data, error } = await supabase
    .from(tableName)
    .select(ownerField)
    .eq('id', recordId)
    .single();

  if (error || !data) {
    logger?.error('Resource ownership check failed', error, {
      tableName,
      recordId,
      userId,
    });
    throw forbiddenError('Resource not found or access denied');
  }

  if (data[ownerField] !== userId) {
    logger?.warn('Resource ownership denied', {
      tableName,
      recordId,
      userId,
      ownerId: data[ownerField],
    });
    throw forbiddenError('You do not own this resource');
  }

  logger?.debug('Resource ownership verified', {
    tableName,
    recordId,
    userId,
  });

  return true;
}

/**
 * Verify API key (for programmatic access)
 */
export async function verifyApiKey(
  supabase: SupabaseClient,
  apiKey: string,
  logger?: Logger
): Promise<{ userId: string; institutionId: string | null }> {
  const { data: key, error } = await supabase
    .from('api_keys')
    .select('user_id, institution_id, last_used_at')
    .eq('key', apiKey)
    .eq('is_active', true)
    .single();

  if (error || !key) {
    logger?.warn('Invalid API key', { error: error?.message });
    throw unauthorizedError('Invalid API key');
  }

  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key', apiKey);

  logger?.debug('API key verified', {
    userId: key.user_id,
    institutionId: key.institution_id,
  });

  return {
    userId: key.user_id,
    institutionId: key.institution_id,
  };
}

/**
 * Extract authorization token from request
 */
export function getAuthToken(req: Request): string | null {
  const authorization = req.headers.get('Authorization');
  
  if (!authorization) {
    return null;
  }

  // Remove 'Bearer ' prefix if present
  return authorization.replace(/^Bearer\s+/i, '');
}

/**
 * Check if request has valid authorization
 */
export function hasAuthorization(req: Request): boolean {
  const token = getAuthToken(req);
  return token !== null && token.length > 0;
}
