import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Archive,
  User,
  CreditCard,
  LogOut,
  CalendarDays,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

type ArchivedJob = {
  id: string;
  title: string;
  location: string;
  postedAgo: string;
  candidates: number;
  description?: string;
  skills?: string[];
  salary?: string;
  jobType?: string;
  score?: number;
};



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
        active ? "bg-[#eef4ff] text-[#2563eb]" : "text-[#374151] hover:bg-[#f3f4f6]"
      )}
    >
      <span className={cn("w-5 h-5 rounded-full grid place-items-center", active ? "bg-[#2563eb] text-white" : "bg-[#eff2f8] text-[#2563eb]")}>
        <Icon className="w-3 h-3" />
      </span>
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "Hired"
      ? "bg-[#22c55e]"
      : status === "Reviewing"
      ? "bg-[#eab308]"
      : status === "Shortlisted"
      ? "bg-[#9333ea]"
      : "bg-[#ef4444]";
  return <span className={cn("text-[10px] text-white font-semibold px-2 py-0.5 rounded-full", cls)}>{status}</span>;
}

export default function RecruiterArchivedJobs() {
  const navigate = useNavigate();
  const [titleFilter, setTitleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<ArchivedJob | null>(null);
  const [showCandidates, setShowCandidates] = useState(false);

  // Archived jobs
  const [archivedJobs, setArchivedJobs] = useState<ArchivedJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  // Candidate rows for selected job
  const [applications, setApplications] = useState<any[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState("");

  const loadArchivedJobs = useCallback(async () => {
    try {
      setJobsLoading(true);
      setJobsError("");
      const res = await api.get("/v1/recruiter/jobs", { params: { status: "inactive" } });
      const jobs = res.data.jobs || res.data || [];
      setArchivedJobs(jobs.map((j: any) => ({
        id: j.id,
        title: j.title || "Untitled",
        location: j.location || "Unknown",
        postedAgo: j.created_at ? `Posted ${Math.floor((Date.now() - new Date(j.created_at).getTime()) / 86400000)} days ago` : "Unknown",
        candidates: j.applicant_count || 0,
        description: j.description || "",
        skills: j.skills || [],
        salary: j.salary_range || j.salary || "N/A",
        jobType: j.job_type || "Full Time",
        score: j.score || 0,
      })));
    } catch (err) {
      console.error("Failed to load archived jobs:", err);
      setJobsError("Unable to load archived jobs.");
      toast.error("Unable to load archived jobs.");
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => { loadArchivedJobs(); }, [loadArchivedJobs]);

  const loadCandidates = useCallback(async (jobId: string) => {
    try {
      setCandidatesLoading(true);
      setCandidatesError("");
      const res = await api.get(`/v1/recruiter/jobs/${jobId}/applications`);
      const apps = res.data.applications || res.data || [];
      setApplications(apps.map((a: any) => ({
        name: a.applicant_name || a.name || "Unknown",
        role: a.position || "Applicant",
        applied: a.applied_at ? `Applied ${Math.floor((Date.now() - new Date(a.applied_at).getTime()) / 86400000)} days ago` : "Recently",
        location: a.location || "Unknown",
        exp: a.experience || "N/A",
        score: a.match_score ? `${a.match_score}%` : "N/A",
        status: a.status || "New",
      })));
    } catch (err) {
      console.error("Failed to load candidates:", err);
      setCandidatesError("Unable to load applicants for this job.");
      toast.error("Unable to load applicants for this job.");
    } finally {
      setCandidatesLoading(false);
    }
  }, []);

  const handleSelectJob = (job: ArchivedJob) => {
    setSelectedJob(job);
  };

  const userRaw = localStorage.getItem("user");
  const userObj = userRaw ? JSON.parse(userRaw) : null;
  const authProvider = userObj?.app_metadata?.provider || userObj?.identities?.[0]?.provider || null;
  const displayName = userObj?.user_metadata?.name || userObj?.email?.split("@")[0] || "Profile";

  const visibleJobs = useMemo(() => {
    return archivedJobs.filter((j) => {
      const byTitle = !titleFilter || j.title.toLowerCase().includes(titleFilter.toLowerCase());
      const byDate = !dateFilter || j.postedAgo.toLowerCase().includes(dateFilter.toLowerCase());
      return byTitle && byDate;
    });
  }, [titleFilter, dateFilter, archivedJobs]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

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
              <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate("/recruiter")} />
              <SidebarItem icon={BriefcaseBusiness} label="My Jobs" onClick={() => navigate("/recruiter/my-jobs")} />
              <SidebarItem icon={Users} label="Candidates" onClick={() => navigate("/recruiter/candidates")} />
              <SidebarItem icon={Archive} label="Archived Jobs" active />
              <SidebarItem icon={User} label="Profile" onClick={() => navigate("/profile")} />
              <SidebarItem icon={CreditCard} label="Upgrade plan" onClick={() => navigate("/recruiter-plans")} />
            </div>
          </div>
          <SidebarItem icon={LogOut} label="Logout" onClick={handleLogout} />
        </aside>

        <main className="flex-1 min-w-0 px-4 md:px-6 xl:px-8 py-5">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-[42px] leading-none font-bold text-[#2563eb] mb-2">Archived Jobs</h1>
                <p className="text-[12px] text-[#6b7280] font-medium">
                  View Job Postings You Have Archived. These Jobs Are No Longer Visible To Candidates.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280] font-medium">
                {authProvider === "google" ? <span className="text-[14px]">G</span> : <User className="w-3.5 h-3.5" />}
                <span>{displayName}</span>
                <span>|</span>
                <span>Free Account</span>
              </div>
            </div>

            <section className="rounded-md border border-[#eceef3] bg-white p-4 mt-4">
              <div className="text-[24px] font-semibold text-[#111827] mb-3">Search</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <div className="text-[12px] font-semibold text-[#6b7280] mb-1">Job Title</div>
                  <Input value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} className="h-10 border-[#e5e7eb]" placeholder="Enter Job Title" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[#6b7280] mb-1">Post Date</div>
                  <Input value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-10 border-[#e5e7eb]" placeholder="Select Post Date" />
                </div>
                <Button className="h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-semibold rounded-md">Filter</Button>
              </div>
            </section>

            <section className="rounded-md border border-[#eceef3] bg-white p-4 mt-4 min-h-[420px]">
              <h3 className="text-[24px] font-semibold text-[#111827] mb-3">Archived Jobs ({visibleJobs.length})</h3>
              {jobsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
                </div>
              )}
              {jobsError && !jobsLoading && (
                <div className="text-red-500 text-sm py-4">{jobsError}</div>
              )}
              {!jobsLoading && !jobsError && visibleJobs.length === 0 && (
                <div className="text-[#6b7280] text-sm py-4">No archived jobs.</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {visibleJobs.map((j) => (
                  <div key={j.id} className="rounded-md border border-[#edf0f5] p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[16px] font-semibold text-[#111827]">{j.title}</div>
                      <span className="text-[10px] text-white bg-[#9ca3af] px-2 py-0.5 rounded-full">Archived</span>
                    </div>
                    <div className="text-[13px] text-[#6b7280] mb-2">{j.location}</div>
                    <div className="text-[12px] text-[#9ca3af] flex items-center gap-1 mb-3">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {j.postedAgo}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[#2563eb] text-[12px] font-semibold">👥 {j.candidates}</div>
                      <Button className="h-8 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12px] font-semibold" onClick={() => handleSelectJob(j)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between text-[11px] text-[#6b7280] font-medium">
                <span>Showing 1-{visibleJobs.length} of {visibleJobs.length} Jobs</span>
                <span className="w-6 h-6 rounded bg-[#2563eb] text-white grid place-items-center">1</span>
              </div>
            </section>
          </div>
        </main>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] bg-white rounded-md border border-[#e5e7eb] shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#edf0f5]">
              <h3 className="text-[28px] font-semibold text-[#111827]">Job Details</h3>
              <button type="button" onClick={() => setSelectedJob(null)}>
                <X className="w-5 h-5 text-[#374151]" />
              </button>
            </div>
            <div className="p-4">
              <div className="text-[18px] font-semibold text-[#111827]">{selectedJob.title}</div>
              <div className="text-[12px] text-[#6b7280] mt-1">{selectedJob.location} • {selectedJob.postedAgo}</div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <span className="text-[10px] text-white bg-[#8b5cf6] px-2 py-0.5 rounded-full">Internal</span>
                <span className="text-[10px] text-white bg-[#3b82f6] px-2 py-0.5 rounded-full">{selectedJob.jobType}</span>
                <span className="text-[10px] text-white bg-[#22c55e] px-2 py-0.5 rounded-full">Score: {selectedJob.score}%</span>
                <span className="text-[10px] text-white bg-[#ec4899] px-2 py-0.5 rounded-full">{selectedJob.salary}</span>
              </div>
              <div className="mt-4">
                <div className="text-[16px] font-semibold text-[#111827] mb-1">Job Description</div>
                <p className="text-[12px] text-[#6b7280]">{selectedJob.description || "No description provided."}</p>
              </div>
              <div className="mt-4">
                <div className="text-[16px] font-semibold text-[#111827] mb-1">Required Skills</div>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedJob.skills?.map((s) => (
                    <span key={s} className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded">{s}</span>
                  )) || "None"}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#edf0f5] grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-10 border-[#cfd7e3]" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
              <Button className="h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white" onClick={() => { setShowCandidates(true); loadCandidates(selectedJob.id); }}>
                Show Candidates({selectedJob.candidates})
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCandidates && selectedJob && (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-[980px] bg-white rounded-md border border-[#e5e7eb] shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#edf0f5]">
              <h3 className="text-[28px] font-semibold text-[#111827]">
                Candidates - {selectedJob.title} ({selectedJob.location})
              </h3>
              <button type="button" onClick={() => setShowCandidates(false)}>
                <X className="w-5 h-5 text-[#374151]" />
              </button>
            </div>
            <div className="p-3 max-h-[420px] overflow-auto">
              {candidatesLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2563eb]"></div>
                </div>
              )}
              {candidatesError && !candidatesLoading && (
                <div className="text-red-500 text-sm py-4 px-2">{candidatesError}</div>
              )}
              {!candidatesLoading && !candidatesError && applications.length === 0 && (
                <div className="text-[#6b7280] text-sm py-4 px-2">No applicants for this job.</div>
              )}
              {applications.map((c, idx) => (
                <div key={`${c.name}-${idx}`} className="grid grid-cols-[2.1fr_1.2fr_1fr_0.9fr_0.8fr_1fr_0.9fr] gap-2 items-center px-2 py-3 border-b border-[#f1f5f9] text-[12px]">
                  <div>
                    <div className="font-semibold text-[#111827]">{c.name}</div>
                    <div className="text-[#6b7280]">{c.role}</div>
                  </div>
                  <div className="text-[#6b7280]">{c.applied}</div>
                  <div className="text-[#6b7280]">{c.location}</div>
                  <div className="text-[#6b7280]">{c.exp}</div>
                  <div className="text-[#111827] font-semibold">{c.score}</div>
                  <StatusPill status={c.status} />
                  <Button variant="outline" className="h-8 border-[#cfd7e3] text-[12px]">View CV</Button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#edf0f5] flex justify-end">
              <Button className="h-10 px-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white" onClick={() => setShowCandidates(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

