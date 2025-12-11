import { createClient } from '@supabase/supabase-js';

// Vite exposes environment variables prefixed with VITE_ or NEXT_PUBLIC_ (if configured)
// Check for both naming conventions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
                        import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
                        '';

if (!supabaseUrl) {
  throw new Error(
    'Supabase URL is required. Please set VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in your .env file.\n' +
    'Note: In Vite, environment variables must be prefixed with VITE_ to be exposed to the client.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Supabase Anon Key is required. Please set VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env file.\n' +
    'Note: In Vite, environment variables must be prefixed with VITE_ to be exposed to the client.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

