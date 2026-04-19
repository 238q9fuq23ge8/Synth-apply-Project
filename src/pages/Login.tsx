import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "@/lib/api";
import { supabase, setSupabaseSession } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthBanner } from "@/components/auth/AuthBanner";
import { AuthError } from "@/components/auth/AuthError";
import { AuthBackground } from "@/components/auth/AuthBackground";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setFormError(null);

    if (!email || !password) {
      setFormError("Please Fill In All The Required Fields Before Proceeding.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please Enter A Valid Email Address");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("v1/auth/login", { email, password });
      const data = response.data;

      if (!data || !data.access_token) {
        throw new Error("No access token received");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");
      localStorage.setItem("user_email", email);

      if (data.user?.id) {
        localStorage.setItem("user_id", data.user.id);
      }

      localStorage.setItem("remaining_credits", String(data.remaining_credits ?? 0));
      localStorage.setItem("trial_ends_at", data.trial_ends_at ?? "");
      localStorage.setItem("plan", data.plan ?? "free_trial");

      const person = data.person || "job_seeker";
      localStorage.setItem("person", person);
      localStorage.setItem("user", JSON.stringify(data.user || {}));

      toast.success("Welcome back! Redirecting...");
      await setSupabaseSession(data.access_token, data.refresh_token);

      try {
        const userId = data.user?.id || localStorage.getItem("user_id");
        if (userId) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("person")
            .eq("user_id", userId)
            .single();

          if (profile && profile.person) {
            localStorage.setItem("person", profile.person);
          }
        }
      } catch (profileErr) {
        console.error("⚠️ Profile check failed:", profileErr);
      }

      const currentPerson = localStorage.getItem("person") || person;
      setTimeout(() => {
        if (currentPerson === "recruiter") {
          navigate("/recruiter", { replace: true });
        } else {
          localStorage.setItem("onboarding_completed", "true");
          navigate("/dashboard", { replace: true });
        }
      }, 700);

    } catch (err: any) {
      console.error("❌ Login error:", err);
      setFormError("Incorrect Email Or Password. Please Try Again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem("pending_auth_mode", "sign_in");
      localStorage.removeItem("pending_account_type");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Login error:", err);
      toast.error(err.message || "Failed to sign in with Google");
    }
  };

  return (
    <MainLayout hideHeader={true} hideFooter={true}>
      <AuthBackground>
        <AuthCard sidebar={<AuthBanner />}>
          <div className="w-full max-w-[420px] mx-auto">
            {/* Multi-step Header */}
            <div className="flex flex-col gap-1 mb-8">
               <div className="flex items-center gap-3 mb-4">
                  <img src={ScopeLogo} alt="Scope AI" className="w-10 h-10 object-contain" />
                  <span className="text-[24px] font-bold text-[#0f172a] tracking-tight">Scope AI</span>
               </div>
               
               <h2 className="text-[34px] font-bold text-[#2563eb] leading-tight tracking-tight mb-2">
                 Welcome Back!
               </h2>
               
               <p className="text-slate-500 text-[14px] leading-relaxed font-medium mb-1.5 max-w-[380px]">
                 Sign in to access your AI-powered job search, CV builder, and personalized career insights.
               </p>
               
               <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-blue-500/50" />
                  <span>Trusted By 10,000+ Professionals</span>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[14px] font-bold text-slate-700 ml-1 flex">
                  Email Address <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="testing@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-12 h-[56px] bg-[#f8fafc] border-slate-100/80 text-[#1e293b] font-medium placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 rounded-[12px] text-[15px] transition-all ${emailError || formError ? 'border-red-400 focus-visible:ring-red-500/10' : ''}`}
                  />
                </div>
                {emailError && (
                  <div className="flex items-center gap-1.5 text-[#e11d48] text-[11px] font-extrabold mt-1.5 ml-1 tracking-wide uppercase">
                    <AlertCircle className="w-[14px] h-[14px] flex-shrink-0" strokeWidth={3} />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="password" className="text-[14px] font-bold text-slate-700 ml-1 flex">
                    Password <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[13px] font-bold text-[#2563eb] hover:underline transition-all"
                  >
                    Forget Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-12 pr-12 h-[56px] bg-[#f8fafc] border-slate-100/80 text-[#1e293b] font-medium placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 rounded-[12px] text-[15px] transition-all ${formError ? 'border-red-400 focus-visible:ring-red-500/10' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              {formError && <AuthError message={formError} />}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-[56px] bg-[#2563eb] hover:bg-blue-700 text-white font-bold tracking-wide text-[16px] rounded-[12px] shadow-xl shadow-blue-500/20 transition-all mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="my-8 flex items-center gap-4">
               <div className="h-px flex-1 bg-slate-100"></div>
               <span className="text-[#94a3b8] text-[11px] font-bold tracking-widest uppercase">OR</span>
               <div className="h-px flex-1 bg-slate-100"></div>
            </div>

            <Button
               type="button"
               variant="outline"
               onClick={handleGoogleLogin}
               className="w-full h-[56px] bg-white border border-slate-200 text-slate-700 font-bold text-[15px] rounded-[12px] shadow-sm hover:bg-slate-50 flex items-center justify-center gap-3 transition-all"
            >
               <img
                 src="https://www.vectorlogo.zone/logos/google/google-icon.svg"
                 alt="Google"
                 className="w-5 h-5"
               />
               <span>Sign In With Google</span>
            </Button>

            <div className="mt-10 text-center text-[14px] text-gray-500 font-bold">
              Don't Have An Account?{" "}
              <Link
                to="/signup"
                className="text-[#3b82f6] hover:underline transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </AuthCard>
      </AuthBackground>
    </MainLayout>
  );
};

export default Login;
