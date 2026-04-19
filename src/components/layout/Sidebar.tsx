// src/components/layout/Sidebar.tsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import api from "@/lib/api";

import {
  Home,
  Upload,
  Search as SearchIcon,
  FileText,
  ListChecks,
  CreditCard,
  LogOut,
  Zap,
  Clock,
  BriefcaseBusiness,
  UserCog,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";
import { toast } from "sonner";

const seekerMenuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Upload, label: "Upload CV", path: "/upload-cv" },
  { icon: Sparkles, label: "Recommended Jobs", path: "/recommended-jobs" },
  { icon: ListChecks, label: "My Applications", path: "/my-applications" },
  { icon: TrendingUp, label: "Skill Gap Analysis", path: "/skill-gap-analysis" },
  { icon: BriefcaseBusiness, label: "Scope Jobs", path: "/CompanyJobs" },
  { icon: CreditCard, label: "Plans & Billing", path: "/plans" },
];

const recruiterMenuItems = [
  { icon: Home, label: "Recruiter Dashboard", path: "/recruiter" },
  { icon: BriefcaseBusiness, label: "Manage Jobs", path: "/recruiter" },
  { icon: CreditCard, label: "Plans & Billing", path: "/plans" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const { daysLeft: trialDaysLeft, trialEndsAt } = useTrialCountdown();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [isPaidPlan, setIsPaidPlan] = useState(false);

  const [role, setRole] = useState(localStorage.getItem("person") || "job_seeker");

  // Check if user has a paid plan
  useEffect(() => {
    const checkPlan = () => {
      const planStr = localStorage.getItem("plan");
      if (planStr) {
        try {
          const plan = JSON.parse(planStr);
          // Check if it's a paid plan (pro, premium, recruiter)
          const paidPlans = ['pro', 'premium', 'recruiter'];
          const tier = plan?.tier?.toLowerCase() || '';
          setIsPaidPlan(paidPlans.some(p => tier.includes(p)));
        } catch (e) {
          // check string directly
          const paidPlans = ['pro', 'premium', 'recruiter'];
          setIsPaidPlan(paidPlans.some(p => planStr.toLowerCase().includes(p)));
        }
      }
    };
    checkPlan();

    // Listen for storage changes (when plan is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plan') {
        checkPlan();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ✅ Fetch credits from backend on mount
  useEffect(() => {
    const fetchCreditsFromSupabase = async () => {
      try {
        // ✅ Define userId and token inside the useEffect
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");
        
        if (!userStr || !token) {
          console.warn('⚠️ Sidebar: Missing user or token');
          setCreditsLoading(false);
          return;
        }

        let user;
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('❌ Sidebar: Invalid user data');
          setCreditsLoading(false);
          return;
        }

        const userId = user?.id;
        if (!userId) {
          console.warn('⚠️ Sidebar: No user ID found');
          setCreditsLoading(false);
          return;
        }

        console.log('🔍 Sidebar: Fetching credits for user:', userId);
        
        const apiUrl = import.meta.env.VITE_API_URL || "https://jobbot-production-ddd9.up.railway.app";
        
        // ✅ Build headers with ngrok support
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
        
        // Add ngrok header if using ngrok
        if (apiUrl.includes("ngrok")) {
          headers['ngrok-skip-browser-warning'] = '69420';
        }
        
        const response = await fetch(`${apiUrl}/v1/profile/${userId}`, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('✅ Sidebar: Profile data fetched:', data);
        setCredits(data.remaining_credits || 0);
        setDaysLeft(data.days_left);
        setCreditsLoading(false);
        
        const isPaid = data.subscription_status === 'active' || 
          ['pro', 'premium', 'recruiter', 'paid'].includes(data.plan?.toLowerCase());
        
        setIsPaidPlan(isPaid);
        
        // Use backend flags for strict enforcement
        const isActiveSubscription = data.subscription_status === 'active';
        const isTrialActive = data.trial_active !== false;
        const isFreeTrial = (data.plan === 'free_trial' || !data.plan);

        // ✅ Immediate Redirection if account invalid
        if (!isActiveSubscription && !isTrialActive) {
          console.warn("⚠️ Account invalid - Sidebar redirect to /plans");
          navigate("/plans");
        }
        
        // Cache in localStorage
        localStorage.setItem('remaining_credits', String(data.remaining_credits || 0));
        localStorage.setItem('days_left', String(data.days_left || 0));
        localStorage.setItem('plan', JSON.stringify({ 
          tier: data.plan, 
          subscription_status: data.subscription_status,
          trial_active: data.trial_active
        }));
        
      } catch (error: any) {
        console.error('❌ Sidebar: Failed to fetch profile:', error);
        
        // Use cached credits as fallback
        const cachedCredits = localStorage.getItem('remaining_credits');
        if (cachedCredits) {
          setCredits(parseInt(cachedCredits, 10));
        }
        
        setCreditsLoading(false);
      }
    };

    fetchCreditsFromSupabase();
  }, []); // ✅ Empty dependency array - runs once on mount

  // ✅ Listen for localStorage changes (from other tabs or Dashboard updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "remaining_credits" || e.key === "credits") {
        const newValue = e.newValue;
        if (newValue && !isNaN(Number(newValue))) {
          setCredits(Number(newValue));
          console.log("🔄 Sidebar: Credits updated from storage event:", newValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Refresh credits when window regains focus
  useEffect(() => {
    const handleFocus = async () => {
      try {
        const userStr = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");
        
        if (!userStr || !token) return;

        let user;
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('❌ Sidebar: Invalid user data on focus');
          return;
        }

        const userId = user?.id;
        if (!userId) return;

        console.log("👁️ Sidebar: Window focused, refreshing credits");

        const apiUrl = import.meta.env.VITE_API_URL || "https://jobbot-production-ddd9.up.railway.app";
        
        // ✅ Build headers with ngrok support
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };
        
        // Add ngrok header if using ngrok
        if (apiUrl.includes("ngrok")) {
          headers['ngrok-skip-browser-warning'] = '69420';
        }
        
        const res = await fetch(`${apiUrl}/v1/credits/balance`, {
          method: 'GET',
          headers
        });

        if (res.ok) {
          const data = await res.json();
          const fetchedCredits = data.remaining ?? 0;
          
          setCredits(fetchedCredits);
          localStorage.setItem("remaining_credits", String(fetchedCredits));
          localStorage.setItem("credits", String(fetchedCredits));
          
          console.log("✅ Sidebar: Credits refreshed on focus:", fetchedCredits);
        }
      } catch (err) {
        console.error("❌ Sidebar: Failed to refresh credits on focus:", err);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // ✅ Listen for custom credit update events from Dashboard
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent) => {
      console.log("🔄 Sidebar: Received credit update event:", event.detail);
      setCredits(event.detail.credits);
    };

    window.addEventListener('credits-updated' as any, handleCreditUpdate);
    return () => {
      window.removeEventListener('credits-updated' as any, handleCreditUpdate);
    };
  }, []);

  // 🧭 Watch trial expiration + credits depletion
  useEffect(() => {
    // Paid users who are active never get blocked here (handled by profile fetch)
    if (isPaidPlan) return;

    if (daysLeft !== null && daysLeft <= 0) {
      // Logic handled in fetchCreditsFromSupabase for immediate redirect,
      // but keeping this for state updates
      const planStr = localStorage.getItem("plan");
      const planObj = planStr ? JSON.parse(planStr) : null;
      const isFreeTrial = planObj?.tier === 'free_trial' || !planObj?.tier;
      
      const message = isFreeTrial
        ? "⏳ Your 7-day free trial has ended. Please upgrade to continue."
        : "💳 Your plan has expired. Please renew to continue.";
      
      toast.warning(message);
      navigate("/plans");
    } else if (credits !== null && credits <= 0) {
      toast.warning("💸 You've run out of credits. Please buy more to continue searching jobs.");
      navigate("/plans");
    }
  }, [daysLeft, credits, navigate, isPaidPlan]);

  const toggleRole = () => {
    const newRole = role === "job_seeker" ? "recruiter" : "job_seeker";
    localStorage.setItem("person", newRole);
    setRole(newRole);
    toast.success(`Switched to ${newRole === "recruiter" ? "Recruiter" : "Job Seeker"} mode`);
    navigate(newRole === "recruiter" ? "/recruiter" : "/dashboard");
  };
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-full overflow-y-auto glass-card border-r p-6 flex flex-col justify-between">
      {/* --- Logo Section --- */}
      <div>
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src={ScopeLogo}
            alt="Scope AI Logo"
            className="w-16 h-16 mb-2 drop-shadow-lg"
          />
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Scope AI
          </h1>
          <p className="text-xs text-gray-400 mt-1 tracking-wide">
            Automate your job search
          </p>
        </div>

        {/* --- Role Display --- */}
        <div className="rounded-xl bg-gradient-to-r from-indigo-600/10 to-purple-600/10 p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-indigo-700 font-medium">
              {role === "job_seeker" ? (
                <UserCog className="w-4 h-4" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              <span>
                Role:{" "}
                <strong className="capitalize">
                  {role === "job_seeker" ? "Job Seeker" : "Recruiter"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* --- Navigation --- */}
        <nav className="flex-1 space-y-2">
          {(role === "recruiter" ? recruiterMenuItems : seekerMenuItems).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r hover:text-white btn-hero from-primary to-accent text-white shadow-md"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground "
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- Footer: Credits + Trial + Logout --- */}
      <div className="pt-4 border-t border-white/10 mt-6">
        <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-600/10 p-4 text-center shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Credits Left</span>
            </div>
            
            {creditsLoading ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin text-indigo-500" />
                <p className="text-lg font-semibold text-gray-400">Loading...</p>
              </div>
            ) : (
              <p className="text-2xl font-semibold text-primary">
                {credits === null ? "0" : credits}
              </p>
            )}

            {/* Show trial only for non-paid plans */}
            {daysLeft !== null && !isPaidPlan && (
              <div className="flex items-center gap-2 text-xs text-indigo-500 font-medium mt-1">
                <Clock className="w-3 h-3" />
                <span>Trial expires in {daysLeft} day{daysLeft === 1 ? "" : "s"}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 mt-5 px-4 py-3 rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
// import { useEffect, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Home,
//   Upload,
//   Search as SearchIcon,
//   FileText,
//   ListChecks,
//   CreditCard,
//   LogOut,
//   Zap,
//   Clock,
//   BriefcaseBusiness,
//   UserCog,
//   Users,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { toast } from "sonner";
// import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

// const menuItems = [
//   { icon: Home, label: "Dashboard", path: "/dashboard" },
//   { icon: Upload, label: "Upload CV", path: "/upload-cv" },
//   { icon: SearchIcon, label: "Job Search", path: "/job-search" },
//   { icon: ListChecks, label: "My Applications", path: "/my-applications" },
//   { icon: FileText, label: "CV Builder", path: "/cv-builder" },
//   { icon: CreditCard, label: "Plans & Billing", path: "/plans" },
//   { icon: BriefcaseBusiness, label: "Scope Jobs", path: "/CompanyJobs" },
// ];

// export const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [credits, setCredits] = useState<number | null>(null);
//   const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
//     localStorage.getItem("trial_ends_at")
//   );
//   const [daysLeft, setDaysLeft] = useState<number | null>(null);
//   const [role, setRole] = useState(localStorage.getItem("person") || "job_seeker");

//   // ✅ Refresh credits and role info periodically
//   useEffect(() => {
//     const computeDaysLeft = (iso: string | null) => {
//       if (!iso) return null;
//       const end = new Date(iso).getTime();
//       if (Number.isNaN(end)) return null;
//       const now = Date.now();
//       return Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
//     };

//     const updateInfo = () => {
//       const creditsStr = localStorage.getItem("remaining_credits");
//       setCredits(creditsStr && !isNaN(Number(creditsStr)) ? Number(creditsStr) : null);

//       const trialEndStr = localStorage.getItem("trial_ends_at");
//       setTrialEndsAt(trialEndStr || null);
//       setDaysLeft(computeDaysLeft(trialEndStr || null));

//       const storedRole = localStorage.getItem("person");
//       if (storedRole) setRole(storedRole);
//     };

//     updateInfo();
//     const interval = setInterval(updateInfo, 5000);
//     window.addEventListener("focus", updateInfo);
//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("focus", updateInfo);
//     };
//   }, []);

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   const toggleRole = () => {
//     const newRole = role === "job_seeker" ? "recruiter" : "job_seeker";
//     localStorage.setItem("person", newRole);
//     setRole(newRole);
//     toast.success(`Switched to ${newRole === "recruiter" ? "Recruiter" : "Job Seeker"} mode`);
//     navigate(newRole === "recruiter" ? "/recruiter" : "/dashboard");
//   };

//   const trialInfo =
//     trialEndsAt && daysLeft !== null
//       ? `Trial expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
//       : null;

//   return (
//     <aside className="w-64 min-h-screen glass-card border-r p-6 flex flex-col justify-between">
//       {/* --- Top Section: Logo + Role --- */}
//       <div>
//         {/* Logo */}
//         <div className="mb-6 flex flex-col items-center text-center">
//           <img
//             src={ScopeLogo}
//             alt="Scope AI Logo"
//             className="w-16 h-16 mb-2 drop-shadow-lg"
//           />
//           <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
//             Scope AI
//           </h1>
//           <p className="text-xs text-gray-400 mt-1 tracking-wide">
//             Automate your job search
//           </p>
//         </div>

//         {/* --- Role Display --- */}
//         <div className="rounded-xl bg-gradient-to-r from-indigo-600/10 to-purple-600/10 p-4 text-center shadow-sm hover:shadow-md transition-all duration-300 mb-6">
//           <div className="flex flex-col items-center gap-2">
//             <div className="flex items-center gap-2 text-indigo-700 font-medium">
//               {role === "job_seeker" ? <UserCog className="w-4 h-4" /> : <Users className="w-4 h-4" />}
//               <span>
//                 Role:{" "}
//                 <strong className="capitalize">
//                   {role === "job_seeker" ? "Job Seeker" : "Recruiter"}
//                 </strong>
//               </span>
//             </div>
            
//           </div>
//         </div>

//         {/* --- Navigation --- */}
//         <nav className="flex-1 space-y-2">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = location.pathname === item.path;
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
//                   isActive
//                     ? "bg-gradient-to-r hover:text-white btn-hero from-primary to-accent text-white shadow-md"
//                     : "text-foreground/70 hover:bg-muted hover:text-foreground "
//                 )}
//               >
//                 <Icon className="w-5 h-5" />
//                 <span className="font-medium">{item.label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* --- Bottom Section: Credits + Logout --- */}
//       <div className="pt-4 border-t border-white/10 mt-6">
//         <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-600/10 p-4 text-center shadow-sm hover:shadow-md transition-all duration-300">
//           <div className="flex flex-col items-center space-y-2">
//             <div className="flex items-center gap-2">
//               <Zap className="w-4 h-4 text-yellow-500" />
//               <span className="text-sm text-muted-foreground">Credits Left</span>
//             </div>
//             <p className="text-2xl font-semibold text-primary">
//               {credits === null ? "..." : credits}
//             </p>
//             {trialInfo && (
//               <div className="flex items-center gap-2 text-xs text-indigo-500 font-medium mt-1">
//                 <Clock className="w-3 h-3" />
//                 <span>{trialInfo}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center justify-center gap-2 mt-5 px-4 py-3 rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-200"
//         >
//           <LogOut className="w-5 h-5" />
//           <span className="font-medium">Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// };

// // src/components/layout/Sidebar.tsx
// import { useEffect, useState } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Home,
//   Upload,
//   Search as SearchIcon,
//   FileText,
//   ListChecks,
//   CreditCard,
//   LogOut,
//   Zap,
//   Clock,
//   BriefcaseBusiness
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";


// const menuItems = [
//   { icon: Home, label: "Dashboard", path: "/dashboard" },
//   { icon: Upload, label: "Upload CV", path: "/upload-cv" },
//   { icon: SearchIcon, label: "Job Search", path: "/job-search" },
//   { icon: ListChecks, label: "My Applications", path: "/my-applications" },
//   { icon: FileText, label: "CV Builder", path: "/cv-builder" },
//   { icon: CreditCard, label: "Plans & Billing", path: "/plans" },
//   { icon: BriefcaseBusiness, label: "Scope Jobs", path: "/CompanyJobs" },
// ];

// export const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [credits, setCredits] = useState<number | null>(null);
//   const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
//     localStorage.getItem("trial_ends_at")
//   );
//   const [daysLeft, setDaysLeft] = useState<number | null>(null);

//   // ✅ Refresh credits + trial (and compute days left) on interval & focus
//   useEffect(() => {
//     const computeDaysLeft = (iso: string | null) => {
//       if (!iso) return null;
//       const end = new Date(iso).getTime();
//       if (Number.isNaN(end)) return null;
//       const now = Date.now();
//       return Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
//     };

//     const updateInfo = () => {
//       const creditsStr = localStorage.getItem("remaining_credits");
//       setCredits(creditsStr && !isNaN(Number(creditsStr)) ? Number(creditsStr) : null);

//       const trialEndStr = localStorage.getItem("trial_ends_at");
//       setTrialEndsAt(trialEndStr || null);
//       setDaysLeft(computeDaysLeft(trialEndStr || null));
//     };

//     updateInfo();
//     const interval = setInterval(updateInfo, 5000);
//     window.addEventListener("focus", updateInfo);
//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("focus", updateInfo);
//     };
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("remaining_credits");
//     localStorage.removeItem("trial_ends_at");
//     localStorage.removeItem("parsed_cv");
//     localStorage.removeItem("current_cv_id");
//     navigate("/login");
//   };

//   const trialInfo =
//     trialEndsAt && daysLeft !== null
//       ? `Trial expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
//       : null;

//   return (
//     <aside className="w-64 min-h-screen glass-card border-r p-6 flex flex-col justify-between">
//       {/* --- Logo Section --- */}
//       <div>
//         <div className="mb-8 flex flex-col items-center text-center">
//           <img
//             src={ScopeLogo}
//             alt="Scope AI Logo"
//             className="w-16 h-16 mb-2 drop-shadow-lg"
//           />
//           <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
//             Scope AI
//           </h1>
//           <p className="text-xs text-gray-400 mt-1 tracking-wide">
//             Automate your job search
//           </p>
//         </div>

//         {/* --- Navigation --- */}
//         <nav className="flex-1 space-y-2">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = location.pathname === item.path;
//             return (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className={cn(
//                   "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
//                   isActive
//                     ? "bg-gradient-to-r hover:text-white btn-hero from-primary to-accent text-white shadow-md"
//                     : "text-foreground/70 hover:bg-muted hover:text-foreground "
//                 )}
//               >
//                 <Icon className="w-5 h-5" />
//                 <span className="font-medium">{item.label}</span>
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* --- Footer: Credits + Trial + Logout --- */}
//       <div className="pt-4 border-t border-white/10 mt-6">
//         {/* Modern Credits & Trial Card */}
//         <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-600/10 p-4 text-center shadow-sm hover:shadow-md transition-all duration-300">
//           <div className="flex flex-col items-center space-y-2">
//             <div className="flex items-center gap-2">
//               <Zap className="w-4 h-4 text-yellow-500" />
//               <span className="text-sm text-muted-foreground">Credits Left</span>
//             </div>
//             <p className="text-2xl font-semibold text-primary">
//               {credits === null ? "..." : credits}
//             </p>

//             {trialInfo && (
//               <div className="flex items-center gap-2 text-xs text-indigo-500 font-medium mt-1">
//                 <Clock className="w-3 h-3" />
//                 <span>{trialInfo}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Logout Button */}
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center justify-center gap-2 mt-5 px-4 py-3 rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-200"
//         >
//           <LogOut className="w-5 h-5" />
//           <span className="font-medium">Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// };
