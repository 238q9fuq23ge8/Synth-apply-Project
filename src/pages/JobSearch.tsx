import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/ui/job-card";
import { Search, Filter, Loader2, Zap, TrendingUp, AlertCircle, Target } from "lucide-react";
import api from "@/lib/api";
import "../App.css";
import "@/index.css";
import { toast } from "sonner";
import { JobModal } from "@/components/ui/JobModal";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

// =====================================
// Types
// =====================================
interface Job {
  id: string;
  title: string;
  company?: string;
  location?: string;
  snippet?: string;
  url?: string;
  salary_min?: number;
  salary_max?: number;
  score?: number;
  relevance_score?: number;
  source: string;
  salary?: string;
}

interface JobSearchResponse {
  jobs: Job[];
  remaining_credits: number;
  plan: string;
  trial_ends_at?: string;
  source: string;
  total: number;
  fetch_time?: string;
  filtering_stats?: {
    raw_fetched: number;
    after_dedup: number;
    final_filtered: number;
    keywords_searched: string;
    region_searched: string;
  };
}

// =====================================
// Component
// =====================================
const JobSearch = () => {
  const [keywords, setKeywords] = useState("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(1);
  const [userPlan, setUserPlan] = useState<string | null>(
    localStorage.getItem("plan")
  );
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
    localStorage.getItem("trial_ends_at")
  );
  const [remainingCredits, setRemainingCredits] = useState<number>(
    Number(localStorage.getItem("remaining_credits") || 0)
  );
  const [creditsDeducted, setCreditsDeducted] = useState<number>(0);
  const [showCreditDeduction, setShowCreditDeduction] = useState(false);
  const [filteringStats, setFilteringStats] = useState<any>(null);
  const cv_id = localStorage.getItem("current_cv_id");

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const openJobModal = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

  // =====================================
  // ⚡ REAL-TIME Dynamic Fetch
  // =====================================
  const fetchJobs = async (): Promise<Job[]> => {
    const startTime = Date.now();
    const previousCredits = remainingCredits;

    const body: any = {
      keywords,
      region,
    };

    try {
      const response = await api.post<JobSearchResponse>(
        "/v1/jobs/search-simple",
        body,
        { timeout: 90000 }
      );
      const data = response.data;

      const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⚡ Real-time search completed in ${fetchTime}s`);
      console.log(`📊 Filtering stats:`, data.filtering_stats);

      // Store filtering stats
      if (data.filtering_stats) {
        setFilteringStats(data.filtering_stats);
      }

      // --- Normalize plan ---
      const planData =
        typeof data.plan === "object"
          ? data.plan
          : {
              tier: data.plan || "free_trial",
              creditsTotal: 100,
              creditsUsed: 0,
              dailyCap: 100,
              usedToday: 0,
            };

      const remaining = data.remaining_credits ?? planData.creditsTotal - planData.creditsUsed;

      // 🎯 Calculate credits deducted
      const deducted = Math.max(0, previousCredits - remaining);
      setCreditsDeducted(deducted);
      setShowCreditDeduction(true);

      setTimeout(() => setShowCreditDeduction(false), 9000);

      // ✅ Update LocalStorage
      localStorage.setItem("remaining_credits", remaining.toString());
      localStorage.setItem("plan", JSON.stringify(planData));
      if (data.trial_ends_at) localStorage.setItem("trial_ends_at", data.trial_ends_at);

      const unifiedCredit = {
        tier: planData.tier,
        creditsTotal: planData.creditsTotal,
        creditsUsed: planData.creditsUsed,
        dailyCap: planData.dailyCap || 100,
        usedToday: planData.usedToday || 0,
        renewsAt: data.trial_ends_at || planData.renewsAt || null,
      };
      localStorage.setItem("credit_info", JSON.stringify(unifiedCredit));

      // ✅ Update React state
      setRemainingCredits(remaining);
      setUserPlan(planData.tier);

      // Only show internal jobs — filter out external sources
      const allJobs = Array.isArray(data.jobs) ? data.jobs : [];
      const jobs = allJobs.filter((j: Job) => {
        const src = (j.source || "").toLowerCase();
        return !src.includes("external") && !src.includes("email");
      });

      // ✅ Show success notification
      if (deducted > 0) {
        toast.success(
          `✅ Found ${jobs.length} "${keywords}" jobs in ${region}! ${deducted} credit${deducted > 1 ? "s" : ""} used.`,
          { duration: 3000 }
        );
      } else {
        toast.success(`✅ Found ${jobs.length} matching jobs!`);
      }

      // Show filtering stats if significant filtering occurred
      if (data.filtering_stats) {
        const { raw_fetched, final_filtered } = data.filtering_stats;
        if (raw_fetched > final_filtered * 1.5) {
          toast.info(
            `🎯 Filtered ${raw_fetched} jobs down to ${final_filtered} best matches for "${keywords}" in ${region}`,
            { duration: 4000 }
          );
        }
      }

      // 🔁 Refresh Supabase credits
      refreshSupabaseCredits();

      return jobs;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          toast.error(`No jobs found for "${keywords}" in ${region}. Try different keywords.`);
          return [];
        }
        if (status === 400) {
          toast.error("Please select a valid region.");
          return [];
        }
        if (status === 403 || status === 429) {
          toast.error("Out of credits! Purchase more to continue searching.");
          return [];
        }
        console.error("API Error:", error.response.data);
        toast.error(error.response.data?.detail || "Failed to fetch jobs");
      } else {
        console.error("Network Error:", error.message);
        toast.error("Network error. Please try again.");
      }
      return [];
    }
  };

  // =====================================
  // Refresh Supabase Credits
  // =====================================
  const refreshSupabaseCredits = async () => {
    try {
      const user = (await supabase.auth.getUser()).data?.user;
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (data?.credits !== undefined) {
        localStorage.setItem("remaining_credits", data.credits.toString());
        setRemainingCredits(data.credits);
      }
    } catch (err) {
      console.error("❌ Error refreshing Supabase credits:", err);
    }
  };

  // =====================================
  // React Query Hook
  // =====================================
  const {
    data: jobs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["jobs", keywords, region, page],
    queryFn: fetchJobs,
    enabled: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // =====================================
  // Handle Search
  // =====================================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim()) {
      toast.error("Please enter search keywords");
      return;
    }
    if (!region.trim()) {
      toast.error("Please select a location");
      return;
    }
    setFilteringStats(null); // Reset stats
    refetch();
  };

  const [planName, setPlanName] = useState("Free Trial");

  useEffect(() => {
    const planRaw = localStorage.getItem("plan");
    if (planRaw) {
      try {
        const parsed = JSON.parse(planRaw);
        setPlanName(
          parsed.tier?.toUpperCase?.() || parsed.plan?.toUpperCase?.() || "FREE TRIAL"
        );
      } catch {
        setPlanName("FREE TRIAL");
      }
    } else {
      setPlanName("FREE TRIAL");
    }
  }, [remainingCredits, userPlan]);

  // =====================================
  // Trial Countdown
  // =====================================
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  // =====================================
  // Fetch Credits on Mount
  // =====================================
  // ===== REPLACE THE fetchUserCredits useEffect in JobSearch.tsx =====
// Around line 270-300 in your current JobSearch.tsx

// ✅ NEW: Fetch Credits & Trial from Backend API (like Sidebar does)
useEffect(() => {
  const fetchUserCreditsAndTrial = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        console.warn("⚠️ JobSearch: No auth credentials found");
        return;
      }

      const user = JSON.parse(userStr);
      if (!user?.id) {
        console.warn("⚠️ JobSearch: No user ID found");
        return;
      }

      console.log("🔍 JobSearch: Fetching profile from backend for user:", user.id);

      // ✅ Fetch from backend API (same as Sidebar)
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/v1/profile/${user.id}`, {
        method: 'GET',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ JobSearch: API error ${res.status}:`, errorText);
        throw new Error(`Failed to fetch profile: ${res.status}`);
      }

      const data = await res.json();
      console.log("📊 JobSearch: Profile data received:", data);

      // ✅ Extract credits (try both field names)
      const fetchedCredits = data.credits ?? data.remaining_credits ?? 0;
      
      // ✅ Extract plan info
      const fetchedPlan = data.plan || "free_trial";
      
      // ✅ Extract trial end date
      const fetchedTrialEndsAt = data.trial_ends_at || null;

      // ✅ Calculate trial days left
      let calculatedDaysLeft = null;
      if (fetchedTrialEndsAt) {
        const end = new Date(fetchedTrialEndsAt).getTime();
        const now = Date.now();
        calculatedDaysLeft = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
      }

      console.log("💳 JobSearch: Credits:", fetchedCredits);
      console.log("📦 JobSearch: Plan:", fetchedPlan);
      console.log("⏳ JobSearch: Trial days left:", calculatedDaysLeft);

      // ✅ Update React state
      setRemainingCredits(fetchedCredits);
      setUserPlan(fetchedPlan);
      setTrialEndsAt(fetchedTrialEndsAt);
      setDaysLeft(calculatedDaysLeft);

      // ✅ Update localStorage for persistence
      localStorage.setItem("remaining_credits", String(fetchedCredits));
      localStorage.setItem("credits", String(fetchedCredits));
      localStorage.setItem("plan", JSON.stringify({ tier: fetchedPlan }));
      if (fetchedTrialEndsAt) {
        localStorage.setItem("trial_ends_at", fetchedTrialEndsAt);
      }

      console.log("✅ JobSearch: Profile data updated successfully");

    } catch (err: any) {
      console.error("❌ JobSearch: Failed to fetch profile:", err);
      
      // ✅ Fallback to localStorage if API fails
      const storedCredits = localStorage.getItem("remaining_credits") || localStorage.getItem("credits");
      const storedPlan = localStorage.getItem("plan");
      const storedTrialEndsAt = localStorage.getItem("trial_ends_at");

      if (storedCredits && !isNaN(Number(storedCredits))) {
        console.log("🔄 JobSearch: Using cached credits:", storedCredits);
        setRemainingCredits(Number(storedCredits));
      }

      if (storedPlan) {
        try {
          const parsed = JSON.parse(storedPlan);
          setUserPlan(parsed.tier || "free_trial");
        } catch {
          setUserPlan("free_trial");
        }
      }

      if (storedTrialEndsAt) {
        setTrialEndsAt(storedTrialEndsAt);
        const end = new Date(storedTrialEndsAt).getTime();
        const now = Date.now();
        const daysLeft = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
        setDaysLeft(daysLeft);
      }
    }
  };

  fetchUserCreditsAndTrial();

  // ✅ Refresh on window focus (like Sidebar)
  const handleFocus = () => {
    console.log("👁️ JobSearch: Window focused, refreshing data");
    fetchUserCreditsAndTrial();
  };

  window.addEventListener("focus", handleFocus);
  return () => window.removeEventListener("focus", handleFocus);
}, []);



  const creditCostPerSearch = planName === "FREE TRIAL" ? 5 : 1;

  // =====================================
  // UI Rendering
  // =====================================
  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-[1528px] mx-auto">
          {/* ===== Header (Job Matches / Search) ===== */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
              <div>
                <h1 className="text-[clamp(1.75rem,4vw,2.2rem)] font-bold text-[#2862eb] leading-tight mb-1">
                  Job Matches
                </h1>
                <p className="text-[16px] text-[#4b5563] max-w-[640px] leading-relaxed">
                  Search any role and region — AI-ranked results with match scores.
                </p>
              </div>
              <div className="bg-[#fff8e1] border border-[#fce9a8] rounded-lg py-2.5 px-4 min-w-[200px] shadow-sm shrink-0">
                <div className="flex items-center gap-2 font-bold text-[#111827] text-[13px]">
                  <span className="text-amber-500">⚡</span>
                  <span>{remainingCredits} Credits Left</span>
                </div>
                {daysLeft !== null && (
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5 ml-6">
                    Trial: {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status chips (deduction animation on search) */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {daysLeft !== null && planName === "FREE TRIAL" && (
              <span className="rounded-full bg-[#2862eb] text-white text-[11px] font-bold px-3 py-1">
                ⏳ {daysLeft}d trial left
              </span>
            )}
            <div className="relative inline-block">
              {showCreditDeduction && creditsDeducted > 0 && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg animate-bounce z-10">
                  -{creditsDeducted} credits
                </span>
              )}
            </div>
            {cv_id && (
              <span className="rounded-full border border-[#f2f2f2] bg-white text-[12px] font-medium px-3 py-1 text-[#111827]">
                CV linked
              </span>
            )}
          </div>

          {/* ===== Search Bar ===== */}
          <form onSubmit={handleSearch} className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-6 mb-8">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search ANY job: Frontend, HR, Manager, Sales..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="pl-12 h-12"
                />
              </div>
              <div className="w-full sm:w-80">
                <select
  value={region}
  onChange={(e) => setRegion(e.target.value)}
  className="w-full h-12 border border-gray-300 rounded-md px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
>
  <option value="">🌍 Select Location</option>

  {/* 🕌 GulfTalent Supported */}
  {/* <optgroup label="🏝️ Gulf Countries & Cities"> */}
    <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
    <option value="Dubai">🇦🇪 Dubai</option>
    <option value="Abu Dhabi">🇦🇪 Abu Dhabi</option>
    <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
    <option value="Riyadh">🇸🇦 Riyadh</option>
    <option value="Qatar">🇶🇦 Qatar</option>
    <option value="Kuwait">🇰🇼 Kuwait</option>
    <option value="Bahrain">🇧🇭 Bahrain</option>
    <option value="Oman">🇴🇲 Oman</option>
  {/* </optgroup> */}

  {/* 🌍 Adzuna Supported */}
  {/* <optgroup label="🌎 Adzuna Supported Countries"> */}
    <option value="Australia">🇦🇺 Australia</option>
    <option value="Austria">🇦🇹 Austria</option>
    <option value="Belgium">🇧🇪 Belgium</option>
    <option value="Brazil">🇧🇷 Brazil</option>
    <option value="Canada">🇨🇦 Canada</option>
    <option value="France">🇫🇷 France</option>
    <option value="Germany">🇩🇪 Germany</option>
    <option value="India">🇮🇳 India</option>
    <option value="Italy">🇮🇹 Italy</option>
    <option value="Netherlands">🇳🇱 Netherlands</option>
    <option value="New Zealand">🇳🇿 New Zealand</option>
    <option value="Poland">🇵🇱 Poland</option>
    <option value="South Africa">🇿🇦 South Africa</option>
    <option value="Singapore">🇸🇬 Singapore</option>
    <option value="Spain">🇪🇸 Spain</option>
    <option value="Switzerland">🇨🇭 Switzerland</option>
    <option value="United Kingdom">🇬🇧 United Kingdom</option>
    <option value="United States">🇺🇸 United States</option>
  {/* </optgroup> */}

  {/* 🌐 Jooble Supported Countries */}
  {/* <optgroup label="🌍 Jooble Supported Countries"> */}
    <option value="Argentina">🇦🇷 Argentina</option>
    <option value="Bangladesh">🇧🇩 Bangladesh</option>
    <option value="Chile">🇨🇱 Chile</option>
    <option value="Colombia">🇨🇴 Colombia</option>
    <option value="Czech Republic">🇨🇿 Czech Republic</option>
    <option value="Denmark">🇩🇰 Denmark</option>
    <option value="Egypt">🇪🇬 Egypt</option>
    <option value="Finland">🇫🇮 Finland</option>
    <option value="Greece">🇬🇷 Greece</option>
    <option value="Hong Kong">🇭🇰 Hong Kong</option>
    <option value="Hungary">🇭🇺 Hungary</option>
    <option value="Indonesia">🇮🇩 Indonesia</option>
    <option value="Ireland">🇮🇪 Ireland</option>
    <option value="Japan">🇯🇵 Japan</option>
    <option value="Kenya">🇰🇪 Kenya</option>
    <option value="Malaysia">🇲🇾 Malaysia</option>
    <option value="Mexico">🇲🇽 Mexico</option>
    <option value="Morocco">🇲🇦 Morocco</option>
    <option value="Nigeria">🇳🇬 Nigeria</option>
    <option value="Norway">🇳🇴 Norway</option>
    <option value="Pakistan">🇵🇰 Pakistan</option>
    <option value="Peru">🇵🇪 Peru</option>
    <option value="Philippines">🇵🇭 Philippines</option>
    <option value="Portugal">🇵🇹 Portugal</option>
    <option value="Romania">🇷🇴 Romania</option>
    <option value="South Korea">🇰🇷 South Korea</option>
    <option value="Sweden">🇸🇪 Sweden</option>
    <option value="Thailand">🇹🇭 Thailand</option>
    <option value="Turkey">🇹🇷 Turkey</option>
    <option value="Ukraine">🇺🇦 Ukraine</option>
    <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
    <option value="United Kingdom">🇬🇧 United Kingdom</option>
    <option value="United States">🇺🇸 United States</option>
    <option value="Vietnam">🇻🇳 Vietnam</option>
  {/* </optgroup> */}

  {/* Major Global Cities */}
  <optgroup label="🌏 Major Cities">
    <option value="London">🇬🇧 London</option>
    <option value="New York">🇺🇸 New York</option>
    <option value="Toronto">🇨🇦 Toronto</option>
    <option value="Sydney">🇦🇺 Sydney</option>
    <option value="Berlin">🇩🇪 Berlin</option>
    <option value="Paris">🇫🇷 Paris</option>
    <option value="Singapore City">🇸🇬 Singapore City</option>
    <option value="Mumbai">🇮🇳 Mumbai</option>
    <option value="Lahore">🇵🇰 Lahore</option>
    <option value="Karachi">🇵🇰 Karachi</option>
  </optgroup>

  <option value="Remote">🌐 Remote</option>
</select>

              </div>

              <Button
                type="submit"
                className="btn-hero h-12 px-8 font-semibold flex items-center justify-center"
                disabled={isFetching}
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Searching...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 w-5 h-5" /> Search Jobs
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* ===== Filtering Stats Banner ===== */}
          {filteringStats && !isFetching && jobs.length > 0 && (
            <div 
              className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-4 mb-6"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.08) 100%)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-semibold text-foreground">
                    Smart Filter: {filteringStats.raw_fetched} jobs → {filteringStats.final_filtered} best matches
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  Filtered for: "<span className="font-semibold text-primary">{filteringStats.keywords_searched}</span>" in{" "}
                  <span className="font-semibold text-primary">{filteringStats.region_searched}</span>
                </p>
              </div>
            </div>
          )}

          {/* ✅ ENHANCED: Job Results with Beautiful Progress Bar */}
          {isLoading || isFetching ? (
            <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm py-24 text-center">
              <div className="space-y-6">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary mb-4" />
                <div>
                  <p className="text-lg font-semibold text-foreground">🎯 Real-time search in progress...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Finding <span className="font-medium text-primary">{keywords}</span> jobs in{" "}
                    <span className="font-medium text-primary">{region}</span>
                  </p>
                </div>
                
                {/* ✅ Enhanced Progress Bar */}
                <div className="max-w-lg mx-auto space-y-4">
                  {/* Main Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full shadow-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                      style={{
                        width: '0%',
                        animation: 'progress-fill 3s ease-in-out infinite alternate'
                      }}
                    />
                  </div>
                  
                  {/* Search Progress Dots */}
                  <div className="flex justify-center space-x-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-primary/60 rounded-full"
                        style={{
                          animation: `pulse 1.5s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Dynamic Search Status */}
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <span style={{ animation: 'bounce 1s infinite' }}>🔍</span>
                      <span style={{ animation: 'pulse 2s infinite' }}>Searching multiple job boards...</span>
                    </div>
                  </div>
                  
                  {/* Progress Phase Indicator */}
                  <div className="text-xs text-muted-foreground/80">
                    <span style={{ animation: 'pulse 2s infinite' }}>
                      Analyzing {keywords} opportunities in {region}...
                    </span>
                  </div>
                </div>
              </div>
              
              <style jsx>{`
                @keyframes progress-fill {
                  0% { width: 10%; }
                  25% { width: 45%; }
                  50% { width: 75%; }
                  75% { width: 85%; }
                  100% { width: 95%; }
                }
                @keyframes pulse {
                  0%, 100% { opacity: 0.5; transform: scale(1); }
                  50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes bounce {
                  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                  40% { transform: translateY(-5px); }
                  60% { transform: translateY(-3px); }
                }
              `}</style>
            </div>
          ) : isError ? (
            <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-8 text-center" style={{ border: "2px solid rgba(239, 68, 68, 0.3)", background: "rgba(254, 242, 242, 0.8)" }}>
              <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
              <p className="text-lg font-semibold text-red-800">
                ❌ {(error as Error)?.message || "Something went wrong"}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4 btn-hero"
              >
                Try Again
              </Button>
            </div>
          ) : jobs && jobs.length > 0 ? (
            <>
              <div 
                className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-4 mb-6"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.08) 100%)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <p className="text-sm font-semibold text-foreground">
                  ✅ Found <span className="text-green-600 text-lg font-bold">{jobs.length}</span>{" "}
                  <span className="text-primary font-bold">{keywords}</span> jobs in{" "}
                  <span className="text-primary font-bold">{region}</span>
                </p>
              </div>

              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => openJobModal(job)}
                    className="cursor-pointer hover:scale-[1.01] transition-all duration-200"
                  >
                    <JobCard
                      title={job.title}
                      company={job.company || "Company not specified"}
                      location={job.location || "Location not specified"}
                      matchPercentage={job.relevance_score || job.score || 85}
                      postedDate={job.source?.toUpperCase() || "VERIFIED"}
                      salary={job.salary || null}
                    />
                  </div>
                ))}
              </div>

              <JobModal job={selectedJob} isOpen={isModalOpen} onClose={closeJobModal} />
            </>
          ) : (
            <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm py-20 text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">
                No jobs found for <span className="text-primary">{keywords}</span> in{" "}
                <span className="text-primary">{region}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or select another location
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobSearch;
// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Sidebar } from "@/components/layout/Sidebar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { JobCard } from "@/components/ui/job-card";
// import { Search, Filter, Loader2, Zap, TrendingUp, AlertCircle, Target } from "lucide-react";
// import api from "@/lib/api";
// import "../App.css";
// import "@/index.css";
// import { toast } from "sonner";
// import { JobModal } from "@/components/ui/JobModal";
// import { supabase } from "@/lib/supabaseClient";
// import { useNavigate } from "react-router-dom";

// // =====================================
// // Types
// // =====================================
// interface Job {
//   id: string;
//   title: string;
//   company?: string;
//   location?: string;
//   snippet?: string;
//   url?: string;
//   salary_min?: number;
//   salary_max?: number;
//   score?: number;
//   relevance_score?: number;
//   source: string;
//   salary?: string;
// }

// interface JobSearchResponse {
//   jobs: Job[];
//   remaining_credits: number;
//   plan: string;
//   trial_ends_at?: string;
//   source: string;
//   total: number;
//   fetch_time?: string;
//   filtering_stats?: {
//     raw_fetched: number;
//     after_dedup: number;
//     final_filtered: number;
//     keywords_searched: string;
//     region_searched: string;
//   };
// }

// // =====================================
// // Component
// // =====================================
// const JobSearch = () => {
//   const [keywords, setKeywords] = useState("");
//   const [region, setRegion] = useState("");
//   const [page, setPage] = useState(1);
//   const [userPlan, setUserPlan] = useState<string | null>(
//     localStorage.getItem("plan")
//   );
//   const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
//     localStorage.getItem("trial_ends_at")
//   );
//   const [remainingCredits, setRemainingCredits] = useState<number>(
//     Number(localStorage.getItem("remaining_credits") || 0)
//   );
//   const [creditsDeducted, setCreditsDeducted] = useState<number>(0);
//   const [showCreditDeduction, setShowCreditDeduction] = useState(false);
//   const [filteringStats, setFilteringStats] = useState<any>(null);
//   const cv_id = localStorage.getItem("current_cv_id");

//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const navigate = useNavigate();

//   const openJobModal = (job: Job) => {
//     setSelectedJob(job);
//     setIsModalOpen(true);
//   };

//   const closeJobModal = () => {
//     setSelectedJob(null);
//     setIsModalOpen(false);
//   };

//   // =====================================
//   // ⚡ REAL-TIME Dynamic Fetch
//   // =====================================
//   const fetchJobs = async (): Promise<Job[]> => {
//     const startTime = Date.now();
//     const previousCredits = remainingCredits;

//     const body: any = {
//       keywords,
//       region,
//     };

//     try {
//       const response = await api.post<JobSearchResponse>(
//         "/v1/jobs/search-simple",
//         body,
//         { timeout: 90000 }
//       );
//       const data = response.data;

//       const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
//       console.log(`⚡ Real-time search completed in ${fetchTime}s`);
//       console.log(`📊 Filtering stats:`, data.filtering_stats);

//       // Store filtering stats
//       if (data.filtering_stats) {
//         setFilteringStats(data.filtering_stats);
//       }

//       // --- Normalize plan ---
//       const planData =
//         typeof data.plan === "object"
//           ? data.plan
//           : {
//               tier: data.plan || "free_trial",
//               creditsTotal: 100,
//               creditsUsed: 0,
//               dailyCap: 100,
//               usedToday: 0,
//             };

//       const remaining = data.remaining_credits ?? planData.creditsTotal - planData.creditsUsed;

//       // 🎯 Calculate credits deducted
//       const deducted = Math.max(0, previousCredits - remaining);
//       setCreditsDeducted(deducted);
//       setShowCreditDeduction(true);

//       setTimeout(() => setShowCreditDeduction(false), 9000);

//       // ✅ Update LocalStorage
//       localStorage.setItem("remaining_credits", remaining.toString());
//       localStorage.setItem("plan", JSON.stringify(planData));
//       if (data.trial_ends_at) localStorage.setItem("trial_ends_at", data.trial_ends_at);

//       const unifiedCredit = {
//         tier: planData.tier,
//         creditsTotal: planData.creditsTotal,
//         creditsUsed: planData.creditsUsed,
//         dailyCap: planData.dailyCap || 100,
//         usedToday: planData.usedToday || 0,
//         renewsAt: data.trial_ends_at || planData.renewsAt || null,
//       };
//       localStorage.setItem("credit_info", JSON.stringify(unifiedCredit));

//       // ✅ Update React state
//       setRemainingCredits(remaining);
//       setUserPlan(planData.tier);

//       const jobs = Array.isArray(data.jobs) ? data.jobs : [];

//       // ✅ Show success notification
//       if (deducted > 0) {
//         toast.success(
//           `✅ Found ${jobs.length} "${keywords}" jobs in ${region}! ${deducted} credit${deducted > 1 ? "s" : ""} used.`,
//           { duration: 3000 }
//         );
//       } else {
//         toast.success(`✅ Found ${jobs.length} matching jobs!`);
//       }

//       // Show filtering stats if significant filtering occurred
//       if (data.filtering_stats) {
//         const { raw_fetched, final_filtered } = data.filtering_stats;
//         if (raw_fetched > final_filtered * 1.5) {
//           toast.info(
//             `🎯 Filtered ${raw_fetched} jobs down to ${final_filtered} best matches for "${keywords}" in ${region}`,
//             { duration: 4000 }
//           );
//         }
//       }

//       // 🔁 Refresh Supabase credits
//       refreshSupabaseCredits();

//       return jobs;
//     } catch (error: any) {
//       if (error.response) {
//         const status = error.response.status;
//         if (status === 404) {
//           toast.error(`No jobs found for "${keywords}" in ${region}. Try different keywords.`);
//           return [];
//         }
//         if (status === 400) {
//           toast.error("Please select a valid region.");
//           return [];
//         }
//         if (status === 403 || status === 429) {
//           toast.error("Out of credits! Purchase more to continue searching.");
//           return [];
//         }
//         console.error("API Error:", error.response.data);
//         toast.error(error.response.data?.detail || "Failed to fetch jobs");
//       } else {
//         console.error("Network Error:", error.message);
//         toast.error("Network error. Please try again.");
//       }
//       return [];
//     }
//   };

//   // =====================================
//   // Refresh Supabase Credits
//   // =====================================
//   const refreshSupabaseCredits = async () => {
//     try {
//       const user = (await supabase.auth.getUser()).data?.user;
//       if (!user) return;

//       const { data } = await supabase
//         .from("profiles")
//         .select("credits")
//         .eq("id", user.id)
//         .single();

//       if (data?.credits !== undefined) {
//         localStorage.setItem("remaining_credits", data.credits.toString());
//         setRemainingCredits(data.credits);
//       }
//     } catch (err) {
//       console.error("❌ Error refreshing Supabase credits:", err);
//     }
//   };

//   // =====================================
//   // React Query Hook
//   // =====================================
//   const {
//     data: jobs = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//     isFetching,
//   } = useQuery({
//     queryKey: ["jobs", keywords, region, page],
//     queryFn: fetchJobs,
//     enabled: false,
//     retry: 1,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });

//   // =====================================
//   // Handle Search
//   // =====================================
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!keywords.trim()) {
//       toast.error("Please enter search keywords");
//       return;
//     }
//     if (!region.trim()) {
//       toast.error("Please select a location");
//       return;
//     }
//     setFilteringStats(null); // Reset stats
//     refetch();
//   };

//   const [planName, setPlanName] = useState("Free Trial");

//   useEffect(() => {
//     const planRaw = localStorage.getItem("plan");
//     if (planRaw) {
//       try {
//         const parsed = JSON.parse(planRaw);
//         setPlanName(
//           parsed.tier?.toUpperCase?.() || parsed.plan?.toUpperCase?.() || "FREE TRIAL"
//         );
//       } catch {
//         setPlanName("FREE TRIAL");
//       }
//     } else {
//       setPlanName("FREE TRIAL");
//     }
//   }, [remainingCredits, userPlan]);

//   // =====================================
//   // Trial Countdown
//   // =====================================
//   const [daysLeft, setDaysLeft] = useState<number | null>(null);

//   // =====================================
//   // Fetch Credits on Mount
//   // =====================================
//   // ===== REPLACE THE fetchUserCredits useEffect in JobSearch.tsx =====
// // Around line 270-300 in your current JobSearch.tsx

// // ✅ NEW: Fetch Credits & Trial from Backend API (like Sidebar does)
// useEffect(() => {
//   const fetchUserCreditsAndTrial = async () => {
//     try {
//       const token = localStorage.getItem("access_token");
//       const userStr = localStorage.getItem("user");

//       if (!token || !userStr) {
//         console.warn("⚠️ JobSearch: No auth credentials found");
//         return;
//       }

//       const user = JSON.parse(userStr);
//       if (!user?.id) {
//         console.warn("⚠️ JobSearch: No user ID found");
//         return;
//       }

//       console.log("🔍 JobSearch: Fetching profile from backend for user:", user.id);

//       // ✅ Fetch from backend API (same as Sidebar)
//       const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
//       const res = await fetch(`${apiUrl}/v1/profile/${user.id}`, {
//         method: 'GET',
//         headers: { 
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error(`❌ JobSearch: API error ${res.status}:`, errorText);
//         throw new Error(`Failed to fetch profile: ${res.status}`);
//       }

//       const data = await res.json();
//       console.log("📊 JobSearch: Profile data received:", data);

//       // ✅ Extract credits (try both field names)
//       const fetchedCredits = data.credits ?? data.remaining_credits ?? 0;
      
//       // ✅ Extract plan info
//       const fetchedPlan = data.plan || "free_trial";
      
//       // ✅ Extract trial end date
//       const fetchedTrialEndsAt = data.trial_ends_at || null;

//       // ✅ Calculate trial days left
//       let calculatedDaysLeft = null;
//       if (fetchedTrialEndsAt) {
//         const end = new Date(fetchedTrialEndsAt).getTime();
//         const now = Date.now();
//         calculatedDaysLeft = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
//       }

//       console.log("💳 JobSearch: Credits:", fetchedCredits);
//       console.log("📦 JobSearch: Plan:", fetchedPlan);
//       console.log("⏳ JobSearch: Trial days left:", calculatedDaysLeft);

//       // ✅ Update React state
//       setRemainingCredits(fetchedCredits);
//       setUserPlan(fetchedPlan);
//       setTrialEndsAt(fetchedTrialEndsAt);
//       setDaysLeft(calculatedDaysLeft);

//       // ✅ Update localStorage for persistence
//       localStorage.setItem("remaining_credits", String(fetchedCredits));
//       localStorage.setItem("credits", String(fetchedCredits));
//       localStorage.setItem("plan", JSON.stringify({ tier: fetchedPlan }));
//       if (fetchedTrialEndsAt) {
//         localStorage.setItem("trial_ends_at", fetchedTrialEndsAt);
//       }

//       console.log("✅ JobSearch: Profile data updated successfully");

//     } catch (err: any) {
//       console.error("❌ JobSearch: Failed to fetch profile:", err);
      
//       // ✅ Fallback to localStorage if API fails
//       const storedCredits = localStorage.getItem("remaining_credits") || localStorage.getItem("credits");
//       const storedPlan = localStorage.getItem("plan");
//       const storedTrialEndsAt = localStorage.getItem("trial_ends_at");

//       if (storedCredits && !isNaN(Number(storedCredits))) {
//         console.log("🔄 JobSearch: Using cached credits:", storedCredits);
//         setRemainingCredits(Number(storedCredits));
//       }

//       if (storedPlan) {
//         try {
//           const parsed = JSON.parse(storedPlan);
//           setUserPlan(parsed.tier || "free_trial");
//         } catch {
//           setUserPlan("free_trial");
//         }
//       }

//       if (storedTrialEndsAt) {
//         setTrialEndsAt(storedTrialEndsAt);
//         const end = new Date(storedTrialEndsAt).getTime();
//         const now = Date.now();
//         const daysLeft = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
//         setDaysLeft(daysLeft);
//       }
//     }
//   };

//   fetchUserCreditsAndTrial();

//   // ✅ Refresh on window focus (like Sidebar)
//   const handleFocus = () => {
//     console.log("👁️ JobSearch: Window focused, refreshing data");
//     fetchUserCreditsAndTrial();
//   };

//   window.addEventListener("focus", handleFocus);
//   return () => window.removeEventListener("focus", handleFocus);
// }, []);



//   const creditCostPerSearch = planName === "FREE TRIAL" ? 5 : 1;

//   // =====================================
//   // UI Rendering
//   // =====================================
//   return (
//     <div className="flex min-h-screen bg-gradient-hero">
//       <Sidebar />

//       <main className="flex-1 p-6 md:p-8">
//         <div className="max-w-6xl mx-auto">
//           {/* ===== Header ===== */}
//           <div className="mb-8">
//             <div className="flex items-center gap-3 mb-3">
//               <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
//                 <Search className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold">Job Search</h1>
//                 <p className="text-muted-foreground text-sm mt-0.5">
//                   Dynamic AI-powered matching - Search ANY job type!
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* ===== Plan & Credits Info ===== */}
//           <div
//             className="bg-white border border-[#f2f2f2] rounded-md shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4"
//             style={{
//               border: "1px solid rgba(124,58,237,0.2)",
//               background: "rgba(255,255,255,0.9)",
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(124,58,237,0.12)",
//             }}
//           >
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
//               <div className="flex flex-wrap items-center gap-2.5">
//                 {/* <span 
//                   className="btn-hero inline-flex items-center gap-1.5"
//                   style={{
//                     color: "#fff",
//                     borderRadius: "999px",
//                     padding: "6px 14px",
//                     fontWeight: 700,
//                     fontSize: "0.8rem",
//                   }}
//                 >
//                   <Zap className="h-3.5 w-3.5" />
//                   {planName.replace("_", " ")}
//                 </span> */}

//                 {daysLeft !== null && planName === "FREE TRIAL" && (
//                   <span
//                     className="btn-hero inline-flex items-center gap-1.5"
//                     style={{
//                       color: "white",
//                       borderRadius: "999px",
//                       padding: "5px 12px",
//                       fontWeight: 700,
//                       fontSize: "0.78rem",
//                     }}
//                   >
//                     ⏳ {daysLeft}d left
//                   </span>
//                 )}

//                 <div className="relative inline-block">
//                   <span
//                     className="btn-hero inline-flex items-center gap-1.5"
//                     style={{
//                       color: "white",
//                       borderRadius: "999px",
//                       padding: "5px 12px",
//                       fontWeight: 700,
//                       fontSize: "0.78rem",
//                     }}
//                   >
//                     💰 {remainingCredits} credits
//                   </span>
                  
//                   {showCreditDeduction && creditsDeducted > 0 && (
//                     <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-bounce z-10">
//                       -{creditsDeducted} 💸
//                     </span>
//                   )}
//                 </div>

//                 {cv_id && (
//                   <span
//                     className="btn-hero inline-flex items-center gap-1.5"
//                     style={{
//                       color: "white",
//                       borderRadius: "999px",
//                       padding: "5px 12px",
//                       fontWeight: 700,
//                       fontSize: "0.78rem",
//                     }}
//                   >
//                     ✅ CV Linked
//                   </span>
//                 )}
//               </div>

//               {/* <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#7c3aed" }}>
//                 <TrendingUp className="h-4 w-4" />
//                 <span>
//                   {creditCostPerSearch} credit{creditCostPerSearch > 1 ? "s" : ""}/search
//                 </span>
//               </div> */}
//             </div>
//           </div>

//           {/* ===== Search Bar ===== */}
//           <form onSubmit={handleSearch} className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-6 mb-8">
//             <div className="flex gap-4 flex-col sm:flex-row">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                 <Input
//                   placeholder="Search ANY job: Frontend, HR, Manager, Sales..."
//                   value={keywords}
//                   onChange={(e) => setKeywords(e.target.value)}
//                   className="pl-12 h-12"
//                 />
//               </div>
//               <div className="w-full sm:w-80">
//                 <select
//   value={region}
//   onChange={(e) => setRegion(e.target.value)}
//   className="w-full h-12 border border-gray-300 rounded-md px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
// >
//   <option value="">🌍 Select Location</option>

//   {/* 🕌 GulfTalent Supported */}
//   {/* <optgroup label="🏝️ Gulf Countries & Cities"> */}
//     <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
//     <option value="Dubai">🇦🇪 Dubai</option>
//     <option value="Abu Dhabi">🇦🇪 Abu Dhabi</option>
//     <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
//     <option value="Riyadh">🇸🇦 Riyadh</option>
//     <option value="Qatar">🇶🇦 Qatar</option>
//     <option value="Kuwait">🇰🇼 Kuwait</option>
//     <option value="Bahrain">🇧🇭 Bahrain</option>
//     <option value="Oman">🇴🇲 Oman</option>
//   {/* </optgroup> */}

//   {/* 🌍 Adzuna Supported */}
//   {/* <optgroup label="🌎 Adzuna Supported Countries"> */}
//     <option value="Australia">🇦🇺 Australia</option>
//     <option value="Austria">🇦🇹 Austria</option>
//     <option value="Belgium">🇧🇪 Belgium</option>
//     <option value="Brazil">🇧🇷 Brazil</option>
//     <option value="Canada">🇨🇦 Canada</option>
//     <option value="France">🇫🇷 France</option>
//     <option value="Germany">🇩🇪 Germany</option>
//     <option value="India">🇮🇳 India</option>
//     <option value="Italy">🇮🇹 Italy</option>
//     <option value="Netherlands">🇳🇱 Netherlands</option>
//     <option value="New Zealand">🇳🇿 New Zealand</option>
//     <option value="Poland">🇵🇱 Poland</option>
//     <option value="South Africa">🇿🇦 South Africa</option>
//     <option value="Singapore">🇸🇬 Singapore</option>
//     <option value="Spain">🇪🇸 Spain</option>
//     <option value="Switzerland">🇨🇭 Switzerland</option>
//     <option value="United Kingdom">🇬🇧 United Kingdom</option>
//     <option value="United States">🇺🇸 United States</option>
//   {/* </optgroup> */}

//   {/* 🌐 Jooble Supported Countries */}
//   {/* <optgroup label="🌍 Jooble Supported Countries"> */}
//     <option value="Argentina">🇦🇷 Argentina</option>
//     <option value="Bangladesh">🇧🇩 Bangladesh</option>
//     <option value="Chile">🇨🇱 Chile</option>
//     <option value="Colombia">🇨🇴 Colombia</option>
//     <option value="Czech Republic">🇨🇿 Czech Republic</option>
//     <option value="Denmark">🇩🇰 Denmark</option>
//     <option value="Egypt">🇪🇬 Egypt</option>
//     <option value="Finland">🇫🇮 Finland</option>
//     <option value="Greece">🇬🇷 Greece</option>
//     <option value="Hong Kong">🇭🇰 Hong Kong</option>
//     <option value="Hungary">🇭🇺 Hungary</option>
//     <option value="Indonesia">🇮🇩 Indonesia</option>
//     <option value="Ireland">🇮🇪 Ireland</option>
//     <option value="Japan">🇯🇵 Japan</option>
//     <option value="Kenya">🇰🇪 Kenya</option>
//     <option value="Malaysia">🇲🇾 Malaysia</option>
//     <option value="Mexico">🇲🇽 Mexico</option>
//     <option value="Morocco">🇲🇦 Morocco</option>
//     <option value="Nigeria">🇳🇬 Nigeria</option>
//     <option value="Norway">🇳🇴 Norway</option>
//     <option value="Pakistan">🇵🇰 Pakistan</option>
//     <option value="Peru">🇵🇪 Peru</option>
//     <option value="Philippines">🇵🇭 Philippines</option>
//     <option value="Portugal">🇵🇹 Portugal</option>
//     <option value="Romania">🇷🇴 Romania</option>
//     <option value="South Korea">🇰🇷 South Korea</option>
//     <option value="Sweden">🇸🇪 Sweden</option>
//     <option value="Thailand">🇹🇭 Thailand</option>
//     <option value="Turkey">🇹🇷 Turkey</option>
//     <option value="Ukraine">🇺🇦 Ukraine</option>
//     <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
//     <option value="United Kingdom">🇬🇧 United Kingdom</option>
//     <option value="United States">🇺🇸 United States</option>
//     <option value="Vietnam">🇻🇳 Vietnam</option>
//   {/* </optgroup> */}

//   {/* Major Global Cities */}
//   <optgroup label="🌏 Major Cities">
//     <option value="London">🇬🇧 London</option>
//     <option value="New York">🇺🇸 New York</option>
//     <option value="Toronto">🇨🇦 Toronto</option>
//     <option value="Sydney">🇦🇺 Sydney</option>
//     <option value="Berlin">🇩🇪 Berlin</option>
//     <option value="Paris">🇫🇷 Paris</option>
//     <option value="Singapore City">🇸🇬 Singapore City</option>
//     <option value="Mumbai">🇮🇳 Mumbai</option>
//     <option value="Lahore">🇵🇰 Lahore</option>
//     <option value="Karachi">🇵🇰 Karachi</option>
//   </optgroup>

//   <option value="Remote">🌐 Remote</option>
// </select>

//               </div>

//               <Button
//                 type="submit"
//                 className="btn-hero h-12 px-8 font-semibold flex items-center justify-center"
//                 disabled={isFetching}
//               >
//                 {isFetching ? (
//                   <>
//                     <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Target className="mr-2 w-5 h-5" /> Search Jobs
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>

//           {/* ===== Filtering Stats Banner ===== */}
//           {filteringStats && !isFetching && jobs.length > 0 && (
//             <div 
//               className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-4 mb-6"
//               style={{
//                 background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.08) 100%)",
//                 border: "1px solid rgba(59,130,246,0.2)",
//               }}
//             >
//               <div className="flex items-center justify-between flex-wrap gap-2">
//                 <div className="flex items-center gap-2">
//                   <Target className="h-5 w-5 text-blue-600" />
//                   <p className="text-sm font-semibold text-foreground">
//                     Smart Filter: {filteringStats.raw_fetched} jobs → {filteringStats.final_filtered} best matches
//                   </p>
//                 </div>
//                 <p className="text-xs text-gray-600">
//                   Filtered for: "<span className="font-semibold text-primary">{filteringStats.keywords_searched}</span>" in{" "}
//                   <span className="font-semibold text-primary">{filteringStats.region_searched}</span>
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* ===== Job Results ===== */}
//           {isLoading || isFetching ? (
//             <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm py-24 text-center">
//               <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary mb-4" />
//               <p className="text-lg font-semibold text-foreground">🎯 Real-time search in progress...</p>
//               <p className="text-sm text-muted-foreground mt-2">
//                 Finding <span className="font-medium text-primary">{keywords}</span> jobs in{" "}
//                 <span className="font-medium text-primary">{region}</span>
//               </p>
//             </div>
//           ) : isError ? (
//             <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-8 text-center" style={{ border: "2px solid rgba(239, 68, 68, 0.3)", background: "rgba(254, 242, 242, 0.8)" }}>
//               <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
//               <p className="text-lg font-semibold text-red-800">
//                 ❌ {(error as Error)?.message || "Something went wrong"}
//               </p>
//               <Button
//                 onClick={() => refetch()}
//                 variant="outline"
//                 className="mt-4 btn-hero"
//               >
//                 Try Again
//               </Button>
//             </div>
//           ) : jobs && jobs.length > 0 ? (
//             <>
//               <div 
//                 className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-4 mb-6"
//                 style={{
//                   background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.08) 100%)",
//                   border: "1px solid rgba(16,185,129,0.2)",
//                 }}
//               >
//                 <p className="text-sm font-semibold text-foreground">
//                   ✅ Found <span className="text-green-600 text-lg font-bold">{jobs.length}</span>{" "}
//                   <span className="text-primary font-bold">{keywords}</span> jobs in{" "}
//                   <span className="text-primary font-bold">{region}</span>
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 {jobs.map((job) => (
//                   <div
//                     key={job.id}
//                     onClick={() => openJobModal(job)}
//                     className="cursor-pointer hover:scale-[1.01] transition-all duration-200"
//                   >
//                     <JobCard
//                       title={job.title}
//                       company={job.company || "Company not specified"}
//                       location={job.location || "Location not specified"}
//                       matchPercentage={job.relevance_score || job.score || 85}
//                       postedDate={job.source?.toUpperCase() || "VERIFIED"}
//                       salary={job.salary || null}
//                     />
//                   </div>
//                 ))}
//               </div>

//               <JobModal job={selectedJob} isOpen={isModalOpen} onClose={closeJobModal} />
//             </>
//           ) : (
//             <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm py-20 text-center">
//               <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
//               <p className="text-lg font-semibold text-foreground mb-2">
//                 No jobs found for <span className="text-primary">{keywords}</span> in{" "}
//                 <span className="text-primary">{region}</span>
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 Try different keywords or select another location
//               </p>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default JobSearch;
// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Sidebar } from "@/components/layout/Sidebar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { JobCard } from "@/components/ui/job-card";
// import { Search, Filter, Loader2, Zap, TrendingUp } from "lucide-react";
// import api from "@/lib/api";
// import "../App.css";
// import "@/index.css";
// import { toast } from "sonner";
// import { JobModal } from "@/components/ui/JobModal";
// import { supabase } from "@/lib/supabaseClient";

// import { useNavigate } from "react-router-dom";

// // =====================================
// // Types
// // =====================================
// interface Job {
//   id: string;
//   title: string;
//   company?: string;
//   location?: string;
//   snippet?: string;
//   url?: string;
//   salary_min?: number;
//   salary_max?: number;
//   score: number;
//   source: string;
//   salary?: string;
// }

// interface JobSearchResponse {
//   jobs: Job[];
//   remaining_credits: number;
//   plan: string;
//   trial_ends_at?: string;
//   source: string;
//   total: number;
// }

// // =====================================
// // Component
// // =====================================
// const JobSearch = () => {
//   const [keywords, setKeywords] = useState("frontend developer");
//   const [region, setRegion] = useState("United Arab Emirates");
//   const [page, setPage] = useState(1);
//   const [userPlan, setUserPlan] = useState<string | null>(
//     localStorage.getItem("plan")
//   );
//   const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
//     localStorage.getItem("trial_ends_at")
//   );
//   const [remainingCredits, setRemainingCredits] = useState<number>(
//     Number(localStorage.getItem("remaining_credits") || 0)
//   );
//   const [creditsDeducted, setCreditsDeducted] = useState<number>(0);
//   const [showCreditDeduction, setShowCreditDeduction] = useState(false);
//   const cv_id = localStorage.getItem("current_cv_id");

//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const navigate = useNavigate();

//   const openJobModal = (job: Job) => {
//     setSelectedJob(job);
//     setIsModalOpen(true);
//   };

//   const closeJobModal = () => {
//     setSelectedJob(null);
//     setIsModalOpen(false);
//   };

//   // =====================================
//   // Fetch Jobs with Optimized Speed
//   // =====================================
//   const fetchJobs = async (): Promise<Job[]> => {
//     const startTime = Date.now();
//     const previousCredits = remainingCredits;

//     const body: any = {
//       keywords,
//       region,
//     };

//     try {
//       // ⚡ Optimized: Set timeout to 10 seconds for faster response
//       const response = await api.post<JobSearchResponse>(
//         "/v1/jobs/search-simple",
//         body,
//         { timeout: 10000 }
//       );
//       const data = response.data;

//       const fetchTime = ((Date.now() - startTime) / 1000).toFixed(2);
//       console.log(`⚡ Fetched ${data.total} jobs in ${fetchTime}s from ${data.source}`);

//       // --- Normalize plan ---
//       const planData =
//         typeof data.plan === "object"
//           ? data.plan
//           : {
//               tier: data.plan || "free_trial",
//               creditsTotal: 100,
//               creditsUsed: 0,
//               dailyCap: 100,
//               usedToday: 0,
//             };

//       const remaining = data.remaining_credits ?? planData.creditsTotal - planData.creditsUsed;

//       // 🎯 Calculate credits deducted
//       const deducted = Math.max(0, previousCredits - remaining);
//       setCreditsDeducted(deducted);
//       setShowCreditDeduction(true);

//       // Hide deduction animation after 3 seconds
//       setTimeout(() => setShowCreditDeduction(false), 3000);

//       // ✅ Update LocalStorage
//       localStorage.setItem("remaining_credits", remaining.toString());
//       localStorage.setItem("plan", JSON.stringify(planData));
//       if (data.trial_ends_at) localStorage.setItem("trial_ends_at", data.trial_ends_at);

//       const unifiedCredit = {
//         tier: planData.tier,
//         creditsTotal: planData.creditsTotal,
//         creditsUsed: planData.creditsUsed,
//         dailyCap: planData.dailyCap || 100,
//         usedToday: planData.usedToday || 0,
//         renewsAt: data.trial_ends_at || planData.renewsAt || null,
//       };
//       localStorage.setItem("credit_info", JSON.stringify(unifiedCredit));

//       // ✅ Update React state immediately
//       setRemainingCredits(remaining);
//       setUserPlan(planData.tier);

//       // ✅ Show credit deduction notification
//       if (deducted > 0) {
//         toast.success(
//           `✅ Search complete! ${deducted} credit${deducted > 1 ? "s" : ""} used. ${remaining} remaining.`,
//           { duration: 3000 }
//         );
//       } else {
//         toast.success(`✅ Found ${data.total} jobs!`);
//       }

//       // 🔁 Refresh Supabase credits (non-blocking)
//       refreshSupabaseCredits();

//       return Array.isArray(data.jobs) ? data.jobs : [];
//     } catch (error: any) {
//       if (error.response) {
//         const status = error.response.status;
//         if (status === 404) {
//           toast.error(`No jobs found for "${keywords}" in ${region}. Try different keywords.`);
//           return [];
//         }
//         if (status === 400) {
//           toast.error("Please select a valid region.");
//           return [];
//         }
//         if (status === 403 || status === 429) {
//           toast.error("Out of credits! Purchase more to continue searching.");
//           return [];
//         }
//         console.error("API Error:", error.response.data);
//         toast.error(error.response.data?.detail || "Failed to fetch jobs");
//       } else {
//         console.error("Network Error:", error.message);
//         toast.error("Network error. Please try again.");
//       }
//       return [];
//     }
//   };

//   // =====================================
//   // Refresh Supabase Credits (Async)
//   // =====================================
//   const refreshSupabaseCredits = async () => {
//     try {
//       const user = (await supabase.auth.getUser()).data?.user;
//       if (!user) return;

//       const { data } = await supabase
//         .from("profiles")
//         .select("credits")
//         .eq("id", user.id)
//         .single();

//       if (data?.credits !== undefined) {
//         localStorage.setItem("remaining_credits", data.credits.toString());
//         setRemainingCredits(data.credits);
//         console.log("🔄 Supabase credits refreshed:", data.credits);
//       }
//     } catch (err) {
//       console.error("❌ Error refreshing Supabase credits:", err);
//     }
//   };

//   // =====================================
//   // React Query Hook (Optimized)
//   // =====================================
//   const {
//     data: jobs = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//     isFetching,
//   } = useQuery({
//     queryKey: ["jobs", keywords, region, page],
//     queryFn: fetchJobs,
//     enabled: false,
//     retry: 1,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000, // Cache for 10 minutes
//   });

//   // =====================================
//   // Handle Search
//   // =====================================
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!keywords.trim()) {
//       toast.error("Please enter search keywords");
//       return;
//     }
//     if (!region.trim()) {
//       toast.error("Please select a location");
//       return;
//     }
//     refetch();
//   };

//   const [planName, setPlanName] = useState("Free Trial");

//   useEffect(() => {
//     const planRaw = localStorage.getItem("plan");

//     if (planRaw) {
//       try {
//         const parsed = JSON.parse(planRaw);
//         setPlanName(
//           parsed.tier?.toUpperCase?.() || parsed.plan?.toUpperCase?.() || "FREE TRIAL"
//         );
//       } catch {
//         setPlanName("FREE TRIAL");
//       }
//     } else {
//       setPlanName("FREE TRIAL");
//     }
//   }, [remainingCredits, userPlan]);

//   const applyToJob = async (job: Job) => {
//     navigate(job.url)
//   }

//   // =====================================
//   // Trial Countdown
//   // =====================================
//   const [daysLeft, setDaysLeft] = useState<number | null>(null);
//   useEffect(() => {
//     if (trialEndsAt) {
//       const end = new Date(trialEndsAt).getTime();
//       const now = Date.now();
//       const diffDays = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
//       setDaysLeft(diffDays);
//     }
//   }, [trialEndsAt]);

//   // =====================================
//   // Fetch Real Credits from Supabase on Mount
//   // =====================================
//   useEffect(() => {
//     const fetchUserCredits = async () => {
//       try {
//         const user = (await supabase.auth.getUser()).data?.user;
//         if (!user) {
//           console.warn("⚠️ No user logged in, skipping Supabase credits fetch.");
//           return;
//         }

//         const { data, error } = await supabase
//           .from("profiles")
//           .select("credits, plan, trial_ends_at")
//           .eq("id", user.id)
//           .single();

//         if (error) throw error;

//         const supaCredits = data?.credits ?? 0;
//         const supaPlan = data?.plan ?? "free_trial";
//         const trialEnds = data?.trial_ends_at ?? null;

//         // 🧠 Sync Supabase credits with localStorage
//         localStorage.setItem("remaining_credits", supaCredits.toString());
//         localStorage.setItem("plan", JSON.stringify({ tier: supaPlan }));
//         if (trialEnds) localStorage.setItem("trial_ends_at", trialEnds);

//         setRemainingCredits(supaCredits);
//         setUserPlan(supaPlan);
//         setTrialEndsAt(trialEnds);

//         console.log("✅ Synced credits from Supabase:", supaCredits);
//       } catch (err) {
//         console.error("❌ Error fetching Supabase credits:", err);
//       }
//     };

//     fetchUserCredits();
//   }, []);

//   // Determine credit cost per search
//   const creditCostPerSearch = planName === "FREE TRIAL" ? 5 : 1;

//   // =====================================
//   // UI Rendering
//   // =====================================
//   return (
//     <div className="flex min-h-screen bg-gradient-hero">
//       <Sidebar />

//       <main className="flex-1 p-6 md:p-8">
//         <div className="max-w-6xl mx-auto">
//           {/* ===== Header ===== */}
//           <div className="mb-8">
//             <div className="flex items-center gap-3 mb-3">
//               <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
//                 <Search className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold">Global Job Search</h1>
//                 <p className="text-muted-foreground text-sm mt-0.5">
//                   AI-powered job matching across the globe
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* ===== Plan & Credits Info (Old Theme) ===== */}
//           <div
//             className="bg-white border border-[#f2f2f2] rounded-md shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4"
//             style={{
//               border: "1px solid rgba(124,58,237,0.2)",
//               background: "rgba(255,255,255,0.9)",
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(124,58,237,0.12)",
//             }}
//           >
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
//               <div className="flex flex-wrap items-center gap-2.5">
//                 <span 
//                   className="btn-hero inline-flex items-center gap-1.5"
//                   style={{
//                     color: "#fff",
//                     borderRadius: "999px",
//                     padding: "6px 14px",
//                     fontWeight: 700,
//                     fontSize: "0.8rem",
//                   }}
//                 >
//                   <Zap className="h-3.5 w-3.5" />
//                   {planName.replace("_", " ")}
//                 </span>

//                 {daysLeft !== null && planName === "FREE TRIAL" && (
//                   <span
//                     className="btn-hero inline-flex items-center gap-1.5"
//                     style={{
//                       color: "white",
//                       border: "1px solid rgba(192,38,211,0.25)",
//                       borderRadius: "999px",
//                       padding: "5px 12px",
//                       fontWeight: 700,
//                       fontSize: "0.78rem",
//                     }}
//                   >
//                     ⏳ {daysLeft}d left
//                   </span>
//                 )}

//                 <div className="relative inline-block">
//                   <span
//                     className="btn-hero inline-flex items-center gap-1.5"
//                     style={{
//                       color: "white",
//                       borderRadius: "999px",
//                       padding: "5px 12px",
//                       fontWeight: 700,
//                       fontSize: "0.78rem",
//                     }}
//                   >
//                     💰 {remainingCredits} credits
//                   </span>
                  
//                   {/* Real-time Credit Deduction Animation */}
//                   {showCreditDeduction && creditsDeducted > 0 && (
//                     <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-bounce z-10">
//                       -{creditsDeducted} 💸
//                     </span>
//                   )}
//                 </div>

//                 {cv_id && (
//                   <span
//                     className="btn-hero inline-flex items-center gap-1.5"
//                     style={{
//                       color: "white",
//                       borderRadius: "999px",
//                       padding: "5px 12px",
//                       fontWeight: 700,
//                       fontSize: "0.78rem",
//                     }}
//                   >
//                     ✅ CV Linked
//                   </span>
//                 )}
//               </div>

//               <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#7c3aed" }}>
//                 <TrendingUp className="h-4 w-4" />
//                 <span>
//                   {creditCostPerSearch} credit{creditCostPerSearch > 1 ? "s" : ""}/search
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* ===== Search Bar (Old Theme) ===== */}
//           <form onSubmit={handleSearch} className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-6 mb-8">
//             <div className="flex gap-4 flex-col sm:flex-row">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                 <Input
//                   placeholder="Search jobs by title, keyword..."
//                   value={keywords}
//                   onChange={(e) => setKeywords(e.target.value)}
//                   className="pl-12 h-12"
//                 />
//               </div>
//               <div className="w-full sm:w-80">
//                 <select
//                   value={region}
//                   onChange={(e) => setRegion(e.target.value)}
//                   className="w-full h-12 border border-gray-300 rounded-md px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
//                 >
//                   <option value="">🌍 Select Location</option>

//                   {/* === GULF COUNTRIES & CITIES === */}
//                   <optgroup label="🏝️ Gulf Countries & Cities">
//                     <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
//                     <option value="Dubai">Dubai</option>
//                     <option value="Abu Dhabi">Abu Dhabi</option>
//                     <option value="Sharjah">Sharjah</option>
//                     <option value="Ajman">Ajman</option>
//                     <option value="Ras Al Khaimah">Ras Al Khaimah</option>
//                     <option value="Fujairah">Fujairah</option>
//                     <option value="Al Ain">Al Ain</option>
//                     <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
//                     <option value="Riyadh">Riyadh</option>
//                     <option value="Jeddah">Jeddah</option>
//                     <option value="Mecca">Mecca</option>
//                     <option value="Medina">Medina</option>
//                     <option value="Dammam">Dammam</option>
//                     <option value="Kuwait">🇰🇼 Kuwait</option>
//                     <option value="Kuwait City">Kuwait City</option>
//                     <option value="Qatar">🇶🇦 Qatar</option>
//                     <option value="Doha">Doha</option>
//                     <option value="Bahrain">🇧🇭 Bahrain</option>
//                     <option value="Manama">Manama</option>
//                     <option value="Oman">🇴🇲 Oman</option>
//                     <option value="Muscat">Muscat</option>
//                   </optgroup>

//                   {/* === ALL COUNTRIES (A-Z) === */}
//                   <optgroup label="🌍 All Countries">
//                     <option value="Afghanistan">🇦🇫 Afghanistan</option>
//                     <option value="Albania">🇦🇱 Albania</option>
//                     <option value="Algeria">🇩🇿 Algeria</option>
//                     <option value="Andorra">🇦🇩 Andorra</option>
//                     <option value="Angola">🇦🇴 Angola</option>
//                     <option value="Argentina">🇦🇷 Argentina</option>
//                     <option value="Armenia">🇦🇲 Armenia</option>
//                     <option value="Australia">🇦🇺 Australia</option>
//                     <option value="Austria">🇦🇹 Austria</option>
//                     <option value="Azerbaijan">🇦🇿 Azerbaijan</option>
//                     <option value="Bangladesh">🇧🇩 Bangladesh</option>
//                     <option value="Belarus">🇧🇾 Belarus</option>
//                     <option value="Belgium">🇧🇪 Belgium</option>
//                     <option value="Belize">🇧🇿 Belize</option>
//                     <option value="Bolivia">🇧🇴 Bolivia</option>
//                     <option value="Bosnia and Herzegovina">🇧🇦 Bosnia and Herzegovina</option>
//                     <option value="Botswana">🇧🇼 Botswana</option>
//                     <option value="Brazil">🇧🇷 Brazil</option>
//                     <option value="Brunei">🇧🇳 Brunei</option>
//                     <option value="Bulgaria">🇧🇬 Bulgaria</option>
//                     <option value="Cambodia">🇰🇭 Cambodia</option>
//                     <option value="Cameroon">🇨🇲 Cameroon</option>
//                     <option value="Canada">🇨🇦 Canada</option>
//                     <option value="Chile">🇨🇱 Chile</option>
//                     <option value="China">🇨🇳 China</option>
//                     <option value="Colombia">🇨🇴 Colombia</option>
//                     <option value="Costa Rica">🇨🇷 Costa Rica</option>
//                     <option value="Croatia">🇭🇷 Croatia</option>
//                     <option value="Cuba">🇨🇺 Cuba</option>
//                     <option value="Cyprus">🇨🇾 Cyprus</option>
//                     <option value="Czech Republic">🇨🇿 Czech Republic</option>
//                     <option value="Denmark">🇩🇰 Denmark</option>
//                     <option value="Dominican Republic">🇩🇴 Dominican Republic</option>
//                     <option value="Ecuador">🇪🇨 Ecuador</option>
//                     <option value="Egypt">🇪🇬 Egypt</option>
//                     <option value="El Salvador">🇸🇻 El Salvador</option>
//                     <option value="Estonia">🇪🇪 Estonia</option>
//                     <option value="Ethiopia">🇪🇹 Ethiopia</option>
//                     <option value="Fiji">🇫🇯 Fiji</option>
//                     <option value="Finland">🇫🇮 Finland</option>
//                     <option value="France">🇫🇷 France</option>
//                     <option value="Georgia">🇬🇪 Georgia</option>
//                     <option value="Germany">🇩🇪 Germany</option>
//                     <option value="Ghana">🇬🇭 Ghana</option>
//                     <option value="Greece">🇬🇷 Greece</option>
//                     <option value="Guatemala">🇬🇹 Guatemala</option>
//                     <option value="Honduras">🇭🇳 Honduras</option>
//                     <option value="Hong Kong">🇭🇰 Hong Kong</option>
//                     <option value="Hungary">🇭🇺 Hungary</option>
//                     <option value="Iceland">🇮🇸 Iceland</option>
//                     <option value="India">🇮🇳 India</option>
//                     <option value="Indonesia">🇮🇩 Indonesia</option>
//                     <option value="Iran">🇮🇷 Iran</option>
//                     <option value="Iraq">🇮🇶 Iraq</option>
//                     <option value="Ireland">🇮🇪 Ireland</option>
//                     <option value="Israel">🇮🇱 Israel</option>
//                     <option value="Italy">🇮🇹 Italy</option>
//                     <option value="Jamaica">🇯🇲 Jamaica</option>
//                     <option value="Japan">🇯🇵 Japan</option>
//                     <option value="Jordan">🇯🇴 Jordan</option>
//                     <option value="Kazakhstan">🇰🇿 Kazakhstan</option>
//                     <option value="Kenya">🇰🇪 Kenya</option>
//                     <option value="Latvia">🇱🇻 Latvia</option>
//                     <option value="Lebanon">🇱🇧 Lebanon</option>
//                     <option value="Libya">🇱🇾 Libya</option>
//                     <option value="Lithuania">🇱🇹 Lithuania</option>
//                     <option value="Luxembourg">🇱🇺 Luxembourg</option>
//                     <option value="Malaysia">🇲🇾 Malaysia</option>
//                     <option value="Maldives">🇲🇻 Maldives</option>
//                     <option value="Malta">🇲🇹 Malta</option>
//                     <option value="Mexico">🇲🇽 Mexico</option>
//                     <option value="Moldova">🇲🇩 Moldova</option>
//                     <option value="Monaco">🇲🇨 Monaco</option>
//                     <option value="Mongolia">🇲🇳 Mongolia</option>
//                     <option value="Montenegro">🇲🇪 Montenegro</option>
//                     <option value="Morocco">🇲🇦 Morocco</option>
//                     <option value="Myanmar">🇲🇲 Myanmar</option>
//                     <option value="Nepal">🇳🇵 Nepal</option>
//                     <option value="Netherlands">🇳🇱 Netherlands</option>
//                     <option value="New Zealand">🇳🇿 New Zealand</option>
//                     <option value="Nicaragua">🇳🇮 Nicaragua</option>
//                     <option value="Nigeria">🇳🇬 Nigeria</option>
//                     <option value="North Macedonia">🇲🇰 North Macedonia</option>
//                     <option value="Norway">🇳🇴 Norway</option>
//                     <option value="Pakistan">🇵🇰 Pakistan</option>
//                     <option value="Palestine">🇵🇸 Palestine</option>
//                     <option value="Panama">🇵🇦 Panama</option>
//                     <option value="Paraguay">🇵🇾 Paraguay</option>
//                     <option value="Peru">🇵🇪 Peru</option>
//                     <option value="Philippines">🇵🇭 Philippines</option>
//                     <option value="Poland">🇵🇱 Poland</option>
//                     <option value="Portugal">🇵🇹 Portugal</option>
//                     <option value="Romania">🇷🇴 Romania</option>
//                     <option value="Russia">🇷🇺 Russia</option>
//                     <option value="Rwanda">🇷🇼 Rwanda</option>
//                     <option value="Serbia">🇷🇸 Serbia</option>
//                     <option value="Singapore">🇸🇬 Singapore</option>
//                     <option value="Slovakia">🇸🇰 Slovakia</option>
//                     <option value="Slovenia">🇸🇮 Slovenia</option>
//                     <option value="South Africa">🇿🇦 South Africa</option>
//                     <option value="South Korea">🇰🇷 South Korea</option>
//                     <option value="Spain">🇪🇸 Spain</option>
//                     <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
//                     <option value="Sudan">🇸🇩 Sudan</option>
//                     <option value="Sweden">🇸🇪 Sweden</option>
//                     <option value="Switzerland">🇨🇭 Switzerland</option>
//                     <option value="Syria">🇸🇾 Syria</option>
//                     <option value="Taiwan">🇹🇼 Taiwan</option>
//                     <option value="Tanzania">🇹🇿 Tanzania</option>
//                     <option value="Thailand">🇹🇭 Thailand</option>
//                     <option value="Tunisia">🇹🇳 Tunisia</option>
//                     <option value="Turkey">🇹🇷 Turkey</option>
//                     <option value="Uganda">🇺🇬 Uganda</option>
//                     <option value="Ukraine">🇺🇦 Ukraine</option>
//                     <option value="United Kingdom">🇬🇧 United Kingdom</option>
//                     <option value="United States">🇺🇸 United States</option>
//                     <option value="Uruguay">🇺🇾 Uruguay</option>
//                     <option value="Uzbekistan">🇺🇿 Uzbekistan</option>
//                     <option value="Venezuela">🇻🇪 Venezuela</option>
//                     <option value="Vietnam">🇻🇳 Vietnam</option>
//                     <option value="Yemen">🇾🇪 Yemen</option>
//                     <option value="Zambia">🇿🇲 Zambia</option>
//                     <option value="Zimbabwe">🇿🇼 Zimbabwe</option>
//                   </optgroup>

//                   {/* === MAJOR CITIES === */}
//                   <optgroup label="Major Cities">
//                     <option value="London">🇬🇧 London</option>
//                     <option value="Manchester">🇬🇧 Manchester</option>
//                     <option value="Birmingham">🇬🇧 Birmingham</option>
//                     <option value="New York">🇺🇸 New York</option>
//                     <option value="San Francisco">🇺🇸 San Francisco</option>
//                     <option value="Los Angeles">🇺🇸 Los Angeles</option>
//                     <option value="Chicago">🇺🇸 Chicago</option>
//                     <option value="Boston">🇺🇸 Boston</option>
//                     <option value="Austin">🇺🇸 Austin</option>
//                     <option value="Seattle">🇺🇸 Seattle</option>
//                     <option value="Toronto">🇨🇦 Toronto</option>
//                     <option value="Vancouver">🇨🇦 Vancouver</option>
//                     <option value="Montreal">🇨🇦 Montreal</option>
//                     <option value="Sydney">🇦🇺 Sydney</option>
//                     <option value="Melbourne">🇦🇺 Melbourne</option>
//                     <option value="Singapore">🇸🇬 Singapore</option>
//                     <option value="Tokyo">🇯🇵 Tokyo</option>
//                     <option value="Berlin">🇩🇪 Berlin</option>
//                     <option value="Munich">🇩🇪 Munich</option>
//                     <option value="Paris">🇫🇷 Paris</option>
//                     <option value="Amsterdam">🇳🇱 Amsterdam</option>
//                     <option value="Barcelona">🇪🇸 Barcelona</option>
//                     <option value="Madrid">🇪🇸 Madrid</option>
//                   </optgroup>

//                   <option value="Remote">🌐 Remote</option>
//                 </select>
//               </div>

//               <Button
//                 type="submit"
//                 className="btn-hero h-12 px-8 font-semibold flex items-center justify-center"
//                 disabled={isFetching}
//               >
//                 {isFetching ? (
//                   <>
//                     <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Filter className="mr-2 w-5 h-5" /> Search Jobs
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>

//           {/* ===== Job Results (Old Theme) ===== */}
//           {isLoading || isFetching ? (
//             <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm py-24 text-center">
//               <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary mb-4" />
//               <p className="text-lg font-semibold text-foreground">Searching jobs...</p>
//               <p className="text-sm text-muted-foreground mt-2">
//                 Finding opportunities in <span className="font-medium text-primary">{region}</span>
//               </p>
//             </div>
//           ) : isError ? (
//             <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-8 text-center" style={{ border: "2px solid rgba(239, 68, 68, 0.3)", background: "rgba(254, 242, 242, 0.8)" }}>
//               <p className="text-lg font-semibold text-red-800">
//                 ❌ {(error as Error)?.message || "Something went wrong"}
//               </p>
//               <Button
//                 onClick={() => refetch()}
//                 variant="outline"
//                 className="mt-4 btn-hero"
//               >
//                 Try Again
//               </Button>
//             </div>
//           ) : jobs && jobs.length > 0 ? (
//             <>
//               <div 
//                 className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-4 mb-6"
//                 style={{
//                   background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(192,38,211,0.08) 100%)",
//                   border: "1px solid rgba(124,58,237,0.15)",
//                 }}
//               >
//                 <p className="text-sm font-semibold text-foreground">
//                   Found <span className="text-primary text-lg font-bold">{jobs.length}</span> opportunities in{" "}
//                   <span className="text-primary font-bold">{region}</span>
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 {jobs.map((job) => (
//                   <div
//                     key={job.id}
//                     onClick={() => openJobModal(job)}
//                     className="cursor-pointer hover:scale-[1.01] transition-all duration-200"
//                   >
//                     <JobCard
//                       title={job.title}
//                       company={job.company || "Company not specified"}
//                       location={job.location || "Location not specified"}
//                       matchPercentage={Math.round(job.score || 0)}
//                       postedDate={job.source?.toUpperCase() || "JOOBLE"}
//                       salary={job.salary || null}
//                       // onApply={() => applyToJob(job)}                      
//                     />
//                   </div>
//                 ))}
//               </div>

//               <JobModal job={selectedJob} isOpen={isModalOpen} onClose={closeJobModal} />

//               {jobs.length >= 20 && (
//                 <div className="mt-8 text-center">
//                   <Button
//                     variant="outline"
//                     className="btn-hero font-semibold h-12 px-8"
//                     onClick={() => {
//                       setPage(page + 1);
//                       refetch();
//                     }}
//                     disabled={isFetching}
//                   >
//                     {isFetching ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Loading...
//                       </>
//                     ) : (
//                       "Load More Jobs"
//                     )}
//                   </Button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm py-20 text-center">
//               <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
//               <p className="text-lg font-semibold text-foreground mb-2">
//                 No jobs found in <span className="text-primary">{region}</span>
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 Try different keywords or select another location
//               </p>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default JobSearch;

// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Sidebar } from "@/components/layout/Sidebar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { JobCard } from "@/components/ui/job-card";
// import { Search, Filter, Loader2 } from "lucide-react";
// import api from "@/lib/api";
// import "../App.css";
// import "@/index.css";
// import { toast } from "sonner";
// import { JobModal } from "@/components/ui/JobModal";
// import { supabase } from "@/lib/supabaseClient";


// // =====================================
// // Types
// // =====================================
// interface Job {
//   id: string;
//   title: string;
//   company?: string;
//   location?: string;
//   snippet?: string;
//   url?: string;
//   salary_min?: number;
//   salary_max?: number;
//   score: number;
//   source: string;
// }

// interface JobSearchResponse {
//   jobs: Job[];
//   remaining_credits: number;
//   plan: string;
//   trial_ends_at?: string;
//   source: string;
//   total: number;
// }

// // =====================================
// // Component
// // =====================================
// const JobSearch = () => {
//   const [keywords, setKeywords] = useState("frontend developer");
//   const [region, setRegion] = useState("United Arab Emirates");
//   const [page, setPage] = useState(1);
//   const [userPlan, setUserPlan] = useState<string | null>(
//     localStorage.getItem("plan")
//   );
//   const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
//     localStorage.getItem("trial_ends_at")
//   );
//   const [remainingCredits, setRemainingCredits] = useState<number>(
//     Number(localStorage.getItem("remaining_credits") || 0)
//   );
//   const cv_id = localStorage.getItem("current_cv_id");

//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const openJobModal = (job: Job) => {
//     setSelectedJob(job);
//     setIsModalOpen(true);
//   };

//   const closeJobModal = () => {
//     setSelectedJob(null);
//     setIsModalOpen(false);
//   };

//   // =====================================
//   // Fetch Jobs (Simple Search - No Auth Required)
//   // =====================================
//   // =====================================
//   // Fetch Jobs (Simple Search - Fixed Credits Sync)
//   // =====================================
//   const fetchJobs = async (): Promise<Job[]> => {
//     const body: any = {
//       keywords,
//       region,
//     };

//     try {
//       const response = await api.post<JobSearchResponse>("/v1/jobs/search-simple", body);
//       const data = response.data;

//       console.log(`✅ Fetched ${data.total} jobs from ${data.source}`);
//       console.log("🪙 Backend returned credits:", data.remaining_credits, "Plan:", data.plan);

//       // --- Normalize plan (string or object) ---
//       const planData =
//         typeof data.plan === "object"
//           ? data.plan
//           : {
//             tier: data.plan || "free_trial",
//             creditsTotal: 100,
//             creditsUsed: 0,
//             dailyCap: 100,
//             usedToday: 0,
//           };

//       // --- Compute remaining credits properly ---
//       const remaining = data.remaining_credits ?? (planData.creditsTotal - planData.creditsUsed);

//       // ✅ Update LocalStorage Safely
//       localStorage.setItem("remaining_credits", remaining.toString());
//       localStorage.setItem("plan", JSON.stringify(planData));
//       if (data.trial_ends_at) localStorage.setItem("trial_ends_at", data.trial_ends_at);

//       const unifiedCredit = {
//         tier: planData.tier,
//         creditsTotal: planData.creditsTotal,
//         creditsUsed: planData.creditsUsed,
//         dailyCap: planData.dailyCap || 100,
//         usedToday: planData.usedToday || 0,
//         renewsAt: data.trial_ends_at || planData.renewsAt || null,
//       };
//       localStorage.setItem("credit_info", JSON.stringify(unifiedCredit));

//       // ✅ Update React state immediately
//       setRemainingCredits(remaining);
//       setUserPlan(planData.tier);

//       // ✅ (Optional) Toast confirmation
//       toast.success(`💰 ${remaining} credits left`);

//       console.log("💾 LocalStorage synced:", {
//         remaining,
//         planData,
//         unifiedCredit,
//       });
//       // 🔁 Refresh Supabase credits after job fetch (success path)
//       const refreshCredits = async () => {
//         const user = (await supabase.auth.getUser()).data?.user;
//         if (!user) return;
//         const { data } = await supabase
//           .from("profiles")
//           .select("credits")
//           .eq("id", user.id)
//           .single();
//         if (data?.credits !== undefined) {
//           localStorage.setItem("remaining_credits", data.credits.toString());
//           setRemainingCredits(data.credits);
//           console.log("🔄 Supabase credits refreshed:", data.credits);
//         }
//       };
//       await refreshCredits();

//       return Array.isArray(data.jobs) ? data.jobs : [];
//     } catch (error: any) {
//       if (error.response) {
//         const status = error.response.status;
//         if (status === 404) {
//           toast.error(`No jobs found for "${keywords}" in ${region}. Try different keywords.`);
//           return [];
//         }
//         if (status === 400) {
//           toast.error("Please select a valid region.");
//           return [];
//         }
//         console.error("API Error:", error.response.data);
//         toast.error(error.response.data?.detail || "Failed to fetch jobs");
//       } else {
//         console.error("Network Error:", error.message);
//         toast.error("Network error. Please try again.");
//       }
//       // 🔁 Refresh Supabase credits after job fetch


//       return [];
//     }
//   };


//   // =====================================
//   // React Query Hook
//   // =====================================
//   const {
//     data: jobs = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//     isFetching,
//   } = useQuery({
//     queryKey: ["jobs", keywords, region, page],
//     queryFn: fetchJobs,
//     enabled: false,
//     retry: 1,
//     staleTime: 5 * 60 * 1000,
//   });

//   // =====================================
//   // Handle Search
//   // =====================================
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!keywords.trim()) {
//       toast.error("Please enter search keywords");
//       return;
//     }
//     if (!region.trim()) {
//       toast.error("Please select a location");
//       return;
//     }
//     refetch();
//   };

//   const [planName, setPlanName] = useState("Free Trial");
//   const [credits, setCredits] = useState(0);

//   useEffect(() => {
//     const planRaw = localStorage.getItem("plan");
//     const rem = localStorage.getItem("remaining_credits");

//     if (planRaw) {
//       try {
//         const parsed = JSON.parse(planRaw);
//         setPlanName(
//           parsed.tier?.toUpperCase?.() ||
//           parsed.plan?.toUpperCase?.() ||
//           "FREE TRIAL"
//         );
//       } catch {
//         setPlanName("FREE TRIAL");
//       }
//     } else {
//       setPlanName("FREE TRIAL");
//     }

//     // ✅ Update credits dynamically if Supabase updated
//     if (rem) {
//       setCredits(parseInt(rem, 10));
//     } else {
//       setCredits(0);
//     }
//   }, [remainingCredits, userPlan]);


//   // =====================================
//   // Trial Countdown
//   // =====================================
//   const [daysLeft, setDaysLeft] = useState<number | null>(null);
//   useEffect(() => {
//     if (trialEndsAt) {
//       const end = new Date(trialEndsAt).getTime();
//       const now = Date.now();
//       const diffDays = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
//       setDaysLeft(diffDays);
//     }
//   }, [trialEndsAt]);
//   // =====================================
//   // Fetch Real Credits from Supabase
//   // =====================================
//   useEffect(() => {
//     const fetchUserCredits = async () => {
//       try {
//         const user = (await supabase.auth.getUser()).data?.user;
//         if (!user) {
//           console.warn("⚠️ No user logged in, skipping Supabase credits fetch.");
//           return;
//         }

//         const { data, error } = await supabase
//           .from("profiles")
//           .select("credits, plan, trial_ends_at")
//           .eq("id", user.id)
//           .single();

//         if (error) throw error;

//         const supaCredits = data?.credits ?? 0;
//         const supaPlan = data?.plan ?? "free_trial";
//         const trialEnds = data?.trial_ends_at ?? null;

//         // 🧠 Sync Supabase credits with localStorage
//         localStorage.setItem("remaining_credits", supaCredits.toString());
//         localStorage.setItem("plan", JSON.stringify({ tier: supaPlan }));
//         if (trialEnds) localStorage.setItem("trial_ends_at", trialEnds);

//         setRemainingCredits(supaCredits);
//         setUserPlan(supaPlan);
//         setTrialEndsAt(trialEnds);

//         console.log("✅ Synced credits from Supabase:", supaCredits);
//       } catch (err) {
//         console.error("❌ Error fetching Supabase credits:", err);
//       }
//     };

//     fetchUserCredits();
//   }, []);

//   // =====================================
//   // UI Rendering
//   // =====================================
//   return (
//     <div className="flex min-h-screen bg-gradient-hero">
//       <Sidebar />

//       <main className="flex-1 p-8">
//         <div className="max-w-6xl mx-auto">
//           {/* ===== Header ===== */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold mb-2">Global Job Search</h1>
//             <p className="text-muted-foreground">
//               Search jobs worldwide with AI-powered matching
//             </p>
//           </div>
//           {/* ===== Compact Plan & Credits Info ===== */}
//           <div
//             className="bg-white border border-[#f2f2f2] rounded-md shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3"
//             style={{
//               border: "1px solid rgba(124,58,237,0.18)",
//               background: "rgba(255,255,255,0.85)",
//               borderRadius: "14px",
//               boxShadow: "0 8px 20px rgba(124,58,237,0.10)",
//             }}
//           >
//             <div className="flex flex-wrap items-center gap-2 text-sm ">
//               <span
//                 className="btn-hero"
//                 style={{
//                   color: "#fff",
//                   borderRadius: "999px",
//                   padding: "4px 10px",
//                   fontWeight: 600,
//                   fontSize: "0.8rem",
//                 }}
//               >
//                 {planName ? planName.replace("_", " ").toUpperCase() : "FREE TRIAL"}
//               </span>

//               {daysLeft !== null && planName === "FREE TRIAL" && (
//                 <span
//                   className="btn-hero"
//                   style={{
//                     color: "white",
//                     border: "1px solid rgba(192,38,211,0.25)",
//                     borderRadius: "999px",
//                     padding: "3px 9px",
//                     fontWeight: 600,
//                     fontSize: "0.78rem",
//                   }}
//                 >
//                   ⏳ {daysLeft}d left
//                 </span>
//               )}

//               <span
//                 className="btn-hero"
//                 style={{

//                   color: "white",
//                   borderRadius: "999px",
//                   padding: "3px 9px",
//                   fontWeight: 600,
//                   fontSize: "0.78rem",
//                 }}
//               >
//                 💰 {remainingCredits} credits
//               </span>

//               {cv_id && (
//                 <span
//                   className="btn-hero"
//                   style={{
//                     color: "white",
//                     borderRadius: "999px",
//                     padding: "3px 9px",
//                     fontWeight: 600,
//                     fontSize: "0.78rem",
//                   }}
//                 >
//                   ✅ CV Linked
//                 </span>
//               )}
//             </div>

//             <div className="text-xs text-slate-600 text-right">
//               <span>Keep searching to unlock more matches</span>
//             </div>
//           </div>

//           {/* ===== Search Bar ===== */}
//           <form onSubmit={handleSearch} className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-6 mb-8">
//             <div className="flex gap-4 flex-col sm:flex-row">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                 <Input
//                   placeholder="Search jobs by title, keyword..."
//                   value={keywords}
//                   onChange={(e) => setKeywords(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <div className="w-full sm:w-72">
//                 <select
//                   value={region}
//                   onChange={(e) => setRegion(e.target.value)}
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="">🌍 Select Location</option>

//                   {/* === GULF COUNTRIES & CITIES === */}
//                   <optgroup label="🏝️ Gulf Countries & Cities">
//                     <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
//                     <option value="Dubai">Dubai</option>
//                     <option value="Abu Dhabi">Abu Dhabi</option>
//                     <option value="Sharjah">Sharjah</option>
//                     <option value="Ajman">Ajman</option>
//                     <option value="Ras Al Khaimah">Ras Al Khaimah</option>
//                     <option value="Fujairah">Fujairah</option>
//                     <option value="Al Ain">Al Ain</option>
//                     <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
//                     <option value="Riyadh">Riyadh</option>
//                     <option value="Jeddah">Jeddah</option>
//                     <option value="Mecca">Mecca</option>
//                     <option value="Medina">Medina</option>
//                     <option value="Dammam">Dammam</option>
//                     <option value="Kuwait">🇰🇼 Kuwait</option>
//                     <option value="Kuwait City">Kuwait City</option>
//                     <option value="Qatar">🇶🇦 Qatar</option>
//                     <option value="Doha">Doha</option>
//                     <option value="Bahrain">🇧🇭 Bahrain</option>
//                     <option value="Manama">Manama</option>
//                     <option value="Oman">🇴🇲 Oman</option>
//                     <option value="Muscat">Muscat</option>
//                   </optgroup>

//                   {/* === ALL COUNTRIES (A-Z) === */}
//                   <optgroup label="🌍 All Countries">
//                     <option value="Afghanistan">🇦🇫 Afghanistan</option>
//                     <option value="Albania">🇦🇱 Albania</option>
//                     <option value="Algeria">🇩🇿 Algeria</option>
//                     <option value="Andorra">🇦🇩 Andorra</option>
//                     <option value="Angola">🇦🇴 Angola</option>
//                     <option value="Argentina">🇦🇷 Argentina</option>
//                     <option value="Armenia">🇦🇲 Armenia</option>
//                     <option value="Australia">🇦🇺 Australia</option>
//                     <option value="Austria">🇦🇹 Austria</option>
//                     <option value="Azerbaijan">🇦🇿 Azerbaijan</option>
//                     <option value="Bangladesh">🇧🇩 Bangladesh</option>
//                     <option value="Belarus">🇧🇾 Belarus</option>
//                     <option value="Belgium">🇧🇪 Belgium</option>
//                     <option value="Belize">🇧🇿 Belize</option>
//                     <option value="Bolivia">🇧🇴 Bolivia</option>
//                     <option value="Bosnia and Herzegovina">🇧🇦 Bosnia and Herzegovina</option>
//                     <option value="Botswana">🇧🇼 Botswana</option>
//                     <option value="Brazil">🇧🇷 Brazil</option>
//                     <option value="Brunei">🇧🇳 Brunei</option>
//                     <option value="Bulgaria">🇧🇬 Bulgaria</option>
//                     <option value="Cambodia">🇰🇭 Cambodia</option>
//                     <option value="Cameroon">🇨🇲 Cameroon</option>
//                     <option value="Canada">🇨🇦 Canada</option>
//                     <option value="Chile">🇨🇱 Chile</option>
//                     <option value="China">🇨🇳 China</option>
//                     <option value="Colombia">🇨🇴 Colombia</option>
//                     <option value="Costa Rica">🇨🇷 Costa Rica</option>
//                     <option value="Croatia">🇭🇷 Croatia</option>
//                     <option value="Cuba">🇨🇺 Cuba</option>
//                     <option value="Cyprus">🇨🇾 Cyprus</option>
//                     <option value="Czech Republic">🇨🇿 Czech Republic</option>
//                     <option value="Denmark">🇩🇰 Denmark</option>
//                     <option value="Dominican Republic">🇩🇴 Dominican Republic</option>
//                     <option value="Ecuador">🇪🇨 Ecuador</option>
//                     <option value="Egypt">🇪🇬 Egypt</option>
//                     <option value="El Salvador">🇸🇻 El Salvador</option>
//                     <option value="Estonia">🇪🇪 Estonia</option>
//                     <option value="Ethiopia">🇪🇹 Ethiopia</option>
//                     <option value="Fiji">🇫🇯 Fiji</option>
//                     <option value="Finland">🇫🇮 Finland</option>
//                     <option value="France">🇫🇷 France</option>
//                     <option value="Georgia">🇬🇪 Georgia</option>
//                     <option value="Germany">🇩🇪 Germany</option>
//                     <option value="Ghana">🇬🇭 Ghana</option>
//                     <option value="Greece">🇬🇷 Greece</option>
//                     <option value="Guatemala">🇬🇹 Guatemala</option>
//                     <option value="Honduras">🇭🇳 Honduras</option>
//                     <option value="Hong Kong">🇭🇰 Hong Kong</option>
//                     <option value="Hungary">🇭🇺 Hungary</option>
//                     <option value="Iceland">🇮🇸 Iceland</option>
//                     <option value="India">🇮🇳 India</option>
//                     <option value="Indonesia">🇮🇩 Indonesia</option>
//                     <option value="Iran">🇮🇷 Iran</option>
//                     <option value="Iraq">🇮🇶 Iraq</option>
//                     <option value="Ireland">🇮🇪 Ireland</option>
//                     <option value="Israel">🇮🇱 Israel</option>
//                     <option value="Italy">🇮🇹 Italy</option>
//                     <option value="Jamaica">🇯🇲 Jamaica</option>
//                     <option value="Japan">🇯🇵 Japan</option>
//                     <option value="Jordan">🇯🇴 Jordan</option>
//                     <option value="Kazakhstan">🇰🇿 Kazakhstan</option>
//                     <option value="Kenya">🇰🇪 Kenya</option>
//                     <option value="Latvia">🇱🇻 Latvia</option>
//                     <option value="Lebanon">🇱🇧 Lebanon</option>
//                     <option value="Libya">🇱🇾 Libya</option>
//                     <option value="Lithuania">🇱🇹 Lithuania</option>
//                     <option value="Luxembourg">🇱🇺 Luxembourg</option>
//                     <option value="Malaysia">🇲🇾 Malaysia</option>
//                     <option value="Maldives">🇲🇻 Maldives</option>
//                     <option value="Malta">🇲🇹 Malta</option>
//                     <option value="Mexico">🇲🇽 Mexico</option>
//                     <option value="Moldova">🇲🇩 Moldova</option>
//                     <option value="Monaco">🇲🇨 Monaco</option>
//                     <option value="Mongolia">🇲🇳 Mongolia</option>
//                     <option value="Montenegro">🇲🇪 Montenegro</option>
//                     <option value="Morocco">🇲🇦 Morocco</option>
//                     <option value="Myanmar">🇲🇲 Myanmar</option>
//                     <option value="Nepal">🇳🇵 Nepal</option>
//                     <option value="Netherlands">🇳🇱 Netherlands</option>
//                     <option value="New Zealand">🇳🇿 New Zealand</option>
//                     <option value="Nicaragua">🇳🇮 Nicaragua</option>
//                     <option value="Nigeria">🇳🇬 Nigeria</option>
//                     <option value="North Macedonia">🇲🇰 North Macedonia</option>
//                     <option value="Norway">🇳🇴 Norway</option>
//                     <option value="Pakistan">🇵🇰 Pakistan</option>
//                     <option value="Palestine">🇵🇸 Palestine</option>
//                     <option value="Panama">🇵🇦 Panama</option>
//                     <option value="Paraguay">🇵🇾 Paraguay</option>
//                     <option value="Peru">🇵🇪 Peru</option>
//                     <option value="Philippines">🇵🇭 Philippines</option>
//                     <option value="Poland">🇵🇱 Poland</option>
//                     <option value="Portugal">🇵🇹 Portugal</option>
//                     <option value="Romania">🇷🇴 Romania</option>
//                     <option value="Russia">🇷🇺 Russia</option>
//                     <option value="Rwanda">🇷🇼 Rwanda</option>
//                     <option value="Serbia">🇷🇸 Serbia</option>
//                     <option value="Singapore">🇸🇬 Singapore</option>
//                     <option value="Slovakia">🇸🇰 Slovakia</option>
//                     <option value="Slovenia">🇸🇮 Slovenia</option>
//                     <option value="South Africa">🇿🇦 South Africa</option>
//                     <option value="South Korea">🇰🇷 South Korea</option>
//                     <option value="Spain">🇪🇸 Spain</option>
//                     <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
//                     <option value="Sudan">🇸🇩 Sudan</option>
//                     <option value="Sweden">🇸🇪 Sweden</option>
//                     <option value="Switzerland">🇨🇭 Switzerland</option>
//                     <option value="Syria">🇸🇾 Syria</option>
//                     <option value="Taiwan">🇹🇼 Taiwan</option>
//                     <option value="Tanzania">🇹🇿 Tanzania</option>
//                     <option value="Thailand">🇹🇭 Thailand</option>
//                     <option value="Tunisia">🇹🇳 Tunisia</option>
//                     <option value="Turkey">🇹🇷 Turkey</option>
//                     <option value="Uganda">🇺🇬 Uganda</option>
//                     <option value="Ukraine">🇺🇦 Ukraine</option>
//                     <option value="United Kingdom">🇬🇧 United Kingdom</option>
//                     <option value="United States">🇺🇸 United States</option>
//                     <option value="Uruguay">🇺🇾 Uruguay</option>
//                     <option value="Uzbekistan">🇺🇿 Uzbekistan</option>
//                     <option value="Venezuela">🇻🇪 Venezuela</option>
//                     <option value="Vietnam">🇻🇳 Vietnam</option>
//                     <option value="Yemen">🇾🇪 Yemen</option>
//                     <option value="Zambia">🇿🇲 Zambia</option>
//                     <option value="Zimbabwe">🇿🇼 Zimbabwe</option>
//                   </optgroup>

//                   {/* === MAJOR CITIES === */}
//                   <optgroup label="Major Cities">
//                     <option value="London">🇬🇧 London</option>
//                     <option value="Manchester">🇬🇧 Manchester</option>
//                     <option value="Birmingham">🇬🇧 Birmingham</option>
//                     <option value="New York">🇺🇸 New York</option>
//                     <option value="San Francisco">🇺🇸 San Francisco</option>
//                     <option value="Los Angeles">🇺🇸 Los Angeles</option>
//                     <option value="Chicago">🇺🇸 Chicago</option>
//                     <option value="Boston">🇺🇸 Boston</option>
//                     <option value="Austin">🇺🇸 Austin</option>
//                     <option value="Seattle">🇺🇸 Seattle</option>
//                     <option value="Toronto">🇨🇦 Toronto</option>
//                     <option value="Vancouver">🇨🇦 Vancouver</option>
//                     <option value="Montreal">🇨🇦 Montreal</option>
//                     <option value="Sydney">🇦🇺 Sydney</option>
//                     <option value="Melbourne">🇦🇺 Melbourne</option>
//                     <option value="Singapore">🇸🇬 Singapore</option>
//                     <option value="Tokyo">🇯🇵 Tokyo</option>
//                     <option value="Berlin">🇩🇪 Berlin</option>
//                     <option value="Munich">🇩🇪 Munich</option>
//                     <option value="Paris">🇫🇷 Paris</option>
//                     <option value="Amsterdam">🇳🇱 Amsterdam</option>
//                     <option value="Barcelona">🇪🇸 Barcelona</option>
//                     <option value="Madrid">🇪🇸 Madrid</option>
//                   </optgroup>

//                   <option value="Remote">🌐 Remote</option>
//                 </select>
//               </div>

//               <Button
//                 type="submit"
//                 className="btn-hero flex items-center justify-center"
//                 disabled={isFetching}
//               >
//                 {isFetching ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Filter className="mr-2 w-5 h-5" /> Search
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>

//           {/* ===== Job Results ===== */}
//           {isLoading || isFetching ? (
//             <div className="text-center py-20 text-muted-foreground">
//               <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
//               Searching jobs in <span className="font-medium">{region}</span>...
//             </div>
//           ) : isError ? (
//             <div className="text-center py-20 text-red-500">
//               ❌ Error: {(error as Error)?.message || "Something went wrong."}
//             </div>
//           ) : jobs && jobs.length > 0 ? (
//             <>
//               <p className="text-muted-foreground mb-4">
//                 Found <span className="font-semibold text-foreground">{jobs.length}</span> jobs in{" "}
//                 <span className="font-semibold text-foreground">{region}</span>
//               </p>

//               <div className="space-y-4">
//                 {jobs.map((job) => (
//                   <div
//                     key={job.id}
//                     onClick={() => openJobModal(job)}
//                     className="cursor-pointer hover:scale-[1.01] transition-transform duration-150"
//                   >
//                     <JobCard
//                       title={job.title}
//                       company={job.company || "Company not specified"}
//                       location={job.location || "Location not specified"}
//                       url={job.url}
//                     />
//                   </div>
//                 ))}
//               </div>

//               <JobModal
//                 job={selectedJob}
//                 isOpen={isModalOpen}
//                 onClose={closeJobModal}
//               />

//               {jobs.length >= 20 && (
//                 <div className="mt-6 text-center">
//                   <Button
//                     variant="outline"
//                     className="btn-hero"
//                     onClick={() => {
//                       setPage(page + 1);
//                       refetch();
//                     }}
//                     disabled={isFetching}
//                   >
//                     Load More Jobs
//                   </Button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-20 text-muted-foreground">
//               🔍 No jobs found in <span className="font-semibold">{region}</span>.
//               <br />
//               <span className="text-sm subtitle mt-2 block">
//                 Try different keywords or select a different location
//               </span>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default JobSearch;

// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Sidebar } from "@/components/layout/Sidebar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { JobCard } from "@/components/ui/job-card";
// import { Search, Filter, Loader2 } from "lucide-react";
// import api from "@/lib/api";
// import "../App.css";
// import "@/index.css";
// import { toast } from "sonner";

// // optional: import "./styles/theme.css"; // if you added the status-wrap CSS snippet
// import { JobModal } from "@/components/ui/JobModal";

// // =====================================
// // Types
// // =====================================
// interface Job {
//   id: string;
//   title: string;
//   company?: string;
//   location?: string;
//   snippet?: string;
//   url?: string;
//   salary_min?: number;
//   salary_max?: number;
//   score: number;
//   source: string;
// }

// interface JobSearchResponse {
//   jobs: Job[];
//   remaining_credits: number;
//   plan: string;
//   trial_ends_at?: string;
// }

// // =====================================
// // Component
// // =====================================
// const JobSearch = () => {
//   const [keywords, setKeywords] = useState("frontend developer");
//   const [region, setRegion] = useState("UAE");
//   const [page, setPage] = useState(1);
//   const [userPlan, setUserPlan] = useState<string | null>(
//     localStorage.getItem("plan")
//   );
//   const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
//     localStorage.getItem("trial_ends_at")
//   );
//   const [remainingCredits, setRemainingCredits] = useState<number>(
//     Number(localStorage.getItem("remaining_credits") || 0)
//   );
//   const cv_id = localStorage.getItem("current_cv_id");

//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const openJobModal = (job: Job) => {
//     setSelectedJob(job);
//     setIsModalOpen(true);
//   };

//   const closeJobModal = () => {
//     setSelectedJob(null);
//     setIsModalOpen(false);
//   };

//   // =====================================
//   // Fetch Jobs (integrated credit logic)
//   // =====================================
//   const fetchJobs = async (): Promise<Job[]> => {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       toast.error("Please login first.");
//       return [];
//     }

//     const body: any = {
//       keywords,
//       region,
//       page,
//       radius: 40,
//     };
//     if (cv_id) body.cv_id = cv_id;

//     try {
//       const response = await api.post<JobSearchResponse>("/v1/jobs/search-simple", body, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = response.data;

//       // live update credits / plan / trial
//       if (data.remaining_credits !== undefined) {
//         setRemainingCredits(data.remaining_credits);
//         localStorage.setItem("remaining_credits", String(data.remaining_credits));
//       }
//       if (data.plan) {
//         setUserPlan(data.plan);
//         localStorage.setItem("plan", data.plan);
//       }
//       if (data.trial_ends_at) {
//         setTrialEndsAt(data.trial_ends_at);
//         localStorage.setItem("trial_ends_at", data.trial_ends_at);
//       }

//       return Array.isArray(data.jobs) ? data.jobs : [];
//     } catch (error: any) {
//       if (error.response) {
//         const status = error.response.status;
//         if (status === 402) {
//           toast.error("⚠️ You've run out of credits. Please upgrade your plan to continue.");
//           window.location.href = "/plans";
//           return [];
//         }
//         if (status === 404) {
//           toast.error("CV not found. Please upload a CV first.");
//           return [];
//         }
//         if (status === 403) {
//           toast.error("Access denied. Please ensure you own this CV.");
//           return [];
//         }
//         console.error("API Error:", error.response.data);
//       } else {
//         console.error("Network Error:", error.message);
//       }
//       return [];
//     }
//   };

//   // =====================================
//   // React Query Hook
//   // =====================================
//   const {
//     data: jobs = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//     isFetching,
//   } = useQuery({
//     queryKey: ["jobs", keywords, region, page, cv_id],
//     queryFn: fetchJobs,
//     enabled: false,
//     retry: 1,
//     staleTime: 5 * 60 * 1000,
//   });

//   // =====================================
//   // Handle Search
//   // =====================================
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!keywords.trim()) {
//       toast.error("Please enter search keywords");
//       return;
//     }
//     if (!region.trim()) {
//       toast.error("Please enter a location");
//       return;
//     }
//     refetch();
//   };
//   const [planName, setPlanName] = useState("Free Trial");
//   const [credits, setCredits] = useState(0);

//   useEffect(() => {
//     try {
//       const planRaw = localStorage.getItem("plan");
//       if (planRaw) {
//         const parsed = JSON.parse(planRaw);
//         setPlanName(
//           parsed.tier?.toUpperCase?.() ||
//           parsed.plan?.toUpperCase?.() ||
//           "FREE TRIAL"
//         );
//         const remaining = localStorage.getItem("remaining_credits");
//         setCredits(remaining ? parseInt(remaining, 10) : parsed.creditsTotal ?? 0);
//       } else {
//         setPlanName("FREE TRIAL");
//         setCredits(100);
//       }
//     } catch {
//       setPlanName("FREE TRIAL");
//       setCredits(100);
//     }
//   }, []);
//   // =====================================
//   // Trial Countdown
//   // =====================================
//   const [daysLeft, setDaysLeft] = useState<number | null>(null);
//   useEffect(() => {
//     if (trialEndsAt) {
//       const end = new Date(trialEndsAt).getTime();
//       const now = Date.now();
//       const diffDays = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
//       setDaysLeft(diffDays);
//     }
//   }, [trialEndsAt]);

//   // =====================================
//   // Profile Sync on Mount
//   // =====================================
//   useEffect(() => {
//     const updateCredits = async () => {
//       const token = localStorage.getItem("access_token");
//       if (!token) return;

//       try {
//         const response = await api.get("/v1/users/profile", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.data) {
//           const d = response.data;
//           if (d.credits !== undefined) {
//             setRemainingCredits(d.credits);
//             localStorage.setItem("remaining_credits", String(d.credits));
//           }
//           if (d.plan) {
//             setUserPlan(d.plan);
//             localStorage.setItem("plan", d.plan);
//           }
//           if (d.trial_ends_at) {
//             setTrialEndsAt(d.trial_ends_at);
//             localStorage.setItem("trial_ends_at", d.trial_ends_at);
//           }
//         }
//       } catch (err) {
//         console.warn("Failed to fetch profile:", err);
//       }
//     };

//     updateCredits();
//   }, []);

//   // =====================================
//   // UI Rendering
//   // =====================================
//   return (
//     <div className="flex min-h-screen bg-gradient-hero">
//       <Sidebar />

//       <main className="flex-1 p-8">
//         <div className="max-w-6xl mx-auto">
//           {/* ===== Header ===== */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold mb-2">Job Search</h1>
//             <p className="text-muted-foreground">
//               AI-powered job search — results ranked using your CV
//             </p>
//             {cv_id && (
//               <p className="text-sm text-green-600 mt-1">✅ Using uploaded CV for better matching</p>
//             )}
//           </div>


//           {/* ===== Compact Plan & Credits Info ===== */}
//           <div
//             className="bg-white border border-[#f2f2f2] rounded-md shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3"
//             style={{
//               border: "1px solid rgba(124,58,237,0.18)",
//               background: "rgba(255,255,255,0.85)",
//               borderRadius: "14px",
//               boxShadow: "0 8px 20px rgba(124,58,237,0.10)",
//             }}
//           >
//             <div className="flex flex-wrap items-center gap-2 text-sm ">
//               <span
//                 className="btn-hero"
//                 style={{
//                   color: "#fff",
//                   borderRadius: "999px",
//                   padding: "4px 10px",
//                   fontWeight: 600,
//                   fontSize: "0.8rem",
//                 }}
//               >
//                 {planName ? planName.replace("_", " ").toUpperCase() : "FREE TRIAL"}
//               </span>

//               {daysLeft !== null && planName === "FREE TRIAL" && (
//                 <span
//                   className="btn-hero"
//                   style={{
//                     color: "white",
//                     border: "1px solid rgba(192,38,211,0.25)",
//                     borderRadius: "999px",
//                     padding: "3px 9px",
//                     fontWeight: 600,
//                     fontSize: "0.78rem",
//                   }}
//                 >
//                   ⏳ {daysLeft}d left
//                 </span>
//               )}

//               <span
//                 className="btn-hero"
//                 style={{

//                   color: "white",
//                   borderRadius: "999px",
//                   padding: "3px 9px",
//                   fontWeight: 600,
//                   fontSize: "0.78rem",
//                 }}
//               >
//                 💰 {remainingCredits} credits
//               </span>

//               {cv_id && (
//                 <span
//                   className="btn-hero"
//                   style={{
//                     color: "white",
//                     borderRadius: "999px",
//                     padding: "3px 9px",
//                     fontWeight: 600,
//                     fontSize: "0.78rem",
//                   }}
//                 >
//                   ✅ CV Linked
//                 </span>
//               )}
//             </div>

//             <div className="text-xs text-slate-600 text-right">
//               <span>Keep searching to unlock more matches</span>
//             </div>
//           </div>


//           {/* ===== Search Bar ===== */}
//           <form onSubmit={handleSearch} className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-6 mb-8">
//             <div className="flex gap-4 flex-col sm:flex-row">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                 <Input
//                   placeholder="Search jobs by title, keyword..."
//                   value={keywords}
//                   onChange={(e) => setKeywords(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <div className="w-full sm:w-64">
//                 <select
//                   value={region}
//                   onChange={(e) => setRegion(e.target.value)}
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="">🌍 Select Location</option>

//                   {/* Adzuna + Jooble Countries */}
//                   <option value="Australia">🇦🇺 Australia</option>
//                   <option value="Austria">🇦🇹 Austria</option>
//                   <option value="Belgium">🇧🇪 Belgium</option>
//                   <option value="Brazil">🇧🇷 Brazil</option>
//                   <option value="Canada">🇨🇦 Canada</option>
//                   <option value="France">🇫🇷 France</option>
//                   <option value="Germany">🇩🇪 Germany</option>
//                   <option value="India">🇮🇳 India</option>
//                   <option value="Italy">🇮🇹 Italy</option>
//                   <option value="Mexico">🇲🇽 Mexico</option>
//                   <option value="Netherlands">🇳🇱 Netherlands</option>
//                   <option value="New Zealand">🇳🇿 New Zealand</option>
//                   <option value="Poland">🇵🇱 Poland</option>
//                   <option value="South Africa">🇿🇦 South Africa</option>
//                   <option value="United Kingdom">🇬🇧 United Kingdom</option>
//                   <option value="United States">🇺🇸 United States</option>

//                   {/* Jooble Extras */}
//                   <option value="Argentina">🇦🇷 Argentina</option>
//                   <option value="Bangladesh">🇧🇩 Bangladesh</option>
//                   <option value="Chile">🇨🇱 Chile</option>
//                   <option value="China">🇨🇳 China</option>
//                   <option value="Colombia">🇨🇴 Colombia</option>
//                   <option value="Czech Republic">🇨🇿 Czech Republic</option>
//                   <option value="Denmark">🇩🇰 Denmark</option>
//                   <option value="Egypt">🇪🇬 Egypt</option>
//                   <option value="Finland">🇫🇮 Finland</option>
//                   <option value="Greece">🇬🇷 Greece</option>
//                   <option value="Hong Kong">🇭🇰 Hong Kong</option>
//                   <option value="Hungary">🇭🇺 Hungary</option>
//                   <option value="Indonesia">🇮🇩 Indonesia</option>
//                   <option value="Ireland">🇮🇪 Ireland</option>
//                   <option value="Israel">🇮🇱 Israel</option>
//                   <option value="Japan">🇯🇵 Japan</option>
//                   <option value="Kenya">🇰🇪 Kenya</option>
//                   <option value="Kuwait">🇰🇼 Kuwait</option>
//                   <option value="Malaysia">🇲🇾 Malaysia</option>
//                   <option value="Morocco">🇲🇦 Morocco</option>
//                   <option value="Nigeria">🇳🇬 Nigeria</option>
//                   <option value="Norway">🇳🇴 Norway</option>
//                   <option value="Pakistan">🇵🇰 Pakistan</option>
//                   <option value="Philippines">🇵🇭 Philippines</option>
//                   <option value="Portugal">🇵🇹 Portugal</option>
//                   <option value="Qatar">🇶🇦 Qatar</option>
//                   <option value="Romania">🇷🇴 Romania</option>
//                   <option value="Russia">🇷🇺 Russia</option>
//                   <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
//                   <option value="Serbia">🇷🇸 Serbia</option>
//                   <option value="Singapore">🇸🇬 Singapore</option>
//                   <option value="Slovakia">🇸🇰 Slovakia</option>
//                   <option value="Spain">🇪🇸 Spain</option>
//                   <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
//                   <option value="Sweden">🇸🇪 Sweden</option>
//                   <option value="Switzerland">🇨🇭 Switzerland</option>
//                   <option value="Taiwan">🇹🇼 Taiwan</option>
//                   <option value="Thailand">🇹🇭 Thailand</option>
//                   <option value="Turkey">🇹🇷 Turkey</option>
//                   <option value="Ukraine">🇺🇦 Ukraine</option>
//                   <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
//                   <option value="Uruguay">🇺🇾 Uruguay</option>
//                   <option value="Vietnam">🇻🇳 Vietnam</option>
//                   <option value="Zimbabwe">🇿🇼 Zimbabwe</option>

//                   <option value="Remote">🌐 Remote</option>
//                 </select>
//               </div>

//               <Button
//                 type="submit"
//                 className="btn-hero flex items-center justify-center"
//                 disabled={isFetching}
//               >
//                 {isFetching ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Filter className="mr-2 w-5 h-5" /> Search
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>

//           {/* ===== Job Results ===== */}
//           {isLoading || isFetching ? (
//             <div className="text-center py-20 text-muted-foreground">
//               <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
//               Searching jobs in <span className="font-medium">{region}</span>...
//             </div>
//           ) : isError ? (
//             <div className="text-center py-20 text-red-500">
//               ❌ Error: {(error as Error)?.message || "Something went wrong."}
//             </div>
//           ) : jobs && jobs.length > 0 ? (
//             <>
//               <p className="text-muted-foreground mb-4">
//                 Found <span className="font-semibold text-foreground">{jobs.length}</span> jobs{" "}
//                 {cv_id ? "matching your CV" : ""}
//               </p>

//               <div className="space-y-4">
//                 {jobs.map((job) => (
//                   <div
//                     key={job.id}
//                     onClick={() => openJobModal(job)}
//                     className="cursor-pointer hover:scale-[1.01] transition-transform duration-150"
//                   >
//                     <JobCard
//                       title={job.title}
//                       company={job.company || "Company not specified"}
//                       location={job.location || "Location not specified"}
//                       // matchPercentage={Math.round(job.score || 0)}
//                       // postedDate={job.source?.toUpperCase() || "JOOBLE"}
//                       url={job.url}
//                     />
//                   </div>
//                 ))}
//               </div>

//               {/* Add the Modal Component at the end of return */}
//               <JobModal
//                 job={selectedJob}
//                 isOpen={isModalOpen}
//                 onClose={closeJobModal}
//               />


//               {/* Pagination */}
//               {jobs.length >= 20 && (
//                 <div className="mt-6 text-center">
//                   <Button
//                     variant="outline"
//                     className="btn-hero"
//                     onClick={() => {
//                       setPage(page + 1);
//                       refetch();
//                     }}
//                     disabled={isFetching}
//                   >
//                     Load More Jobs
//                   </Button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-20 text-muted-foreground">
//               🔍 No jobs found yet. Try searching with different keywords or location.
//               <br />
//               <span className="text-sm subtitle">
//                 Example: "Frontend Developer" in "United Arab Emirates"
//               </span>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default JobSearch;


// import { useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Sidebar } from "@/components/layout/Sidebar";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { JobCard } from "@/components/ui/job-card";
// import { Search, Filter, Loader2 } from "lucide-react";
// import api from "@/lib/api";
// import "../App.css";
// import "@/index.css";

// // =====================================
// // Types
// // =====================================
// interface Job {
//   id: string;
//   title: string;
//   company?: string;
//   location?: string;
//   snippet?: string;
//   url?: string;
//   salary_min?: number;
//   salary_max?: number;
//   score: number;
//   source: string;
// }

// interface JobSearchResponse {
//   jobs: Job[];
//   remaining_credits: number;
//   plan: string;
//   trial_ends_at?: string;
// }

// // =====================================
// // Component
// // =====================================
// const JobSearch = () => {
//   const [keywords, setKeywords] = useState("frontend developer");
//   const [region, setRegion] = useState("UAE");
//   const [page, setPage] = useState(1);
//   const [userPlan, setUserPlan] = useState<string | null>(
//     localStorage.getItem("plan")
//   );
//   const [trialEndsAt, setTrialEndsAt] = useState<string | null>(
//     localStorage.getItem("trial_ends_at")
//   );
//   const [remainingCredits, setRemainingCredits] = useState<number>(
//     Number(localStorage.getItem("remaining_credits") || 0)
//   );
//   const cv_id = localStorage.getItem("current_cv_id");

//   // =====================================
//   // Fetch Jobs (integrated credit logic)
//   // =====================================
//   const fetchJobs = async (): Promise<Job[]> => {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       alert("Please login first.");
//       return [];
//     }

//     const body: any = {
//       keywords,
//       region,
//       page,
//       radius: 40,
//     };
//     if (cv_id) body.cv_id = cv_id;

//     try {
//       // ✅ Backend returns JobSearchResponse with jobs + credits
//       const response = await api.post<JobSearchResponse>(
//         "/v1/jobs/search",
//         body,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const data = response.data;

//       console.log("✅ API Response:", data);

//       // ✅ Update plan + credits + trial info in real time
//       if (data.remaining_credits !== undefined) {
//         setRemainingCredits(data.remaining_credits);
//         localStorage.setItem(
//           "remaining_credits",
//           String(data.remaining_credits)
//         );
//       }
//       if (data.plan) {
//         setUserPlan(data.plan);
//         localStorage.setItem("plan", data.plan);
//       }
//       if (data.trial_ends_at) {
//         setTrialEndsAt(data.trial_ends_at);
//         localStorage.setItem("trial_ends_at", data.trial_ends_at);
//       }

//       // ✅ Return jobs list (keeps your working code flow)
//       return Array.isArray(data.jobs) ? data.jobs : [];
//     } catch (error: any) {
//       if (error.response) {
//         const status = error.response.status;
//         if (status === 402) {
//           alert(
//             "⚠️ You've run out of credits. Please upgrade your plan to continue."
//           );
//           window.location.href = "/plans";
//           return [];
//         }
//         if (status === 404) {
//           alert("CV not found. Please upload a CV first.");
//           return [];
//         }
//         if (status === 403) {
//           alert("Access denied. Please ensure you own this CV.");
//           return [];
//         }
//         console.error("API Error:", error.response.data);
//       } else {
//         console.error("Network Error:", error.message);
//       }
//       return [];
//     }
//   };

//   // =====================================
//   // React Query Hook
//   // =====================================
//   const {
//     data: jobs = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//     isFetching,
//   } = useQuery({
//     queryKey: ["jobs", keywords, region, page, cv_id],
//     queryFn: fetchJobs,
//     enabled: false,
//     retry: 1,
//     staleTime: 5 * 60 * 1000,
//   });

//   // =====================================
//   // Handle Search
//   // =====================================
//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!keywords.trim()) {
//       alert("Please enter search keywords");
//       return;
//     }
//     if (!region.trim()) {
//       alert("Please enter a location");
//       return;
//     }
//     refetch();
//   };

//   // =====================================
//   // Trial Countdown
//   // =====================================
//   const [daysLeft, setDaysLeft] = useState<number | null>(null);
//   useEffect(() => {
//     if (trialEndsAt) {
//       const end = new Date(trialEndsAt).getTime();
//       const now = Date.now();
//       const diffDays = Math.max(
//         0,
//         Math.floor((end - now) / (1000 * 60 * 60 * 24))
//       );
//       setDaysLeft(diffDays);
//     }
//   }, [trialEndsAt]);

//   // =====================================
//   // Profile Sync on Mount
//   // =====================================
//   useEffect(() => {
//     const updateCredits = async () => {
//       const token = localStorage.getItem("access_token");
//       if (!token) return;

//       try {
//         const response = await api.get("/v1/users/profile", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.data) {
//           const d = response.data;
//           if (d.credits !== undefined) {
//             setRemainingCredits(d.credits);
//             localStorage.setItem("remaining_credits", String(d.credits));
//           }
//           if (d.plan) {
//             setUserPlan(d.plan);
//             localStorage.setItem("plan", d.plan);
//           }
//           if (d.trial_ends_at) {
//             setTrialEndsAt(d.trial_ends_at);
//             localStorage.setItem("trial_ends_at", d.trial_ends_at);
//           }
//         }
//       } catch (err) {
//         console.warn("Failed to fetch profile:", err);
//       }
//     };

//     updateCredits();
//   }, []);

//   // =====================================
//   // UI Rendering
//   // =====================================
//   return (
//     <div className="flex min-h-screen bg-gradient-hero">
//       <Sidebar />

//       <main className="flex-1 p-8">
//         <div className="max-w-6xl mx-auto">
//           {/* ===== Header ===== */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold mb-2">Job Search</h1>
//             <p className="text-muted-foreground">
//               AI-powered job search — results ranked using your CV
//             </p>
//             {cv_id && (
//               <p className="text-sm text-green-600 mt-1">
//                 ✅ Using uploaded CV for better matching
//               </p>
//             )}
//           </div>

//           {/* ===== Plan & Credits Info ===== */}
//           <div className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground">
//                 Current Plan:{" "}
//                 <span className="font-semibold  subtitle">
//                   {userPlan ? userPlan.replace("_", " ").toUpperCase() : "—"}
//                 </span>
//               </p>
//               {daysLeft !== null && userPlan === "free_trial" && (
//                 <p className="text-xs text-muted-foreground subtitle ">
//                   Trial expires in{" "}
//                   <span className="text-foreground font-medium subtitle">{daysLeft}</span>{" "}
//                   days
//                 </p>
//               )}
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">
//                 💰 Credits left:{" "}
//                 <span className="font-semibold  animate-pulse subtitle">
//                   {remainingCredits}
//                 </span>
//               </p>
//             </div>
//           </div>

//           {/* ===== Search Bar ===== */}
//           <form onSubmit={handleSearch} className="bg-white border border-[#f2f2f2] rounded-md shadow-sm p-6 mb-8">
//             <div className="flex gap-4 flex-col sm:flex-row">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
//                 <Input
//                   placeholder="Search jobs by title, keyword..."
//                   value={keywords}
//                   onChange={(e) => setKeywords(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <div className="w-full sm:w-64">
//                 <Input
//                   placeholder="Location (e.g. UAE, UK, Remote)"
//                   value={region}
//                   onChange={(e) => setRegion(e.target.value)}
//                 />
//               </div>
//               <Button
//                 type="submit"
//                 className="btn-hero flex items-center justify-center"
//                 disabled={isFetching}
//               >
//                 {isFetching ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
//                   </>
//                 ) : (
//                   <>
//                     <Filter className="mr-2 w-5 h-5" /> Search
//                   </>
//                 )}
//               </Button>
//             </div>
//           </form>

//           {/* ===== Job Results ===== */}
//           {isLoading || isFetching ? (
//             <div className="text-center py-20 text-muted-foreground">
//               <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
//               Searching jobs near{" "}
//               <span className="font-medium">{region}</span>...
//             </div>
//           ) : isError ? (
//             <div className="text-center py-20 text-red-500">
//               ❌ Error: {(error as Error)?.message || "Something went wrong."}
//             </div>
//           ) : jobs && jobs.length > 0 ? (
//             <>
//               <p className="text-muted-foreground mb-4">
//                 Found{" "}
//                 <span className="font-semibold text-foreground">
//                   {jobs.length}
//                 </span>{" "}
//                 jobs {cv_id ? "matching your CV" : ""}
//               </p>

//               <div className="space-y-4">
//                 {jobs.map((job) => (
//                   <JobCard
//                     key={job.id}
//                     title={job.title}
//                     company={job.company || "Company not specified"}
//                     location={job.location || "Location not specified"}
//                     matchPercentage={Math.round(job.score || 0)}
//                     postedDate={job.source?.toUpperCase() || "JOOBLE"}
//                     url={job.url}
//                   />
//                 ))}
//               </div>

//               {/* Pagination */}
//               {jobs.length >= 20 && (
//                 <div className="mt-6 text-center">
//                   <Button
//                     variant="outline"
//                     className="btn-hero"
//                     onClick={() => {
//                       setPage(page + 1);
//                       refetch();
//                     }}
//                     disabled={isFetching}
//                   >
//                     Load More Jobs
//                   </Button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-20 text-muted-foreground">
//               🔍 No jobs found yet. Try searching with different keywords or
//               location.
//               <br />
//               <span className="text-sm subtitle">
//                 Example: "Frontend Developer" in "United Arab Emirates"
//               </span>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default JobSearch;
