// components/recruiter/ApplicantsModal.tsx
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export default function ApplicantsModal({ data, onClose, onRefresh }) {
  const { jobId, apps } = data;

  const handleShortlist = async (appId, action) => {
    const token = localStorage.getItem("access_token");
    try {
      await api.post(`/recruiter/applications/${appId}/status`, { status: action }, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Updated" });
      onRefresh();
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl p-4 overflow-auto">
        <div className="flex justify-between items-center">
          <h3>Applicants</h3>
          <button onClick={onClose}>Close</button>
        </div>

        <div className="mt-4 space-y-4">
          {apps.map((itemWrapper) => {
            const a = itemWrapper.application;
            const cv = itemWrapper.cv || {};
            return (
              <div key={a.id} className="p-3 border rounded flex justify-between items-start">
                <div>
                  <div className="font-medium">{cv.parsed_json?.name || "Unknown Candidate"}</div>
                  <div className="text-sm text-muted-foreground">{cv.parsed_json?.title || ""}</div>
                  <div className="text-sm">Score: <strong>{Math.round(Number(a.score || 0))}%</strong></div>
                </div>
                <div className="flex flex-col items-end">
                  <a className="text-primary mb-2" href={/* generate signed storage link for cv.file_path */ "#"} target="_blank" rel="noreferrer">Open CV</a>
                  <div className="flex gap-2">
                    <button className="btn" onClick={()=>handleShortlist(a.id, "shortlisted")}>Shortlist</button>
                    <button className="btn-outline" onClick={()=>handleShortlist(a.id, "rejected")}>Reject</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
