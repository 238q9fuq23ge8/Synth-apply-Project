import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";

type CVParsed = {
  name?: string;
  title?: string;
  contact?: any;
  summary?: string;
  skills?: string[];
  experience?: Array<any>;
  education?: Array<any>;
  certifications?: string[];
  projects?: Array<any>;
};

export default function CVViewer() {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [parsed, setParsed] = useState<CVParsed | null>(null);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setErr("Please login first.");
      setLoading(false);
      return;
    }
    const run = async () => {
      try {
        const res = await api.get(`/v1/cv/${cvId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setParsed(res.data?.parsed || {});
        setSkills(res.data?.extracted_skills || []);
      } catch (e: any) {
        setErr(e?.response?.data?.detail || "Failed to load CV.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [cvId]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Candidate CV</h1>
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </div>

          {loading ? (
            <div className="rounded-xl border bg-white p-6">Loading…</div>
          ) : err ? (
            <div className="rounded-xl border bg-white p-6 text-red-600">{err}</div>
          ) : (
            <div className="rounded-xl border bg-white p-6 space-y-6">
              <div>
                <div className="text-xl font-semibold">
                  {parsed?.name || "Unnamed Candidate"}
                </div>
                <div className="text-sm text-gray-600">{parsed?.title}</div>
              </div>

              {parsed?.summary && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium mb-1">Summary</div>
                  <p className="text-sm text-gray-700">{parsed.summary}</p>
                </div>
              )}

              {skills?.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border px-2 py-1 text-xs text-gray-700 bg-gray-50"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsed?.experience && parsed.experience.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Experience</div>
                  <div className="space-y-3">
                    {parsed.experience.map((e, i) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="font-medium">{e.role}</div>
                        <div className="text-sm text-gray-600">
                          {e.company} • {e.location} • {e.duration}
                        </div>
                        {e.achievements && (
                          <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
                            {e.achievements.map((a: string, j: number) => (
                              <li key={j}>{a}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsed?.education && parsed.education.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Education</div>
                  <div className="space-y-2">
                    {parsed.education.map((ed, i) => (
                      <div key={i} className="text-sm">
                        <div className="font-medium">{ed.degree}</div>
                        <div className="text-gray-600">
                          {ed.institution} • {ed.duration}
                        </div>
                        {ed.details && <div>{ed.details}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
