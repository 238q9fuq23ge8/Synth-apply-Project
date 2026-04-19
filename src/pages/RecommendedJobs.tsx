import { useCallback, useEffect, useRef, useState } from "react";
import { ScopeJobSeekerLayout } from "@/components/jobseeker/ScopeJobSeekerLayout";
import { useTrialCountdown } from "@/hooks/useTrialCountdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Filter, Sparkles, Loader2, X, CheckCircle, Star, Wallet, BadgeCheck, Sparkle, CalendarDays } from "lucide-react";
import { fetchJobRecommendations, JobRecommendation, RecommendationsResponse } from "@/services/recommendationsApi";
import api from "@/lib/api";

function scorePillClass(score: number) {
  if (score >= 80) return "bg-[#009605] text-white";
  if (score >= 60) return "bg-[#2862eb] text-white";
  return "bg-[#ff6900] text-white";
}

function CompanyLogo({ className }: { className?: string }) {
  return (
    <div className={cn("shrink-0 overflow-hidden", className)} aria-hidden>
      <img src="/logo.png" alt="Company Logo" className="w-full h-full object-contain" />
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group">
      <span className="text-[#9ca3af] text-[12px] cursor-default">ⓘ</span>
      <span className="pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 top-[115%] hidden group-hover:block w-[220px] rounded-lg bg-white border border-[#e5e7eb] shadow-lg px-3 py-2 text-[11px] text-[#4b5563] font-medium">
        {text}
      </span>
    </span>
  );
}

export default function RecommendedJobs() {
  const { daysLeft: trialDaysLeft } = useTrialCountdown();
  const [cvId, setCvId] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);
  const [minScore, setMinScore] = useState(30);
  const [region, setRegion] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "results">("idle");
  const [progress, setProgress] = useState(0);
  const [selectedJob, setSelectedJob] = useState<JobRecommendation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileUsed, setProfileUsed] = useState<RecommendationsResponse["profile_used"] | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  // CV check on mount (R6)
  useEffect(() => {
    let isMounted = true;
    const checkCv = async () => {
      try {
        const res = await api.get("/v1/cvs/latest");
        if (!isMounted) return;
        
        const cvIdVal = res.data?.id || res.data?.cv_id;
        if (cvIdVal) {
          setCvId(cvIdVal);
          localStorage.setItem("current_cv_id", cvIdVal);
          // Auto-load recommendations if CV exists
          loadRecommendations({ cv_id: cvIdVal });
        }
      } catch (err) {
        console.log("No CV found or error fetching CV");
      }
    };
    checkCv();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const credits = Number(localStorage.getItem("remaining_credits") || 65) || 65;

  // Re-usable fetch function
  const loadRecommendations = useCallback(async (params?: { min_score?: number; limit?: number; region?: string; cv_id?: string }) => {
    try {
      setLoading(true);
      setError("");
      setPhase("loading");
      setProgress(0);

      // Start progress animation
      const startedAt = Date.now();
      const timer = window.setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const pct = Math.min(95, Math.floor((elapsed / 2000) * 95));
        setProgress(pct);
      }, 60);

      const cvIdVal = params?.cv_id || localStorage.getItem("current_cv_id") || undefined;
      const result = await fetchJobRecommendations({
        cv_id: cvIdVal,
        limit: params?.limit || limit,
        min_score: params?.min_score || minScore,
        region: params?.region || region || undefined,
      });

      window.clearInterval(timer);
      setProgress(100);
      setRecommendations(result.recommendations || []);
      setProfileUsed(result.profile_used || null);
      setCreditsRemaining(result.credits_remaining ?? null);

      // Small delay so user sees 100%
      setTimeout(() => {
        setPhase("results");
      }, 200);
    } catch (err: any) {
      console.error("Failed to load recommendations:", err);
      setError(err?.message || "Unable to load recommendations. Please try again.");
      setRecommendations([]);
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  }, [limit, minScore, region]);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const onCvFilePicked = async (file?: File) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx")) return;

    try {
      setUploading(true);
      setUploadError("");
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/v1/cv/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const realCvId = res.data?.id || res.data?.cv_id;
      if (!realCvId) throw new Error("No CV ID returned from server.");
      localStorage.setItem("current_cv_id", realCvId);
      setCvId(realCvId);
      setPhase("idle");
    } catch (err: any) {
      console.error("CV upload failed:", err);
      setUploadError(err?.response?.data?.message || err?.message || "Failed to upload CV. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!cvId) {
    return (
      <ScopeJobSeekerLayout
        title="Recommended Jobs"
        subtitle="Browse Job Opportunities Selected By AI Based On Your CV, Skills, And Experience."
        creditsLeft={credits}
        trialDaysLeft={trialDaysLeft ?? undefined}
        hideSidebar
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[14px] font-bold text-[#111827] mb-3">Upload Your CV</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => onCvFilePicked(e.target.files?.[0])}
          />
          <div className="bg-white border border-[#f2f2f2] rounded-md shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.08)] overflow-hidden">
            <div
              className="h-[140px] sm:h-[170px] flex items-center justify-center bg-[#fafafa] cursor-pointer"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCvFilePicked(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <div className="mx-auto mb-3 w-10 h-10 rounded-lg border border-[#e5e7eb] bg-white grid place-items-center">
                  <Upload className="w-5 h-5 text-[#111827]" />
                </div>
                <p className="text-[#111827] font-semibold text-[13px]">
                  Drag &amp; Drop Your CV Or{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-[#2862eb] underline underline-offset-2"
                  >
                    Choose File
                  </button>{" "}
                  To Upload
                </p>
                <p className="text-[#9ca3af] text-[11px] font-medium mt-1">
                  Supported Format: PDF, DOCX (Max 8MB)
                </p>
                {uploading && (
                  <p className="text-[#2862eb] text-[11px] font-semibold mt-2 flex items-center justify-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                  </p>
                )}
                {uploadError && (
                  <p className="text-red-500 text-[11px] font-semibold mt-2">{uploadError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScopeJobSeekerLayout>
    );
  }

  return (
    <ScopeJobSeekerLayout
      title="Recommended Jobs"
      subtitle="Browse Job Opportunities Selected By AI Based On Your CV, Skills, And Experience."
      creditsLeft={credits}
      trialDaysLeft={trialDaysLeft ?? undefined}
      hideSidebar
    >
      <div className="bg-[#f2f4fb] border border-[#eef0f6] rounded-md px-6 py-5 shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.06)] mb-8">
        <div className="text-[13px] font-bold text-[#111827] mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#111827]" />
          Filter
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#111827] mb-2">
              Results Limit <span className="text-red-500">*</span>
              <Hint text="The maximum number of job results to display in this search." />
            </div>
            <Input
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 20)))}
              className="h-10 bg-white border-[#e5e7eb]"
            />
            <div className="text-[10px] text-[#9ca3af] font-medium mt-2">1-100 (default: 20)</div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#111827] mb-2">
              Minimum Score <span className="text-red-500">*</span>
              <Hint text="The minimum match score required for a job to appear in your results." />
            </div>
            <Input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Math.max(0, Math.min(100, parseInt(e.target.value) || 30)))}
              className="h-10 bg-white border-[#e5e7eb]"
            />
            <div className="text-[10px] text-[#9ca3af] font-medium mt-2">0-100 (default: 30)</div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#111827] mb-2">
              Region Override <span className="text-[#9ca3af] font-medium">(Optional)</span>
              <Hint text="Manually choose a location to search for jobs." />
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="e.g., United States"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-10 bg-white border-[#e5e7eb]"
              />
              <Button
                type="button"
                onClick={() => {
                  setSelectedJob(null);
                  loadRecommendations({ min_score: minScore, limit, region: region || undefined });
                }}
                disabled={loading}
                className="h-10 min-w-[140px] bg-[#2862eb] hover:bg-[#2862eb]/90 text-white font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>
            <div className="text-[10px] text-[#9ca3af] font-medium mt-2">Leave empty to use search history</div>
          </div>
        </div>
      </div>

      {phase === "idle" && !error && (
        <div className="text-center py-24">
          <div className="text-[14px] font-bold text-[#111827] mb-2">No recommendations yet</div>
          <div className="text-[12px] text-[#6b7280] font-medium">
            Apply Filters Above And Find Your Matched Jobs.
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => loadRecommendations()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {phase === "loading" && (
        <div className="text-center py-24">
          <div className="text-[20px] font-semibold text-[#111827] mb-2">Finding your perfect matches...</div>
          <div className="text-[12px] text-[#6b7280] font-medium mb-7">
            Analyzing Your CV And Search History To Recommend The Best Jobs For You
          </div>

          <div className="max-w-[520px] mx-auto">
            <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#22c55e]"
                style={{ width: `${Math.max(6, progress)}%` }}
              />
            </div>
            <div className="text-right text-[12px] text-[#6b7280] font-medium mt-2">
              {progress}%
            </div>
          </div>
        </div>
      )}

      {phase === "results" && (
        <>
          {!loading && !error && recommendations.length === 0 && (
            <div className="text-center py-16 text-gray-500 text-sm">
              No jobs match your profile right now. Try updating your skills.
            </div>
          )}

          {recommendations.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-[#f2f2f2] rounded-md shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.06)] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-[#111827] flex items-center gap-1">
                      Total Recommendations
                      <Hint text="The total number of job opportunities found that match your CV and selected search criteria." />
                    </div>
                    <div className="text-[18px] font-bold text-[#111827] mt-1">{recommendations.length}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-50 grid place-items-center border border-purple-100">
                    <Star className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                </div>

                <div className="bg-white border border-[#f2f2f2] rounded-md shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.06)] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-[#111827] flex items-center gap-1">
                      Credits Remaining
                      <Hint text="The number of credits left in your account. Credits are used when running AI job searches or automation." />
                    </div>
                    <div className="text-[18px] font-bold text-[#111827] mt-1">{creditsRemaining ?? credits}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-50 grid place-items-center border border-amber-100">
                    <Wallet className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                </div>

                <div className="bg-white border border-[#f2f2f2] rounded-md shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.06)] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-[#111827] flex items-center gap-1">
                      Used CV Title
                      <Hint text="The job title selected from your CV and used to find matching job opportunities." />
                    </div>
                    <div className="text-[14px] font-bold text-[#111827] mt-1">{profileUsed?.title || "N/A"}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-50 grid place-items-center border border-green-100">
                    <BadgeCheck className="w-5 h-5 text-[#22c55e]" />
                  </div>
                </div>

                <div className="bg-white border border-[#f2f2f2] rounded-md shadow-[0px_0px_7.1px_0px_rgba(0,0,0,0.06)] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-[#111827] flex items-center gap-1">
                      Used Skills Count
                      <Hint text="Number of skills from your CV that were used by the AI to match job opportunities." />
                    </div>
                    <div className="text-[18px] font-bold text-[#111827] mt-1">{profileUsed?.skills_count ?? 0}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-pink-50 grid place-items-center border border-pink-100">
                    <Sparkle className="w-5 h-5 text-[#ec4899]" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="text-[14px] font-bold text-[#111827]">
                  Recommended Offers ({recommendations.length})
                </div>
                <div className="relative w-full max-w-[360px]">
                  <Input
                    placeholder="Search Jobs By Title, Company Or Status..."
                    className="h-10 bg-white border-[#e5e7eb] pl-4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendations.map((job) => {
                  const isRemote = job.location?.toLowerCase().includes("remote") || false;
                  const employment = job.job_type || "full";
                  const tags: { label: string; className: string }[] = [
                    job.is_internal
                      ? { label: "Internal", className: "bg-[#8B5CF6] text-white" }
                      : { label: "External", className: "bg-[#F59E0B] text-white" },
                    isRemote
                      ? { label: "Remote", className: "bg-[#10B981] text-white" }
                      : { label: employment.toLowerCase().includes("part") ? "Part Time" : "Full Time", className: "bg-[#3B82F6] text-white" },
                  ];

                  const postedLabel = job.posted_date
                    ? "Posted " + new Date(job.posted_date).toLocaleDateString()
                    : "";
                  const salaryLabel = job.salary || "";

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-xl border border-[#e8e8ed] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-4 sm:p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <CompanyLogo className="w-9 h-9" />
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {tags.map((t) => (
                            <span key={t.label} className={cn("text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md", t.className)}>
                              {t.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-[15px] font-bold text-[#111827] mb-1">{job.title}</div>
                      <div className="text-[13px] text-[#6b7280] font-medium mb-3">
                        {job.company || "Unknown"} <span className="text-[#d1d5db]">•</span> {job.location || "N/A"}
                      </div>

                      {postedLabel && (
                        <div className="flex items-center gap-2 text-[12px] text-[#9ca3af] font-medium mb-4">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {postedLabel}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-10 rounded-lg border-2 border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 font-bold text-[13px]"
                          onClick={() => setSelectedJob(job)}
                        >
                          Show Details
                        </Button>
                        <Button
                          type="button"
                          className="flex-1 h-10 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-[13px] shadow-md shadow-blue-500/15"
                          onClick={() => setSelectedJob(job)}
                        >
                          Apply Now →
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[512px] border border-[#e8e8ed] overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#f3f4f6]">
              <div className="text-[14px] font-bold text-[#111827]">Job Details</div>
              <button
                type="button"
                className="p-2 rounded-lg text-[#6b7280] hover:bg-[#f3f4f6]"
                onClick={() => setSelectedJob(null)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-start gap-3 mb-4">
                <CompanyLogo className="w-10 h-10" />
                <div className="min-w-0">
                  <div className="text-[16px] font-bold text-[#111827]">{selectedJob.title}</div>
                  <div className="text-[12px] text-[#6b7280] font-medium flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">🏢 {selectedJob.company || "Unknown"}</span>
                    <span className="flex items-center gap-1">📍 {selectedJob.location || "N/A"}</span>
                    {selectedJob.posted_date && (
                      <span className="flex items-center gap-1">🕒 {new Date(selectedJob.posted_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#8B5CF6] text-white">
                  {selectedJob.is_internal ? "Internal" : "External"}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#3B82F6] text-white">
                  {selectedJob.location?.toLowerCase().includes("remote")
                    ? "Remote"
                    : (selectedJob.job_type || "full").toLowerCase().includes("part")
                      ? "Part Time"
                      : "Full Time"}
                </span>
                <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-md", scorePillClass(selectedJob.score))}>
                  Score: {selectedJob.score}%
                </span>
                {selectedJob.salary && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-pink-100 text-pink-700 border border-pink-200">
                    {selectedJob.salary}
                  </span>
                )}
              </div>

              {selectedJob.snippet && (
                <div className="mb-5">
                  <div className="text-[13px] font-bold text-[#111827] mb-2">Job Description</div>
                  <div className="text-[13px] text-[#4b5563] leading-relaxed">
                    {selectedJob.snippet}
                  </div>
                </div>
              )}

              {selectedJob.match_reasons && selectedJob.match_reasons.length > 0 && (
                <div className="mb-2">
                  <div className="text-[13px] font-bold text-[#111827] mb-2">Why This Job Matches</div>
                  <div className="space-y-2 text-[13px] text-[#4b5563] font-medium">
                    {selectedJob.match_reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5" />
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#f3f4f6] flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 rounded-xl border-2 border-[#2563EB] text-[#2563EB] font-bold"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                className="flex-1 h-11 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold"
                onClick={() => {
                  if (selectedJob.url) {
                    window.open(selectedJob.url, "_blank");
                  }
                  setSelectedJob(null);
                }}
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </ScopeJobSeekerLayout>
  );
}
