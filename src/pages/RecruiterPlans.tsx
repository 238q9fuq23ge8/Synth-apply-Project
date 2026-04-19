import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Archive,
  User,
  CreditCard,
  LogOut,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import { PRICE_IDS } from "@/lib/price";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
        active ? "bg-[#eef4ff] text-[#2563eb]" : "text-[#374151] hover:bg-[#f3f4f6]"
      )}
    >
      <span className={cn("w-5 h-5 rounded-full grid place-items-center", active ? "bg-[#2563eb] text-white" : "bg-[#eff2f8] text-[#2563eb]")}>
        <Icon className="w-3 h-3" />
      </span>
      {label}
    </button>
  );
}

const PLANS = [
  {
    key: "700_credits",
    title: "700 Credits",
    price: "49.99 AED",
    priceId: PRICE_IDS["700_credits"],
    features: ["700 Credits", "AI CV Parsing", "Smart Job Search", "One-time purchase"],
    badge: undefined as string | undefined,
  },
  {
    key: "1400_credits",
    title: "1400 Credits",
    price: "79.99 AED",
    priceId: PRICE_IDS["1400_credits"],
    features: ["1400 Credits", "AI CV Parsing", "Smart Job Search", "One-time purchase"],
    badge: "Best value",
  },
  {
    key: "3000_credits",
    title: "Recruiter Plan",
    price: "199.99 AED",
    priceId: PRICE_IDS["3000_credits"],
    features: ["3000 Credits", "Unlimited Job Postings", "Unlimited CV Views", "Priority Support", "AI CV Parsing"],
    badge: "Recruiter",
  },
];

export default function RecruiterPlans() {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem("user");
  const userObj = userRaw ? JSON.parse(userRaw) : null;
  const authProvider = userObj?.app_metadata?.provider || userObj?.identities?.[0]?.provider || null;
  const displayName = userObj?.user_metadata?.name || userObj?.email?.split("@")[0] || "Profile";

  const [credits, setCredits] = useState<{ remaining: number; total: number } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    api.get("/v1/credits/balance")
      .then((res) => setCredits({ remaining: res.data.remaining ?? 0, total: res.data.total ?? 0 }))
      .catch(() => {});
  }, []);

  const handleSubscribe = async (priceId: string, planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const res = await api.post("/v1/payments/create-checkout-session", { price_id: priceId });
      const url = res.data?.session_url || res.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error("No checkout URL returned. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-[#f7f8fb] min-h-screen">
      <div className="flex">
        <aside className="hidden lg:flex lg:flex-col lg:justify-between w-[220px] xl:w-[236px] shrink-0 border-r border-[#eceef3] bg-white sticky top-0 h-screen px-3 py-4">
          <div>
            <div className="flex items-center gap-2.5 px-2 mb-5 pt-1">
              <img src={ScopeLogo} alt="Scope AI" className="w-9 h-9 object-contain" />
              <span className="text-[30px] leading-none font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-fuchsia-500">
                Scope AI
              </span>
            </div>
            <div className="space-y-1.5">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate("/recruiter")} />
              <SidebarItem icon={BriefcaseBusiness} label="My Jobs" onClick={() => navigate("/recruiter/my-jobs")} />
              <SidebarItem icon={Users} label="Candidates" onClick={() => navigate("/recruiter/candidates")} />
              <SidebarItem icon={Archive} label="Archived Jobs" onClick={() => navigate("/recruiter-archived-jobs")} />
              <SidebarItem icon={User} label="Profile" onClick={() => navigate("/profile")} />
              <SidebarItem icon={CreditCard} label="Upgrade plan" active />
            </div>
          </div>
          <SidebarItem icon={LogOut} label="Logout" onClick={logout} />
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-6 xl:px-8 py-5">
          <div className="max-w-[1400px] mx-auto">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[42px] leading-none font-bold text-[#2563eb] mb-2">Upgrade Plan</h1>
                <p className="text-[12px] text-[#6b7280] font-medium">
                  Purchase credits to power your hiring. All prices in AED.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280] font-medium">
                {authProvider === "google" ? <span className="text-[14px]">G</span> : <User className="w-3.5 h-3.5" />}
                <span>{displayName}</span>
              </div>
            </div>

            {/* Credits banner */}
            <div className="rounded-md bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white px-5 py-4 flex items-center justify-between mb-6">
              <div className="text-[13px] font-semibold">
                Current Credits:{" "}
                {credits === null ? (
                  <span className="opacity-70">Loading...</span>
                ) : (
                  <span className="text-white font-bold">{credits.remaining} / {credits.total}</span>
                )}
              </div>
              <div className="text-[11px] font-semibold bg-white/15 px-2 py-0.5 rounded">Recruiter Account</div>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLANS.map((plan) => (
                <div key={plan.key} className="rounded-xl border border-[#edf0f5] bg-white p-6 relative flex flex-col">
                  {plan.badge && (
                    <span className="absolute right-4 top-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ebfdf5] text-[#10b981]">
                      {plan.badge}
                    </span>
                  )}
                  <div className="text-[18px] font-semibold text-[#111827] mb-1">{plan.title}</div>
                  <div className="text-[34px] leading-none font-bold text-[#111827] mb-5">{plan.price}</div>
                  <div className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-[13px] text-[#6b7280] font-medium">
                        <Check className="w-4 h-4 text-[#10b981] shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleSubscribe(plan.priceId, plan.key)}
                    disabled={loadingPlan === plan.key}
                    className="w-full h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold rounded-md"
                  >
                    {loadingPlan === plan.key ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
