// src/store/automationStore.ts
import { create } from "zustand";
import api from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

interface AutomationStatus {
  is_running: boolean;
  run_id: string | null;
  started_at: string | null;
}

interface AutomationStore {
  status: AutomationStatus;
  isLoading: boolean;
  lastChecked: number;

  fetchStatus: () => Promise<void>;
  setRunning: (runId: string) => void;
  clearRunning: () => void;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollingInterval: NodeJS.Timeout | null = null;

export const useAutomationStore = create<AutomationStore>((set, get) => ({
  status: {
    is_running: false,
    run_id: null,
    started_at: null,
  },
  isLoading: false,
  lastChecked: 0,
  
  fetchStatus: async () => {
    const now = Date.now();
    const { lastChecked } = get();

    // Prevent fetching too frequently (min 5 seconds between checks)
    if (now - lastChecked < 5000) {
      return;
    }

    set({ isLoading: true, lastChecked: now });

    try {
      // 🔥 1) Get Supabase session token
        const [activeAutomation, setActiveAutomation] = useState<any>(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        console.warn("⚠️ No auth token found, skipping status check.");
        setActiveAutomation(null);
        return;
      }

      // 🔥 2) Call backend with Authorization header
      const response = await api.get("/v1/automation/status", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = response.data;

      console.log("📊 Automation status:", data);

      set({
        status: {
          is_running: data.has_active || data.is_running || false,
          run_id: data.run_id || null,
          started_at: data.started_at || null,
        },
        isLoading: false,
      });
    } catch (error: any) {
      console.error("❌ Failed to fetch automation status:", error);

      // On 404, assume no active automation
      if (error?.response?.status === 404) {
        set({
          status: { is_running: false, run_id: null, started_at: null },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    }
  },

  setRunning: (runId: string) => {
    console.log("🚀 Setting automation running:", runId);
    set({
      status: {
        is_running: true,
        run_id: runId,
        started_at: new Date().toISOString(),
      },
    });
  },

  clearRunning: () => {
    console.log("🛑 Clearing automation running status");
    set({
      status: {
        is_running: false,
        run_id: null,
        started_at: null,
      },
    });
    get().stopPolling();
  },

  startPolling: () => {
    console.log("🔄 Starting automation status polling");
    get().stopPolling(); // Clear any existing interval

    // Poll every 10 seconds
    pollingInterval = setInterval(() => {
      const { status } = get();

      // Only poll if we think automation is running
      if (status.is_running) {
        get().fetchStatus();
      } else {
        get().stopPolling();
      }
    }, 10000);
  },

  stopPolling: () => {
    if (pollingInterval) {
      console.log("⏹️ Stopping automation status polling");
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },
}));
