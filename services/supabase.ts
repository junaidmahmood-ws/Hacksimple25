import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vite exposes environment variables prefixed with VITE_ or NEXT_PUBLIC_ (if configured)
// Check for both naming conventions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
                        import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
                        '';

// Create a mock supabase client for local development without credentials
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('⚠️ Supabase credentials not found. Running in local-only mode (leaderboard features disabled).');
}

export { supabase };

