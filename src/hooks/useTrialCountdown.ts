import { useEffect, useState } from "react";

/**
 * Calculates remaining free trial days based on stored trial_ends_at.
 * Matches logic used in JobSearch.
 */
export const useTrialCountdown = () => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
    localStorage.getItem("trial_ends_at")
  );

  useEffect(() => {
    const updateCountdown = () => {
      const trialEnd = localStorage.getItem("trial_ends_at");
      if (!trialEnd) {
        setDaysLeft(null);
        return;
      }

      const end = new Date(trialEnd).getTime();
      const now = Date.now();
      const diffDays = Math.max(
        0,
        Math.floor((end - now) / (1000 * 60 * 60 * 24))
      );
      setDaysLeft(diffDays);
      setTrialEndsAt(trialEnd);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 3600000); // hourly update
    return () => clearInterval(interval);
  }, []);

  return { daysLeft, trialEndsAt };
};
