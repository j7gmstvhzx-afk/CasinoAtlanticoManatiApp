import { createClient } from '@supabase/supabase-js';
import { authStorage } from '@/lib/authStorage';

const supabaseUrl      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? '';
const supabaseAnonKey  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Step 10: fail loud rather than silently shipping the anon key + JWT over
// cleartext if the URL is ever misconfigured. Enforced at module load.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase no está configurado: define EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY.',
  );
}
if (!supabaseUrl.startsWith('https://')) {
  throw new Error(
    `EXPO_PUBLIC_SUPABASE_URL debe usar https:// (recibido: ${supabaseUrl}).`,
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Step 2: keychain/keystore-backed storage on native, AsyncStorage on web.
    storage:            authStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});
