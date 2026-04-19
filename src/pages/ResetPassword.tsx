import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthBanner } from "@/components/auth/AuthBanner";
import { AuthError } from "@/components/auth/AuthError";
import { AuthBackground } from "@/components/auth/AuthBackground";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"enterEmail" | "emailSent" | "setNewPassword">("enterEmail");
  
  // Step 1 State
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Step 3 State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Password Strength Check
  const hasMinLength = password.length > 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  // Determine overall password match state
  const isMatch = password && confirmPassword && (password === confirmPassword);
  const showMismatchError = confirmPassword.length > 0 && confirmPassword !== password;

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (accessToken && type === "recovery") {
      setToken(accessToken);
      setStep("setNewPassword");
    }
  }, []);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!email) {
      setEmailError("We Couldn't Find An Account With This Email. Please Check The Address Or Create A New Account.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please Enter A Valid Email Address");
      return;
    }

    setLoading(true);
    try {
      await api.post("/v1/auth/forgot-password", { email });
      setStep("emailSent");
    } catch (err: any) {
      console.error(err);
      setEmailError(err?.response?.data?.detail || "We Couldn't Find An Account With This Email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) return;
    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber) return;
    if (!isMatch) return;

    setLoading(true);

    try {
      await api.post("/v1/auth/reset-password", { 
        token: token,
        new_password: password 
      });
      toast.success("Password updated successfully!");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout hideHeader={true} hideFooter={true}>
      <AuthBackground>
        <AuthCard sidebar={<AuthBanner />}>
          <div className="w-full max-w-[420px] mx-auto">
            
            {/* Multi-step Header (Shown for Step 1 and 3) */}
            {step !== "emailSent" && (
              <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <img src={ScopeLogo} alt="Scope AI" className="w-10 h-10 object-contain" />
                    <span className="text-[24px] font-bold text-[#0f172a] tracking-tight">Scope AI</span>
                </div>
                
                <h2 className="text-[34px] font-bold text-[#2563eb] leading-tight tracking-tight mb-2">
                  {step === "enterEmail" ? "Reset Password" : "New Password"}
                </h2>
                
                <p className="text-slate-500 text-[14px] leading-relaxed font-medium mb-1.5 max-w-[380px]">
                  {step === "enterEmail" 
                    ? "Enter your email to receive a recovery link and get back into your account."
                    : "Create a strong, unique password to secure your account."}
                </p>
                
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-blue-500/50" />
                    <span>Trusted By 10,000+ Professionals</span>
                </div>
              </div>
            )}

            {step === "enterEmail" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <form onSubmit={handleSendResetEmail} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[14px] font-bold text-slate-700 ml-1 flex">
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-12 h-[56px] bg-[#f8fafc] border-slate-100/80 text-[#1e293b] font-medium placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 rounded-[12px] text-[15px] transition-all ${emailError ? 'border-red-400 focus-visible:ring-red-500/10' : ''}`}
                      />
                    </div>
                  </div>

                  {emailError && <AuthError message={emailError} />}

                  <div className="flex flex-col gap-4 pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-[56px] bg-[#2563eb] hover:bg-blue-700 text-white font-bold tracking-wide text-[16px] rounded-[12px] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Reset Link
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                    <button 
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-[14px] font-bold text-slate-400 hover:text-blue-600 transition-colors py-2 flex items-center justify-center gap-2"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === "emailSent" && (
              <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in duration-500">
                <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                  <div className="relative z-10 w-32 h-32 flex flex-col items-center group">
                    <div className="absolute bottom-0 w-32 h-20 bg-[#1e40af] rounded-xl z-30 shadow-2xl overflow-hidden flex items-center justify-center">
                       <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 144 96"><path d="M0 0 L72 48 L144 0" fill="none" stroke="white" strokeWidth="2" /></svg>
                    </div>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="absolute bottom-8 w-24 h-28 bg-white rounded-xl shadow-xl z-20 flex flex-col items-center pt-4 border border-gray-100 transform group-hover:-translate-y-6 transition-transform duration-700">
                      <img src={ScopeLogo} alt="Logo" className="w-10 h-10 object-contain" />
                    </motion.div>
                    <div className="absolute bottom-0 w-32 h-20 z-40 pointer-events-none">
                       <svg className="w-full h-full" viewBox="0 0 144 96"><path d="M0 0 L72 56 L144 0 V96 H0 Z" fill="#2563eb" /></svg>
                    </div>
                  </div>
                </div>
                <h2 className="text-[30px] font-bold text-[#0f172a] mb-4 tracking-tight">Check Your Email</h2>
                <p className="text-slate-500 text-[15px] mb-10 leading-relaxed font-medium">
                  We've sent a recovery link to <strong className="text-blue-600 underline font-bold">{email}</strong>.
                </p>
                <Button onClick={() => navigate("/login")} className="w-full max-w-[240px] h-[56px] bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-500/10 transition-all">Go To Login</Button>
              </div>
            )}

            {step === "setNewPassword" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[14px] font-bold text-slate-700 ml-1 flex">New Password <span className="text-red-500 ml-1">*</span></Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-12 pr-12 h-[56px] bg-[#f8fafc] border-slate-100/80 text-[#1e293b] font-medium placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 rounded-[12px] text-[15px] transition-all`}
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

                  <div className="space-y-2">
                    <Label className="text-[14px] font-bold text-slate-700 ml-1 flex">Confirm Password <span className="text-red-500 ml-1">*</span></Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-12 pr-12 h-[56px] bg-[#f8fafc] border-slate-100/80 text-[#1e293b] font-medium placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500/10 focus-visible:border-blue-500 rounded-[12px] text-[15px] transition-all ${showMismatchError ? 'border-red-400 focus-visible:ring-red-500/10' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    </div>
                  </div>

                  {showMismatchError && <AuthError message="Passwords Do Not Match. Please make sure both fields are identical." />}

                  <Button 
                    type="submit" 
                    disabled={loading || !isMatch || !hasMinLength}
                    className="w-full h-[56px] bg-[#2563eb] hover:bg-blue-700 text-white font-bold tracking-wide text-[16px] rounded-[12px] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Update Password
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </AuthCard>

        {/* Global Page Footer Removed */}
      </AuthBackground>
    </MainLayout>
  );
}
