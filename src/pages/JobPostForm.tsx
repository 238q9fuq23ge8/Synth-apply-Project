// components/recruiter/JobPostForm.tsx
import { useState } from "react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";


export default function JobPostForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [duration, setDuration] = useState("30");


  const handleSubmit = async (e) => {
    e.preventDefault();
    const dDays = parseInt(duration) || 30;
    if (dDays < 1 || dDays > 365) {
      toast.error("Duration must be between 1 and 365 days");
      return;
    }

    try {
      const payload = {
        title,
        description,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        duration_days: dDays
      };
      await api.post("/v1/recruiter/jobs/json", payload);
      setTitle(""); setDescription(""); setSkills(""); setDuration("30");
      onCreated();
      toast.success("Job posted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to post job");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4">
      <h3 className="font-semibold mb-2">Post a Job</h3>
      <Input placeholder="Job title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea className="w-full mt-2 p-2 border rounded" rows={6} placeholder="Job description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <Input placeholder="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />

      <div className="mt-4">
        <label className="text-sm font-medium">Job Duration (days)</label>
        <Input
          type="number"
          min="1"
          max="365"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="mt-1"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          How many days should this job remain active? (1-365 days, default: 30)
        </p>
      </div>

      <Button type="submit" className="mt-4 w-full">Post Job</Button>
    </form>
  );
}
