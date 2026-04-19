import { useState } from "react";
import { Search, BriefcaseBusiness } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

type PersonType = "job_seeker" | "recruiter";

function getDestination(person: PersonType) {
  return person === "recruiter" ? "/recruiter" : "/dashboard";
}

function saveGoogleRole(email: string, person: PersonType) {
  try {
    const raw = localStorage.getItem("google_account_roles");
    const current = raw ? JSON.parse(raw) : {};
    current[email.toLowerCase()] = person;
    localStorage.setItem("google_account_roles", JSON.stringify(current));
  } catch {
    // no-op
  }
}

export default function AccountSelection() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PersonType | null>(null);
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const email = localStorage.getItem("user_email") || "";
      if (!token) {
        toast.error("Session expired. Please sign in again.");
        navigate("/login", { replace: true });
        return;
      }

      await api.post(
        "/v1/profile/set-role",
        { person: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("person", selected);
      localStorage.removeItem("pending_auth_mode");
      localStorage.removeItem("pending_account_type");
      if (email) saveGoogleRole(email, selected);

      navigate(getDestination(selected), { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete account setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#fbfbfc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[900px] border border-[#f0f1f4] bg-white rounded-sm px-6 md:px-10 py-10 md:py-12">
        <h1 className="text-center text-[#2563eb] font-bold text-[48px] leading-none mb-4">Get Started as...</h1>
        <p className="text-center text-[#6b7280] text-[16px] font-medium mb-8">
          Choose your account type to get started with Scope AI and unlock smarter, AI-powered career tools.
        </p>

        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            type="button"
            onClick={() => setSelected("job_seeker")}
            className={`w-[200px] h-[160px] border rounded-md flex flex-col items-center justify-center transition-all ${
              selected === "job_seeker"
                ? "border-[#2c64eb] shadow-[0_0_0_1px_#2c64eb]"
                : "border-[#eceef2] bg-[#fafafa]"
            }`}
          >
            <Search className={`w-14 h-14 mb-3 ${selected === "job_seeker" ? "text-[#2c64eb]" : "text-[#a3a3a3]"}`} />
            <div className="text-[16px] font-semibold text-[#1f2937]">Job Seeker</div>
            <div className="text-[12px] text-[#9ca3af]">Finding Opportunities</div>
          </button>

          <button
            type="button"
            onClick={() => setSelected("recruiter")}
            className={`w-[200px] h-[160px] border rounded-md flex flex-col items-center justify-center transition-all ${
              selected === "recruiter"
                ? "border-[#2c64eb] shadow-[0_0_0_1px_#2c64eb]"
                : "border-[#eceef2] bg-[#fafafa]"
            }`}
          >
            <BriefcaseBusiness
              className={`w-14 h-14 mb-3 ${selected === "recruiter" ? "text-[#2c64eb]" : "text-[#a3a3a3]"}`}
            />
            <div className="text-[16px] font-semibold text-[#1f2937]">Recruiter</div>
            <div className="text-[12px] text-[#9ca3af]">Hiring Top Talent</div>
          </button>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onCreate}
            disabled={!selected || loading}
            className="h-[48px] min-w-[180px] bg-[#2c64eb] hover:bg-[#2256d9] text-white font-semibold text-[16px] rounded-md disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}

