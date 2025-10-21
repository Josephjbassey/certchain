import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Vite exposes env vars on import.meta.env
const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Helpful warning during local dev if env vars are missing
  // Avoid throwing so the app can still render a friendly error page
  console.warn('Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Named export used across the app: import { supabase } from "@/integrations/supabase/client"
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type SupabaseClient = typeof supabase;