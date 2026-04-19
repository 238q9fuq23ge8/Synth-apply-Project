// store/useCredits.ts
import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const useCredits = create((set) => ({
  credits: 0,
  loading: true,

  async loadCredits(userId: string) {
    set({ loading: true });
    const { data, error } = await supabase
      .from("credits")
      .select("remaining")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      localStorage.setItem("credits", data.remaining);
      set({ credits: data.remaining, loading: false });
    } else {
      set({ credits: 0, loading: false });
    }
  },
}));
