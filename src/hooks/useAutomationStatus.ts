import { useEffect, useState } from "react";
import api from "@/lib/api";

export function useAutomationStatus() {
  const [status, setStatus] = useState({
    is_running: false,
    run_id: null,
    started_at: null,
    last_updated_at: null,
    run_details: null,
  });

  async function fetchStatus() {
    try {
      const res = await api.get("/v1/automation/persistent-status");
      setStatus(res.data);
    } catch (err) {
      console.error("[Automation Status] Failed:", err);
    }
  }

  useEffect(() => {
    fetchStatus(); // Initial load

    const interval = setInterval(fetchStatus, 4000); // Poll backend

    return () => clearInterval(interval);
  }, []);

  return status;
}
