// components/recruiter/JobList.tsx
import { useState } from "react";
import api from "@/lib/api";
import ApplicantsModal from "./applicantsmodal";
import { toast } from "sonner";


export default function JobList({ jobs, onRefresh }) {
  const [openJob, setOpenJob] = useState(null);
  const token = localStorage.getItem("access_token");

  const viewApplicants = async (jobId) => {
    try {
      const res = await api.get(`/recruiter/jobs/${jobId}/applications`, { headers: { Authorization: `Bearer ${token}` } });
      setOpenJob({ jobId, apps: res.data });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load applicants");
    }
  };

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id} className="glass-card p-4 mb-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{job.title}</h4>
              <p className="text-sm text-muted-foreground">{job.location || ""}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Applicants: {/* optionally fetch count or rely on backend */}</p>
              <button className="text-primary" onClick={() => viewApplicants(job.id)}>View Applicants</button>
            </div>
          </div>
        </div>
      ))}

      {openJob && <ApplicantsModal data={openJob} onClose={() => setOpenJob(null)} onRefresh={onRefresh} />}
    </div>
  );
}
