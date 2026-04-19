// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ✅ Helper to set the session from access token
export const setSupabaseSession = async (accessToken: string, refreshToken?: string) => {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || localStorage.getItem('refresh_token') || '',
    });

    if (error) {
      console.error('❌ Failed to set Supabase session:', error);
      return false;
    }

    console.log('✅ Supabase session set successfully');
    return true;
  } catch (err) {
    console.error('❌ Error setting session:', err);
    return false;
  }
};
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true,
//     flowType: 'pkce', // ✅ Important for production security
//   },

// });

// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = "https://lwlecomxuuutdwxjxihl.supabase.co";
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!; // Add in .env

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
