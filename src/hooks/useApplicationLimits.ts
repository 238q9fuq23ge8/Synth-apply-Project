import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface ApplicationLimits {
  ok: boolean;
  can_proceed: boolean;
  remaining: number;
  current_count: number;
  daily_limit: number;
  plan: string;
  unlimited: boolean;
  is_admin: boolean;
  reset_time: string;
  reset_in_hours: number;
  features: {
    daily_applications: {
      enabled: boolean;
      limit: number;
      used: number;
      remaining: number;
      resets_at: string;
    };
  };
}

export function useApplicationLimits() {
  const [limits, setLimits] = useState<ApplicationLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get("/v1/automation/application-limits");
      setLimits(response.data as ApplicationLimits);
    } catch (err: unknown) {
      console.error("Failed to fetch application limits:", err);
      setError(err instanceof Error ? err.message : "Failed to load limits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimits();
    // Refresh every minute to update countdown
    const interval = setInterval(fetchLimits, 60000);
    return () => clearInterval(interval);
  }, [fetchLimits]);

  return { limits, loading, error, refetch: fetchLimits };
}