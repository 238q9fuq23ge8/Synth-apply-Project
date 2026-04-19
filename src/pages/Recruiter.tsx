import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Archive,
  User,
  CreditCard,
  LogOut,
  Info,
  Search,
  MoreHorizontal,
  CalendarDays,
  UserRound,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

type MetricCard = {
  title: string;
  value: string;
  tooltip: string;
  iconBg: string;
  iconColor: string;
};

const METRIC_CARD_DEFS: { key: string; title: string; tooltip: string; iconBg: string; iconColor: string }[] = [
  { key: "total_jobs",            title: "Total Jobs",             tooltip: "Total number of job postings you have created on the platform.", iconBg: "bg-slate-100",   iconColor: "text-slate-500" },
  { key: "active_jobs",           title: "Active Jobs",            tooltip: "Job postings that are currently live and accepting applications.", iconBg: "bg-violet-100",  iconColor: "text-violet-500" },
  { key: "total_candidates",      title: "Total Candidates",       tooltip: "The total number of candidates who have applied to your job postings.", iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-500" },
  { key: "candidates_in_review",  title: "Candidates In Review",   tooltip: "Candidates currently being evaluated by your hiring pipeline.", iconBg: "bg-amber-100",   iconColor: "text-amber-600" },
  { key: "candidates_added_today",title: "Candidates Added Today", tooltip: "New candidates who entered to your open postings today.", iconBg: "bg-blue-100",    iconColor: "text-blue-500" },
  { key: "hired",                 title: "Hired",                  tooltip: "Candidates you have marked as hired through the platform.", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
];

function buildMetricCards(data: Record<string, any>): MetricCard[] {
  // Normalise field aliases the backend may return
  const d: Record<string, any> = {
    ...data,
    // aliases
    total_candidates:       data.total_candidates       ?? data.candidates          ?? data.total_applications ?? 0,
    candidates_in_review:   data.candidates_in_review   ?? data.pending             ?? data.interviews_scheduled ?? 0,
    candidates_added_today: data.candidates_added_today ?? data.last_24_hours       ?? data.new_today ?? 0,
    hired:                  data.hired                  ?? data.hired_count         ?? 0,
    total_jobs:             data.total_jobs             ?? data.jobs_count          ?? 0,
    active_jobs:            data.active_jobs            ?? data.active_jobs_count   ?? 0,
  };
  return METRIC_CARD_DEFS.map((def) => ({
    title:     def.title,
    value:     String(d[def.key] ?? 0),
    tooltip:   def.tooltip,
    iconBg:    def.iconBg,
    iconColor: def.iconColor,
  }));
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} Min Ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} Hours Ago`;
  const days = Math.floor(hrs / 24);
  return `${days} Days Ago`;
}

function Hint({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex">
      <Info className="w-3.5 h-3.5 text-[#9ca3af]" />
      <span className="pointer-events-none absolute z-40 left-1/2 -translate-x-1/2 top-[120%] hidden group-hover:block min-w-[210px] max-w-[250px] rounded-lg border border-[#e5e7eb] bg-white shadow-lg px-3 py-2 text-[11px] font-medium text-[#4b5563]">
        {text}
      </span>
    </span>
  );
}

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
        active
          ? "bg-[#eef4ff] text-[#2563eb]"
          : "text-[#374151] hover:bg-[#f3f4f6]"
      )}
    >
      <span
        className={cn(
          "w-5 h-5 rounded-full grid place-items-center",
          active ? "bg-[#2563eb] text-white" : "bg-[#eff2f8] text-[#2563eb]"
        )}
      >
        <Icon className="w-3 h-3" />
      </span>
      {label}
    </button>
  );
}

function MetricCardView({ card }: { card: MetricCard }) {
  return (
    <div className="rounded-md border border-[#f0f1f5] bg-white p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280] font-semibold">
          {card.title}
          <Hint text={card.tooltip} />
        </div>
        <span className={cn("w-7 h-7 rounded-md grid place-items-center", card.iconBg)}>
          <span className={cn("w-2.5 h-2.5 rounded-full", card.iconColor.replace("text-", "bg-"))} />
        </span>
      </div>
      <div className="text-[33px] leading-none font-semibold text-[#111827] tracking-tight">{card.value}</div>
      <div className="mt-2 text-right text-[11px] text-[#3b82f6] font-semibold">View →</div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Metrics state
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState("");

  // Jobs state
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  // Candidates state
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [candidatesError, setCandidatesError] = useState("");

  // Week chart data
  const [weekData, setWeekData] = useState<any[]>([]);
  const maxWeek = useMemo(() => (weekData.length ? Math.max(...weekData.map((d) => d.value)) : 1), [weekData]);
  const userRaw = localStorage.getItem("user");
  const userObj = userRaw ? JSON.parse(userRaw) : null;
  const authProvider = userObj?.app_metadata?.provider || userObj?.identities?.[0]?.provider || null;
  const displayName = userObj?.user_metadata?.name || userObj?.email?.split("@")[0] || "Profile";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // --- Load metrics ---
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setMetricsLoading(true);
        const res = await api.get("/v1/recruiter/analytics");
        console.log("📊 Analytics raw response:", res.data);
        setMetrics(buildMetricCards(res.data));
      } catch (err) {
        console.error("Failed to load metrics:", err);
        setMetricsError("Unable to load metrics.");
        toast.error("Failed to load dashboard metrics.");
      } finally {
        setMetricsLoading(false);
      }
    };
    loadMetrics();
  }, []);

  // --- Load jobs ---
  const loadJobs = async () => {
    try {
      setJobsLoading(true);
      const res = await api.get("/v1/recruiter/jobs");
      const allJobs = res.data?.jobs || res.data || [];
      setJobs(allJobs);

      // Derive weekData from jobs' posted dates
      const dayColors: Record<string, string> = {
        Saturday: "#14B8A6", Sunday: "#6366F1", Monday: "#F43F5E",
        Tuesday: "#F97316", Wednesday: "#38BDF8", Thursday: "#8B5CF6", Friday: "#C026D3",
      };
      const dayCounts: Record<string, number> = {};
      const now = Date.now();
      for (const j of allJobs) {
        const d = j.posted_date || j.created_at;
        if (!d) continue;
        const diff = now - new Date(d).getTime();
        if (diff <= 7 * 24 * 60 * 60 * 1000) {
          const dayName = new Date(d).toLocaleDateString("en-US", { weekday: "long" });
          dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        }
      }
      const chart = Object.entries(dayCounts).map(([day, value]) => ({
        day, value, color: dayColors[day] || "#6366F1",
      }));
      setWeekData(chart);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setJobsError("Unable to load jobs.");
      toast.error("Failed to load jobs.");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  // --- Load candidates ---
  const loadCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const res = await api.get("/v1/recruiter/jobs");
      const allJobs = res.data?.jobs || res.data || [];
      const candidateList: any[] = [];
      for (const job of allJobs.slice(0, 5)) {
        try {
          const appRes = await api.get(`/v1/recruiter/jobs/${job.id}/applications`);
          const apps = appRes.data?.applications || appRes.data || [];
          apps.forEach((app: any) => {
            candidateList.push({
              name: app.applicant_name || app.name || "Unknown",
              role: `Applied For ${job.title}`,
              score: (app.match_score || app.score) ? `${app.match_score || app.score}%` : "N/A",
              ago: timeAgo(app.applied_at || app.created_at || ""),
            });
          });
        } catch (err) {
          console.warn("Failed to load applications for job:", job.id, err);
        }
      }
      setCandidates(candidateList.slice(0, 10));
    } catch (err) {
      console.error("Failed to load candidates:", err);
      setCandidatesError("Unable to load candidates.");
      toast.error("Failed to load candidates.");
    } finally {
      setCandidatesLoading(false);
    }
  };

  useEffect(() => { loadCandidates(); }, []);

  // --- Profile modal check ---
  useEffect(() => {
    const isRecruiter = localStorage.getItem("person") === "recruiter";
    const isCompleted = localStorage.getItem("recruiter_profile_completed") === "true";
    setProfileCompleted(isCompleted);
    if (isRecruiter && !isCompleted) {
      setShowCompleteProfileModal(true);
    }
  }, []);

  return (
    <div className="bg-[#f7f8fb] min-h-screen relative">
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
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
              <SidebarItem icon={BriefcaseBusiness} label="My Jobs" onClick={() => navigate("/recruiter/my-jobs")} />
              <SidebarItem icon={Users} label="Candidates" onClick={() => navigate("/recruiter/candidates")} />
              <SidebarItem icon={Archive} label="Archived Jobs" onClick={() => navigate("/recruiter-archived-jobs")} />
              <SidebarItem icon={User} label="Profile" onClick={() => navigate("/profile")} />
              <SidebarItem icon={CreditCard} label="Upgrade plan" onClick={() => navigate("/recruiter-plans")} />
            </div>
          </div>
          <SidebarItem icon={LogOut} label="Logout" onClick={handleLogout} />
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-6 xl:px-8 py-5">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-[42px] leading-none font-bold text-[#2563eb] mb-2">Dashboard</h1>
                <p className="text-[12px] text-[#6b7280] font-medium">
                  Get A Quick Overview Of Your Hiring Activity And Recent Updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="text-[12px] font-semibold text-[#2563eb] hover:underline"
              >
                {profileCompleted ? "Profile" : "Complete Profile"}
              </button>
            </div>
            <div className="flex justify-end mb-3">
              <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280] font-medium">
                {authProvider === "google" ? <span className="text-[14px]">G</span> : <User className="w-3.5 h-3.5" />}
                <span>{displayName}</span>
                <span>|</span>
                <span>Free Account</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <section className="xl:col-span-7 rounded-lg border border-[#eceef3] bg-white p-3.5">
                {metricsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
                    <span className="ml-2 text-sm text-[#6b7280]">Loading metrics...</span>
                  </div>
                ) : metricsError ? (
                  <div className="text-center py-12 text-red-500 text-sm font-medium">{metricsError}</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {metrics.map((m) => (
                      <MetricCardView key={m.title} card={m} />
                    ))}
                  </div>
                )}
              </section>

              <section className="xl:col-span-5 rounded-lg border border-[#eceef3] bg-white p-4">
                <h3 className="text-[22px] font-semibold text-[#111827] mb-3">Applications At Last 7 Days</h3>
                {jobsLoading ? (
                  <div className="h-[270px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
                    <span className="ml-2 text-sm text-[#6b7280]">Loading chart...</span>
                  </div>
                ) : weekData.length === 0 ? (
                  <div className="h-[270px] flex items-center justify-center text-sm text-[#9ca3af]">No chart data available for the last 7 days.</div>
                ) : (
                  <div className="h-[270px] flex items-end gap-4 md:gap-5 px-2">
                    {weekData.map((d, idx) => {
                      const h = (d.value / maxWeek) * 205;
                      return (
                        <div key={d.day} className="flex-1 min-w-[46px] flex flex-col items-center justify-end">
                          <motion.div
                            initial={{ height: 0, opacity: 0.35 }}
                            animate={{ height: h, opacity: 1 }}
                            transition={{ duration: 0.75, ease: "easeOut", delay: idx * 0.08 }}
                            className="w-full rounded-sm"
                            style={{ backgroundColor: d.color }}
                          />
                          <div className="text-[10px] text-[#111827] mt-2">{d.day}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mt-4">
              <section className="xl:col-span-7 rounded-lg border border-[#eceef3] bg-white p-4">
                <h3 className="text-[27px] font-semibold text-[#111827] mb-4">Recent Jobs Performance</h3>
                {jobsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
                    <span className="ml-2 text-sm text-[#6b7280]">Loading jobs...</span>
                  </div>
                ) : jobsError ? (
                  <div className="text-center py-12 text-red-500 text-sm font-medium">{jobsError}</div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-12 text-sm text-[#9ca3af]">No jobs posted yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {jobs.slice(0, 4).map((j) => (
                      <div key={j.id} className="rounded-md border border-[#f0f1f5] p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-[18px] font-semibold text-[#111827] mb-1">{j.title}</div>
                            <div className="text-[13px] text-[#6b7280] mb-2">{j.location || "Remote"}</div>
                            <div className="text-[12px] text-[#9ca3af] flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {timeAgo(j.posted_date || j.created_at || "")}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              (j.status || "").toLowerCase() === "active" || (j.status || "").toLowerCase() === "open"
                                ? "bg-green-500 text-white"
                                : "bg-red-600 text-white"
                            )}
                          >
                            {j.status || "Active"}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-[#2563eb] text-[12px] font-semibold flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {j.applicants_count ?? j.applications_count ?? "—"}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="h-8 px-2.5 border-[#d1d5db]">
                              <MoreHorizontal className="w-4 h-4 text-[#6b7280]" />
                            </Button>
                            <Button className="h-8 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-semibold">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="xl:col-span-5 rounded-lg border border-[#eceef3] bg-white p-4">
                <h3 className="text-[27px] font-semibold text-[#111827] mb-4">Candidates Needing Action</h3>
                {candidatesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
                    <span className="ml-2 text-sm text-[#6b7280]">Loading candidates...</span>
                  </div>
                ) : candidatesError ? (
                  <div className="text-center py-12 text-red-500 text-sm font-medium">{candidatesError}</div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-12 text-sm text-[#9ca3af]">No candidates yet.</div>
                ) : (
                  <div className="space-y-2.5">
                    {candidates.map((c, idx) => (
                      <div key={`${c.name}-${idx}`} className="rounded-md border border-[#f0f1f5] p-3 flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-full bg-[#eef4ff] text-[#2563eb] grid place-items-center shrink-0">
                            <UserRound className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="text-[14px] font-semibold text-[#111827] truncate">
                              {c.name} {c.role}
                            </div>
                            <div className="text-[11px] text-[#9ca3af]">
                              Match Score: {c.score} <span className="mx-1">|</span> {c.ago}
                            </div>
                          </div>
                        </div>
                        <Button className="h-8 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-semibold">
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {showCompleteProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[470px] bg-white rounded-lg shadow-2xl border border-[#edf0f5] px-6 py-6">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("recruiter_profile_completed", "true");
                setShowCompleteProfileModal(false);
                setProfileCompleted(true);
              }}
              className="absolute right-4 top-4 text-[#6b7280] hover:text-[#111827]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-[86px] h-[86px] rounded-full bg-[#f5f8ff] border border-[#e5edff] mx-auto mb-4 grid place-items-center text-[28px]">
              👤
            </div>

            <h3 className="text-center text-[30px] leading-none font-semibold text-[#111827] mb-2">
              Complete Your Profile
            </h3>
            <p className="text-center text-[13px] text-[#6b7280] font-medium mb-5">
              To Start Posting Jobs, Please Add Your Company Name And Logo To Your Profile
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11 border-[#cfd7e3] text-[#334155] font-semibold"
                onClick={() => {
                  localStorage.setItem("recruiter_profile_completed", "true");
                  setShowCompleteProfileModal(false);
                  setProfileCompleted(true);
                }}
              >
                Cancel
              </Button>
              <Button
                className="h-11 bg-[#2b64eb] hover:bg-[#2056d2] text-white font-semibold"
                onClick={() => {
                  localStorage.setItem("recruiter_profile_completed", "true");
                  setShowCompleteProfileModal(false);
                  setProfileCompleted(true);
                  navigate("/profile");
                }}
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

