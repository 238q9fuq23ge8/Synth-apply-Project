import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import StepsSidebar from "@/components/onboarding/StepsSidebar";
import UploadCVStep from "@/components/onboarding/UploadCVStep";
import JobSearchStep from "@/components/onboarding/JobSearchStep";
import AutoApplyStep from "@/components/onboarding/AutoApplyStep";
import MyApplicationsStep from "@/components/onboarding/MyApplicationsStep";
import { supabase } from "@/lib/supabaseClient";
import api from "@/lib/api";
import { toast } from "sonner";

type StepKey = "upload" | "search" | "auto" | "applications";

const steps: { key: StepKey; title: string; subtitle?: string; description: string }[] = [
  {
    key: "upload",
    title: "Upload Your CV",
    subtitle: "Upload & parse",
    description: "Upload your resume and let our AI extract your profile details for better matching.",
  },
  {
    key: "search",
    title: "Job Search",
    subtitle: "Find roles",
    description: "Search jobs worldwide and discover roles tailored to your skills and preferences.",
  },
  {
    key: "auto",
    title: "Auto Apply",
    subtitle: "1-click automation",
    description: "Use automation to submit applications quickly and efficiently while you focus on prep.",
  },
  {
    key: "applications",
    title: "My Applications",
    subtitle: "Track progress",
    description: "Review the applications you've submitted and monitor their status over time.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<StepKey, HTMLElement | null>>({
    upload: null,
    search: null,
    auto: null,
    applications: null,
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<StepKey>>(new Set());
  const [confetti, setConfetti] = useState(false);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: window.innerWidth, h: window.innerHeight });
  const [isCompleting, setIsCompleting] = useState(false);

  // ✅ Onboarding has been removed - redirect to dashboard immediately
  useEffect(() => {
    console.log("✅ Onboarding has been removed, redirecting to dashboard");
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  // Scroll to a step
  const scrollTo = (idx: number) => {
    const key = steps[idx].key;
    const el = sectionRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // When a step completes, mark as done and go next
  const handleCompleted = (key: StepKey) => {
    setCompleted((prev) => new Set([...prev, key]));
    const nextIdx = Math.min(steps.findIndex((s) => s.key === key) + 1, steps.length - 1);
    setActiveIdx((prev) => Math.max(prev, nextIdx));
    requestAnimationFrame(() => scrollTo(nextIdx));
  };

  // ✅ Complete onboarding handler with proper database update
  const handleCompleteOnboarding = async () => {
    if (isCompleting) return; // Prevent double-clicks
    
    setIsCompleting(true);
    
    try {
      const userId = localStorage.getItem("user_id");
      const accessToken = localStorage.getItem("access_token");
      
      if (!userId || !accessToken) {
        toast.error("Authentication error. Please log in again.");
        navigate("/login", { replace: true });
        return;
      }

      console.log("🎯 Completing onboarding for user:", userId);

      // ✅ Update via Supabase directly (using user_id as the key)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("❌ Supabase update error:", updateError);
        throw updateError;
      }

      console.log("✅ Onboarding marked as completed in database");

      // ✅ Also try to update via backend API as backup
      try {
        await api.post("/v1/profile/complete-onboarding", {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log("✅ Backend onboarding completion confirmed");
      } catch (backendErr) {
        console.warn("⚠️ Backend update failed (but Supabase succeeded):", backendErr);
        // Continue anyway since Supabase update succeeded
      }

      // ✅ Update localStorage
      localStorage.setItem("onboarding_completed", "true");
      const email = localStorage.getItem("email");
      if (email) {
        localStorage.setItem(`${email}_onboarding_completed`, "true");
      }
      
      // Remove temporary flags
      localStorage.removeItem("onboarding_in_progress");
      
      // Show success message and confetti
      toast.success("🎉 Onboarding completed! Welcome to ScopeAI!");
      setConfetti(true);
      
      // Navigate to dashboard after celebration
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 3000);

    } catch (error) {
      console.error("❌ Failed to complete onboarding:", error);
      toast.error("Failed to complete onboarding. Redirecting anyway...");
      
      // Still set localStorage and navigate even if update fails
      localStorage.setItem("onboarding_completed", "true");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    } finally {
      setIsCompleting(false);
    }
  };

  // ✅ Allow "Mark as Done" for each step
  const handleMarkAsDone = (key: StepKey) => {
    console.log(`✅ Marking step "${key}" as done`);
    handleCompleted(key);
    toast.success(`Step "${steps.find(s => s.key === key)?.title}" marked as complete!`);
  };

  // IntersectionObserver to sync active step on scroll
  useEffect(() => {
    let ticking = false;
    const sections = steps
      .map((s) => ({ key: s.key, el: sectionRefs.current[s.key] }))
      .filter((x) => x.el) as { key: StepKey; el: HTMLElement }[];

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const viewportCenter = window.innerHeight / 2;
        let bestIdx = 0;
        let bestDist = Infinity;
        sections.forEach((s, idx) => {
          const rect = s.el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const dist = Math.abs(center - viewportCenter);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = steps.findIndex((x) => x.key === s.key);
          }
        });
        setActiveIdx(bestIdx);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [completed]);

  // Track viewport for confetti sizing
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize, { passive: true } as any);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const stepStatuses = useMemo(() => {
    return steps.map((s, idx) => ({
      key: s.key,
      active: idx === activeIdx,
      completed: completed.has(s.key),
      title: s.title,
      subtitle: s.subtitle,
    }));
  }, [activeIdx, completed]);

  // Only render sections that are completed or current
  const maxCompletedIdx = steps.reduce((acc, s, i) => (completed.has(s.key) ? i : acc), -1);
  const maxReachableIdx = Math.max(activeIdx, maxCompletedIdx + 1);

  return (
    <div className="min-h-screen bg-gradient-hero grid md:grid-cols-[320px,1fr] relative">
      {confetti && (
        <Confetti
          width={viewport.w}
          height={viewport.h}
          numberOfPieces={320}
          recycle={false}
          gravity={0.35}
          onConfettiComplete={(inst) => {
            try { (inst as any)?.reset?.(); } catch {}
            setConfetti(false);
          }}
        />
      )}
      
      {/* Left column sidebar (full height) */}
      <aside className="hidden md:block h-screen sticky top-0 overflow-auto p-4">
        <StepsSidebar
          steps={stepStatuses}
          onStepClick={(idx) => {
            if (idx <= maxReachableIdx) scrollTo(idx);
          }}
        />
      </aside>

      <main className="w-full">
        <div ref={containerRef}>
          {steps.map((s, idx) => {
            const canShow = idx <= maxReachableIdx || completed.has(s.key);
            if (!canShow) return null;
            const isCompleted = completed.has(s.key);
            
            const common = {
              className:
                "min-h-screen w-full flex flex-col items-center justify-start md:justify-center px-6 md:px-10",
              "data-step": s.key,
              ref: (el: HTMLElement | null) => ((sectionRefs.current as any)[s.key] = el),
            } as any;
            
            return (
              <section key={s.key} {...common}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border p-5 md:p-8"
                >
                  <header className="mb-5 flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-1">{s.title}</h2>
                      <p className="text-sm md:text-base text-gray-600">{s.description}</p>
                    </div>
                    
                    {/* ✅ Mark as Done button for each step */}
                    {!isCompleted && s.key !== "applications" && (
                      <button
                        onClick={() => handleMarkAsDone(s.key)}
                        className="ml-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Skip / Mark as Done ✓
                      </button>
                    )}
                  </header>
                  
                  {s.key === "upload" && (
                    <UploadCVStep onComplete={() => handleCompleted("upload")} />
                  )}
                  {s.key === "search" && (
                    <JobSearchStep onComplete={() => handleCompleted("search")} />
                  )}
                  {s.key === "auto" && (
                    <AutoApplyStep onComplete={() => handleCompleted("auto")} />
                  )}
                  {s.key === "applications" && (
                    <div className="space-y-6">
                      <MyApplicationsStep />
                      <div className="flex justify-end gap-3">
                        {/* ✅ Skip to Dashboard button */}
                        <button
                          className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                          onClick={handleCompleteOnboarding}
                          disabled={isCompleting}
                        >
                          Skip to Dashboard →
                        </button>
                        
                        {/* ✅ Complete Onboarding button */}
                        <button
                          className="btn-hero px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleCompleteOnboarding}
                          disabled={isCompleting}
                        >
                          {isCompleting ? "Completing..." : "Complete Onboarding 🚀"}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
// import { useEffect, useMemo, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import Confetti from "react-confetti";
// import StepsSidebar from "@/components/onboarding/StepsSidebar";
// import UploadCVStep from "@/components/onboarding/UploadCVStep";
// import JobSearchStep from "@/components/onboarding/JobSearchStep";
// import AutoApplyStep from "@/components/onboarding/AutoApplyStep";
// import MyApplicationsStep from "@/components/onboarding/MyApplicationsStep";
// import { supabase } from "@/lib/supabaseClient";

// type StepKey = "upload" | "search" | "auto" | "applications";

// const steps: { key: StepKey; title: string; subtitle?: string; description: string }[] = [
//   {
//     key: "upload",
//     title: "Upload Your CV",
//     subtitle: "Upload & parse",
//     description: "Upload your resume and let our AI extract your profile details for better matching.",
//   },
//   {
//     key: "search",
//     title: "Job Search",
//     subtitle: "Find roles",
//     description: "Search jobs worldwide and discover roles tailored to your skills and preferences.",
//   },
//   {
//     key: "auto",
//     title: "Auto Apply",
//     subtitle: "1-click automation",
//     description: "Use automation to submit applications quickly and efficiently while you focus on prep.",
//   },
//   {
//     key: "applications",
//     title: "My Applications",
//     subtitle: "Track progress",
//     description: "Review the applications you've submitted and monitor their status over time.",
//   },
// ];

// export default function Onboarding() {
//   const navigate = useNavigate();
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const sectionRefs = useRef<Record<StepKey, HTMLElement | null>>({
//     upload: null,
//     search: null,
//     auto: null,
//     applications: null,
//   });

//   const [activeIdx, setActiveIdx] = useState(0);
//   const [completed, setCompleted] = useState<Set<StepKey>>(new Set());
//   const [confetti, setConfetti] = useState(false);
//   const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: window.innerWidth, h: window.innerHeight });

//   // ✅ Check if user should be here
//   useEffect(() => {
//     const checkOnboardingStatus = async () => {
//       const token = localStorage.getItem("access_token");
      
//       if (!token) {
//         navigate("/login", { replace: true });
//         return;
//       }

//       try {
//         // Get user from Supabase
//         const { data: { user } } = await supabase.auth.getUser();
        
//         if (!user) {
//           navigate("/login", { replace: true });
//           return;
//         }

//         // Check if onboarding is completed in Supabase profiles table
//         const { data: profile, error } = await supabase
//           .from("profiles")
//           .select("onboarding_completed")
//           .eq("id", user.id)
//           .single();

//         if (error) {
//           console.error("Error checking onboarding status:", error);
//           return;
//         }

//         // If onboarding already completed, redirect to dashboard
//         if (profile?.onboarding_completed === true) {
//           console.log("✅ Onboarding already completed, redirecting to dashboard");
//           navigate("/dashboard", { replace: true });
//           return;
//         }

//         console.log("🎯 User needs to complete onboarding");
//       } catch (error) {
//         console.error("Error in onboarding check:", error);
//       }
//     };

//     checkOnboardingStatus();
//   }, [navigate]);

//   // Scroll to a step
//   const scrollTo = (idx: number) => {
//     const key = steps[idx].key;
//     const el = sectionRefs.current[key];
//     if (el) {
//       el.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   // When a step completes, mark as done and go next
//   const handleCompleted = (key: StepKey) => {
//     setCompleted((prev) => new Set([...prev, key]));
//     const nextIdx = Math.min(steps.findIndex((s) => s.key === key) + 1, steps.length - 1);
//     setActiveIdx((prev) => Math.max(prev, nextIdx));
//     requestAnimationFrame(() => scrollTo(nextIdx));
//   };

//   // ✅ Complete onboarding handler with Supabase update
//   const handleCompleteOnboarding = async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
      
//       if (!user) {
//         console.error("No user found");
//         return;
//       }

//       // Update Supabase profiles table
//       const { error: updateError } = await supabase
//         .from("profiles")
//         .update({ 
//           onboarding_completed: true,
//           updated_at: new Date().toISOString()
//         })
//         .eq("id", user.id);

//       if (updateError) {
//         console.error("Error updating onboarding status:", updateError);
//         throw updateError;
//       }

//       console.log("✅ Onboarding marked as completed in database for user:", user.id);

//       // Also set localStorage flags for quick client-side checks
//       const email = user.email || localStorage.getItem("user_email");
//       if (email) {
//         localStorage.setItem(`${email}_onboarding_completed`, "true");
//       }
//       localStorage.setItem("onboarding_completed", "true");
      
//       // Remove temporary flags
//       localStorage.removeItem("onboarding_in_progress");
      
//       // Show confetti
//       setConfetti(true);
      
//       // Navigate to dashboard after celebration
//       setTimeout(() => {
//         navigate("/dashboard", { replace: true });
//       }, 3000);

//     } catch (error) {
//       console.error("Failed to complete onboarding:", error);
//       // Still navigate even if update fails
//       setTimeout(() => {
//         navigate("/dashboard", { replace: true });
//       }, 1000);
//     }
//   };

//   // IntersectionObserver to sync active step on scroll
//   useEffect(() => {
//     let ticking = false;
//     const sections = steps
//       .map((s) => ({ key: s.key, el: sectionRefs.current[s.key] }))
//       .filter((x) => x.el) as { key: StepKey; el: HTMLElement }[];

//     const onScroll = () => {
//       if (ticking) return;
//       ticking = true;
//       requestAnimationFrame(() => {
//         const viewportCenter = window.innerHeight / 2;
//         let bestIdx = 0;
//         let bestDist = Infinity;
//         sections.forEach((s, idx) => {
//           const rect = s.el.getBoundingClientRect();
//           const center = rect.top + rect.height / 2;
//           const dist = Math.abs(center - viewportCenter);
//           if (dist < bestDist) {
//             bestDist = dist;
//             bestIdx = steps.findIndex((x) => x.key === s.key);
//           }
//         });
//         setActiveIdx(bestIdx);
//         ticking = false;
//       });
//     };

//     window.addEventListener("scroll", onScroll, { passive: true });
//     onScroll();
//     return () => window.removeEventListener("scroll", onScroll);
//   }, [completed]);

//   // Track viewport for confetti sizing
//   useEffect(() => {
//     const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
//     window.addEventListener("resize", onResize, { passive: true } as any);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const stepStatuses = useMemo(() => {
//     return steps.map((s, idx) => ({
//       key: s.key,
//       active: idx === activeIdx,
//       completed: completed.has(s.key),
//       title: s.title,
//       subtitle: s.subtitle,
//     }));
//   }, [activeIdx, completed]);

//   // Only render sections that are completed or current
//   const maxCompletedIdx = steps.reduce((acc, s, i) => (completed.has(s.key) ? i : acc), -1);
//   const maxReachableIdx = Math.max(activeIdx, maxCompletedIdx + 1);

//   return (
//     <div className="min-h-screen bg-gradient-hero grid md:grid-cols-[320px,1fr] relative">
//       {confetti && (
//         <Confetti
//           width={viewport.w}
//           height={viewport.h}
//           numberOfPieces={320}
//           recycle={false}
//           gravity={0.35}
//           onConfettiComplete={(inst) => {
//             try { (inst as any)?.reset?.(); } catch {}
//             setConfetti(false);
//           }}
//         />
//       )}
      
//       {/* Left column sidebar (full height) */}
//       <aside className="hidden md:block h-screen sticky top-0 overflow-auto p-4">
//         <StepsSidebar
//           steps={stepStatuses}
//           onStepClick={(idx) => {
//             if (idx <= maxReachableIdx) scrollTo(idx);
//           }}
//         />
//       </aside>

//       <main className="w-full">
//         <div ref={containerRef}>
//           {steps.map((s, idx) => {
//             const canShow = idx <= maxReachableIdx || completed.has(s.key);
//             if (!canShow) return null;
//             const common = {
//               className:
//                 "min-h-screen w-full flex flex-col items-center justify-start md:justify-center px-6 md:px-10",
//               "data-step": s.key,
//               ref: (el: HTMLElement | null) => ((sectionRefs.current as any)[s.key] = el),
//             } as any;
//             return (
//               <section key={s.key} {...common}>
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.4 }}
//                   className="w-full max-w-5xl bg-white rounded-2xl shadow-lg border p-5 md:p-8"
//                 >
//                   <header className="mb-5">
//                     <h2 className="text-2xl md:text-3xl font-bold mb-1">{s.title}</h2>
//                     <p className="text-sm md:text-base text-gray-600">{s.description}</p>
//                   </header>
//                   {s.key === "upload" && (
//                     <UploadCVStep onComplete={() => handleCompleted("upload")} />
//                   )}
//                   {s.key === "search" && (
//                     <JobSearchStep onComplete={() => handleCompleted("search")} />
//                   )}
//                   {s.key === "auto" && (
//                     <AutoApplyStep onComplete={() => handleCompleted("auto")} />
//                   )}
//                   {s.key === "applications" && (
//                     <div className="space-y-6">
//                       <MyApplicationsStep />
//                       <div className="flex justify-end">
//                         <button
//                           className="btn-hero px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
//                           onClick={handleCompleteOnboarding}
//                         >
//                           Complete Onboarding → Dashboard 🚀
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </motion.div>
//               </section>
//             );
//           })}
//         </div>
//       </main>
//     </div>
//   );
// }
