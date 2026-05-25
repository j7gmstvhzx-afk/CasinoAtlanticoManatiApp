import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id:        string;
  email:     string;
  full_name: string | null;
  role:      'admin' | 'viewer';
}

interface AuthStore {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;

  init:    () => void;
  signIn:  (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  profile: null,
  loading: true,

  init() {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, loading: false });
      if (session) loadProfile(session.user.id, set);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) loadProfile(session.user.id, set);
      else set({ profile: null });
    });
  },

  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  async signOut() {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));

async function loadProfile(
  userId: string,
  set: (partial: Partial<AuthStore>) => void,
) {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .single();
  if (data) set({ profile: data as UserProfile });
}
