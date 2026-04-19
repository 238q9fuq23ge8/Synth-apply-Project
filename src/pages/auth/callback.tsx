import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import api from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

// =========================================================
// HELPER: Calculate Trial Days Remaining
// =========================================================
function calculateTrialDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  
  try {
    const endDate = new Date(trialEndsAt);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
}

// =========================================================
// HELPER: Format Plan Display Name
// =========================================================
function formatPlanName(plan: string): string {
  const planMap: Record<string, string> = {
    'free_trial': 'Free Trial',
    'pro': 'Pro',
    'premium': 'Premium',
    'recruiter': 'Recruiter'
  };
  return planMap[plan?.toLowerCase()] || 'Free Trial';
}

// =========================================================
// HELPER: Determine Navigation Destination
// =========================================================
function getNavigationDestination(
  person: string,
  onboardingCompleted: boolean
): string {
  console.log("🧭 Navigation decision:", { person, onboardingCompleted });

  if (person === "recruiter") {
    console.log("👔 Recruiter detected → /recruiter");
    return "/recruiter";
  }

  if (person === "cv_builder") {
    console.log("📄 CV Builder detected → /cv-builder");
    return "/cv-builder";
  }

  if (person === "job_seeker") {
    // Onboarding has been removed - all job seekers go to dashboard
    console.log("👤 Job seeker → /dashboard (onboarding removed)");
    return "/dashboard";
  }

  console.log("⚠️ Unknown person type, defaulting to /dashboard");
  return "/dashboard";
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const provider = params.get("provider");

        // ======================================================
        // 🟦 FACEBOOK AUTH FLOW
        // ======================================================
        if (provider === "facebook") {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/auth/facebook/callback${window.location.search}`
            );
            const data = await response.json();

            if (!data?.user) throw new Error("Facebook login failed");

            console.log("✅ Facebook Authenticated user:", data.user);

            const fbUser = {
              id: data.user.id || `fb_${Date.now()}`,
              email: data.user.email || "",
              user_metadata: {
                name: data.user.name || "User",
                full_name: data.user.name || "User",
                avatar_url: data.user.avatar || "",
                person: localStorage.getItem("pending_account_type") || "job_seeker",
              },
            };

            localStorage.setItem("user", JSON.stringify(fbUser));
            localStorage.setItem("access_token", data.access_token || "");
            localStorage.setItem("user_email", fbUser.email);

            try {
              console.log("📤 Syncing Facebook profile...");
              await api.post("/v1/profile/sync", { user: fbUser });
              console.log("✅ Facebook profile synced");
            } catch (syncErr) {
              console.error("⚠️ Profile sync failed:", syncErr);
            }

            try {
              console.log("📤 Fetching accurate profile data...");
              const res = await api.post("/v1/profile/me", {}, {
                headers: { Authorization: `Bearer ${data.access_token}` }
              });
              
              const profile = res.data;
              console.log("✅ Profile data fetched:", profile);

              const trialDaysLeft = calculateTrialDaysLeft(profile.trial_ends_at);
              const isPremium = profile.plan?.toLowerCase() === 'premium';

              localStorage.setItem("user_id", profile.user_id);
              localStorage.setItem("email", profile.email);
              localStorage.setItem("person", profile.person || "job_seeker");
              
              localStorage.setItem("remaining_credits", String(profile.remaining_credits || 0));
              localStorage.setItem("credits_total", String(profile.credits_total || 0));
              localStorage.setItem("used_credits", String(profile.used_credits || 0));
              
              localStorage.setItem("plan", profile.plan || "free_trial");
              localStorage.setItem("plan_display", formatPlanName(profile.plan));
              localStorage.setItem("trial_ends_at", profile.trial_ends_at || "");
              localStorage.setItem("trial_days_left", String(trialDaysLeft));
              
              const planObj = {
                tier: formatPlanName(profile.plan),
                tierRaw: profile.plan || "free_trial",
                creditsTotal: profile.credits_total || 0,
                creditsRemaining: profile.remaining_credits || 0,
                creditsUsed: profile.used_credits || 0,
                isPremium: isPremium,
                isFreeTrial: profile.plan?.toLowerCase() === 'free_trial',
                trialEndsAt: profile.trial_ends_at,
                trialDaysLeft: trialDaysLeft,
                hasUnlimitedCredits: isPremium,
              };
              
              localStorage.setItem("planObj", JSON.stringify(planObj));

              const onboardingCompleted = profile.onboarding_completed === true;
              
              if (onboardingCompleted) {
                localStorage.setItem("onboarding_completed", "true");
              }
              
              localStorage.removeItem("pending_account_type");

              const destination = getNavigationDestination(
                profile.person || "job_seeker",
                onboardingCompleted
              );

              const isNewUser = !onboardingCompleted;
              toast.success(`Welcome ${isNewUser ? '' : 'back'}, ${fbUser.user_metadata.name}!`);
              navigate(destination);
            } catch (profileErr) {
              console.error("❌ Failed to fetch profile:", profileErr);
              setDefaultProfile(fbUser.user_metadata.name);

              const pendingType = localStorage.getItem("pending_account_type") || "job_seeker";
              localStorage.setItem("person", pendingType);
              localStorage.removeItem("pending_account_type");

              if (pendingType === "recruiter") {
                navigate("/recruiter");
              } else if (pendingType === "cv_builder") {
                navigate("/cv-builder");
              } else {
                navigate("/dashboard");
              }
            }

            return;
          } catch (fbErr: any) {
            console.error("❌ Facebook callback error:", fbErr);
            toast.error("Facebook sign-in failed. Please try again.");
            navigate("/login");
            return;
          }
        }

        // ======================================================
        // 🟥 GOOGLE AUTH FLOW (Supabase)
        // ======================================================
        console.log("🔍 Processing Google authentication...");
        
        const { data, error } = await supabase.auth.getSession();
        let session = data?.session;

        if (!session) {
          console.log("🔄 No session found, checking URL...");
          const { data: redirectData, error: redirectError } =
            await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (redirectError) throw redirectError;
          session = redirectData.session;
        }

        if (!session) {
          console.error("❌ No valid session found");
          toast.error("No valid session found after Google sign-in");
          navigate("/login");
          return;
        }

        const { user } = session;
        console.log("✅ Google Authenticated user:", {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        });

        const normalizedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            name:
              user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.given_name ||
              user.email?.split("@")[0] ||
              "User",
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User",
            avatar_url:
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              "",
            person: localStorage.getItem("pending_account_type") || user.user_metadata?.person || "job_seeker",
          },
        };

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        localStorage.setItem("access_token", session.access_token);
        localStorage.setItem("refresh_token", session.refresh_token);
        localStorage.setItem("user_email", user.email || "");

        try {
          console.log("📤 Syncing Google profile with backend...");
          await api.post("/v1/profile/sync", { user: normalizedUser });
          console.log("✅ Profile sync successful");
        } catch (syncErr: any) {
          console.error("❌ Profile sync error:", syncErr);
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          console.log("📤 Fetching accurate profile data from backend...");
          
          const res = await api.post("/v1/profile/me", {}, {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          
          const profile = res.data;
          console.log("✅ Backend profile loaded:", profile);

          if (!profile.user_id) {
            throw new Error("Invalid profile response - missing user_id");
          }

          const trialDaysLeft = calculateTrialDaysLeft(profile.trial_ends_at);
          const isPremium = profile.plan?.toLowerCase() === 'premium';
          const isFreeTrial = profile.plan?.toLowerCase() === 'free_trial';

          localStorage.setItem("user_id", profile.user_id);
          localStorage.setItem("email", profile.email);
          localStorage.setItem("person", profile.person || "job_seeker");
          
          localStorage.setItem("remaining_credits", String(profile.remaining_credits || 0));
          localStorage.setItem("credits_total", String(profile.credits_total || 0));
          localStorage.setItem("used_credits", String(profile.used_credits || 0));
          
          localStorage.setItem("plan", profile.plan || "free_trial");
          localStorage.setItem("plan_display", formatPlanName(profile.plan));
          localStorage.setItem("trial_ends_at", profile.trial_ends_at || "");
          localStorage.setItem("trial_days_left", String(trialDaysLeft));
          
          const planObj = {
            tier: formatPlanName(profile.plan),
            tierRaw: profile.plan || "free_trial",
            creditsTotal: profile.credits_total || 0,
            creditsRemaining: profile.remaining_credits || 0,
            creditsUsed: profile.used_credits || 0,
            isPremium: isPremium,
            isFreeTrial: isFreeTrial,
            trialEndsAt: profile.trial_ends_at,
            trialDaysLeft: trialDaysLeft,
            hasUnlimitedCredits: isPremium,
            showTrialWarning: isFreeTrial && trialDaysLeft <= 3,
          };
          
          localStorage.setItem("planObj", JSON.stringify(planObj));

          const onboardingCompleted = profile.onboarding_completed === true;
          
          if (onboardingCompleted) {
            localStorage.setItem("onboarding_completed", "true");
          }
          
          localStorage.removeItem("pending_account_type");

          const userName = normalizedUser.user_metadata.name;
          const isNewUser = !onboardingCompleted;
          
          if (isFreeTrial && trialDaysLeft > 0) {
            toast.success(
              `Welcome ${isNewUser ? '' : 'back'}, ${userName}! ${trialDaysLeft} trial days remaining.`,
              { duration: 4000 }
            );
          } else if (isFreeTrial && trialDaysLeft === 0) {
            toast.warning(
              `Welcome, ${userName}! Your trial has ended. Upgrade to continue.`,
              { duration: 5000 }
            );
          } else {
            toast.success(`Welcome ${isNewUser ? '' : 'back'}, ${userName}!`);
          }

          const person = profile.person || normalizedUser.user_metadata.person;
          
          const destination = getNavigationDestination(
            person,
            onboardingCompleted
          );
          
          console.log(`🧭 Navigating to ${destination} as ${person} (onboarding complete: ${onboardingCompleted})`);
          navigate(destination);

        } catch (profileErr: any) {
          console.error("❌ Failed to fetch profile from backend:", profileErr);

          console.warn("⚠️ Using fallback defaults");
          setDefaultProfile(normalizedUser.user_metadata.name);

          const pendingType = localStorage.getItem("pending_account_type") || "job_seeker";
          localStorage.setItem("person", pendingType);
          localStorage.removeItem("pending_account_type");

          toast.warning(`Welcome, ${normalizedUser.user_metadata.name}! Loading default settings.`);

          if (pendingType === "recruiter") {
            navigate("/recruiter");
          } else if (pendingType === "cv_builder") {
            navigate("/cv-builder");
          } else {
            navigate("/dashboard");
          }
        }

      } catch (err: any) {
        console.error("❌ Auth callback critical error:", err);
        toast.error("Sign-in failed. Please try again.");
        navigate("/login");
      }
    };

    handleAuth();
  }, [navigate]);

  // =========================================================
  // HELPER: Set Default Profile (Fallback)
  // =========================================================
  function setDefaultProfile(userName: string = "User") {
    console.log("⚙️ Setting default profile values");
    
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    localStorage.setItem("remaining_credits", "100");
    localStorage.setItem("credits_total", "100");
    localStorage.setItem("used_credits", "0");
    localStorage.setItem("plan", "free_trial");
    localStorage.setItem("plan_display", "Free Trial");
    localStorage.setItem("trial_ends_at", trialEnd.toISOString());
    localStorage.setItem("trial_days_left", "7");
    
    const defaultPlanObj = {
      tier: "Free Trial",
      tierRaw: "free_trial",
      creditsTotal: 100,
      creditsRemaining: 100,
      creditsUsed: 0,
      isPremium: false,
      isFreeTrial: true,
      trialEndsAt: trialEnd.toISOString(),
      trialDaysLeft: 7,
      hasUnlimitedCredits: false,
      showTrialWarning: false,
    };
    
    localStorage.setItem("planObj", JSON.stringify(defaultPlanObj));
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Loading Card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={ScopeLogo} alt="Scope AI" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg" />
        </div>

        {/* Animated Spinner */}
        <div className="relative flex justify-center mb-6">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-purple-100"></div>
            
            {/* Spinning gradient ring */}
            <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 border-b-pink-600 animate-spin"></div>
            
            {/* Center pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Connecting Your Account
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Please wait while we set up your profile...
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Loading messages */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-purple-600" />
            <span>Verifying authentication...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/lib/supabaseClient";
// import api from "@/lib/api";
// import { toast } from "sonner";
// // hafa
// // =========================================================
// // HELPER: Calculate Trial Days Remaining
// // =========================================================
// function calculateTrialDaysLeft(trialEndsAt: string | null): number {
//   if (!trialEndsAt) return 0;
  
//   try {
//     const endDate = new Date(trialEndsAt);
//     const now = new Date();
//     const diffTime = endDate.getTime() - now.getTime();
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//     return Math.max(0, diffDays);
//   } catch {
//     return 0;
//   }
// }

// // =========================================================
// // HELPER: Format Plan Display Name
// // =========================================================
// function formatPlanName(plan: string): string {
//   const planMap: Record<string, string> = {
//     'free_trial': 'Free Trial',
//     'pro': 'Pro',
//     'premium': 'Premium',
//     'recruiter': 'Recruiter'
//   };
//   return planMap[plan?.toLowerCase()] || 'Free Trial';
// }

// // =========================================================
// // HELPER: Determine Navigation Destination
// // =========================================================
// function getNavigationDestination(
//   person: string,
//   isNewUser: boolean,
//   hasCompletedOnboarding: boolean
// ): string {
//   if (person === "recruiter") {
//     // Recruiters always go to recruiter dashboard
//     return "/recruiter";
//   }
  
//   if (person === "job_seeker") {
//     // New job seekers or those who haven't completed onboarding
//     if (isNewUser || !hasCompletedOnboarding) {
//       console.log("🆕 New job seeker - routing to onboarding");
//       return "/onboarding";
//     }
//     // Returning job seekers who completed onboarding
//     console.log("👤 Returning job seeker - routing to dashboard");
//     return "/dashboard";
//   }
  
//   // Default fallback
//   return "/dashboard";
// }

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleAuth = async () => {
//       try {
//         const params = new URLSearchParams(window.location.search);
//         const provider = params.get("provider");

//         // ======================================================
//         // 🟦 FACEBOOK AUTH FLOW
//         // ======================================================
//         if (provider === "facebook") {
//           try {
//             const response = await fetch(
//               `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/auth/facebook/callback${window.location.search}`
//             );
//             const data = await response.json();

//             if (!data?.user) throw new Error("Facebook login failed");

//             console.log("✅ Facebook Authenticated user:", data.user);

//             const fbUser = {
//               id: data.user.id || `fb_${Date.now()}`,
//               email: data.user.email || "",
//               user_metadata: {
//                 name: data.user.name || "User",
//                 full_name: data.user.name || "User",
//                 avatar_url: data.user.avatar || "",
//                 person: "job_seeker",
//               },
//             };

//             // 🧩 Save initial data
//             localStorage.setItem("user", JSON.stringify(fbUser));
//             localStorage.setItem("access_token", data.access_token || "");

//             // 🧩 Sync with backend
//             try {
//               console.log("📤 Syncing Facebook profile...");
//               await api.post("/v1/profile/sync", { user: fbUser });
//               console.log("✅ Facebook profile synced");
//             } catch (syncErr) {
//               console.error("⚠️ Profile sync failed:", syncErr);
//             }

//             // 🧩 Fetch ACCURATE profile data from backend
//             try {
//               console.log("📤 Fetching accurate profile data...");
//               const res = await api.post("/v1/profile/me", {}, {
//                 headers: { Authorization: `Bearer ${data.access_token}` }
//               });
              
//               const profile = res.data;
//               console.log("✅ Profile data fetched:", profile);

//               // ✅ Calculate trial days left
//               const trialDaysLeft = calculateTrialDaysLeft(profile.trial_ends_at);
//               const isPremium = profile.plan?.toLowerCase() === 'premium';

//               // ✅ Store ALL accurate data
//               localStorage.setItem("user_id", profile.user_id);
//               localStorage.setItem("email", profile.email);
//               localStorage.setItem("person", profile.person || "job_seeker");
              
//               // Credits data
//               localStorage.setItem("remaining_credits", String(profile.remaining_credits || 0));
//               localStorage.setItem("credits_total", String(profile.credits_total || 0));
//               localStorage.setItem("used_credits", String(profile.used_credits || 0));
              
//               // Plan data
//               localStorage.setItem("plan", profile.plan || "free_trial");
//               localStorage.setItem("plan_display", formatPlanName(profile.plan));
//               localStorage.setItem("trial_ends_at", profile.trial_ends_at || "");
//               localStorage.setItem("trial_days_left", String(trialDaysLeft));
              
//               // ✅ Comprehensive plan object
//               const planObj = {
//                 tier: formatPlanName(profile.plan),
//                 tierRaw: profile.plan || "free_trial",
//                 creditsTotal: profile.credits_total || 0,
//                 creditsRemaining: profile.remaining_credits || 0,
//                 creditsUsed: profile.used_credits || 0,
//                 isPremium: isPremium,
//                 isFreeTrial: profile.plan?.toLowerCase() === 'free_trial',
//                 trialEndsAt: profile.trial_ends_at,
//                 trialDaysLeft: trialDaysLeft,
//                 hasUnlimitedCredits: isPremium,
//               };
              
//               localStorage.setItem("planObj", JSON.stringify(planObj));
              
//               console.log("💾 Stored profile data:", {
//                 plan: profile.plan,
//                 credits: profile.remaining_credits,
//                 trialDaysLeft,
//                 person: profile.person
//               });

//               // ✅ Check onboarding status and determine destination
//               const hasCompletedOnboarding = localStorage.getItem("onboarding_completed") === "true";
//               const isNewUser = profile.is_new_user || false;
              
//               const destination = getNavigationDestination(
//                 profile.person || "job_seeker",
//                 isNewUser,
//                 hasCompletedOnboarding
//               );

//               toast.success(`Welcome ${isNewUser ? '' : 'back'}, ${fbUser.user_metadata.name}!`);
//               navigate(destination);
//             } catch (profileErr) {
//               console.error("❌ Failed to fetch profile:", profileErr);
//               // Set safe defaults
//               setDefaultProfile(fbUser.user_metadata.name);
//               navigate("/onboarding"); // New users default to onboarding
//             }

//             return;
//           } catch (fbErr: any) {
//             console.error("❌ Facebook callback error:", fbErr);
//             toast.error("Facebook sign-in failed. Please try again.");
//             navigate("/login");
//             return;
//           }
//         }

//         // ======================================================
//         // 🟥 GOOGLE AUTH FLOW (Supabase)
//         // ======================================================
//         console.log("🔍 Processing Google authentication...");
        
//         const { data, error } = await supabase.auth.getSession();
//         let session = data?.session;

//         if (!session) {
//           console.log("🔄 No session found, checking URL...");
//           const { data: redirectData, error: redirectError } =
//             await supabase.auth.getSessionFromUrl({ storeSession: true });
//           if (redirectError) throw redirectError;
//           session = redirectData.session;
//         }

//         if (!session) {
//           console.error("❌ No valid session found");
//           toast.error("No valid session found after Google sign-in");
//           navigate("/login");
//           return;
//         }

//         const { user } = session;
//         console.log("✅ Google Authenticated user:", {
//           id: user.id,
//           email: user.email,
//           metadata: user.user_metadata
//         });

//         const normalizedUser = {
//           ...user,
//           user_metadata: {
//             ...user.user_metadata,
//             name:
//               user.user_metadata?.name ||
//               user.user_metadata?.full_name ||
//               user.user_metadata?.given_name ||
//               user.email?.split("@")[0] ||
//               "User",
//             full_name:
//               user.user_metadata?.full_name ||
//               user.user_metadata?.name ||
//               user.email?.split("@")[0] ||
//               "User",
//             avatar_url:
//               user.user_metadata?.avatar_url ||
//               user.user_metadata?.picture ||
//               "",
//             person: user.user_metadata?.person || "job_seeker",
//           },
//         };

//         // 🧩 Save initial session data
//         localStorage.setItem("user", JSON.stringify(normalizedUser));
//         localStorage.setItem("access_token", session.access_token);
//         localStorage.setItem("refresh_token", session.refresh_token);

//         // 🧩 Sync with backend
//         try {
//           console.log("📤 Syncing Google profile with backend...");
//           await api.post("/v1/profile/sync", { user: normalizedUser });
//           console.log("✅ Profile sync successful");
//         } catch (syncErr: any) {
//           console.error("❌ Profile sync error:", syncErr);
//           console.error("Response:", syncErr.response?.data);
//           // Continue anyway - profile might already exist
//         }

//         // ⏳ Small delay to ensure DB is updated
//         await new Promise(resolve => setTimeout(resolve, 500));

//         // 🧩 Fetch ACCURATE profile data from Supabase via backend
//         try {
//           console.log("📤 Fetching accurate profile data from backend...");
          
//           const res = await api.post("/v1/profile/me", {}, {
//             headers: {
//               Authorization: `Bearer ${session.access_token}`
//             }
//           });
          
//           const profile = res.data;
//           console.log("✅ Backend profile loaded:", profile);

//           // ✅ Validate profile data
//           if (!profile.user_id) {
//             throw new Error("Invalid profile response - missing user_id");
//           }

//           // ✅ Calculate trial days left
//           const trialDaysLeft = calculateTrialDaysLeft(profile.trial_ends_at);
//           const isPremium = profile.plan?.toLowerCase() === 'premium';
//           const isFreeTrial = profile.plan?.toLowerCase() === 'free_trial';

//           console.log("📊 Profile calculations:", {
//             plan: profile.plan,
//             trialEndsAt: profile.trial_ends_at,
//             trialDaysLeft,
//             isPremium,
//             isFreeTrial,
//             credits: profile.remaining_credits
//           });

//           // ✅ Store ALL accurate data in localStorage
//           localStorage.setItem("user_id", profile.user_id);
//           localStorage.setItem("email", profile.email);
//           localStorage.setItem("person", profile.person || "job_seeker");
          
//           // Credits data
//           localStorage.setItem("remaining_credits", String(profile.remaining_credits || 0));
//           localStorage.setItem("credits_total", String(profile.credits_total || 0));
//           localStorage.setItem("used_credits", String(profile.used_credits || 0));
          
//           // Plan data
//           localStorage.setItem("plan", profile.plan || "free_trial");
//           localStorage.setItem("plan_display", formatPlanName(profile.plan));
//           localStorage.setItem("trial_ends_at", profile.trial_ends_at || "");
//           localStorage.setItem("trial_days_left", String(trialDaysLeft));
          
//           // ✅ Comprehensive plan object for easy access
//           const planObj = {
//             tier: formatPlanName(profile.plan),
//             tierRaw: profile.plan || "free_trial",
//             creditsTotal: profile.credits_total || 0,
//             creditsRemaining: profile.remaining_credits || 0,
//             creditsUsed: profile.used_credits || 0,
//             isPremium: isPremium,
//             isFreeTrial: isFreeTrial,
//             trialEndsAt: profile.trial_ends_at,
//             trialDaysLeft: trialDaysLeft,
//             hasUnlimitedCredits: isPremium,
//             showTrialWarning: isFreeTrial && trialDaysLeft <= 3,
//           };
          
//           localStorage.setItem("planObj", JSON.stringify(planObj));

//           console.log("💾 Successfully stored all profile data:", {
//             plan: profile.plan,
//             credits: profile.remaining_credits,
//             trialDaysLeft,
//             person: profile.person
//           });

//           // ✅ Check if user has completed onboarding
//           const hasCompletedOnboarding = localStorage.getItem("onboarding_completed") === "true";
//           const isNewUser = profile.is_new_user || false; // Backend should return this flag
          
//           // ✅ Show appropriate welcome message
//           const userName = normalizedUser.user_metadata.name;
//           if (isFreeTrial && trialDaysLeft > 0) {
//             toast.success(
//               `Welcome ${isNewUser ? '' : 'back'}, ${userName}! ${trialDaysLeft} trial days remaining.`,
//               { duration: 4000 }
//             );
//           } else if (isFreeTrial && trialDaysLeft === 0) {
//             toast.warning(
//               `Welcome, ${userName}! Your trial has ended. Upgrade to continue.`,
//               { duration: 5000 }
//             );
//           } else {
//             toast.success(`Welcome ${isNewUser ? '' : 'back'}, ${userName}!`);
//           }

//           // ✅ Navigate based on user type and onboarding status
//           const person = profile.person || normalizedUser.user_metadata.person;
          
//           const destination = getNavigationDestination(
//             person,
//             isNewUser,
//             hasCompletedOnboarding
//           );
          
//           console.log(`🧭 Navigating to ${destination} as ${person} (new: ${isNewUser}, onboarding: ${hasCompletedOnboarding})`);
//           navigate(destination);

//         } catch (profileErr: any) {
//           console.error("❌ Failed to fetch profile from backend:", profileErr);
//           console.error("Error details:", {
//             message: profileErr.message,
//             response: profileErr.response?.data,
//             status: profileErr.response?.status
//           });
          
//           // ⚠️ Fallback: Set safe defaults and continue
//           console.warn("⚠️ Using fallback defaults");
//           setDefaultProfile(normalizedUser.user_metadata.name);
          
//           toast.warning(`Welcome, ${normalizedUser.user_metadata.name}! Loading default settings.`);
//           navigate("/onboarding"); // Default to onboarding for safety
//         }

//       } catch (err: any) {
//         console.error("❌ Auth callback critical error:", err);
//         console.error("Error details:", {
//           message: err.message,
//           response: err.response?.data,
//           status: err.response?.status,
//           stack: err.stack
//         });
        
//         toast.error("Sign-in failed. Please try again.");
//         navigate("/login");
//       }
//     };

//     handleAuth();
//   }, [navigate]);

//   // =========================================================
//   // HELPER: Set Default Profile (Fallback)
//   // =========================================================
//   function setDefaultProfile(userName: string = "User") {
//     console.log("⚙️ Setting default profile values");
    
//     const now = new Date();
//     const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
//     localStorage.setItem("person", "job_seeker");
//     localStorage.setItem("remaining_credits", "100");
//     localStorage.setItem("credits_total", "100");
//     localStorage.setItem("used_credits", "0");
//     localStorage.setItem("plan", "free_trial");
//     localStorage.setItem("plan_display", "Free Trial");
//     localStorage.setItem("trial_ends_at", trialEnd.toISOString());
//     localStorage.setItem("trial_days_left", "7");
    
//     const defaultPlanObj = {
//       tier: "Free Trial",
//       tierRaw: "free_trial",
//       creditsTotal: 100,
//       creditsRemaining: 100,
//       creditsUsed: 0,
//       isPremium: false,
//       isFreeTrial: true,
//       trialEndsAt: trialEnd.toISOString(),
//       trialDaysLeft: 7,
//       hasUnlimitedCredits: false,
//       showTrialWarning: false,
//     };
    
//     localStorage.setItem("planObj", JSON.stringify(defaultPlanObj));
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="text-center p-8 bg-white rounded-lg shadow-lg">
//         {/* Loading Spinner */}
//         <div className="relative mb-6">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
//           </div>
//         </div>

//         <h2 className="text-xl font-semibold text-gray-800 mb-2">
//           Connecting Your Account
//         </h2>
//         <p className="text-gray-500 text-sm">
//           Please wait while we set up your profile...
//         </p>

//         {/* Progress Dots */}
//         <div className="flex justify-center gap-2 mt-6">
//           <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//           <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//           <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//         </div>
//       </div>
//     </div>
//   );
// }
