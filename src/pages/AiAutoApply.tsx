import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Filter, Search, Sparkles, Upload, Zap } from "lucide-react";
import { toast } from "sonner";
import api, { fetchCreditBalance } from "@/lib/api";
import type { CreditBalance } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAutomation } from "@/contexts/AutomationContext";
import { AutomationStatusBanner } from "@/components/AutomationStatusBanner";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { useApplicationLimits } from "@/hooks/useApplicationLimits";
import { ApplicationLimitCard } from "@/components/ui/ApplicationLimitCard";
import CardTotalIcon from "@/assets/img-homepage/card-total-icon.png";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  snippet?: string;
  score: number;
  source?: string;
  employment_type?: string;
  job_type?: string;
  posted_at?: string;
  published?: string;
}

interface CVInfo {
  id: string;
  file_name: string;
  has_parsed_data: boolean;
  needs_parsing: boolean;
  validation_status: string;
}

const COUNTRIES = [
  "Jordan",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Saudi Arabia",
  "Canada",
  "Germany",
  "France",
  "India",
  "Remote",
];



function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function matchPill(score: number) {
  if (score >= 75) return { bg: "bg-[#009605]", label: `${Math.round(score)}% Match` };
  if (score >= 40) return { bg: "bg-[#ff6900]", label: `${Math.round(score)}% Match` };
  return { bg: "bg-[#a70404]", label: `${Math.round(score)}% Match` };
}

function jobTypePill(job: Job) {
  const t = (job.employment_type || job.job_type || "").toLowerCase();
  if (t.includes("remote"))
    return { className: "bg-[#009605] text-white", text: "Remote" };
  if (t.includes("part")) return { className: "bg-[#3b82f6] text-white", text: "Part Time" };
  return { className: "bg-[#3b82f6] text-white", text: "Full Time" };
}

function sourcePill(source?: string) {
  const s = (source || "").toLowerCase();
  if (s.includes("external") || s.includes("email"))
    return { className: "bg-[#eab308] text-white", text: "External" };
  return { className: "bg-[#7e22ce] text-white", text: "Internal" };
}

/** Normalized row for Figma “AI Auto Apply history” table (frames 343:16716 / 343:16902). */
type AutomationHistoryRun = {
  id: string;
  role?: string;
  country?: string;
  max_jobs?: number;
  jobs_found?: number;
  applied_success?: number;
  started_at?: string;
  finished_at?: string;
  completed_at?: string;
  status?: string;
  selected_jobs?: Job[];
  applications?: unknown[];
};



import { useAutomationSSE } from "@/hooks/useAutomationSSE";

export default function AiAutoApply() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status: automationStatus, setRunning: setAutomationRunning, clearRunning: clearAutomationRunning } = useAutomation();
  const { daysLeft: trialDaysLeft } = useTrialCountdown();
  const { limits: applicationLimits, loading: limitsLoading, refetch: refetchLimits } = useApplicationLimits();

  const [role, setRole] = useState("");
  const [country, setCountry] = useState("Jordan");
  const [countries, setCountries] = useState<string[]>(COUNTRIES);
  const [maxJobs, setMaxJobs] = useState("50");

  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const { connect: connectSSE, disconnect: disconnectSSE } = useAutomationSSE({
    onMessage: (msg) => {
      if (msg.msg) setLogs((prev) => [...prev, msg.msg!]);
      if (msg.type === "success" || msg.type === "progress") {
        if (msg.current && msg.total) {
          setProgress(Math.round((msg.current / msg.total) * 100));
        }
      }
    },
    onComplete: () => {
      setIsCompleted(true);
      toast.success("Automation completed!");
      refetchLimits();
    },
    onError: (err) => {
      toast.error(err.msg || "Automation error");
    },
    autoConnect: true,
  });

  const [useAIScoring, setUseAIScoring] = useState(true);
  const [useLLMBoost, setUseLLMBoost] = useState(false);

  const [cvInfo, setCvInfo] = useState<CVInfo | null>(null);
  const [currentCvId, setCurrentCvId] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [applying, setApplying] = useState(false);
  const [searchPhase, setSearchPhase] = useState("");
  const [searchProgress, setSearchProgress] = useState(0);

  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState("");
  const storedPlan = readJSON<{ daysLeft?: number } | null>("plan", null);

  const [historyPage, setHistoryPage] = useState(false);
  const [historyRuns, setHistoryRuns] = useState<AutomationHistoryRun[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [histRoleFilter, setHistRoleFilter] = useState("");
  const [histCountryFilter, setHistCountryFilter] = useState("");
  const [histDateFilter, setHistDateFilter] = useState("");
  const [historyPageSize, setHistoryPageSize] = useState(15);
  const [historyPageIdx, setHistoryPageIdx] = useState(1);
  const [appliedJobsRun, setAppliedJobsRun] = useState<AutomationHistoryRun | null>(null);
  const [modalJobs, setModalJobs] = useState<Job[]>([]);
  const [modalJobsLoading, setModalJobsLoading] = useState(false);

  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);

  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // ── Fetch credits and CV on mount ──
  useEffect(() => {
    let isMounted = true;
    const initPage = async () => {
      try {
        setCreditsLoading(true);
        const data = await fetchCreditBalance();
        if (isMounted) setCredits(data);
      } catch (err) {
        console.error("Failed to load credits:", err);
        if (isMounted) {
          setCreditsError("Unable to load credit balance.");
          toast.error("Unable to load credit balance.");
        }
      } finally {
        if (isMounted) setCreditsLoading(false);
      }

      try {
        const res = await api.get("/v1/cvs/latest");
        if (isMounted && (res.data?.cv_id || res.data?.id)) {
          const cv = res.data;
          const finalId = cv.cv_id || cv.id;
          setCvInfo({
            id: finalId,
            file_name: cv.file_name || "Latest CV",
            has_parsed_data: true,
            needs_parsing: false,
            validation_status: "valid",
          });
          setCurrentCvId(finalId);
          localStorage.setItem("current_cv_id", finalId);
        }
      } catch (err) {
        console.error("Failed to fetch latest CV:", err);
      }
    };
    initPage();
    return () => { isMounted = false; };
  }, []);

  // ── Fetch automation history when history page opens ──
  useEffect(() => {
    if (!historyPage) return;
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");
        const res = await api.get("/v1/automation/history");
        setHistoryRuns(res.data.history || []);
      } catch (err) {
        console.error("Failed to load automation history:", err);
        setHistoryError("Unable to load automation history.");
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [historyPage]);

  // ── Fetch jobs for a specific history run when modal opens ──
  useEffect(() => {
    if (!appliedJobsRun) {
      setModalJobs([]);
      return;
    }
    // If the run already has inline job data, use it
    if (appliedJobsRun.selected_jobs?.length) {
      setModalJobs(appliedJobsRun.selected_jobs);
      return;
    }
    if (appliedJobsRun.applications?.length) {
      setModalJobs(
        (appliedJobsRun.applications as Record<string, unknown>[]).map((a, i) => ({
          id: String(a.id ?? i),
          title: String(a.job_title ?? a.title ?? "Job"),
          company: String(a.company_name ?? a.company ?? "—"),
          location: String(a.location ?? "—"),
          url: String(a.job_url ?? a.url ?? "#"),
          score: Number(a.score ?? a.match_score ?? 0),
          source: String(a.source ?? "internal"),
        }))
      );
      return;
    }
    // Otherwise fetch from API
    const loadRunJobs = async () => {
      try {
        setModalJobsLoading(true);
        const res = await api.get(`/v1/applied-jobs/run/${appliedJobsRun.id}`);
        setModalJobs(res.data.jobs || res.data || []);
      } catch (err) {
        console.error("Failed to load run jobs:", err);
        toast.error("Unable to load jobs for this run.");
      } finally {
        setModalJobsLoading(false);
      }
    };
    loadRunJobs();
  }, [appliedJobsRun]);

  const clearCvState = useCallback(() => {
    setCvInfo(null);
    setCurrentCvId(null);
    localStorage.removeItem("current_cv_id");
  }, []);

  const handleCvFile = async (file: File) => {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) {
      toast.error("Only PDF or DOCX files are allowed (max 8MB).");
      return;
    }
    try {
      setIsUploading(true);

      // Upload CV file to backend
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/v1/cv/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const cv_id = uploadRes.data.id || uploadRes.data.cv_id;
      localStorage.setItem("current_cv_id", cv_id);

      setIsUploading(false);
      setIsParsing(true);

      setCvInfo({
        id: cv_id,
        file_name: file.name,
        has_parsed_data: true,
        needs_parsing: false,
        validation_status: "valid",
      });
      setCurrentCvId(cv_id);
      const base = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      if (base.length > 2 && base.length < 80) {
        setRole((prev) => (prev.trim() ? prev : base));
      }
      toast.success("CV ready — continue below.");
    } catch (err) {
      console.error("CV upload failed:", err);
      toast.error("Failed to upload CV. Please try again.");
      clearCvState();
    } finally {
      setIsUploading(false);
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasReadyCv = Boolean(cvInfo && currentCvId && !cvInfo.needs_parsing);
  const needsCvProcessing = Boolean(cvInfo?.needs_parsing);
  const showUploadStep = !cvInfo || needsCvProcessing;

  const openHistory = () => {
    setHistoryPage(true);
    setHistoryPageIdx(1);
  };

  const filteredHistoryRuns = useMemo(() => {
    return historyRuns.filter((r) => {
      if (histRoleFilter.trim() && !(r.role || "").toLowerCase().includes(histRoleFilter.toLowerCase())) return false;
      if (histCountryFilter.trim() && !(r.country || "").toLowerCase().includes(histCountryFilter.toLowerCase())) return false;
      if (histDateFilter.trim()) {
        const d = r.finished_at || r.completed_at || r.started_at || "";
        if (!d || d.slice(0, 10) !== histDateFilter) return false;
      }
      return true;
    });
  }, [historyRuns, histRoleFilter, histCountryFilter, histDateFilter]);

  const historyTotalPages = Math.max(1, Math.ceil(filteredHistoryRuns.length / historyPageSize));
  const paginatedHistory = useMemo(() => {
    const start = (historyPageIdx - 1) * historyPageSize;
    return filteredHistoryRuns.slice(start, start + historyPageSize);
  }, [filteredHistoryRuns, historyPageIdx, historyPageSize]);

  const jobsForAppliedModal = modalJobs;

  const fetchJobs = async () => {
    if (!currentCvId || !cvInfo) {
      toast.error("No CV found. Please upload a CV first.");
      return;
    }
    if (cvInfo.needs_parsing) {
      toast.error("CV is still processing. Try again shortly.");
      return;
    }
    if (!role.trim() || !country) {
      toast.error("Enter job role and country.");
      return;
    }

    setLoadingJobs(true);
    setSearchProgress(10);
    setSearchPhase("Scanning job boards across the web...");

    try {
      const cvId = localStorage.getItem("current_cv_id") || currentCvId || "";
      const res = await api.post("/v1/jobs/fetch-and-score", {
        cv_id: cvId,
        keywords: role.trim(),
        location: country,
        max_results: Number(maxJobs) || 50,
        use_ai_scoring: useAIScoring,
        use_llm_boost: useLLMBoost,
      }, { timeout: 120000 }); // 2 min timeout — backend does heavy AI scoring
      const foundJobs: Job[] = res.data.jobs || [];
      setJobs(foundJobs);
      setSelectedJobIds(new Set(foundJobs.map((j) => j.id)));
      if (foundJobs.length) {
        toast.success(`Found ${foundJobs.length} job(s).`);
      }
    } catch (err) {
      console.error("Job search failed:", err);
      toast.error("Job search failed. Please try again.");
      setJobs([]);
      setSelectedJobIds(new Set());
    } finally {
      setSearchProgress(100);
      setLoadingJobs(false);
      setSearchPhase("");
      setTimeout(() => setSearchProgress(0), 400);
    }
  };

  const toggleJob = (id: string) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = jobs.length > 0 && jobs.every((j) => selectedJobIds.has(j.id));

  const toggleSelectAll = () => {
    if (allSelected) setSelectedJobIds(new Set());
    else setSelectedJobIds(new Set(jobs.map((j) => j.id)));
  };

  const startApply = async () => {
    if (selectedJobIds.size === 0) {
      toast.error("Select at least one job.");
      return;
    }
    if (automationStatus.is_running) {
      toast.error("Automation is already running.");
      return;
    }
    if (!currentCvId || !cvInfo) {
      toast.error("No valid CV.");
      return;
    }
    // Check daily application limits
    if (applicationLimits && !applicationLimits.can_proceed) {
      toast.error("Daily application limit reached. Please upgrade your plan or wait for the limit to reset.");
      return;
    }

    const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));
    setApplying(true);
    try {
      const cvId = localStorage.getItem("current_cv_id") || currentCvId || "";
      const res = await api.post("/v1/automate-job-apply", {
        cv_id: cvId,
        role: role.trim(),
        country: country,
        min_match_score: 20,
        max_jobs: 50,
        selected_jobs: selectedJobs.map((j) => j.id),
        include_internal_jobs: true,
        use_semantic: useAIScoring,
        use_llm_boost: useLLMBoost,
      });
      const runId = res.data.run_id || res.data.id;
      setAutomationRunning(runId);
      toast.success(`Started applying to ${selectedJobs.length} job(s).`);
    } catch (err) {
      console.error("Failed to start automation:", err);
      toast.error("Failed to start automation. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const creditsLeft = creditsLoading
    ? "Loading..."
    : creditsError
      ? creditsError
      : `${credits?.remaining ?? credits?.total ?? 0} Credits Left`;
  const trialLabel = storedPlan?.daysLeft ?? trialDaysLeft ?? 4;

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return jobs.slice(start, start + pageSize);
  }, [jobs, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));

  /** Yellow credits on upload step whenever not mid upload/parse (matches reference). */
  const uploadStepIdleChrome = showUploadStep && !isUploading && !isParsing;
  const uploadDropBusy = needsCvProcessing || isUploading || isParsing;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <AutomationStatusBanner />
      <div className="max-w-[1528px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {automationStatus.is_running ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Automation in Progress</h2>
                <p className="text-slate-500">Processing applications for {role || "your specified role"}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#2862eb]">{progress}%</div>
                <div className="text-xs font-bold text-slate-400 uppercase">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-gradient-to-r from-[#2862eb] to-indigo-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Console Logs */}
            <div className="bg-[#111827] rounded-xl p-6 font-mono text-[13px] text-blue-400 h-80 overflow-y-auto mb-8 border border-slate-800 shadow-inner">
              {logs.length === 0 ? (
                <div className="animate-pulse">Initializing connection to automation engine...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </div>
                ))
              )}
              {isCompleted && (
                <div className="mt-4 p-3 bg-blue-900/30 border border-blue-800 rounded text-blue-200 text-center font-bold">
                  🎉 Automation successfully completed!
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                className="h-10 border-[#f2f2f2]"
                onClick={() => {
                  clearAutomationRunning();
                  setLogs([]);
                  setProgress(0);
                  setIsCompleted(false);
                }}
              >
                {isCompleted ? "Return to Setup" : "Stop Automation"}
              </Button>
              {isCompleted && (
                <Button 
                  className="h-10 bg-[#2862eb] hover:bg-[#2862eb]/90"
                  onClick={() => setHistoryPage(true)}
                >
                  View History
                </Button>
              )}
            </div>
          </div>
        ) : historyPage ? (
          <>
            <button
              type="button"
              onClick={() => setHistoryPage(false)}
              className="flex items-center gap-2 text-sm font-medium text-[#2862eb] hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AI Auto Apply
            </button>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[35px] font-bold text-[#2862eb] leading-tight mb-1">AI Auto Apply</h1>
                <p className="text-[16px] text-[#4b5563] max-w-[725px]">
                  Review past automation searches and applications in one place.
                </p>
                <p className="text-[18px] font-semibold text-[#111827] mt-4">
                  {filteredHistoryRuns.length} previous automation run{filteredHistoryRuns.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-shrink-0 bg-white border border-[#f2f2f2] rounded-lg py-2.5 px-4 shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.08)] min-w-[200px]">
                <div className="flex items-center gap-2 font-bold text-[#111827] text-[13px]">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" strokeWidth={1.5} />
                  <span>{creditsLeft}</span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5 ml-6">
                  Trial expires in {trialLabel} days
                </p>
              </div>
            </div>

            <section className="bg-white border border-[#f2f2f2] rounded-md p-5 mb-6 shadow-sm">
              <p className="text-[18px] font-semibold text-[#111827] mb-4">Filter</p>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3">
                  <label className="text-[14px] text-[#111827] block mb-1">Role</label>
                  <Input
                    placeholder="Enter Role"
                    value={histRoleFilter}
                    onChange={(e) => {
                      setHistRoleFilter(e.target.value);
                      setHistoryPageIdx(1);
                    }}
                    className="h-10 border-[#f2f2f2] bg-white text-[13px]"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[14px] text-[#111827] block mb-1">Country</label>
                  <Input
                    placeholder="Enter country"
                    value={histCountryFilter}
                    onChange={(e) => {
                      setHistCountryFilter(e.target.value);
                      setHistoryPageIdx(1);
                    }}
                    className="h-10 border-[#f2f2f2] bg-white text-[13px]"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[14px] text-[#111827] block mb-1">Applied Date</label>
                  <Input
                    type="date"
                    value={histDateFilter}
                    onChange={(e) => {
                      setHistDateFilter(e.target.value);
                      setHistoryPageIdx(1);
                    }}
                    className="h-10 border-[#f2f2f2] bg-white text-[13px]"
                  />
                </div>
                <div className="md:col-span-3">
                  <Button
                    type="button"
                    className="w-full h-10 bg-[#2862eb] hover:bg-[#2862eb]/90 text-white gap-2"
                    onClick={() => setHistoryPageIdx(1)}
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </section>

            <div className="bg-white border border-[#f2f2f2] rounded-[10px] overflow-hidden shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-b border-[#f2f2f2]">
                <div className="flex items-center gap-2 text-[12px] text-[#4b5563]">
                  <Search className="w-4 h-4 opacity-50" />
                  <span>Search</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[#4b5563]">
                  <span>Show</span>
                  <select
                    value={historyPageSize}
                    onChange={(e) => {
                      setHistoryPageSize(Number(e.target.value));
                      setHistoryPageIdx(1);
                    }}
                    className="border border-[#f2f2f2] rounded-md px-2 py-1 bg-white"
                  >
                    {[10, 15, 25, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} Record
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                {historyLoading ? (
                  <p className="p-8 text-sm text-[#4b5563]">Loading history…</p>
                ) : historyError ? (
                  <p className="p-8 text-sm text-red-500">{historyError}</p>
                ) : paginatedHistory.length === 0 ? (
                  <p className="p-8 text-sm text-[#4b5563]">No automation runs match your filters.</p>
                ) : (
                  <table className="w-full text-left text-[14px] text-[#4b5563] min-w-[960px]">
                    <thead>
                      <tr className="border-b border-[#f2f2f2] bg-[#fafbff]">
                        <th className="px-4 py-3 font-normal">Role</th>
                        <th className="px-4 py-3 font-normal">Country</th>
                        <th className="px-4 py-3 font-normal">Max Jobs</th>
                        <th className="px-4 py-3 font-normal">Job Founds</th>
                        <th className="px-4 py-3 font-normal">Applied Successfully</th>
                        <th className="px-4 py-3 font-normal">Date</th>
                        <th className="px-4 py-3 font-normal text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedHistory.map((r) => {
                        const dt = r.finished_at || r.completed_at || r.started_at || "";
                        const dateStr = dt ? new Date(dt).toLocaleDateString() : "—";
                        return (
                          <tr key={r.id} className="border-b border-[#f2f2f2] hover:bg-[#fafafa]/80">
                            <td className="px-4 py-4">{r.role || "—"}</td>
                            <td className="px-4 py-4">{r.country || "—"}</td>
                            <td className="px-4 py-4">{r.max_jobs ?? "—"}</td>
                            <td className="px-4 py-4">{r.jobs_found ?? "—"}</td>
                            <td className="px-4 py-4">{r.applied_success ?? "—"}</td>
                            <td className="px-4 py-4">{dateStr}</td>
                            <td className="px-4 py-4 text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-[12px] border-[#f2f2f2] text-[#111827]"
                                onClick={() => setAppliedJobsRun(r)}
                              >
                                Show Jobs
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#f2f2f2] text-[12px] text-[#4b5563]">
                <span>
                  Displaying{" "}
                  {filteredHistoryRuns.length === 0
                    ? 0
                    : (historyPageIdx - 1) * historyPageSize + 1}{" "}
                  to {Math.min(historyPageIdx * historyPageSize, filteredHistoryRuns.length)} of{" "}
                  {filteredHistoryRuns.length} records
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={historyPageIdx <= 1}
                    onClick={() => setHistoryPageIdx((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <span className="w-8 h-8 rounded-full bg-[#2862eb] text-white flex items-center justify-center text-[12px] font-bold">
                    {historyPageIdx}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={historyPageIdx >= historyTotalPages}
                    onClick={() => setHistoryPageIdx((p) => Math.min(historyTotalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[35px] font-bold text-[#2862eb] leading-tight mb-1">AI Auto Apply</h1>
            <p className="text-[16px] text-[#4b5563] max-w-[640px] leading-relaxed">
              Let AI Find And Apply To Relevant Jobs Automatically Based On Your CV.
            </p>
          </div>
          <div
            className={cn(
              "flex-shrink-0 rounded-lg py-2.5 px-4 min-w-[200px]",
              uploadStepIdleChrome
                ? "bg-[#fff8e1] border border-[#fce9a8]"
                : "bg-white border border-[#f2f2f2] shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.08)]",
            )}
          >
            <div className="flex items-center gap-2 font-bold text-[#111827] text-[13px]">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" strokeWidth={1.5} />
              <span>
                {creditsLeft}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5 ml-6">
              Trial expires in {trialLabel} days
            </p>
          </div>
        </div>

        {showUploadStep && (
          <section className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <h2 className="text-[18px] font-bold text-[#111827]">Upload Your CV</h2>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md border border-[#2862eb] bg-white text-[#2862eb] text-[14px] font-normal hover:bg-blue-50/50 sm:shrink-0 shadow-none"
                onClick={openHistory}
              >
                View History
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleCvFile(f);
              }}
            />
            <div
              role="button"
              tabIndex={uploadDropBusy ? -1 : 0}
              onKeyDown={(e) => {
                if (uploadDropBusy) return;
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (uploadDropBusy) return;
                const f = e.dataTransfer.files?.[0];
                if (f) void handleCvFile(f);
              }}
              onClick={() => {
                if (!uploadDropBusy) fileInputRef.current?.click();
              }}
              className={cn(
                "w-full max-w-full sm:max-w-[90%] md:w-2/3 md:max-w-none mx-auto bg-white rounded-lg border border-[#f2f2f2] shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.08)] min-h-[calc(300px-2cm)] sm:min-h-[calc(340px-2cm)] flex flex-col items-center justify-center py-16 px-8 outline-none transition-colors",
                uploadDropBusy
                  ? "cursor-default"
                  : "cursor-pointer hover:border-[#2862eb]/25 focus-visible:ring-2 focus-visible:ring-[#2862eb]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7]",
              )}
            >
              {uploadDropBusy ? (
                <div className="flex flex-col items-center justify-center px-2" aria-busy="true" aria-label="Working on your CV">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center animate-spin">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-[#2862eb] rounded-full"
                          style={{
                            transform: `rotate(${i * 45}deg) translateY(-20px)`,
                            opacity: 1 - i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-[#111827] mb-7" strokeWidth={2} aria-hidden />
                  <p className="text-[#111827] font-bold text-[15px] mb-2 text-center leading-snug">
                    Drag &amp; Drop Your CV Or{" "}
                    <span
                      role="button"
                      tabIndex={0}
                      className="text-[#2862eb] underline decoration-1 underline-offset-[3px] hover:opacity-90 cursor-pointer font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }
                      }}
                    >
                      Choose File
                    </span>{" "}
                    To Upload
                  </p>
                  <p className="text-[#6b7280] text-[13px] font-medium text-center">
                    Supported Formats: PDF, DOCX (Max 8MB)
                  </p>
                </>
              )}
            </div>
          </section>
        )}

        {hasReadyCv && (
        <section className="relative bg-[#f5f6fd] border border-[#f2f2f2] rounded-md p-5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="text-[18px] font-semibold text-[#111827] capitalize">Automation Settings</h2>
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-md border-[#2862eb] text-[#2862eb] text-[14px] font-normal capitalize hover:bg-[#2862eb]/5 w-full sm:w-auto"
              onClick={openHistory}
            >
              View History
            </Button>
          </div>

          {/* Daily Application Limits Card */}
          {limitsLoading ? (
            <div className="animate-pulse h-20 bg-slate-100 rounded-xl mb-4" />
          ) : applicationLimits && (
            <div className="mb-4">
              <ApplicationLimitCard limits={applicationLimits} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 mb-4">
            <div className="xl:col-span-3">
              <label className="text-[14px] font-light text-[#111827] block mb-1">Job Role</label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="UX Designer Mid level"
                className="h-10 rounded-[5px] border-[#f2f2f2] bg-white text-[12px] placeholder:text-[#111827]/50"
              />
            </div>
            <div className="xl:col-span-3">
              <label className="text-[14px] font-light text-[#111827] block mb-1">Country</label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-10 rounded-[5px] border border-[#f2f2f2] bg-white text-[12px] px-3 appearance-none text-[#111827]"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#111827]/40 text-[10px]">
                  ▼
                </span>
              </div>
            </div>
            <div className="xl:col-span-3">
              <label className="text-[14px] font-light text-[#111827] block mb-1">Max Jobs (1-50)</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={maxJobs}
                onChange={(e) => setMaxJobs(e.target.value)}
                className="h-10 rounded-[5px] border-[#f2f2f2] bg-white text-[12px]"
              />
            </div>
            <div className="xl:col-span-3 flex items-end">
              <Button
                type="button"
                className="w-full h-10 rounded-md bg-[#2862eb] hover:bg-[#2862eb]/90 text-white text-[14px] font-normal capitalize gap-2"
                onClick={fetchJobs}
                disabled={loadingJobs}
              >
                <Search className="w-4 h-4" />
                Find Jobs
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#f2f2f2]/80">
            <p className="text-[14px] font-medium text-[#111827] capitalize">AI Scoring Options</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={useAIScoring} onCheckedChange={(v) => setUseAIScoring(v === true)} className="h-2.5 w-2.5 rounded-[1px] border-[#2862eb] data-[state=checked]:bg-[#2862eb]" />
              <span className="text-[12px] text-[#111827] capitalize">
                Use AI-powered semantic matching (recommended for better results)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={useLLMBoost} onCheckedChange={(v) => setUseLLMBoost(v === true)} className="h-2.5 w-2.5 rounded-[1px] border-[#d8d8d8] data-[state=checked]:bg-[#2862eb]" />
              <span className="text-[12px] text-[#111827] capitalize">
                Enable LLM boost for edge cases (slower but more thorough)
              </span>
            </label>
          </div>

          {loadingJobs && (
            <div className="mt-6 rounded-md border border-[#f2f2f2] bg-white p-6">
              <p className="text-center text-[14px] text-[#111827] mb-1">{searchPhase}</p>
              <p className="text-center text-[12px] text-[#4b5563] mb-4">This may take a moment while we search multiple boards.</p>
              <div className="h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2862eb] transition-all duration-300 rounded-full"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>
            </div>
          )}
        </section>
        )}

        {hasReadyCv && jobs.length > 0 && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-6">
                <h2 className="text-[18px] font-semibold text-[#111827] capitalize">{jobs.length} jobs found</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    className="h-2.5 w-2.5 rounded-[1px] border-[#d8d8d8]"
                  />
                  <span className="text-[12px] text-[#111827] capitalize">Select All</span>
                </label>
              </div>
              <Button
                type="button"
                className={cn(
                  "h-10 rounded-md px-8 text-[14px] font-normal capitalize gap-2 text-white border-[#2862eb]",
                  selectedJobIds.size === 0 || automationStatus.is_running || applying || (applicationLimits && !applicationLimits.can_proceed)
                    ? "opacity-50 bg-[#2862eb] cursor-not-allowed"
                    : "bg-[#2862eb] hover:bg-[#2862eb]/90"
                )}
                disabled={selectedJobIds.size === 0 || automationStatus.is_running || applying || (applicationLimits && !applicationLimits.can_proceed)}
                onClick={startApply}
              >
                <Sparkles className="w-4 h-4" />
                {applicationLimits && !applicationLimits.can_proceed ? "Limit Reached" : "Apply with AI"}
              </Button>
            </div>

            <div className="bg-white border border-[#f2f2f2] rounded-[10px] overflow-hidden shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-b border-[#f2f2f2] bg-white">
                <Input placeholder="Search …" className="max-w-xs h-9 text-sm border-[#f2f2f2]" />
                <div className="flex items-center gap-2 text-[12px] text-[#4b5563]">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border border-[#f2f2f2] rounded-md px-2 py-1 bg-white"
                  >
                    {[10, 15, 25, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} Record
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px] text-[#4b5563] min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#f2f2f2]">
                      <th className="w-10 px-4 py-3" />
                      <th className="px-4 py-3 font-normal">Job Title</th>
                      <th className="px-4 py-3 font-normal">Company</th>
                      <th className="px-4 py-3 font-normal">Location</th>
                      <th className="px-4 py-3 font-normal">Match Score</th>
                      <th className="px-4 py-3 font-normal">Published</th>
                      <th className="px-4 py-3 font-normal">Job Type</th>
                      <th className="px-4 py-3 font-normal">Source</th>
                      <th className="px-4 py-3 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedJobs.map((job) => {
                      const m = matchPill(job.score);
                      const jt = jobTypePill(job);
                      const sp = sourcePill(job.source);
                      const pub = job.posted_at || job.published || new Date().toLocaleDateString();
                      return (
                        <tr key={job.id} className="border-b border-[#f2f2f2] hover:bg-[#fafafa]/80">
                          <td className="px-4 py-4 align-middle">
                            <Checkbox
                              checked={selectedJobIds.has(job.id)}
                              onCheckedChange={() => toggleJob(job.id)}
                              className="h-2.5 w-2.5 rounded-[1px] border-[#d8d8d8]"
                            />
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <div className="flex items-center gap-2">
                              <img src={CardTotalIcon} alt="" className="w-6 h-6 rounded object-contain opacity-90" />
                              <span>{job.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-middle">{job.company}</td>
                          <td className="px-4 py-4 align-middle">{job.location || country}</td>
                          <td className="px-4 py-4 align-middle">
                            <span className={cn("inline-flex items-center justify-center min-w-[73px] h-5 px-2 rounded-full text-[10px] text-white", m.bg)}>
                              {m.label}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-middle text-[13px]">{pub}</td>
                          <td className="px-4 py-4 align-middle">
                            <span className={cn("inline-flex items-center justify-center h-5 px-2 rounded-full text-[10px]", jt.className)}>
                              {jt.text}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <span className={cn("inline-flex items-center justify-center min-w-[56px] h-5 px-2 rounded-full text-[10px]", sp.className)}>
                              {sp.text}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-middle text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-[12px] font-semibold text-[#2862eb] border-[#2862eb]/30"
                              onClick={() => job.url && window.open(job.url, "_blank")}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#f2f2f2] text-[12px] text-[#4b5563]">
                <span>
                  Displaying {jobs.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, jobs.length)} of {jobs.length}{" "}
                  records
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <span className="w-8 h-8 rounded-full bg-[#2862eb] text-white flex items-center justify-center text-[12px] font-bold">
                    {page}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        </>
        )}

        <Dialog open={Boolean(appliedJobsRun)} onOpenChange={(open) => !open && setAppliedJobsRun(null)}>
          <DialogContent className="max-w-[min(100vw-1.5rem,1059px)] max-h-[min(100vh-2rem,90vh)] overflow-hidden flex flex-col p-0 gap-0 border-[#e5e7eb]">
            <DialogHeader className="px-6 py-4 border-b border-[#f2f2f2] space-y-0">
              <DialogTitle className="text-left text-[18px] font-semibold text-[#111827]">
                Applied Jobs — {appliedJobsRun?.role || "Run"} ({appliedJobsRun?.country || "—"})
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto flex-1 px-4 py-4">
              {appliedJobsRun &&
                modalJobsLoading && (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2862eb] border-t-transparent" />
                  </div>
                )}
              {!modalJobsLoading && jobsForAppliedModal.length === 0 ? (
                <p className="text-sm text-[#4b5563] px-2 py-6">No job rows available for this run.</p>
              ) : !modalJobsLoading && (
                <div className="overflow-x-auto rounded-lg border border-[#f2f2f2]">
                  <table className="w-full text-left text-[13px] text-[#4b5563] min-w-[800px]">
                    <thead>
                      <tr className="bg-[#fafbff] border-b border-[#f2f2f2]">
                        <th className="px-3 py-3 font-normal">Job Title</th>
                        <th className="px-3 py-3 font-normal">Company</th>
                        <th className="px-3 py-3 font-normal">Match Score</th>
                        <th className="px-3 py-3 font-normal">Published</th>
                        <th className="px-3 py-3 font-normal">Source</th>
                        <th className="px-3 py-3 font-normal">Applied Method</th>
                        <th className="px-3 py-3 font-normal">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobsForAppliedModal.map((job, idx) => {
                        const m = matchPill(job.score);
                        const sp = sourcePill(job.source);
                        const method = idx % 2 === 0 ? "Manual" : "Auto";
                        const statusLabel = idx % 3 === 0 ? "Reviewing" : "Applied";
                        const statusBg = statusLabel === "Reviewing" ? "bg-violet-100 text-violet-800" : "bg-emerald-100 text-emerald-800";
                        return (
                          <tr key={job.id} className="border-b border-[#f2f2f2] last:border-0">
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <img src={CardTotalIcon} alt="" className="w-6 h-6 rounded object-contain opacity-90" />
                                {job.title}
                              </div>
                            </td>
                            <td className="px-3 py-3">{job.company}</td>
                            <td className="px-3 py-3">
                              <span className={cn("inline-flex items-center justify-center min-w-[73px] h-5 px-2 rounded-full text-[10px] text-white", m.bg)}>
                                {m.label}
                              </span>
                            </td>
                            <td className="px-3 py-3">{new Date().toLocaleDateString()}</td>
                            <td className="px-3 py-3">
                              <span className={cn("inline-flex items-center justify-center h-5 px-2 rounded-full text-[10px]", sp.className)}>
                                {sp.text}
                              </span>
                            </td>
                            <td className="px-3 py-3">{method}</td>
                            <td className="px-3 py-3">
                              <span className={cn("inline-flex items-center justify-center h-5 px-2 rounded-full text-[10px] font-medium", statusBg)}>
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="border-t border-[#f2f2f2] px-6 py-4 flex justify-end bg-[#fafafa]">
              <Button type="button" className="min-w-[228px] h-10 bg-[#2862eb] hover:bg-[#2862eb]/90" onClick={() => setAppliedJobsRun(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
