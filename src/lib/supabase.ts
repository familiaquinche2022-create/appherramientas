import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if we have valid credentials
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};