import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  CalendarDays,
  MapPin,
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Archive,
  Link2,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type JobStatus = "Active" | "Closed" | "Expired";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAgo: string;
  status: JobStatus;
  candidateCount: number;
  description: string;
  skills: string[];
  salary: string;
  jobType: string;
  experienceLevel: string;
  durationDays: number;
  score?: number;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  valueColor = "text-gray-900",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 flex-1 min-w-[140px]">
      <div>
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
      </div>
      <div className="ml-auto">{icon}</div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({
  job,
  onViewDetails,
  onEdit,
  onCopyLink,
  onArchive,
}: {
  job: Job;
  onViewDetails: () => void;
  onEdit: () => void;
  onCopyLink: () => void;
  onArchive: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 relative">
      {/* Status badge */}
      <div className="absolute top-3 right-3">
        <span
          className={cn(
            "text-[11px] font-bold px-2.5 py-0.5 rounded-full",
            job.status === "Active"
              ? "bg-green-500 text-white"
              : job.status === "Expired"
              ? "bg-red-500 text-white"
              : "bg-gray-400 text-white"
          )}
        >
          {job.status}
        </span>
      </div>

      {/* Company logo + title */}
      <div className="flex items-center gap-2 pr-16">
        {/* Google-style logo */}
        <div className="w-8 h-8 grid grid-cols-2 gap-0.5 shrink-0">
          <span className="rounded-sm bg-[#4285F4]" />
          <span className="rounded-sm bg-[#EA4335]" />
          <span className="rounded-sm bg-[#34A853]" />
          <span className="rounded-sm bg-[#FBBC05]" />
        </div>
        <span className="font-semibold text-gray-900 text-sm">{job.title}</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <MapPin className="w-3.5 h-3.5" />
        {job.location}
      </div>

      {/* Posted date */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <CalendarDays className="w-3.5 h-3.5" />
        {job.postedAgo}
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-2 mt-1">
        {/* Candidate count */}
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
        >
          <Users className="w-3.5 h-3.5" />
          {job.candidateCount}
        </button>

        {/* Three-dot menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[130px] py-1">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEdit(); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onCopyLink(); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Copy link
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onArchive(); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Archive
              </button>
            </div>
          )}
        </div>

        {/* View Details */}
        <Button
          size="sm"
          onClick={onViewDetails}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-lg"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}

// ─── Job Details Modal ────────────────────────────────────────────────────────
function JobDetailsModal({
  job,
  onClose,
  onShowCandidates,
}: {
  job: Job;
  onClose: () => void;
  onShowCandidates: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 z-10">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-4">Job Details</h3>

        {/* Company + title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 grid grid-cols-2 gap-0.5 shrink-0">
            <span className="rounded-sm bg-[#4285F4]" />
            <span className="rounded-sm bg-[#EA4335]" />
            <span className="rounded-sm bg-[#34A853]" />
            <span className="rounded-sm bg-[#FBBC05]" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{job.title}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Posted {job.postedAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-600 text-white">Internal</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500 text-white">{job.jobType}</span>
          {job.score && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-500 text-white">
              Score: {job.score}%
            </span>
          )}
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
            {job.salary}
          </span>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm font-bold text-gray-900 mb-1">Job Description</p>
          <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <p className="text-sm font-bold text-gray-900 mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span
                key={s}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 text-gray-700"
          >
            Close
          </Button>
          <Button
            onClick={onShowCandidates}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Show Candidates({job.candidateCount})
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Archive Confirm Modal ────────────────────────────────────────────────────
function ArchiveModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 z-10 text-center">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Archive icon */}
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Archive className="w-8 h-8 text-gray-500" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">Archive Job Offer</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          This Job Will Be Moved To Your Archived Jobs And Will No Longer Accept Applications.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-gray-300 text-gray-700"
          >
            No, Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Yes, Archived
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Success Modal (Job Posted) ───────────────────────────────────────────────
function JobPostedSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 z-10 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-white" strokeWidth={2.5} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Your Job Offer Is Now Live And Visible To Candidates. You Can Manage Applications From Your Dashboard.
        </p>

        <Button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

// ─── Post / Edit Job Form Page ────────────────────────────────────────────────
function JobFormPage({
  mode,
  initialData,
  onSave,
  onCancel,
}: {
  mode: "post" | "edit";
  initialData?: Partial<Job>;
  onSave: (data: Partial<Job>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [location, setLocation] = useState(initialData?.location || "");
  const [salary, setSalary] = useState(initialData?.salary || "");
  const [jobType, setJobType] = useState(initialData?.jobType || "");
  const [experienceLevel, setExperienceLevel] = useState(initialData?.experienceLevel || "");
  const [durationDays, setDurationDays] = useState(String(initialData?.durationDays || 30));

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const s = skillInput.trim().replace(/,$/, "");
      if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Job Title and Description are required.");
      return;
    }
    onSave({ title, description, skills, location, salary, jobType, experienceLevel, durationDays: parseInt(durationDays) || 30 });
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600">
          {mode === "post" ? "Post New Job" : "Edit Job"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === "post"
            ? "Create A New Job Posting And Attract The Best Candidates."
            : "Edit The Job Post And Attract The Best Candidates."}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Job Details</h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Job Title */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Job Description <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter Job Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Required Skills
            </label>
            <div className="min-h-10 border border-gray-200 rounded-md px-3 py-1.5 flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              {skills.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                >
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                className="flex-1 min-w-[80px] text-sm outline-none bg-transparent placeholder:text-gray-400"
                placeholder={skills.length === 0 ? "Enter Required Skills" : ""}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Location</option>
              <option value="San Francisco, CA">San Francisco, CA</option>
              <option value="New York, NY">New York, NY</option>
              <option value="Remote">Remote</option>
              <option value="Jordan">Jordan</option>
              <option value="Dubai, UAE">Dubai, UAE</option>
            </select>
          </div>

          {/* Salary Range */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Salary Range</label>
            <Input
              placeholder="Enter Salary Range"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="h-10 text-sm"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Job Type</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Experience Level */}
        <div className="max-w-xs">
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Experience Level</label>
          <Input
            placeholder="Enter Experience Level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>

      {/* Job Activation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-4">Job Activation</h2>
        <div className="max-w-xs">
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Job Duration (days)</label>
          <Input
            type="number"
            min="1"
            max="365"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="h-10 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            How Many Days Should This Job Remain Active? (Default: 30)
          </p>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3">
        {mode === "edit" && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-8 border-gray-300 text-gray-700"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          className="px-10 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {mode === "post" ? "Save" : "Edit"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main My Jobs Page ────────────────────────────────────────────────────────
export default function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "post" | "edit">("list");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [archiveJob, setArchiveJob] = useState<Job | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Search / filter state
  const [searchTitle, setSearchTitle] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 8;

  const [toastMsg, setToastMsg] = useState<{ text: string; sub: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (text: string, sub: string) => {
    setToastMsg({ text, sub });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch jobs from backend
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: PAGE_SIZE };
      // Backend only accepts: active | inactive — map UI values accordingly
      if (searchStatus) {
        const statusMap: Record<string, string> = {
          active: "active",
          closed: "inactive",
          expired: "inactive",
        };
        const mapped = statusMap[searchStatus.toLowerCase()];
        if (mapped) params.status = mapped;
      }
      const res = await api.get("/v1/recruiter/jobs", { params });
      const raw = res.data?.jobs || res.data || [];
      const mapped: Job[] = raw.map((j: any) => ({
        id: String(j.id),
        title: j.title || "Untitled",
        company: j.company_name || "Company",
        location: j.location || "—",
        postedAgo: j.created_at ? formatRelative(j.created_at) : "Recently",
        status: j.is_active ? "Active" : "Closed",
        candidateCount: j.application_count ?? 0,
        description: j.description || "",
        skills: j.skills || [],
        salary: j.salary_range || j.salary || "",
        jobType: j.job_type || "Full Time",
        experienceLevel: j.experience_level || "",
        durationDays: j.duration_days || 30,
      }));
      setJobs(mapped);
      setTotalPages(Math.max(1, Math.ceil((res.data?.total || raw.length) / PAGE_SIZE)));
    } catch {
      toast.error("Failed to load jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page, searchStatus]);

  function formatRelative(iso: string) {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "1 day ago";
    return `${diff} days ago`;
  }

  // Derived stats from loaded jobs
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "Active").length;
  const closedJobs = jobs.filter((j) => j.status === "Closed").length;
  const totalCandidates = jobs.reduce((s, j) => s + j.candidateCount, 0);

  // Client-side title filter
  const filtered = jobs.filter((j) =>
    !searchTitle || j.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  const handlePostSave = async (data: Partial<Job>) => {
    if (!data.title?.trim() || !data.description?.trim()) {
      toast.error("Job Title and Description are required.");
      return;
    }
    try {
      await api.post("/v1/recruiter/jobs/json", {
        title: data.title.trim(),
        description: data.description.trim(),
        skills: data.skills || [],
        duration_days: data.durationDays || 30,
        location: data.location || undefined,
        salary_range: data.salary || undefined,
        job_type: data.jobType || undefined,
        experience_level: data.experienceLevel || undefined,
      });
      setView("list");
      setShowSuccess(true);
      fetchJobs();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail ? `Failed to post: ${JSON.stringify(detail)}` : "Failed to post job.");
    }
  };

  const handleEditSave = async (data: Partial<Job>) => {
    if (!editingJob) return;
    try {
      // Backend PATCH schema only accepts these fields per API docs
      // Sending unknown fields causes Pydantic model_dump error (500)
      const payload: Record<string, any> = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.location !== undefined) payload.location = data.location;
      if (data.salary !== undefined) payload.salary_range = data.salary;
      if (data.jobType !== undefined) payload.job_type = data.jobType;
      // Omit skills and duration_days — they trigger model_dump error on backend

      await api.patch(`/v1/recruiter/jobs/${editingJob.id}`, payload);
      setEditingJob(null);
      setView("list");
      showToast("Job Updated!", "Your job post has been updated successfully.");
      fetchJobs();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(detail ? `Update failed: ${JSON.stringify(detail)}` : "Failed to update job.");
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveJob) return;
    try {
      await api.delete(`/v1/recruiter/jobs/${archiveJob.id}`);
      setArchiveJob(null);
      showToast("Job Archived!", "This job has been archived successfully.");
      fetchJobs();
    } catch {
      toast.error("Failed to archive job.");
    }
  };

  const handleCopyLink = async (job: Job) => {
    try {
      const res = await api.get(`/v1/recruiter/jobs/${job.id}/public-link`);
      const link = res.data?.public_url || `${window.location.origin}/job/${job.id}`;
      navigator.clipboard.writeText(link).catch(() => {});
      showToast("Link Copied!", "You can now paste it anywhere to share the job.");
    } catch {
      const link = `${window.location.origin}/job/${job.id}`;
      navigator.clipboard.writeText(link).catch(() => {});
      showToast("Link Copied!", "Share this link with candidates.");
    }
  };

  if (view === "post") {
    return (
      <JobFormPage
        mode="post"
        onSave={handlePostSave}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "edit" && editingJob) {
    return (
      <JobFormPage
        mode="edit"
        initialData={editingJob}
        onSave={handleEditSave}
        onCancel={() => { setEditingJob(null); setView("list"); }}
      />
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600">My Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage Your Job Postings, Monitor Applicant Activity, And Update Listings From One Place.
        </p>
      </div>

      {/* Stats row */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex flex-wrap gap-6 divide-x divide-gray-100">
        <StatCard
          label="Total"
          value={totalJobs}
          valueColor="text-gray-900"
          icon={
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
          }
        />
        <div className="pl-6 flex-1">
          <StatCard
            label="Active Jobs"
            value={activeJobs}
            valueColor="text-blue-600"
            icon={
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
            }
          />
        </div>
        <div className="pl-6 flex-1">
          <StatCard
            label="Closed Jobs"
            value={closedJobs}
            valueColor="text-red-500"
            icon={
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
            }
          />
        </div>
        <div className="pl-6 flex-1">
          <StatCard
            label="Total Candidates"
            value={totalCandidates}
            valueColor="text-orange-500"
            icon={
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-400" />
              </div>
            }
          />
        </div>
        <div className="pl-6 flex-1">
          <StatCard
            label="Hired Candidates"
            value={jobs.filter(j => j.status === "Closed").length}
            valueColor="text-green-600"
            icon={
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
            }
          />
        </div>
      </div>

      {/* Search section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Search</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-gray-500 mb-1 block">Job Title</label>
            <Input
              placeholder="Enter Job Title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-gray-500 mb-1 block">Post Date</label>
            <div className="relative">
              <Input
                type="date"
                placeholder="Select Post Date"
                className="h-10 text-sm pr-8"
              />
            </div>
          </div>
          <Button
            onClick={() => { setPage(1); fetchJobs(); }}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Filter
          </Button>
        </div>
      </div>

      {/* Posted Jobs list */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">
          Posted Jobs ({filtered.length})
        </h2>
        <Button
          onClick={() => setView("post")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9 px-4 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </Button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading jobs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-gray-500 font-medium">No jobs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={() => setDetailsJob(job)}
              onEdit={() => { setEditingJob(job); setView("edit"); }}
              onCopyLink={() => handleCopyLink(job)}
              onArchive={() => setArchiveJob(job)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-500">
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} Jobs
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded text-xs font-semibold border",
                p === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {detailsJob && (
        <JobDetailsModal
          job={detailsJob}
          onClose={() => setDetailsJob(null)}
          onShowCandidates={() => {
            setDetailsJob(null);
            navigate("/recruiter/candidates");
          }}
        />
      )}

      {archiveJob && (
        <ArchiveModal
          onCancel={() => setArchiveJob(null)}
          onConfirm={handleArchiveConfirm}
        />
      )}

      {showSuccess && (
        <JobPostedSuccessModal onClose={() => setShowSuccess(false)} />
      )}

      {/* Bottom-right toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-start gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 min-w-[260px] max-w-xs">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{toastMsg.text}</p>
            <p className="text-xs text-gray-500 mt-0.5">{toastMsg.sub}</p>
          </div>
        </div>
      )}
    </div>
  );
}
