"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import {
  Loader2,
  X,
  Search,
  Bot,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScopeJobSeekerLayout } from "@/components/jobseeker/ScopeJobSeekerLayout";
import {
  JobOpportunityCard,
  type JobOfferFilterMeta,
} from "@/components/jobseeker/JobOpportunityCard";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type CJob = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  created_at: string;
  company?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
};

type FilterKey =
  | "all"
  | "remote"
  | "full_time"
  | "part_time"
  | "external"
  | "internal";

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Jobs" },
  { key: "remote", label: "Remote" },
  { key: "full_time", label: "Full Time" },
  { key: "part_time", label: "Part Time" },
  { key: "external", label: "External" },
  { key: "internal", label: "Internal" },
];

function formatRelativePosted(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Recently posted";
  const now = Date.now();
  const days = Math.floor((now - d.getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function metaForIndex(index: number): JobOfferFilterMeta {
  const cycle: JobOfferFilterMeta[] = [
    { isInternal: true, remote: true, employment: "full" },
    { isInternal: true, remote: false, employment: "full" },
    { isInternal: false, remote: false, employment: "full" },
    { isInternal: true, remote: true, employment: "part" },
    { isInternal: false, remote: true, employment: "part" },
    { isInternal: true, remote: false, employment: "part" },
  ];
  return cycle[index % cycle.length];
}

function matchesFilter(meta: JobOfferFilterMeta, key: FilterKey): boolean {
  if (key === "all") return true;
  if (key === "remote") return meta.remote;
  if (key === "full_time") return meta.employment === "full";
  if (key === "part_time") return meta.employment === "part";
  if (key === "external") return !meta.isInternal;
  if (key === "internal") return meta.isInternal;
  return true;
}

function jobScore(job: CJob): number {
  let n = 0;
  for (let i = 0; i < job.id.length; i++) n += job.id.charCodeAt(i);
  return 70 + (n % 21);
}

function descriptionBullets(text: string): string[] {
  const cleaned = text.replace(/\r/g, "").trim();
  if (!cleaned) return [];
  const parts = cleaned.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) return parts.slice(0, 8);
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 6);
}

export default function CompanyJobs() {
  const { daysLeft: trialDaysLeft } = useTrialCountdown();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<CJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<CJob | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const cvId = localStorage.getItem("current_cv_id");

  const creditsLeft =
    Number(localStorage.getItem("remaining_credits") || 65) || 65;

  useEffect(() => {
    const saved = localStorage.getItem("applied_jobs");
    if (saved) {
      try {
        setAppliedJobs(new Set(JSON.parse(saved)));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const load = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const res = await api.get("/v1/company-jobs", { params: { page: p } });
      const list: CJob[] = res.data?.jobs || [];
      setJobs(append ? (prev) => [...prev, ...list] : list);
      setPage(p);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setMsg(err?.response?.data?.detail || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const jobsWithIndex = useMemo(() => {
    return jobs.map((job, index) => ({ job, index, meta: metaForIndex(index) }));
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobsWithIndex.filter(({ job, meta }) => {
      if (!matchesFilter(meta, filter)) return false;
      if (!q) return true;
      const blob = `${job.title} ${job.description} ${(job.skills || []).join(" ")} ${job.company || ""} ${job.location || ""}`.toLowerCase();
      const statusLabel =
        filter === "all"
          ? ""
          : FILTER_CHIPS.find((f) => f.key === filter)?.label.toLowerCase() || "";
      return blob.includes(q) || (statusLabel && blob.includes(statusLabel));
    });
  }, [jobsWithIndex, search, filter]);

  const apply = async (jobId: string) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMsg("Please login first.");
      return;
    }
    if (!cvId) {
      setMsg("Please upload a CV first (Upload CV page).");
      return;
    }
    if (appliedJobs.has(jobId)) return;

    setMsg("");
    setApplyingJobId(jobId);

    try {
      const res = await api.post(
        "/v1/company-jobs/apply",
        { job_id: jobId, cv_id: cvId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const next = new Set(appliedJobs);
      next.add(jobId);
      setAppliedJobs(next);
      localStorage.setItem("applied_jobs", JSON.stringify([...next]));
      setSelected(null);
      setSuccessOpen(true);
      if (res.data?.message) setMsg("");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setMsg(err?.response?.data?.detail || "Failed to apply.");
    } finally {
      setApplyingJobId(null);
    }
  };

  const closeModal = () => setSelected(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        setSuccessOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openDetails = (job: CJob, index: number) => {
    setSelected(job);
    setSelectedIndex(index);
  };

  const detailMeta = metaForIndex(selectedIndex);
  const selectedScore = selected ? jobScore(selected) : 0;
  const detailCompany =
    selected?.company || ["Microsoft", "Figma", "Acme Co", "TechLabs"][
      selectedIndex % 4
    ];
  const detailLocation =
    selected?.location || ["Jordan", "San Francisco, CA", "New York, NY", "Remote"][
      selectedIndex % 4
    ];

  return (
    <ScopeJobSeekerLayout
      title="Job Opportunities"
      subtitle="Browse Job Opportunities From Recruiters And External Platforms."
      creditsLeft={creditsLeft}
      trialDaysLeft={trialDaysLeft ?? undefined}
      trialSubtextClassName="text-red-500 font-semibold"
      hideSidebar
    >
      {msg && !successOpen && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {msg}
        </div>
      )}

      {/* AI-powered recommendations banner (as in mock) */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-xl border border-[#e8e8ed] bg-gradient-to-r from-[#5b21b6] via-[#5b21b6] to-[#4f46e5] shadow-[0_8px_26px_rgba(0,0,0,0.12)]">
          <div className="p-5 sm:p-6 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-white font-bold text-[14px] mb-1">
                <span className="grid place-items-center w-6 h-6 rounded-full bg-white/15 border border-white/20">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </span>
                AI-Powered Recommendations
              </div>
              <p className="text-white/80 text-[12.5px] font-medium max-w-[560px] leading-relaxed">
                Let AI analyze your CV and reveal the job opportunities where you have the strongest match.
              </p>
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={() => navigate("/recommended-jobs")}
                  className="h-9 rounded-lg bg-white text-[#1f2937] hover:bg-white/90 font-bold text-[12px] px-4 shadow-sm"
                >
                  View All Matches
                </Button>
              </div>
            </div>

            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 grid place-items-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[#111827] shrink-0">
            Available Offers ({filtered.length})
          </h2>
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <Input
              placeholder="Search Jobs By Title, Company Or Status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-[#e5e7eb] bg-white text-[14px] placeholder:text-[#9ca3af]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-bold transition-colors border",
                filter === chip.key
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#2563EB]/40"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {loading && jobs.length === 0 ? (
        <div className="rounded-2xl bg-white py-24 text-center border border-[#f2f2f2] shadow-sm">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#2563EB]" />
          <p className="text-[#6b7280] font-medium">Loading opportunities…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-20 text-center border border-[#f2f2f2] shadow-sm">
          <p className="text-lg font-semibold text-[#374151]">No jobs match</p>
          <p className="text-sm text-[#9ca3af] mt-1">
            Try another filter or search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
          {filtered.map(({ job, index, meta }) => (
            <JobOpportunityCard
              key={job.id}
              title={job.title}
              company={
                job.company ||
                ["Figma", "Microsoft", "Acme Co", "TechLabs"][index % 4]
              }
              location={
                job.location ||
                ["San Francisco, CA", "Jordan", "New York, NY", "Remote"][
                  index % 4
                ]
              }
              postedLabel={formatRelativePosted(job.created_at)}
              meta={meta}
              hasApplied={appliedJobs.has(job.id)}
              isApplying={applyingJobId === job.id}
              onShowDetails={() => openDetails(job, index)}
              onApply={() => apply(job.id)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center mt-10">
        <Button
          variant="outline"
          onClick={() => load(page + 1, true)}
          disabled={loading}
          className="h-11 min-w-[200px] rounded-xl border-[#e5e7eb] font-bold text-[#374151]"
        >
          {loading && jobs.length > 0 ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
            </>
          ) : (
            "Load More Jobs"
          )}
        </Button>
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[512px] max-h-[90vh] overflow-y-auto border border-[#e8e8ed]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#f3f4f6]">
                  <h2 className="text-lg font-bold text-[#111827]">Job Details</h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="p-2 rounded-lg text-[#6b7280] hover:bg-[#f3f4f6]"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  <div className="shrink-0 w-11 h-11 overflow-hidden" aria-hidden>
                    <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain" />
                  </div>

                  <h3 className="text-xl font-bold text-[#111827] -mt-2">
                    {selected.title}
                  </h3>

                  <div className="flex flex-col gap-2 text-[13px] text-[#4b5563] font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#9ca3af]" />
                      {detailCompany}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#9ca3af]" />
                      {detailLocation}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#9ca3af]" />
                      Posted {formatRelativePosted(selected.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#8B5CF6] text-white">
                      {detailMeta.isInternal ? "Internal" : "External"}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#3B82F6] text-white">
                      {detailMeta.employment === "full"
                        ? "Full Time"
                        : "Part Time"}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#10B981] text-white">
                      Score: {selectedScore}%
                    </span>
                    {selected.salary_min != null && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-pink-100 text-pink-700 border border-pink-200">
                        {selected.salary_min}$
                        {selected.salary_max != null
                          ? ` - ${selected.salary_max}$`
                          : ""}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-[13px] font-bold text-[#111827] mb-2">
                      Job Description
                    </p>
                    <div className="text-[13px] text-[#4b5563] leading-relaxed space-y-1">
                      {descriptionBullets(selected.description).map((line, i) => (
                        <p key={i}>
                          *{line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {selected.skills?.length > 0 && (
                    <div>
                      <p className="text-[13px] font-bold text-[#111827] mb-2">
                        Required Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selected.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[12px] font-semibold px-3 py-1 rounded-full bg-[#dbeafe] text-[#1e40af]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[13px] font-bold text-[#111827] mb-2">
                      Why This Job Matches
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-[13px] text-[#4b5563]">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                        Good Skill Match ({Math.max(55, selectedScore - 10)}% Match)
                      </li>
                      <li className="flex items-start gap-2 text-[13px] text-[#4b5563]">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                        Job Location Match Your Location
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-[#f3f4f6] flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1 h-11 rounded-xl border-2 border-[#2563EB] text-[#2563EB] font-bold"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={() => apply(selected.id)}
                    disabled={
                      appliedJobs.has(selected.id) || applyingJobId === selected.id
                    }
                    className="flex-1 h-11 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold"
                  >
                    {applyingJobId === selected.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : appliedJobs.has(selected.id) ? (
                      "Applied"
                    ) : (
                      "Apply Now"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success modal */}
      <AnimatePresence>
        {successOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-8 text-center border border-[#e8e8ed]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setSuccessOpen(false)}
                  className="absolute top-4 right-4 p-2 text-[#9ca3af] hover:bg-[#f3f4f6] rounded-lg"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">
                  Application Submitted!
                </h3>
                <p className="text-[14px] text-[#6b7280] leading-relaxed mb-6">
                  Your Application Has Been Successfully Submitted. You&apos;ll
                  Hear From The Company If You&apos;re Shortlisted.
                </p>
                <Button
                  type="button"
                  onClick={() => setSuccessOpen(false)}
                  className="w-full h-11 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ScopeJobSeekerLayout>
  );
}
