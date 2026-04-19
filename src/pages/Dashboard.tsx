import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";
import CardTotalIcon from "@/assets/img-homepage/card-total-icon.png";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// At the top of Dashboard.tsx, with other imports
// import EventSourcePolyfill from "event-source-polyfill";
import { EventSourcePolyfill } from 'event-source-polyfill';
import { useAutomationStore } from '@/store/automationStore';
import { AutomationStatusBanner } from '@/components/AutomationStatusBanner';
import { useAutomation } from '@/contexts/AutomationContext';

import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  Crown, 
  FileText, 
  Filter, 
  ChevronRight, 
  LayoutDashboard, 
  Search, 
  Send, 
  LogOut,
  ClipboardList,
  Hourglass,
  CheckSquare,
  Trophy,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "@/App.css";
import "@/index.css";

/* ===========================================================
   Types & Interfaces
=========================================================== */
type Plan = {
  tier: string;
  creditsTotal: number;
  creditsUsed: number;
  dailyCap: number;
  usedToday: number;
  renewsAt?: string;
  hasAccess: boolean;
  daysLeft?: number;
};

import api, {
  fetchCreditBalance,
  fetchCreditHistory,
  CreditBalance,
  CreditHistory,
} from "@/lib/api";
import AutomateModal from "./AutomateModal";
import { setSupabaseSession, supabase } from "@/lib/supabaseClient";
// import { supabase } from "./usecredits";


type RecentApp = {
  id: string;
  company: string;
  position: string;
  status: string;
  time: string;
  location?: string;
  job_url?: string;
  applied_at: string;
};

type Ticker = {
  id: string | number;
  msg: string;
  ago: string;
  ok: boolean;
  timestamp?: string;
};

type ActivityLog = {
  id: string | number;
  text: string;
  ago: string;
  type: string;
  timestamp?: string;
};

type DashboardStats = {
  cv_count: number;
  jobs_found: number;
  applications_today: number;
  applications_pending: number;
  total_applications: number;
  success_rate: number;
  credits_used_today: number;
};

const defaultPlan: Plan = {
  tier: "Free Trial",
  creditsTotal: 100,
  creditsUsed: 0,
  dailyCap: 100,
  usedToday: 0,
  renewsAt: undefined,
  hasAccess: true,
};
// ✅ ADD THESE LINES

/* ===========================================================
   Utility Functions
=========================================================== */
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ===========================================================
   Progress Ring Component
=========================================================== */
function ProgressRing({
  size = 88,
  stroke = 8,
  value = 0,
}: {
  size?: number;
  stroke?: number;
  value: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size}>
      <circle
        stroke="#E5E7EB"
        fill="transparent"
        strokeWidth={stroke}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="url(#grad)"
        fill="transparent"
        strokeLinecap="round"
        strokeWidth={stroke}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ===========================================================
   Modal Component
=========================================================== */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-hidden"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-5 py-3 sm:py-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
              <button
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto px-4 sm:px-5 py-3 sm:py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}





/* ===========================================================
   Main Dashboard Component
=========================================================== */
const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [dropdownOpen, setDropdownOpen] = useState(false);


  // Credit balance state
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditHistory | null>(null);
  const [creditBalanceLoading, setCreditBalanceLoading] = useState(false);
  const [creditHistoryOpen, setCreditHistoryOpen] = useState(false);
  const [creditHistoryLoading, setCreditHistoryLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPaidPlan, setIsPaidPlan] = useState(false);

  // Credit balance state
  // Real-time data state
  // Add these new state variables:
  const [activeAutomation, setActiveAutomation] = useState<any>(null);
  const [checkingAutomation, setCheckingAutomation] = useState(false);
  const mountedRef = useRef(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const [plan, setPlan] = useState<Plan>(() => readJSON<Plan>("plan", defaultPlan));
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [liveTicker, setLiveTicker] = useState<Ticker[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    cv_count: 0,
    jobs_found: 0,
    applications_today: 0,
    applications_pending: 0,
    total_applications: 0,
    success_rate: 0,
    credits_used_today: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const cvId = localStorage.getItem("current_cv_id");
  const token = localStorage.getItem("access_token");
  // Add to Dashboard.tsx imports

  // Inside Dashboard component, add this hook
  // Inside Dashboard component, add this hook
  const { status: automationStatus, fetchStatus: fetchAutomationStatus } = useAutomation();

  // ✅ ADD: Check automation status on mount
  useEffect(() => {
    const checkAutomationStatus = async () => {
      await fetchAutomationStatus();
    };

    checkAutomationStatus();
  }, [fetchAutomationStatus]);
  /* ===========================================================
   Token Verification & Auth
=========================================================== */
  const verifyToken = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn("⚠️ No access token found");
      handleLogout();
      return false;
    }

    try {
      // ✅ Use Supabase to verify token
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.error("❌ Token verification failed:", error?.message);
        handleLogout();
        return false;
      }

      console.log("✅ Token verified for user:", user.id);
      return true;

    } catch (error: any) {
      console.error("❌ Token verification failed:", error);

      // Don't logout on network errors
      if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        console.warn("⚠️ Network error during token verification, keeping session");
        return true;
      }

      handleLogout();
      return false;
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };
  const API_REQUEST_COOLDOWN = 10000; // 10 seconds between requests
  const lastRequestTime = useRef<Record<string, number>>({});
  /* ===========================================================
     Real-time Data Fetching Functions
  =========================================================== */
  // Add this caching system:
  const dashboardCache = {
    data: { applications: null, stats: null, credits: null, activity: null },
    timestamps: { applications: 0, stats: 0, credits: 0, activity: 0 },
    ttl: 30000
  };

  function getCachedData(key: string) {
    const now = Date.now();
    const lastUpdate = dashboardCache.timestamps[key as keyof typeof dashboardCache.timestamps];
    if (now - lastUpdate < dashboardCache.ttl) {
      return dashboardCache.data[key as keyof typeof dashboardCache.data];
    }
    return null;
  }

  function setCachedData(key: string, data: any) {
    dashboardCache.data[key as keyof typeof dashboardCache.data] = data;
    dashboardCache.timestamps[key as keyof typeof dashboardCache.timestamps] = Date.now();
  }

  function clearCache() {
    dashboardCache.data = { applications: null, stats: null, credits: null, activity: null };
    dashboardCache.timestamps = { applications: 0, stats: 0, credits: 0, activity: 0 };
  }
  // ✅ ADD THIS FUNCTION


  const checkAutomationStatus = useCallback(async () => {
    if (checkingAutomation || !mountedRef.current) return;

    setCheckingAutomation(true);

    try {
      // 🔥 1) Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
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

      if (mountedRef.current) {
        setActiveAutomation(response.data?.has_active ? response.data : null);
      }

    } catch (error: any) {
      console.error("Failed to check automation status:", error);

      if (error?.response?.status === 404) {
        console.log("Automation status endpoint not found, clearing local status");
      }

      if (mountedRef.current) {
        setActiveAutomation(null);
      }

    } finally {
      if (mountedRef.current) {
        setCheckingAutomation(false);
      }
    }
  }, [checkingAutomation]);



  // ✅ FIXED: fetchLiveTicker function  
  const fetchLiveTicker = useCallback(async () => {
    try {
      console.log("🔄 Fetching live ticker...");

      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);

      const response = await api.get(`/v1/applied-jobs/all`);
      const jobs = response.data?.jobs || [];

      console.log("📊 Ticker jobs:", jobs.length);

      const recentJobs = jobs.slice(0, 5);

      const updates: Ticker[] = recentJobs.map((job: any) => {
        const status = job.status?.toLowerCase() || 'pending';
        const jobTitle = job.job_title || 'Position';
        const companyName = job.company_name || 'Company';

        return {
          id: job.id,
          msg: `Applied to ${companyName} — ${jobTitle}`,
          ago: getTimeAgo(job.applied_at || new Date().toISOString()),
          ok: ['applied', 'success', 'completed'].includes(status),
          timestamp: job.applied_at || new Date().toISOString(),
        };
      });

      console.log("✅ Live ticker updates:", updates.length, updates);

      setLiveTicker(updates);

    } catch (error) {
      console.error("❌ Failed to fetch live ticker:", error);
    }
  }, []);

  // ✅ FIXED: fetchRecentApplications function
  const fetchRecentApplications = useCallback(async () => {
    try {
      console.log("🔄 Fetching recent applications...");

      // Check cache first
      const cached = getCachedData('applications');
      if (cached) {
        console.log("📦 Using cached applications:", cached.length);
        setRecentApps(cached);
        return;
      }

      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);

      const response = await api.get(`/v1/applied-jobs/all`);
      console.log("📊 API response:", response.data);

      if (response.data?.jobs) {
        const apps = response.data.jobs.slice(0, 5).map((app: any) => ({
          id: app.id,
          company: app.company_name || "Unknown Company",
          position: app.job_title || "Position",
          status: app.status || "Applied",
          time: getTimeAgo(app.applied_at || new Date().toISOString()),
          job_url: app.job_link,
          applied_at: app.applied_at || new Date().toISOString(),
        }));

        console.log("✅ Processed applications:", apps.length, apps);

        setRecentApps(apps);
        setCachedData('applications', apps);
      } else {
        console.log("⚠️ No jobs found in response");
      }
    } catch (error) {
      console.error("❌ Failed to fetch recent applications:", error);
    }
  }, []);


  const fetchDashboardStats = useCallback(async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Parallel fetch for stats, status, and credits
      const [statsRes, statusRes, creditsRes] = await Promise.all([
        api.get(`/v1/dashboard/stats`, { params: { timezone } }),
        api.get("/v1/automation/status"),
        api.get("/v1/credits/balance", { params: { timezone } })
      ]);

      const stats = statsRes.data?.stats || statsRes.data;
      const status = statusRes.data;
      const credits = creditsRes.data;

      setDashboardStats({
        cv_count: stats.cv_count || 0,
        jobs_found: stats.jobs_found || 0,
        applications_today: stats.applications_today || 0,
        applications_pending: stats.applications_pending || 0,
        total_applications: stats.total_applications || 0,
        success_rate: stats.success_rate || 0,
        credits_used_today: stats.credits_used_today || 0,
      });

      setActiveAutomation(status?.has_active || status?.is_running ? status : null);
      setCreditBalance(credits);
      
      localStorage.setItem("remaining_credits", credits?.remaining?.toString() || "0");

      console.log("✅ Dashboard stats, status, and credits updated");

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  // Polling for automation status
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await api.get("/v1/automation/status");
        const status = res.data;
        const wasRunning = activeAutomation?.is_running || activeAutomation?.has_active;
        const isNowRunning = status?.has_active || status?.is_running;

        setActiveAutomation(isNowRunning ? status : null);

        // If it transitioned from running to stopped, refresh stats once
        if (wasRunning && !isNowRunning) {
          fetchDashboardStats();
        }
      } catch (err) {
        console.error("Polling status failed:", err);
      }
    };

    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [activeAutomation, fetchDashboardStats]);

  // ✅ FIXED: Remove cooldown for initial load and make it less aggressive
  useEffect(() => {
    const initialLoad = async () => {
      console.log("🚀 Dashboard initial load");

      // Direct calls without any cooldown on initial load
      await Promise.all([
        fetchRecentApplications(),
        fetchDashboardStats(),
        fetchActivityFeed(),
        fetchLiveTicker(),        // ✅ ADD THIS
        checkAutomationStatus()
      ]);
    };

    initialLoad();
  }, []); // Run once on mount

  // ✅ FIXED: Enhanced activity feed with better error handling
  const fetchActivityFeed = useCallback(async () => {
    try {
      console.log("🔄 Fetching activity feed...");

      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.log("⚠️ No user found");
        return;
      }

      const user = JSON.parse(userStr);

      // Get automation runs
      const historyResponse = await api.get(`/v1/automation-logs/history?page=1&page_size=10`);
      const runs = historyResponse.data?.runs || [];

      // Get recent applications  
      const jobsResponse = await api.get(`/v1/applied-jobs/all`);
      const jobs = jobsResponse.data?.jobs || [];

      console.log("📊 Activity data:", {
        runsCount: runs.length,
        jobsCount: jobs.length,
        runs: runs.slice(0, 2), // Debug first 2 runs
        jobs: jobs.slice(0, 2)  // Debug first 2 jobs
      });

      const activities: ActivityLog[] = [];

      // ✅ FIXED: Process automation runs with null safety
      runs.forEach((run: any, index: number) => {
        try {
          const totalApplied = run.total_applied || 0;
          const role = run.role || 'Multiple roles';
          const runId = run.id || `run_${index}`;

          console.log(`🔍 Processing run ${index}: ${JSON.stringify(run)}`);

          if (totalApplied > 0) {
            activities.push({
              id: `run_${runId}`,
              text: `Applied to ${totalApplied} jobs for ${role}`,
              ago: getTimeAgo(run.finished_at || run.started_at || new Date().toISOString()),
              type: 'automation',
              timestamp: run.finished_at || run.started_at || new Date().toISOString(),
            });
            console.log(`✅ Added automation activity: Applied to ${totalApplied} jobs`);
          } else if (run.status === 'running') {
            activities.push({
              id: `run_${runId}`,
              text: `Automation running for ${role}`,
              ago: getTimeAgo(run.started_at || new Date().toISOString()),
              type: 'automation',
              timestamp: run.started_at || new Date().toISOString(),
            });
            console.log(`✅ Added running automation activity`);
          } else {
            console.log(`⚠️ Skipped run ${index} - no applications and not running`);
          }
        } catch (runError) {
          console.error(`❌ Error processing run ${index}:`, runError);
        }
      });

      // ✅ FIXED: Process job applications with null safety
      jobs.slice(0, 10).forEach((job: any, index: number) => {
        try {
          const jobTitle = job.job_title || 'Position';
          const companyName = job.company_name || 'Company';
          const appliedAt = job.applied_at || new Date().toISOString();
          const jobId = job.id || `job_${index}`;

          console.log(`🔍 Processing job ${index}: ${jobTitle} at ${companyName}`);

          activities.push({
            id: `app_${jobId}`,
            text: `Applied to ${jobTitle} at ${companyName}`,
            ago: getTimeAgo(appliedAt),
            type: 'application',
            timestamp: appliedAt,
          });
          console.log(`✅ Added job application activity: ${jobTitle}`);
        } catch (jobError) {
          console.error(`❌ Error processing job ${index}:`, jobError);
        }
      });

      // ✅ Sort by timestamp (most recent first)
      activities.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0).getTime();
        const dateB = new Date(b.timestamp || 0).getTime();
        return dateB - dateA;
      });

      const finalActivities = activities.slice(0, 10);

      console.log("✅ Final activities processed:", finalActivities.length);
      console.log("🎯 Sample activities:", finalActivities.slice(0, 3));

      if (finalActivities.length === 0) {
        console.warn("⚠️ NO ACTIVITIES GENERATED despite having data!");
        console.warn("Runs:", runs.length, "Jobs:", jobs.length);
      }

      setActivityFeed(finalActivities);

    } catch (error) {
      console.error("❌ Failed to fetch activity feed:", error);
      // Set empty array on error so UI doesn't get stuck
      setActivityFeed([]);
    }
  }, []);

  // ✅ FIXED: More aggressive initial data loading
  // ✅ FIXED: Remove cooldown entirely for activity feed
  const refreshDashboardData = useCallback(async () => {
    if (!mountedRef.current || isRefreshing) return;

    setIsRefreshing(true);
    console.log("🔄 Dashboard refresh started");

    try {
      // ✅ ALWAYS bypass cooldown for these critical functions
      await Promise.all([
        fetchRecentApplications(),           // Direct call - no cooldown
        fetchDashboardStats(),              // Direct call - no cooldown
        fetchActivityFeed(),                // Direct call - no cooldown
        fetchLiveTicker(),                  // Direct call - no cooldown
        checkAutomationStatus(),            // Direct call - no cooldown
        // ✅ Also refresh credit data
        (async () => {
          try {
            const balance = await fetchCreditBalance();
            localStorage.setItem("remaining_credits", balance?.remaining?.toString() || "0");
            setCreditBalance(balance);
          } catch (error) {
            console.error("Failed to refresh credit balance:", error);
          }
        })(),
        (async () => {
          try {
            const history = await fetchCreditHistory();
            setCreditHistory(history);
            localStorage.setItem("credit_history", JSON.stringify(history));
          } catch (error) {
            console.error("Failed to refresh credit history:", error);
          }
        })()
      ]);

      if (mountedRef.current) {
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Dashboard refresh error:", error);
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing, fetchRecentApplications, fetchDashboardStats, fetchActivityFeed, fetchLiveTicker, checkAutomationStatus]);

  const CelebrationOverlay = () => (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center 
                   bg-black/40 backdrop-blur-sm"
          onClick={() => setShowCelebration(false)}
        >
          {/* MAIN CARD (CLEAN WHITE UI) */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", duration: 0.55, bounce: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md mx-6 w-full rounded-2xl p-8 
                     bg-white shadow-xl border border-gray-100 text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>

            {/* PURPLE GRADIENT TITLE */}
            <h2
              className="text-2xl font-bold mb-2 bg-gradient-to-r 
                       from-purple-600 to-purple-400 
                       bg-clip-text text-transparent"
            >
              Automation Complete!
            </h2>

            {/* Clean subtitle */}
            <p className="text-gray-600 mb-6">
              Your automated applications have been submitted.
              <br />
              View your dashboard for more details.
            </p>

            {/* Purple button */}
            <Button
              onClick={() => {
                setShowCelebration(false);
                navigate("/my-applications");
              }}
              className="px-6 py-3 rounded-xl text-white font-medium
                       bg-gradient-to-r from-purple-600 to-purple-500
                       hover:opacity-90 transition-all"
            >
              View Applications
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );


  /* ===========================================================
     Effects & Lifecycle
  =========================================================== */
  // In Dashboard.tsx
  useEffect(() => {
    const handleAutomationCompleted = () => {
      console.log("🔄 Automation completed - refreshing dashboard");
      refreshDashboardData();
    };

    window.addEventListener('automation-completed', handleAutomationCompleted);

    return () => {
      window.removeEventListener('automation-completed', handleAutomationCompleted);
    };
  }, [refreshDashboardData]);

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        localStorage.clear();
        navigate("/login", { replace: true });
        return;
      }

      const isValid = await verifyToken();
      if (!isValid) return;

      try {
        const user = JSON.parse(userStr);
        const userId = user?.id || localStorage.getItem("user_id");

        if (!userId) {
          console.error("❌ No user ID found");
          localStorage.clear();
          navigate("/login", { replace: true });
          return;
        }

        // ✅ Set Supabase session first
        await setSupabaseSession(token);

        // ✅ Check user type from database
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("person")
            .eq("user_id", userId)
            .single();

          if (error) {
            console.error("⚠️ Supabase query error:", error.message);
            throw error;
          }

          const person = profile?.person || localStorage.getItem("person") || "job_seeker";

          // ✅ Recruiters and job seekers can access dashboard (onboarding removed)
          if (person === "recruiter") {
            console.log("👔 Recruiter detected, allowing dashboard access");
          } else {
            console.log("👤 Job seeker detected, allowing dashboard access (onboarding removed)");
          }

        } catch (dbError: any) {
          console.error("⚠️ Database check failed:", dbError.message);

          // ✅ Fallback to localStorage
          const person = localStorage.getItem("person") || "job_seeker";

          if (person === "recruiter") {
            console.log("👔 Recruiter (fallback), allowing access");
          } else {
            console.log("👤 Job seeker (fallback), allowing access (onboarding removed)");
          }
        }

      } catch (error) {
        console.error("❌ Error in access check:", error);
        localStorage.clear();
        navigate("/login", { replace: true });
      }
    };

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      verifyToken();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(
          user?.user_metadata?.name ||
          user?.user_metadata?.full_name ||
          user?.user_metadata?.given_name ||
          user?.email?.split("@")[0] ||
          "User"
        );
      } catch (e) {
        console.error("Invalid user data in localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    const rawPerson = localStorage.getItem("person");
    const user = rawUser ? JSON.parse(rawUser) : {};
    const role = rawPerson || user?.user_metadata?.person || user?.user_metadata?.role || "job_seeker";

    if (role === "recruiter") {
      navigate("/recruiter");
    }
  }, [navigate]);


  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.warn("⚠️ No access token found");
          return;
        }

        const userStr = localStorage.getItem("user");
        if (!userStr) return;

        const user = JSON.parse(userStr);

        // ✅ Use the api instance which already has ngrok headers
        let data: any = null;
        try {
          const response = await api.get(`/v1/profile/${user.id}`);
          data = response.data;
        } catch (profileErr: any) {
          // 500 from backend — fall back to localStorage plan data silently
          const storedPlan = localStorage.getItem("plan");
          if (storedPlan) {
            setPlan(JSON.parse(storedPlan));
          }
          return;
        }

        console.log("✅ Profile data:", data);

        const daysLeft = data.days_left ?? 0;
        const isFreeTrial = (data.plan === "free_trial" || !data.plan);
        const isActiveSubscription = data.subscription_status === 'active';
        const isTrialActive = data.trial_active !== false; // Explicitly check if false

        // ✅ Strict Redirection Logic
        if (!isActiveSubscription && !isTrialActive) {
          console.warn("⚠️ Account inactive or trial ended - redirecting to /plans");
          navigate("/plans");
          return;
        }

        const isPaidPlanDetected = isActiveSubscription ||
          ['pro', 'premium', 'recruiter', 'paid'].includes(data.plan?.toLowerCase()) ||
          (data.total_credits_purchased && data.total_credits_purchased > 0);

        let planTier = "Free Trial";

        if (data.plan === "pro") {
          planTier = "Pro Plan";
        } else if (data.plan === "premium") {
          planTier = "Premium Plan";
        } else if (data.plan === "recruiter") {
          planTier = "Recruiter Plan";
        } else if (isPaidPlanDetected) {
          planTier = "Paid Plan";
        } else if (!isTrialActive || daysLeft <= 0) {
          planTier = "Plan Expired";
        } else if (isFreeTrial && daysLeft > 0) {
          planTier = `Free Trial (${daysLeft}d left)`;
        }

        const hasCredits = (data.remaining_credits || 0) > 0;
        // Determine daily cap based on plan
        let dailyCap = 100;
        if (data.plan === "pro") dailyCap = 700;
        else if (data.plan === "premium") dailyCap = 1400;
        else if (data.plan === "recruiter") dailyCap = 3000;
        else if (isPaidPlanDetected) dailyCap = 700;

        const updatedPlan = {
          tier: planTier,
          creditsTotal: data.remaining_credits || 0,
          creditsUsed: 0,
          dailyCap: data.daily_limit || dailyCap,
          usedToday: 0,
          renewsAt: data.trial_ends_at,
          hasAccess: hasCredits && (isActiveSubscription || isTrialActive),
          daysLeft: daysLeft
        };

        setPlan(updatedPlan);
        setIsPaidPlan(isPaidPlanDetected);
        localStorage.setItem("plan", JSON.stringify(updatedPlan));
        localStorage.setItem("remaining_credits", String(data.remaining_credits || 0));
        localStorage.setItem("has_access", updatedPlan.hasAccess ? "true" : "false");

        // ✅ Expiration Toast Messaging
        if (daysLeft <= 0) {
          const message = isFreeTrial
            ? "⏳ Your 7-day free trial has ended. Please upgrade to continue."
            : "💳 Your plan has expired. Please renew to continue.";
          toast.warning(message);
        } else if (isFreeTrial && !isPaidPlanDetected && daysLeft <= 3 && hasCredits) {
          toast.info(`Trial ending in ${daysLeft} days. ${data.remaining_credits} credits left.`, {
            duration: 4000,
          });
        }
      } catch (err: any) {
        console.error("❌ Failed to fetch profile:", err);
        // Don't clear localStorage on profile fetch failure
      }
    };

    fetchCredits();
  }, []);

  useEffect(() => {
    const loadCreditData = async () => {
      setCreditBalanceLoading(true);
      try {
        const balance = await fetchCreditBalance();
        localStorage.setItem("remaining_credits", balance?.remaining?.toString() || "0");
        setCreditBalance(balance);
      } catch (error) {
        console.error("Failed to fetch credit balance:", error);
      } finally {
        setCreditBalanceLoading(false);
      }

      setCreditHistoryLoading(true);
      try {
        console.log("Fetching credit history...");
        const history = await fetchCreditHistory();
        console.log("Credit history response:", history);
        setCreditHistory(history);
        localStorage.setItem("credit_history", JSON.stringify(history));
      } catch (error) {
        console.error("Failed to fetch credit history:", error);
      } finally {
        setCreditHistoryLoading(false);
      }
    };

    loadCreditData();
  }, []);

  // ✅ Sync plan with creditBalance whenever balance loads
  // usedToday reflects ONLY today's activity (from new used_today field)
  // creditsUsed reflects ALL-TIME activity
  useEffect(() => {
    if (creditBalance && creditBalance.used_today !== undefined) {
      setPlan((prev) => ({
        ...prev,
        usedToday: creditBalance.used_today,
        creditsUsed: creditBalance.used,
        creditsTotal: creditBalance.remaining, // profile.credits
        dailyCap: creditBalance.total, // plan total (700/1400/3000)
      }));
    }
  }, [creditBalance]);


  useEffect(() => {
    refreshDashboardData();
  }, []);

  // ✅ REPLACE THE 30000 INTERVAL useEffect WITH THIS:
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Initial load
    refreshDashboardData();

    // Set up less frequent refreshes
    intervalId = setInterval(() => {
      if (mountedRef.current && !isRefreshing && !activeAutomation) {
        refreshDashboardData();
      }
    }, 60000); // Only every 60 seconds instead of 30

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);
  // Empty dependency array to prevent recreating interval

  // 🔥 SINGLE UNIFIED SSE CONNECTION (Replace both existing SSE useEffects with this)
  // ============================================
  // SSE FIX - Replace the existing SSE useEffect with this:
  // ============================================

  // ============================================
  // UPDATED SSE CONNECTION - Test this in your Dashboard.tsx
  // ============================================

  // ============================================
  // CORRECT SSE CONNECTION FOR DASHBOARD.TSX
  // Replace your existing SSE useEffect with this
  // ============================================
  // // ============================================
  // // FINAL FIX - SSE with ngrok-skip-browser-warning header
  // // Replace your existing SSE useEffect with this
  // // ============================================



  // // ✅ FIXED SSE CONNECTION - Works for both dev and production
  // useEffect(() => {
  //   const token = localStorage.getItem("access_token");
  //   const userStr = localStorage.getItem("user");

  //   if (!token || !userStr) {
  //     console.error("❌ Cannot connect SSE - missing credentials");
  //     return;
  //   }

  //   let user;
  //   try {
  //     user = JSON.parse(userStr);
  //   } catch (e) {
  //     console.error("❌ Invalid user data");
  //     return;
  //   }

  //   const userId = user?.id;
  //   if (!userId) {
  //     console.error("❌ No user ID");
  //     return;
  //   }

  //   const apiUrl = import.meta.env.VITE_API_URL || "https://jobbot-production-ddd9.up.railway.app";

  //   // ✅ CORRECT: Connect to global SSE endpoint for all user events
  //   const sseUrl = `${apiUrl}/v1/sse/stream?user_id=${userId}`;

  //   console.log("🔌 Connecting to SSE...", { apiUrl, userId });

  //   // ✅ Build headers conditionally
  //   const headers: Record<string, string> = {
  //     'Authorization': `Bearer ${token}`,
  //   };

  //   // Only add ngrok header for ngrok URLs
  //   if (apiUrl.includes("ngrok")) {
  //     headers['ngrok-skip-browser-warning'] = '69420';
  //   }

  //   const evtSource = new EventSourcePolyfill(sseUrl, {
  //     headers,
  //     heartbeatTimeout: 120000,
  //     withCredentials: false,
  //   });

  //   evtSource.onopen = () => {
  //     console.log("✅ SSE Connected!");
  //     toast.success("Live updates connected", { duration: 2000 });
  //   };

  //   evtSource.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       console.log("📨 SSE Event:", data.type, data);

  //       if (data.type === "ping" || data.type === "connected") {
  //         console.log("💓 Heartbeat");
  //         return;
  //       }

  //       // ✅ Filter events by user_id
  //       if (data.user_id && data.user_id !== userId) {
  //         console.log("⏭️ Event for different user, skipping");
  //         return;
  //       }

  //       if (data.type === "completion") {
  //         console.log("🎉 Automation completed!", data);

  //         const successCount = data.successful || data.total_applied || 0;
  //         const totalCount = data.total_applied || 0;

  //         setLiveTicker(prev => [{
  //           id: `completion_${data.run_id || Date.now()}`,
  //           msg: `🎉 Applied to ${successCount}/${totalCount} jobs`,
  //           ago: "just now",
  //           ok: true,
  //           timestamp: new Date().toISOString(),
  //         }, ...prev.slice(0, 4)]);

  //         toast.success(`Applied to ${successCount} jobs!`, { duration: 5000 });
  //         setShowCelebration(true);
  //         setTimeout(() => setShowCelebration(false), 5000);

  //         // Refresh dashboard after 2 seconds
  //         setTimeout(() => refreshDashboardData(), 2000);

  //         // Dispatch custom event for other components
  //         window.dispatchEvent(new CustomEvent('automation-completed', {
  //           detail: {
  //             runId: data.run_id,
  //             successful: successCount,
  //             total: totalCount
  //           }
  //         }));

  //         // Browser notification
  //         if ("Notification" in window && Notification.permission === "granted") {
  //           new Notification("🎉 Automation Complete!", {
  //             body: `Successfully applied to ${successCount}/${totalCount} jobs`,
  //             icon: "/logo.png",
  //           });
  //         }
  //       }

  //       if (data.type === "progress") {
  //         setLiveTicker(prev => [{
  //           id: `progress_${Date.now()}`,
  //           msg: data.msg || "Processing...",
  //           ago: "just now",
  //           ok: true,
  //           timestamp: new Date().toISOString(),
  //         }, ...prev.slice(0, 4)]);
  //       }

  //       if (data.type === "error") {
  //         toast.error(data.msg || "Automation error occurred");
  //         setLiveTicker(prev => [{
  //           id: `error_${Date.now()}`,
  //           msg: `❌ ${data.msg || "Error occurred"}`,
  //           ago: "just now",
  //           ok: false,
  //           timestamp: new Date().toISOString(),
  //         }, ...prev.slice(0, 4)]);
  //       }

  //       if (data.type === "done") {
  //         console.log("✅ Automation done:", data);
  //         toast.success(data.msg || "Automation completed");
  //       }

  //     } catch (err) {
  //       console.error("❌ SSE parse error:", err);
  //     }
  //   };

  //   evtSource.onerror = (err: any) => {
  //     console.error("❌ SSE error:", err);

  //     if (err.status === 404) {
  //       console.error("❌ SSE endpoint not found");
  //       toast.error("Live updates unavailable", { duration: 3000 });
  //     } else if (evtSource.readyState === 2) { // CLOSED
  //       console.log("🔌 SSE connection closed");
  //     } else if (evtSource.readyState === 0) { // CONNECTING
  //       console.log("🔄 SSE reconnecting...");
  //     }
  //   };

  //   return () => {
  //     console.log("🔌 Closing SSE connection");
  //     evtSource.close();
  //   };
  // }, [refreshDashboardData]);
  // 


  // ============================================
  // FINAL FIXED & STABLE SSE (with Reconnect Limit)
  // ============================================

  useEffect(() => {
    let evtSource: EventSourcePolyfill | null = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECTS = 3;
    let isMounted = true;

    const connectSSE = () => {
      if (!isMounted) return;

      // 🔒 Prevent duplicate connections
      if (evtSource) {
        console.log("⚠️ SSE already connected, skipping duplicate connection");
        return;
      }

      // ⛔ Stop if too many reconnects
      if (reconnectAttempts >= MAX_RECONNECTS) {
        console.log("⚠️ Max SSE reconnection attempts reached. Stopping.");
        toast.error("SSE disconnected (max retries reached)");
        return;
      }

      console.log(`🔌 Connecting to SSE... Attempt ${reconnectAttempts + 1}`);

      // ------------------------------
      // 🔑 Auth & User
      // ------------------------------
      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        console.error("❌ Cannot connect SSE - missing credentials");
        return;
      }

      let user;
      try {
        user = JSON.parse(userStr);
      } catch {
        console.error("❌ Invalid user data");
        return;
      }

      const userId = user?.id;
      if (!userId) {
        console.error("❌ No user ID");
        return;
      }

      // ------------------------------
      // 🌍 Build SSE URL
      // ------------------------------
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://jobbot-production-ddd9.up.railway.app";

      const sseUrl = `${apiUrl}/v1/sse/stream?user_id=${userId}`;

      // ------------------------------
      // 📌 Headers
      // ------------------------------
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      if (apiUrl.includes("ngrok") || apiUrl.includes("trycloudflare")) {
        headers["ngrok-skip-browser-warning"] = "69420";
      }

      // ------------------------------
      // 🚀 Create SSE Connection
      // ------------------------------
      evtSource = new EventSourcePolyfill(sseUrl, {
        headers,
        heartbeatTimeout: 120000,
        withCredentials: false,
      });

      evtSource.onopen = () => {
        console.log("✅ SSE Connected (single connection)");
        reconnectAttempts = 0;
        toast.success("Live updates connected", { duration: 2000 });
      };

      // ------------------------------
      // 📨 Handle messages
      // ------------------------------
      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 SSE Event:", data.type, data);

          if (data.type === "ping" || data.type === "connected") return;
          if (data.user_id && data.user_id !== userId) return;

          // 🎉 COMPLETION EVENT
          if (data.type === "completion") {
            const successCount = data.successful || data.total_applied || 0;
            const totalCount = data.total_applied || 0;

            setLiveTicker((prev) => [
              {
                id: `completion_${data.run_id || Date.now()}`,
                msg: `🎉 Applied to ${successCount}/${totalCount} jobs`,
                ago: "just now",
                ok: true,
                timestamp: new Date().toISOString(),
              },
              ...prev.slice(0, 4),
            ]);

            toast.success(`Applied to ${successCount} jobs!`, { duration: 5000 });

            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 5000);

            setTimeout(() => refreshDashboardData(), 2000);

            window.dispatchEvent(
              new CustomEvent("automation-completed", {
                detail: {
                  runId: data.run_id,
                  successful: successCount,
                  total: totalCount,
                },
              })
            );

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("🎉 Automation Complete!", {
                body: `Successfully applied to ${successCount}/${totalCount} jobs`,
                icon: "/logo.png",
              });
            }
          }

          // 🔄 PROGRESS EVENT
          if (data.type === "progress") {
            setLiveTicker((prev) => [
              {
                id: `progress_${Date.now()}`,
                msg: data.msg || "Processing...",
                ago: "just now",
                ok: true,
                timestamp: new Date().toISOString(),
              },
              ...prev.slice(0, 4),
            ]);
          }

          // ❌ ERROR EVENT
          if (data.type === "error") {
            toast.error(data.msg || "Automation error occurred");

            setLiveTicker((prev) => [
              {
                id: `error_${Date.now()}`,
                msg: `❌ ${data.msg || "Error occurred"}`,
                ago: "just now",
                ok: false,
                timestamp: new Date().toISOString(),
              },
              ...prev.slice(0, 4),
            ]);
          }

          // ☑️ DONE Event
          if (data.type === "done") {
            toast.success(data.msg || "Automation completed");
          }
        } catch (err) {
          console.error("❌ SSE parse error:", err);
        }
      };

      // ------------------------------
      // ❌ Handle errors + reconnect
      // ------------------------------
      evtSource.onerror = (err) => {
        console.error("❌ SSE error:", err);

        evtSource?.close();
        evtSource = null;

        reconnectAttempts++;

        if (reconnectAttempts < MAX_RECONNECTS) {
          const delay = 5000 * reconnectAttempts;
          console.log(`🔄 Reconnecting SSE in ${delay / 1000}s...`);
          setTimeout(() => {
            if (isMounted) connectSSE();
          }, delay);
        }
      };
    };

    connectSSE();

    return () => {
      isMounted = false;
      console.log("🔌 Closing SSE connection");
      evtSource?.close();
      evtSource = null;
    };
  }, []);

  // ❗ No dependencies = No reconnect spam

  // ✅ Remove userId from dependencies since it's defined inside
  // useEffect(() => {
  //   const token = localStorage.getItem("access_token");
  //   const userStr = localStorage.getItem("user");

  //   console.log("=== SSE DEBUG ===");
  //   console.log("Token:", token ? "EXISTS (" + token.length + " chars)" : "MISSING");
  //   console.log("User:", userStr ? "EXISTS" : "MISSING");

  //   if (!token || !userStr) {
  //     console.error("❌ Cannot connect - missing credentials");
  //     return;
  //   }

  //   let user;
  //   try {
  //     user = JSON.parse(userStr);
  //   } catch (e) {
  //     console.error("❌ Invalid user data");
  //     return;
  //   }

  //   const userId = user?.id;
  //   if (!userId) {
  //     console.error("❌ No user ID");
  //     return;
  //   }

  //   // Build URL with token
  //   const sseUrl = `https://36ce6792db51.ngrok-free.app/v1/automate-job-apply/stream?access_token=${token}`;
  //   console.log("🔌 Connecting to SSE...");

  //   // ✅ CRITICAL: Use EventSourcePolyfill with ngrok-skip-browser-warning header
  //   const evtSource = new EventSourcePolyfill(sseUrl, {
  //     headers: {
  //       'ngrok-skip-browser-warning': '69420',  // Magic header to skip ngrok warning page
  //       'Authorization': `Bearer ${token}`,
  //     },
  //     heartbeatTimeout: 60000,
  //     withCredentials: false,
  //   });

  //   evtSource.onopen = () => {
  //     console.log("✅ SSE CONNECTED!");
  //     toast.success("Live updates connected");
  //   };

  //   evtSource.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       console.log("📨 SSE Event:", data.type);

  //       if (data.type === "ping") {
  //         console.log("💓");
  //         return;
  //       }

  //       if (data.type === "completion" && data.user_id === userId) {
  //         console.log("🎉 COMPLETED!", data);

  //         setLiveTicker(prev => [{
  //           id: `completion_${data.run_id}`,
  //           msg: `🎉 Applied ${data.successful}/${data.total_applied} jobs`,
  //           ago: "just now",
  //           ok: true,
  //           timestamp: data.ts,
  //         }, ...prev.slice(0, 4)]);

  //         toast.success(`Applied to ${data.successful} jobs!`);
  //         setShowCelebration(true);
  //         setTimeout(() => setShowCelebration(false), 5000);
  //         setTimeout(() => refreshDashboardData(), 2000);

  //         if ("Notification" in window && Notification.permission === "granted") {
  //           new Notification("🎉 Complete!", {
  //             body: `Applied ${data.successful}/${data.total_applied} jobs`,
  //           });
  //         }
  //       }

  //       if (data.type === "progress") {
  //         setLiveTicker(prev => [{
  //           id: Date.now(),
  //           msg: data.msg,
  //           ago: "just now",
  //           ok: true,
  //           timestamp: data.ts,
  //         }, ...prev.slice(0, 4)]);
  //       }

  //       if (data.type === "error") {
  //         toast.error(data.msg);
  //       }
  //     } catch (err) {
  //       console.error("Parse error:", err);
  //     }
  //   };

  //   evtSource.onerror = (err) => {
  //     console.error("❌ SSE error:", err);
  //     if (evtSource.readyState === 2) {
  //       console.log("🔌 Connection closed");
  //     }
  //   };

  //   return () => {
  //     console.log("🔌 Closing SSE");
  //     evtSource.close();
  //   };
  // }, [refreshDashboardData]);


  // Add this useEffect in Dashboard.tsx after your existing useEffects

  // Add browser notification permission request on mount
  // ✅ Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("🔔 Notification permission:", permission);
        if (permission === "granted") {
          toast.success("Browser notifications enabled", { duration: 2000 });
        } else if (permission === "denied") {
          console.warn("⚠️ Notifications blocked by user");
        }
      });
    }
  }, []);


  /* ===========================================================
     Computed Values
  =========================================================== */
  const todayPct = Math.min((dashboardStats.credits_used_today / plan.dailyCap) * 100, 100);
  const creditsLeft = Math.max(plan.creditsTotal - plan.creditsUsed, 0);

  const stats = useMemo(
    () => [
      {
        icon: FileText,
        label: "CVs Uploaded",
        value: String(dashboardStats.cv_count),
        color: "text-blue-600",
      },
      {
        icon: Search,
        label: "Jobs Found",
        value: String(dashboardStats.jobs_found),
        color: "text-cyan-600",
      },
      {
        icon: Send,
        label: "Applied Today",
        value: String(dashboardStats.applications_today),
        color: "text-emerald-600",
      },
      {
        icon: TrendingUp,
        label: "Total Applied",
        value: String(dashboardStats.total_applications),
        color: "text-violet-600",
      },
    ],
    [dashboardStats]
  );

  const openCreditHistory = async () => {
    setCreditHistoryOpen(true);
    try {
      const history = await fetchCreditHistory();
      setCreditHistory(history);
    } catch (error) {
      console.error("Failed to fetch credit history:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#1E293B] mb-2 leading-tight">Dashboard</h1>
            <p className="text-[16px] text-[#64748B] font-medium">
              Welcome Back, {userName}! Here Is A Quick Overview Of Your Professional Journey.
            </p>
          </div>
          <div className="bg-white p-3 px-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 min-w-[200px]">
            <div className="bg-amber-50 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#1E293B] flex items-center gap-1.5">
                {plan.creditsTotal} Credits Left
              </div>
              <div className="text-[12px] text-[#64748B] font-medium">Trial expires in {plan.daysLeft || 0} days</div>
            </div>
          </div>
        </div>

        {/* Automation Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-[16px] font-bold text-[#1E293B]">Automation Status</span>
              <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${activeAutomation ? 'bg-[#EBFDF5] text-[#10B981]' : 'bg-slate-100 text-slate-400'}`}>
                {activeAutomation ? 'Automation Active' : 'Inactive'}
              </span>
            </div>
            {activeAutomation ? (
              <Button
                onClick={() => navigate("/ai-auto-apply")}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] font-bold h-9 px-4 rounded-lg"
              >
                View Progress
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/ai-auto-apply")}
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] font-bold h-9 px-4 rounded-lg"
              >
                Start Automation
              </Button>
            )}
          </div>
          
          <div className="mb-4 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[20px] font-bold text-[#1E293B]">{dashboardStats.applications_today}</span>
              <span className="text-[14px] text-[#94A3B8] font-medium">/ {plan.dailyCap}</span>
              <span className="text-[12px] text-[#3B82F6] font-bold ml-2">Applications Submitted Today</span>
              <span className="text-[12px] text-amber-600 font-bold ml-4">
                Credits Used Today: {creditBalance?.used_today || 0}
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${activeAutomation ? 'bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899]' : 'bg-slate-200'}`}
                style={{ width: `${Math.min((dashboardStats.applications_today / plan.dailyCap) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 3-CARD ROW (middle) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <KPICard 
            label="Total Applications" 
            value={dashboardStats.total_applications} 
            icon={<ClipboardList className="w-5 h-5 text-slate-400" />}
            onView={() => navigate("/my-applications")}
            viewLabel="View All"
          />
          <KPICard 
            label="Applications Today" 
            value={dashboardStats.applications_today} 
            icon={<Hourglass className="w-5 h-5 text-amber-500" />}
            onView={() => navigate("/my-applications")}
            viewLabel="View Today"
          />
          <KPICard 
            label="Success Rate" 
            value={`${dashboardStats.success_rate || 0}%`} 
            icon={<Trophy className="w-5 h-5 text-[#10B981]" />}
            isSuccess
            onView={() => navigate("/my-applications")}
            viewLabel="View History"
          />
        </div>

        {/* 2-CARD ROW (bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <KPICard 
            label="CVs Uploaded" 
            value={dashboardStats.cv_count} 
            icon={<FileText className="w-5 h-5 text-blue-600" />}
            onView={() => navigate("/ai-auto-apply")}
            viewLabel="Upload New CV"
          />
          <KPICard 
            label="Credits Remaining" 
            value={`${creditBalance?.remaining || 0} / ${creditBalance?.total || 0}`} 
            icon={<Zap className="w-5 h-5 text-amber-500 fill-amber-500" />}
            onView={() => navigate("/plans")}
            viewLabel="Buy Credits"
          />
        </div>

        {/* Applications Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-bold text-[#1E293B]">Recent Applications</h2>
            <button className="text-[14px] font-bold text-[#3B82F6] hover:underline" onClick={() => navigate("/my-applications")}>View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentApps.length > 0 ? (
              recentApps.slice(0, 4).map((app, idx) => (
                <ApplicationCardParity 
                  key={app.id || idx}
                  title={app.position}
                  company={app.company}
                  location={app.location || "N/A"}
                  time={`Applied ${app.time}`}
                  status={app.status}
                  progress={idx === 0 ? 85 : idx === 1 ? 45 : idx === 2 ? 15 : 50}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100 text-slate-500">
                No recent applications found.
              </div>
            )}
          </div>
        </div>
      </main>

      <CelebrationOverlay />
    </div>
  );
};

function KPICard({ label, value, icon, isSuccess, onView, viewLabel }: { label: string; value: string | number; icon: React.ReactNode; isSuccess?: boolean; onView?: () => void; viewLabel?: string }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[14px] font-bold text-[#64748B]">{label}</span>
        <div className="p-2 bg-slate-50/50 rounded-lg">{icon}</div>
      </div>
      <div>
        <div className={`text-[24px] font-bold ${isSuccess ? 'text-[#10B981]' : 'text-[#1E293B]'} leading-none mb-1`}>
          {value}
        </div>
        <div className="text-right">
          <button 
            onClick={onView}
            className="text-[12px] font-bold text-[#3B82F6] hover:underline flex items-center justify-end gap-1"
          >
            {viewLabel || 'View'} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function JobCardParity({ title, company, location, time, logo, tags }: { title: string; company: string; location: string; time: string; logo: string; tags: {text: string, color: string}[] }) {
  return (
    <div className="bg-white rounded-[20px] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-[#F1F5F9] p-6 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center p-1 border border-[#F1F5F9]">
             <img src={logo} alt={company} className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#1E293B] leading-tight mb-0.5">{title}</h3>
            <p className="text-[11px] font-medium text-[#64748B]">{company} • {location}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag, i) => (
          <span key={i} className={`${tag.color} text-[10px] font-bold px-2.5 py-0.5 rounded-md`}>
            {tag.text}
          </span>
        ))}
      </div>
      <div className="mt-auto">
        <div className="text-[12px] text-[#94A3B8] font-medium mb-5 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 opacity-60" /> {time}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="text-[13px] font-bold border-[#F1F5F9] bg-[#F8FAFC] text-[#334155] h-[42px] rounded-xl hover:bg-slate-50">
            Show Details
          </Button>
          <Button className="text-[13px] font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white h-[42px] rounded-xl flex items-center justify-center gap-1.5 shadow-[0_2px_4px_0_rgba(59,130,246,0.2)]">
            Apply Now <TrendingUp className="w-3.5 h-3.5 rotate-45" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ApplicationCardParity({ title, company, location, time, status, progress }: { title: string; company: string; location: string; time: string; status: string; progress: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-1 border border-slate-100 text-[#3B82F6] font-bold text-lg">
             <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#1E293B] leading-tight mb-1">{title}</h3>
            <p className="text-[13px] font-medium text-[#64748B]">{company} • {location}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
            <div className="relative w-10 h-10">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100" />
                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={100} strokeDashoffset={100 - progress} className="text-[#10B981]" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600">{progress}%</span>
            </div>
        </div>
      </div>
      <div className="mb-5">
        <div className="text-[12px] text-[#94A3B8] font-medium mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> {time}
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${status === 'Reviewing' ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>
          {status}
        </span>
      </div>
      <div className="mt-auto">
        <Button className="w-full text-[13px] font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white h-10 rounded-xl">
          Details
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;
