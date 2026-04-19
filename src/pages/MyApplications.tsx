import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";

// ── Types ──────────────────────────────────────────────
type Application = {
  id: string | number;
  title: string;
  company?: string;
  status: string;
  match_score?: number | null;
  created_at?: string;
  applied_at?: string;
  source: "internal" | "external";
  job_link?: string;
  error_message?: string;
  application_url?: string;
  automation_run_id?: string;
  is_automated?: boolean;
  applied_date_formatted?: string;
  score_badge?: string;
  location?: string;
};

type Summary = {
  total: number;
  applied: number;
  pending: number;
  failed: number;
  success_rate: number;
};

// ── Helper: relative date ──────────────────────────────
const getRelativeDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Applied today";
  if (diff === 1) return "Applied 1 day ago";
  return `Applied ${diff} days ago`;
};

// ── Company logo placeholder (color per letter) ────────
const companyColors: Record<string, { bg: string; text: string }> = {
  F: { bg: "#f3e8ff", text: "#7c3aed" },
  S: { bg: "#dbeafe", text: "#2563eb" },
  G: { bg: "#fce7f3", text: "#db2777" },
  M: { bg: "#d1fae5", text: "#059669" },
  A: { bg: "#fef3c7", text: "#d97706" },
  default: { bg: "#f1f5f9", text: "#475569" },
};

const getCompanyStyle = (name?: string) => {
  const letter = (name || "?")[0].toUpperCase();
  return companyColors[letter] || companyColors.default;
};

// ── Score badge ring ───────────────────────────────────
const ScoreRing = ({ score }: { score: number | null | undefined }) => {
  if (typeof score !== "number") return null;
  const pct = Math.round(score);
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  let stroke = "#22c55e";
  if (pct < 60) stroke = "#ef4444";
  else if (pct < 80) stroke = "#f59e0b";

  return (
    <div className="relative" style={{ width: 36, height: 36 }}>
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 18 18)"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
        style={{ color: stroke }}
      >
        {pct}%
      </span>
    </div>
  );
};

// ── Stat card icons (inline SVGs for pixel-accuracy) ──
const StatIcons = {
  total: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  applied: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  ),
  pending: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  failed: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
  success: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
};

// ── Job Details Modal ──────────────────────────────────
const JobDetailsModal = ({
  app,
  onClose,
}: {
  app: Application;
  onClose: () => void;
}) => {
  const companyStyle = getCompanyStyle(app.company);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[520px] shadow-2xl relative overflow-hidden animate-modalIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-gray-900">Job Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">
          {/* Company + Title */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[16px] font-bold flex-shrink-0"
              style={{ backgroundColor: companyStyle.bg, color: companyStyle.text }}
            >
              {(app.company || "?")[0].toUpperCase()}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{app.title}</h3>
              <p className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                  </svg>
                  {app.company || "Unknown"}
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {app.location || "Jordan"}
                </span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {app.applied_date_formatted || (app.applied_at ? `Posted ${new Date(app.applied_at).toLocaleDateString()}` : "Posted 2 days ago")}
                </span>
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-500 text-white">
              {app.source === "internal" ? "Internal" : "External"}
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500 text-white">
              Full Time
            </span>
            {typeof app.match_score === "number" && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-500 text-white">
                Score: {Math.round(app.match_score)}%
              </span>
            )}
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500 text-white">
              $00$ - 1000$
            </span>
          </div>

          {/* Job Description */}
          <div className="mb-5">
            <h4 className="text-[14px] font-bold text-gray-900 mb-2">Job Description</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              *Strong UI/UX Principles *Figma Proficiency *Wireframing &amp; Prototyping *Clean, Intuitive Interface Design.
            </p>
          </div>

          {/* Required Skills */}
          <div className="mb-5">
            <h4 className="text-[14px] font-bold text-gray-900 mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {["Communication", "Adobe XD", "ux research", "design systems"].map((skill) => (
                <span
                  key={skill}
                  className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 bg-gray-50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Why This Job Matches */}
          <div className="mb-2">
            <h4 className="text-[14px] font-bold text-gray-900 mb-2">Why This Job Matches</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[13px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-gray-600">Good Skill Match ({typeof app.match_score === "number" ? Math.round(app.match_score) : 66}% Match)</span>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-gray-600">Job Location Match Your Location</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#3b5bfe] hover:bg-[#3050e8] text-white rounded-lg text-[14px] font-semibold transition-colors shadow-md shadow-blue-200"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-modalIn { animation: modalIn .25s ease-out; }
      `}</style>
    </div>
  );
};

// ── Tooltip for Success Rate ───────────────────────────
const SuccessRateTooltip = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <div
      className="absolute top-full right-0 mt-1 bg-gray-800 text-white text-[11px] rounded-lg px-3 py-2 w-[240px] z-50 shadow-lg"
      style={{ lineHeight: 1.5 }}
    >
      The percentage of applications that progressed in the hiring process, such as being shortlisted or hired.
      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-800 rotate-45" />
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ── MAIN COMPONENT ────────────────────────────────────
// ═══════════════════════════════════════════════════════
const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState("All Jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const [credits, setCredits] = useState<number>(65);
  const [daysLeft, setDaysLeft] = useState<number>(4);

  const navigate = useNavigate();

  // ── Fetch data ────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [internalRes, externalRes] = await Promise.all([
        api.get("/v1/jobseeker/applications/all"),
        api.get("/v1/applied-jobs/all"),
      ]);

      const internalApps =
        internalRes.data?.applications?.map((a: any) => ({
          id: a.id,
          title: a.companyjobs?.title || "Internal Job",
          company: a.companyjobs?.company_name || "-",
          status: a.status || "Applied",
          match_score: a.match_score || null,
          created_at: a.created_at,
          applied_at: a.created_at,
          source: "internal" as const,
          job_link: null,
          is_automated: false,
          location: a.companyjobs?.location || "",
        })) || [];

      const externalApps =
        externalRes.data?.jobs?.map((a: any) => ({
          id: a.id,
          title: a.job_title || "External Job",
          company: a.company_name || "-",
          status: a.status || "Applied",
          match_score: a.match_score || null,
          created_at: a.applied_at,
          applied_at: a.applied_at,
          source: (a.job_source || "external").toLowerCase() as "external",
          job_link: a.job_link,
          error_message: a.error_message,
          application_url: a.application_url,
          automation_run_id: a.automation_run_id,
          is_automated: a.is_automated || false,
          applied_date_formatted: a.applied_date_formatted,
          score_badge: a.score_badge,
          location: a.location || "",
        })) || [];

      const uniqueApps = Array.from(
        new Map(
          [...internalApps, ...externalApps].map((item) => [
            `${item.title}-${item.source}-${item.id}`,
            item,
          ])
        ).values()
      );

      uniqueApps.sort(
        (a, b) =>
          new Date(b.applied_at || b.created_at || "").getTime() -
          new Date(a.applied_at || a.created_at || "").getTime()
      );

      setApplications(uniqueApps);

      if (externalRes.data?.summary) {
        setSummary(externalRes.data.summary);
      } else {
        const total = uniqueApps.length;
        const applied = uniqueApps.filter((app) =>
          ["applied", "success"].includes(app.status.toLowerCase())
        ).length;
        const pending = uniqueApps.filter(
          (app) => app.status.toLowerCase() === "pending"
        ).length;
        const failed = uniqueApps.filter((app) =>
          ["failed", "rejected"].includes(app.status.toLowerCase())
        ).length;

        setSummary({
          total,
          applied,
          pending,
          failed,
          success_rate: total > 0 ? Math.round((applied / total) * 100) : 0,
        });
      }
    } catch (err) {
      console.error("Error loading applications:", err);
      setError("Unable to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const updateCreditsAndTrial = () => {
      const storedCredits = localStorage.getItem("remaining_credits");
      if (storedCredits && !isNaN(Number(storedCredits))) setCredits(Number(storedCredits));

      const trialEnds = localStorage.getItem("trial_ends_at");
      if (trialEnds) {
        const end = new Date(trialEnds).getTime();
        const now = Date.now();
        const left = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
        setDaysLeft(left);
      }
    };

    updateCreditsAndTrial();
    fetchApplications();
  }, [fetchApplications]);

  // ── Filters ─────────────────────────────────────
  const filters = ["All Jobs", "Manual", "Automation"];

  const filteredApps = applications.filter((app) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !app.title.toLowerCase().includes(q) &&
        !(app.company || "").toLowerCase().includes(q) &&
        !app.status.toLowerCase().includes(q)
      )
        return false;
    }
    // Tab filter
    if (activeFilter === "Manual") return app.is_automated === false;
    if (activeFilter === "Automation") return app.is_automated === true;
    return true; // "All Jobs"
  });

  // ── Status badge colour helper ──────────────────
  const statusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (["applied", "success"].includes(s))
      return { label: "Applied", bg: "#dcfce7", text: "#16a34a" };
    if (s === "pending")
      return { label: "Pending", bg: "#fef9c3", text: "#ca8a04" };
    if (["failed", "rejected"].includes(s))
      return { label: "Reviewing", bg: "#fee2e2", text: "#dc2626" };
    return { label: status || "Unknown", bg: "#f1f5f9", text: "#64748b" };
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">

      <main className="w-full max-w-[1300px] mx-auto px-6 py-8">
        {/* ── Header ───────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 gap-4">
          <div>
            <h1 className="text-[#3b82f6] text-[2.2rem] font-bold tracking-tight mb-1">
              My Applications
            </h1>
            <p className="text-gray-500 text-[14px] font-medium">
              Track All Your Job Applications In One Place
            </p>
          </div>

          {/* Credits */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-lg py-2 px-4 shadow-sm flex flex-col justify-center min-w-[200px]">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[13px] mb-0.5">
              <span className="text-yellow-400 text-[16px] leading-none">⚡</span>
              <span>
                <span className="text-[#3b82f6]">{credits}</span> Credits Left
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-medium ml-5">
              Trial expires in {daysLeft} days
            </div>
          </div>
        </div>

        {/* ── Stat cards ───────────────────────────── */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-7">
            {/* Total */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[12px] text-gray-400 font-medium mb-0.5">Total</p>
                <p className="text-[28px] font-bold text-gray-900 leading-none">{summary.total}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                {StatIcons.total}
              </div>
            </div>

            {/* Applied */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[12px] text-gray-400 font-medium mb-0.5">Applied</p>
                <p className="text-[28px] font-bold text-[#3b82f6] leading-none">{summary.applied}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                {StatIcons.applied}
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[12px] text-gray-400 font-medium mb-0.5">Pending</p>
                <p className="text-[28px] font-bold text-[#f59e0b] leading-none">{summary.pending}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-yellow-50 flex items-center justify-center">
                {StatIcons.pending}
              </div>
            </div>

            {/* Failed */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[12px] text-gray-400 font-medium mb-0.5">Failed</p>
                <p className="text-[28px] font-bold text-[#ef4444] leading-none">{summary.failed}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                {StatIcons.failed}
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_6px_-2px_rgba(0,0,0,0.05)] px-5 py-4 flex items-center justify-between relative col-span-2 md:col-span-1">
              <div>
                <p className="text-[12px] text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                  Success Rate{" "}
                  <span
                    className="cursor-pointer text-gray-300 hover:text-gray-500 transition-colors"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                  </span>
                </p>
                <p className="text-[28px] font-bold text-[#10b981] leading-none">{summary.success_rate}%</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                {StatIcons.success}
              </div>
              <SuccessRateTooltip show={showTooltip} />
            </div>
          </div>
        )}

        {/* ── Filters + Search row ─────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 mb-3">
              Applied Jobs ({filteredApps.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-[13px] font-medium px-4 py-1.5 rounded-full border transition-all ${
                    activeFilter === f
                      ? "bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative min-w-[260px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Jobs By Title, Company Or Status..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* ── Loading / Error ──────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-gray-500 text-[14px]">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Loading applications...
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="text-red-500 text-[14px] flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
              {error}
            </div>
            <button
              onClick={() => { setError(""); fetchApplications(); }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Job cards grid ───────────────────────── */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredApps.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-400 text-[14px]">
                <svg className="mx-auto mb-3 text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                No applications found.
              </div>
            ) : (
              filteredApps.map((app) => {
                const badge = statusBadge(app.status);
                const companyStyle = getCompanyStyle(app.company);

                return (
                  <div
                    key={`${app.source}-${app.id}`}
                    className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_8px_-3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] transition-all duration-200 flex flex-col overflow-hidden group"
                  >
                    {/* Card top: left border accent */}
                    <div className="h-[3px] bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="p-5 flex-1 flex flex-col">
                      {/* Title row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-bold flex-shrink-0"
                            style={{
                              backgroundColor: companyStyle.bg,
                              color: companyStyle.text,
                            }}
                          >
                            {(app.company || "?")[0].toUpperCase()}
                          </div>
                          <h3 className="text-[14px] font-bold text-gray-900 leading-snug">
                            {app.title}
                          </h3>
                        </div>
                        <ScoreRing score={app.match_score} />
                      </div>

                      {/* Company + Location */}
                      <p className="text-[12px] text-gray-400 font-medium mb-1.5">
                        {app.company || "-"} • {app.location || "San Francisco, CA"}
                      </p>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                        {getRelativeDate(app.applied_at || app.created_at) || "Applied 2 days ago"}
                      </div>

                      {/* Status badge */}
                      <div className="mb-4">
                        <span
                          className="text-[11px] font-semibold px-3 py-1 rounded-full inline-block"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Details button */}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="w-full py-2.5 bg-[#3b5bfe] hover:bg-[#3050e8] text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm shadow-blue-100 cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* ── Modal ──────────────────────────────────── */}
      {selectedApp && (
        <JobDetailsModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  );
};

export default MyApplications;
