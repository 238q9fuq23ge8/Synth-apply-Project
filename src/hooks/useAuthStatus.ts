// src/hooks/useAuthStatus.ts
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useAuthStatus() {
  const [status, setStatus] = useState({ loading: true, loggedIn: false, user: null });

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setStatus({ loading: false, loggedIn: false, user: null });
        return;
      }
      try {
        const { data, error } = await supabase.auth.getUser(token); // gets user info from token
        if (error || !data?.user) {
          setStatus({ loading: false, loggedIn: false, user: null });
        } else {
          setStatus({ loading: false, loggedIn: true, user: data.user });
        }
      } catch (err) {
        setStatus({ loading: false, loggedIn: false, user: null });
      }
    };

    checkUser();
  }, []);

  return status;
}
