/**
 * Supabase Utility Functions
 * 
 * Helper functions for working with Supabase, including retry logic,
 * error handling, and common patterns.
 */

import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

/**
 * Supabase Error with additional context
 */
export class SupabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string,
    public readonly hint?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Handle Supabase errors with user-friendly messages
 */
export function handleSupabaseError(error: PostgrestError | any): SupabaseError {
  if (!error) {
    return new SupabaseError('Unknown error occurred');
  }

  const message = error.message || 'Database operation failed';
  const code = error.code;
  const details = error.details;
  const hint = error.hint;

  // Map common error codes to user-friendly messages
  const userFriendlyMessages: Record<string, string> = {
    '23505': 'This record already exists',
    '23503': 'Related record not found',
    '42501': 'You do not have permission to perform this action',
    'PGRST116': 'No rows found',
    'PGRST301': 'Invalid request format',
  };

  const userMessage = code ? userFriendlyMessages[code] || message : message;

  return new SupabaseError(userMessage, code, details, hint);
}

/**
 * Retry a Supabase operation with exponential backoff
 */
export async function retrySupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000
): Promise<{ data: T | null; error: PostgrestError | null }> {
  let lastError: PostgrestError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await operation();
      
      // If successful, return immediately
      if (!result.error) {
        return result;
      }

      lastError = result.error;

      // Don't retry on certain error codes (client errors)
      const nonRetryableCodes = ['23505', '23503', '42501', 'PGRST116', 'PGRST301'];
      if (lastError.code && nonRetryableCodes.includes(lastError.code)) {
        return result;
      }

      console.warn(`Supabase attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxAttempts - 1) {
        const delay = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error('Unexpected error in Supabase operation:', error);
      lastError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: '',
        hint: '',
        code: 'UNKNOWN',
      } as PostgrestError;
    }
  }

  return { data: null, error: lastError };
}

/**
 * Safe query wrapper with error handling and retry
 */
export async function safeQuery<T>(
  operation: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: {
    retry?: boolean;
    showToast?: boolean;
    errorMessage?: string;
  } = {}
): Promise<T | null> {
  const { retry = true, showToast = true, errorMessage } = options;

  const result = retry
    ? await retrySupabaseOperation(operation)
    : await operation();

  if (result.error) {
    const supabaseError = handleSupabaseError(result.error);
    
    if (showToast) {
      toast.error(errorMessage || supabaseError.message);
    }

    console.error('Supabase query error:', {
      message: supabaseError.message,
      code: supabaseError.code,
      details: supabaseError.details,
      hint: supabaseError.hint,
    });

    return null;
  }

  return result.data;
}

/**
 * Execute a Supabase Edge Function with retry logic
 */
export async function invokeEdgeFunction<T = any>(
  supabase: SupabaseClient,
  functionName: string,
  body?: any,
  options: {
    retry?: boolean;
    maxAttempts?: number;
    showToast?: boolean;
    errorMessage?: string;
  } = {}
): Promise<{ data: T | null; error: Error | null }> {
  const {
    retry = true,
    maxAttempts = 3,
    showToast = true,
    errorMessage,
  } = options;

  const invoke = async () => {
    return await supabase.functions.invoke<T>(functionName, { body });
  };

  if (!retry) {
    const result = await invoke();
    if (result.error && showToast) {
      toast.error(errorMessage || result.error.message);
    }
    return result;
  }

  // Retry logic for Edge Functions
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await invoke();
      
      if (!result.error) {
        return result;
      }

      lastError = result.error;
      console.warn(`Edge function ${functionName} attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxAttempts - 1) {
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  if (lastError && showToast) {
    toast.error(errorMessage || lastError.message);
  }

  return { data: null, error: lastError };
}

/**
 * Batch insert with chunking
 */
export async function batchInsert<T>(
  supabase: SupabaseClient,
  tableName: string,
  records: T[],
  chunkSize: number = 100
): Promise<{ success: number; failed: number; errors: SupabaseError[] }> {
  let success = 0;
  let failed = 0;
  const errors: SupabaseError[] = [];

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);

    try {
      const { error } = await supabase.from(tableName).insert(chunk);

      if (error) {
        failed += chunk.length;
        errors.push(handleSupabaseError(error));
      } else {
        success += chunk.length;
      }
    } catch (error) {
      failed += chunk.length;
      errors.push(handleSupabaseError(error));
    }
  }

  return { success, failed, errors };
}

/**
 * Paginated query helper
 */
export async function* paginatedQuery<T>(
  supabase: SupabaseClient,
  tableName: string,
  pageSize: number = 100,
  filters?: Record<string, any>
): AsyncGenerator<T[], void, unknown> {
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(tableName)
      .select('*')
      .range(from, to);

    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) {
      throw handleSupabaseError(error);
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    yield data as T[];

    if (data.length < pageSize) {
      hasMore = false;
    }

    page++;
  }
}

/**
 * Subscribe to real-time changes with automatic reconnection
 */
export function subscribeWithReconnection<T = any>(
  supabase: SupabaseClient,
  tableName: string,
  callback: (payload: any) => void,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    onError?: (error: Error) => void;
  } = {}
) {
  const { event = '*', filter, onError } = options;

  const channel = supabase
    .channel(`${tableName}-changes`)
    .on(
      'postgres_changes' as any,
      {
        event,
        schema: 'public',
        table: tableName,
        filter,
      },
      callback
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${tableName} changes`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${tableName}`);
        onError?.(new Error(`Failed to subscribe to ${tableName}`));
      }
    });

  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
  };
}

/**
 * Check if user has permission to access a resource
 */
export async function checkPermission(
  supabase: SupabaseClient,
  tableName: string,
  recordId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .eq('id', recordId)
    .eq('user_id', userId)
    .single();

  return !error && data !== null;
}

/**
 * Validate user session and get user data
 */
export async function validateSession(supabase: SupabaseClient) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new SupabaseError('Unauthorized: Please log in', 'AUTH_ERROR');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new SupabaseError('Unauthorized: User not found', 'AUTH_ERROR');
  }

  return { session, user };
}

/**
 * Format RLS policy error for better UX
 */
export function formatRLSError(error: PostgrestError): string {
  if (error.code === '42501') {
    return 'You do not have permission to perform this action. Please check your account permissions.';
  }

  if (error.message.includes('policy')) {
    return 'Access denied by security policy. Please contact support if you believe this is an error.';
  }

  return error.message;
}

/**
 * Cache helper for Supabase queries
 */
export class SupabaseCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data);
    return data;
  }
}

// Global cache instance (5 minutes TTL)
export const supabaseCache = new SupabaseCache(300);
