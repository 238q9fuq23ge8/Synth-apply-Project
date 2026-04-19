import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import api from "@/lib/api";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

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

function getRememberedGoogleRole(email: string): PersonType | null {
  try {
    const raw = localStorage.getItem("google_account_roles");
    if (!raw) return null;
    const current = JSON.parse(raw);
    const role = current[email.toLowerCase()];
    return role === "recruiter" || role === "job_seeker" ? role : null;
  } catch {
    return null;
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const pendingMode = localStorage.getItem("pending_auth_mode");
        const pendingType = localStorage.getItem("pending_account_type") as PersonType | null;

        const { data } = await supabase.auth.getSession();
        let session = data.session;

        if (!session) {
          const { data: urlSessionData, error: urlError } = await supabase.auth.getSessionFromUrl({
            storeSession: true,
          });
          if (urlError) throw urlError;
          session = urlSessionData.session;
        }

        if (!session?.user) {
          toast.error("No valid session found after Google sign-in.");
          navigate("/login", { replace: true });
          return;
        }

        const email = session.user.email || "";
        const rememberedRole = getRememberedGoogleRole(email);
        const normalizedUser = {
          ...session.user,
          user_metadata: {
            ...session.user.user_metadata,
            name:
              session.user.user_metadata?.name ||
              session.user.user_metadata?.full_name ||
              session.user.email?.split("@")[0] ||
              "User",
          },
        };

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        localStorage.setItem("access_token", session.access_token);
        localStorage.setItem("refresh_token", session.refresh_token);
        localStorage.setItem("user_email", email);

        // Keep backend profile in sync for OAuth users.
        await api.post("/v1/profile/sync", { user: normalizedUser });

        try {
          const res = await api.post(
            "/v1/profile/me",
            {},
            { headers: { Authorization: `Bearer ${session.access_token}` } }
          );
          const profile = res.data || {};
          let person = profile.person as PersonType | undefined;

          if (pendingMode === "sign_up" && !rememberedRole) {
            navigate("/account-selection", { replace: true });
            return;
          }

          if (!person) {
            person = pendingType || rememberedRole || undefined;
            if (!person) {
              navigate("/account-selection", { replace: true });
              return;
            }
            await api.post(
              "/v1/profile/set-role",
              { person },
              { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
          }

          localStorage.setItem("person", person);
          if (profile.user_id) localStorage.setItem("user_id", profile.user_id);
          if (profile.plan) localStorage.setItem("plan", profile.plan);
          if (profile.remaining_credits !== undefined) {
            localStorage.setItem("remaining_credits", String(profile.remaining_credits));
          }
          if (profile.trial_ends_at) localStorage.setItem("trial_ends_at", profile.trial_ends_at);

          saveGoogleRole(email, person);
          localStorage.removeItem("pending_auth_mode");
          localStorage.removeItem("pending_account_type");

          toast.success(`Welcome ${person === "recruiter" ? "Recruiter" : "back"}!`);
          navigate(getDestination(person), { replace: true });
        } catch {
          // If login flow and user doesn't exist in backend profile, force sign-up first.
          if (pendingMode === "sign_in") {
            await supabase.auth.signOut();
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            localStorage.removeItem("person");
            toast.error("No account found for this Google email. Please sign up first.");
            navigate("/signup", { replace: true });
            return;
          }

          // Sign-up flow fallback: require account type selection if missing.
          if (!pendingType) {
            navigate("/account-selection", { replace: true });
            return;
          }

          localStorage.setItem("person", pendingType);
          saveGoogleRole(email, pendingType);
          localStorage.removeItem("pending_auth_mode");
          localStorage.removeItem("pending_account_type");
          navigate(getDestination(pendingType), { replace: true });
        }
      } catch (error) {
        console.error("Auth callback failed:", error);
        toast.error("Google authentication failed. Please try again.");
        navigate("/login", { replace: true });
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
      <div className="relative z-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <img src={ScopeLogo} alt="Scope AI" className="w-16 h-16 drop-shadow-lg" />
        </div>
        <div className="relative flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-purple-100" />
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 border-b-pink-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Connecting Your Account
            </span>
          </h2>
          <p className="text-sm text-gray-600">Please wait while we set up your profile...</p>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    </div>
  );
}

