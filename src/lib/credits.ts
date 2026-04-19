// src/lib/credits.ts
import { toast } from "sonner";

/**
 * Check if user can use a feature that requires credits
 * Shows error toast and navigates to plans if no credits
 */
export const canUseFeature = (navigate: (path: string) => void): boolean => {
  const hasAccess = localStorage.getItem("has_access") === "true";
  const remainingCredits = parseInt(localStorage.getItem("remaining_credits") || "0");
  
  if (!hasAccess || remainingCredits <= 0) {
    toast.error("You're out of credits! Purchase more to continue.", {
      duration: 5000,
      action: {
        label: "Buy Credits",
        onClick: () => navigate("/plans"),
      },
    });
    return false;
}
  
  return true;
};

/**
 * Get remaining credits from localStorage
 */
export const getCreditsRemaining = (): number => {
  return parseInt(localStorage.getItem("remaining_credits") || "0");
};

/**
 * Check if user has any credits available
 */
export const hasCreditsAvailable = (): boolean => {
  return getCreditsRemaining() > 0;
};

/**
 * Update credits in localStorage after a transaction
 */
export const updateLocalCredits = (newBalance: number) => {
  localStorage.setItem("remaining_credits", String(newBalance));
  
  // Update hasAccess flag
  localStorage.setItem("has_access", newBalance > 0 ? "true" : "false");
  
  // Update plan object if it exists
  try {
    const planStr = localStorage.getItem("plan");
    if (planStr) {
      const plan = JSON.parse(planStr);
      plan.creditsTotal = newBalance;
      plan.hasAccess = newBalance > 0;
      localStorage.setItem("plan", JSON.stringify(plan));
    }
  } catch (e) {
    console.error("Failed to update plan object:", e);
  }
};