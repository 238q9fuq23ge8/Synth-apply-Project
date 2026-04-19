// /src/hooks/useCredits.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type CreditsState = {
  credits: number | null;          // null = unknown/loading
  trialEndsAt: string | null;      // ISO string from DB or null
  daysLeft: number | null;         // null if unknown; 0 if expired
  loading: boolean;
  error: string | null;
};

function diffDaysUtc(nowISO: string, endISO: string): number {
  try {
    const now = new Date(nowISO).getTime();
    const end = new Date(endISO).getTime();
    if (Number.isNaN(now) || Number.isNaN(end)) return 0;
    const ms = end - now;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } catch {
    return 0;
  }
}

export function useCredits(): {
  state: CreditsState;
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<CreditsState>({
    credits: null,
    trialEndsAt: null,
    daysLeft: null,
    loading: true,
    error: null,
  });

  const computeDaysLeft = useCallback((trialEndsAt: string | null) => {
    if (!trialEndsAt) return null;
    // Use UTC to avoid TZ off-by-one
    const nowISO = new Date().toISOString();
    return diffDaysUtc(nowISO, trialEndsAt);
  }, []);

  const fetchFromSupabase = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) {
        setState({
          credits: 0,
          trialEndsAt: null,
          daysLeft: null,
          loading: false,
          error: "Not authenticated",
        });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("credits, trial_ends_at")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const credits = typeof data?.credits === "number" ? data.credits : 0;
      const trialEndsAt = data?.trial_ends_at ?? null;
      const daysLeft = computeDaysLeft(trialEndsAt);

      // Write-through cache (optional): keep localStorage in sync for other pages,
      // but DO NOT read from it in the Sidebar anymore.
      localStorage.setItem("remaining_credits", String(credits));
      if (trialEndsAt) localStorage.setItem("trial_ends_at", trialEndsAt);

      setState({
        credits,
        trialEndsAt,
        daysLeft,
        loading: false,
        error: null,
      });
    } catch (e: any) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e?.message || "Failed to load credits",
      }));
    }
  }, [computeDaysLeft]);

  // Initial fetch
  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  // Keep in sync with auth changes (login/logout/refresh)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, _session) => {
      fetchFromSupabase();
    });
    return () => subscription.unsubscribe();
  }, [fetchFromSupabase]);

  // Realtime: if you have a realtime subscription on profiles, enable this:
  // (requires supabase Realtime enabled for table 'profiles')
  useEffect(() => {
    const channel = supabase
      .channel("profiles:credits")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const row: any = payload.new || {};
          const credits = typeof row.credits === "number" ? row.credits : null;
          const trialEndsAt = row.trial_ends_at ?? null;
          const daysLeft = computeDaysLeft(trialEndsAt);
          setState((s) => ({
            ...s,
            credits: credits ?? s.credits,
            trialEndsAt: trialEndsAt ?? s.trialEndsAt,
            daysLeft: daysLeft ?? s.daysLeft,
          }));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [computeDaysLeft]);

  const refresh = useCallback(async () => {
    await fetchFromSupabase();
  }, [fetchFromSupabase]);

  return { state, refresh };
}
