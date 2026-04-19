import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Crown, Sparkles, CreditCard, Loader2, ArrowLeft, MapPin, Flame, Users, User, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/pages/currency_context";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { PRICE_IDS } from "@/lib/price";

interface Plan {
  name: string;
  price: string;
  subtext?: string;
  savings?: string;
  priceId?: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  buttonText: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string;
}

const Plans = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState(80); // Default from image
  const [userPlan, setUserPlan] = useState("free_trial");
  const { toast } = useToast();
  const { convert, country } = useCurrency();
  const navigate = useNavigate();

  

  const plans: Plan[] = [
    {
      name: "Basic (700 Credits)",
      price: "49.99 AED/mo",
      icon: <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm"><Zap className="w-5 h-5 text-indigo-500 fill-indigo-500" /></div>,
      priceId: "700_credits",
      features: ["700 Credits", "AI CV Parsing", "Smart Job Search", "One-time purchase"],
      isCurrent: userPlan === "basic",
      buttonText: userPlan === "basic" ? "Current Plan" : "Subscribe",
      disabled: userPlan === "basic",
      badge: userPlan === "basic" ? "Current Plan" : undefined
    },
    {
      name: "Premium (1400 Credits)",
      price: "79.99 AED/mo",
      icon: <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm"><Flame className="w-5 h-5 text-indigo-500" /></div>,
      priceId: "1400_credits",
      features: ["1400 Credits", "AI CV Parsing", "Smart Job Search", "One-time purchase"],
      isPopular: true,
      isCurrent: userPlan === "premium",
      buttonText: userPlan === "premium" ? "Current Plan" : "Subscribe",
      disabled: userPlan === "premium",
      badge: userPlan === "premium" ? "Current Plan" : undefined
    },
    {
      name: "Recruiter (3000 Credits)",
      price: "199.99 AED/mo",
      icon: <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm"><Users className="w-5 h-5 text-indigo-500" /></div>,
      priceId: "3000_credits",
      features: ["3000 Credits", "AI CV Parsing", "Smart Job Search", "Priority Support"],
      isCurrent: userPlan === "recruiter",
      buttonText: userPlan === "recruiter" ? "Current Plan" : "Subscribe",
      disabled: userPlan === "recruiter",
      badge: userPlan === "recruiter" ? "Current Plan" : undefined
    },
  ];

  useEffect(() => {
    const credits = localStorage.getItem("remaining_credits");
    if (credits) setCurrentCredits(parseInt(credits));

    const plan = localStorage.getItem("user_plan") || localStorage.getItem("plan");
    if (plan) setUserPlan(plan);
  }, []);

  useEffect(() => {
    const success = searchParams.get("success") === "true" || searchParams.get("intent") === "payment_success";
    const canceled = searchParams.get("canceled") === "true" || searchParams.get("intent") === "payment_failed";

    if (success) {
      toast({
        title: "Payment Successful!",
        description: "Your credits have been added successfully.",
      });
      // Refresh profile to get updated balance
      api.get("/v1/credits/balance").then(res => {
        if (res.data?.remaining) {
          setCurrentCredits(res.data.remaining);
          localStorage.setItem("remaining_credits", res.data.remaining.toString());
        }
      });
      setSearchParams({});
    } else if (canceled) {
      toast({
        title: "Payment Canceled",
        description: "The checkout session was canceled or failed.",
        variant: "destructive",
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast]);

  const handlePurchase = async (plan: Plan) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase a plan.",
        variant: "destructive",
      });
      return;
    }

    if (!plan.priceId) return;

    setLoading(plan.priceId);
    try {
      const response = await api.post(
        "/v1/payments/create-checkout-session",
        { 
          price_id: PRICE_IDS[plan.priceId as keyof typeof PRICE_IDS]
        }
      );
      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else if (response.data?.session_url) {
        window.location.href = response.data.session_url;
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err?.response?.data?.detail || "Failed to create checkout session.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <GlobalHeader />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
        {/* Header with Title & Status Card */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <h1 className="text-[32px] font-bold text-[#1E293B] mb-2 leading-tight">Purchase Credits</h1>
            <p className="text-[15px] text-[#64748B] font-medium max-w-3xl leading-relaxed">
              Buy Credits To Power Your AI Job Search And Automation. Prices Shown In Your Selected Currency (United Arab Emirates).
            </p>
          </div>

          {/* Credits Status Card */}
          <div className="bg-white p-3 px-5 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-4 min-w-[220px]">
            <div className="bg-amber-50 p-2.5 rounded-lg">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#1E293B] flex items-center gap-1.5">
                {currentCredits} Credits Left
              </div>
              <div className="text-[12px] text-[#64748B] font-medium">Trial expires in 4 days</div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#6366F1] rounded-2xl p-5 mb-10 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-white flex items-center gap-2">
                United Arab Emirates <span className="opacity-60 font-medium">•</span> Current Credits: {currentCredits}
              </div>
              <div className="text-[12px] text-indigo-100 font-medium opacity-80">
                Your credits are used for AI matching, insights, and automated applications.
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 relative z-10">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="text-[12px] font-bold text-white">Free Account</span>
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col relative group hover:shadow-xl transition-all duration-300">
              {/* Badge & Best Value */}
              <div className="flex justify-between items-start mb-6">
                {plan.icon}
                {plan.badge === "Current Plan" && (
                  <span className="text-[12px] font-bold text-[#64748B] bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{plan.badge}</span>
                )}
                {plan.isPopular && (
                  <div className="flex flex-col items-end gap-2 absolute -top-4 right-8">
                    <span className="bg-[#EBFDF5] text-[#10B981] text-[11px] font-bold px-3 py-1 rounded-full border border-[#10B981]/10">Save 20%</span>
                    <div className="bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Flame className="w-3.5 h-3.5 fill-white" /> Best value
                    </div>
                  </div>
                )}
              </div>

              <h3 className="text-[18px] font-bold text-[#1E293B] mb-1">{plan.name}</h3>
              <div className="text-[28px] font-extrabold text-[#1E293B] mb-6">{plan.price}</div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[14px] font-medium text-[#64748B]">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4">
                <Button
                  onClick={() => handlePurchase(plan)}
                  disabled={plan.disabled || (loading === (plan.priceId || plan.name))}
                  className={`w-full py-6 rounded-xl text-[15px] font-bold transition-all shadow-sm ${plan.disabled
                      ? 'bg-[#A5B4FC] text-white cursor-default'
                      : 'bg-[#2563EB] hover:bg-[#1E40AF] text-white'
                    }`}
                >
                  {loading === (plan.priceId || plan.name) ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center">
          <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest leading-loose max-w-2xl mx-auto">
            Plans Renew Monthly. You Can Upgrade, Downgrade, Or Cancel At Any Time.
            Credits Reset At The Start Of Each Billing Cycle. All Prices Are In AED.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Plans;
//                 <div className="mt-1 text-3xl font-extrabold text-primary">
//                   {plan.price}
//                 </div>

//                 {/* ✅ Savings */}
//                 {plan.savings && plan.savings !== "" && (
//                   <div className="text-sm font-semibold text-emerald-600 mt-1">
//                     {plan.savings}
//                   </div>
//                 )}

//                 <ul className="mt-5 space-y-2 text-sm">
//                   {plan.features.map((f) => (
//                     <li key={f} className="flex items-start gap-2 text-secondary">
//                       <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
//                       <span className="text-black">{f}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 <div className="mt-6">
//                   <Button
//                     onClick={() =>
//                       plan.priceId &&
//                       handlePurchase(PRICE_IDS[plan.priceId as keyof typeof PRICE_IDS])
//                     }
//                     disabled={plan.disabled || loading === plan.priceId}
//                     className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
//                       plan.isPopular
//                         ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white"
//                         : "border border-indigo-200 bg-white text-primary hover:bg-indigo-50"
//                     }`}
//                   >
//                     {loading === plan.priceId ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
//                       </>
//                     ) : (
//                       <>
//                         <CreditCard className="mr-2 h-4 w-4" /> {plan.buttonText}
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Plans;
