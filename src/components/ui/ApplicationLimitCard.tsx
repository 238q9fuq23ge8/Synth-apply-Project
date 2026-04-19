import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Zap, Infinity } from "lucide-react";
import { ApplicationLimits } from "@/hooks/useApplicationLimits";

interface ApplicationLimitCardProps {
  limits: ApplicationLimits;
}

export function ApplicationLimitCard({ limits }: ApplicationLimitCardProps) {
  const navigate = useNavigate();

  if (limits.unlimited) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-emerald-800 text-[14px]">Unlimited Applications</p>
          <p className="text-xs text-emerald-600 font-medium">
            Your {limits.plan} plan includes unlimited job applications
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-100 px-2 py-1 rounded-lg">
          <Infinity className="w-3 h-3" />
          Unlimited
        </div>
      </div>
    );
  }

  const percentage = (limits.current_count / limits.daily_limit) * 100;
  const isWarning = percentage >= 70;
  const isCritical = percentage >= 100;

  const getStatusColors = () => {
    if (isCritical) {
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        textSecondary: "text-red-600",
        progress: "bg-red-500",
        button: "bg-red-600 hover:bg-red-700",
      };
    }
    if (isWarning) {
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-800",
        textSecondary: "text-orange-600",
        progress: "bg-orange-500",
        button: "bg-orange-600 hover:bg-orange-700",
      };
    }
    return {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      textSecondary: "text-blue-600",
      progress: "bg-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
    };
  };

  const colors = getStatusColors();

  return (
    <div className={`rounded-xl p-4 border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-red-600" />
          ) : (
            <Clock className="w-4 h-4 text-blue-600" />
          )}
          <span className={`font-bold text-[14px] ${colors.text}`}>
            Daily Applications
          </span>
        </div>
        <span className={`text-xs font-bold ${colors.textSecondary}`}>
          {limits.current_count}/{limits.daily_limit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-300 ${colors.progress}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${colors.textSecondary}`}>
          {limits.remaining > 0
            ? `${limits.remaining} remaining today • Resets in ${Math.ceil(limits.reset_in_hours)}h`
            : "Daily limit reached"}
        </p>

        {limits.remaining === 0 && (
          <Button
            size="sm"
            onClick={() => navigate("/plans")}
            className={`${colors.button} text-white text-xs font-bold h-8 px-3`}
          >
            Upgrade Now
          </Button>
        )}
      </div>
    </div>
  );
}