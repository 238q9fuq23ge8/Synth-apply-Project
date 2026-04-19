import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Mail, ArrowRight, Loader2, CheckCircle2, Clock, AlertCircle, Lock } from "lucide-react";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  // Handle email verified via Supabase redirect
  const handleEmailVerified = async (accessToken: string, refreshToken?: string | null) => {
    try {
      // Set up Supabase session
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || "",
      });

      // Get user data
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
        setIsVerified(true);
        setCheckingStatus(false);

        // Clear pending email
        localStorage.removeItem("pending_verification_email");

        // Check if user has a profile (if so, go to dashboard, otherwise login)
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // User is authenticated, redirect to dashboard
            toast.success("🎉 Email verified! Logging you in...");
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 1500);
          } else {
            // No session, go to login
            toast.success("🎉 Email verified successfully! You can now login.");
            setTimeout(() => {
              navigate("/login", { replace: true });
            }, 2000);
          }
        } catch {
          // Error checking session, default to login
          toast.success("🎉 Email verified successfully! You can now login.");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error setting up session after email verification:", error);
      toast.error("Failed to complete email verification");
      setCheckingStatus(false);
    }
  };

  const checkVerificationStatus = async (emailToCheck: string) => {
    try {
      const response = await api.get(`/v1/auth/check-verification/${encodeURIComponent(emailToCheck)}`);
      const data = response.data;

      if (data.is_verified) {
        setIsVerified(true);
        setCheckingStatus(false);

        // Check if user has an active session
        const { data: { session } } = await supabase.auth.getSession();

        localStorage.removeItem("pending_verification_email");

        if (session) {
          // User is logged in, go to dashboard
          toast.success("🎉 Email verified! Redirecting to dashboard...");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1500);
        } else {
          // User not logged in, go to login
          toast.success("🎉 Email verified! Redirecting to login...");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
        }
      } else {
        setIsVerified(false);
        setCheckingStatus(false);
      }
    } catch (error: any) {
      console.error("Error checking verification status:", error);
      // Don't show error toast, just set checking to false
      setCheckingStatus(false);
    }
  };

  // Get email from localStorage or URL params
  useEffect(() => {
    // Check if user was redirected from Supabase with verification token
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      toast.error(errorDescription || "Verification failed");
      setCheckingStatus(false);
      return;
    }

    if (accessToken) {
      // User was redirected from Supabase after email verification
      // Set up the session and mark as verified
      handleEmailVerified(accessToken, refreshToken);
      return;
    }

    // Normal flow - get email from localStorage or URL params
    const storedEmail = localStorage.getItem("pending_verification_email");
    const emailParam = searchParams.get("email");
    const finalEmail = emailParam || storedEmail || "";

    setEmail(finalEmail);

    // Check verification status on mount
    if (finalEmail) {
      checkVerificationStatus(finalEmail);
    } else {
      setCheckingStatus(false);
    }
  }, [searchParams]);

  // Auto-refresh verification status every 10 seconds
  useEffect(() => {
    if (!isVerified && email && !checkingStatus) {
      const interval = setInterval(() => {
        checkVerificationStatus(email);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isVerified, email, checkingStatus]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email || resendDisabled) return;

    // If password not provided, show password input
    if (!password && !showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    if (!password) {
      toast.error("Please enter your password to resend verification email");
      return;
    }

    setLoading(true);
    setResendDisabled(true);
    setCountdown(60); // 60 second cooldown

    try {
      const response = await api.post("/v1/auth/resend-verification", { email, password });

      if (response.data.ok) {
        toast.success("Verification email sent! Please check your inbox.");
        setShowPasswordInput(false);
        setPassword("");

        // Start checking status again
        checkVerificationStatus(email);
      }
    } catch (error: any) {
      console.error("Resend error:", error);
      const errorMsg = error?.response?.data?.detail || "Failed to resend verification email";
      toast.error(errorMsg);
      setResendDisabled(false);
      setCountdown(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignup = () => {
    localStorage.removeItem("pending_verification_email");
    navigate("/signup");
  };

  const handleGoToLogin = () => {
    localStorage.removeItem("pending_verification_email");
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 sm:p-6 md:p-8 py-8 sm:py-12">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
            <img src={ScopeLogo} alt="Scope AI" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 drop-shadow-lg" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Verify Your Email
            </span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            We've sent a verification link to your email
          </p>
        </div>

        {/* Verification card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8 md:p-10">
          {checkingStatus ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-600">Checking verification status...</p>
            </div>
          ) : isVerified ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h3>
              <p className="text-gray-600 text-center mb-6">
                Your email has been successfully verified. Redirecting...
              </p>
            </div>
          ) : (
            <>
              {/* Status indicator */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">
                    <strong>Awaiting verification</strong>
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please check your email at <span className="font-medium">{email}</span> for the verification link.
                    The link will expire in 30 minutes.
                  </p>
                </div>
              </div>

              {/* Email display */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base bg-gray-50 border-gray-200"
                    disabled={checkingStatus}
                  />
                </div>
              </div>

              {/* Password input for resend */}
              {showPasswordInput && (
                <div className="space-y-2 mb-6">
                  <Label className="text-sm font-semibold text-gray-700">Password (required for resend)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 sm:pl-12 h-11 sm:h-12 text-sm sm:text-base bg-white border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Resend button */}
              <Button
                onClick={handleResendEmail}
                disabled={loading || resendDisabled || !email}
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : showPasswordInput ? (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Email
                  </>
                ) : resendDisabled ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              {/* Auto-refresh notice */}
              <p className="text-xs text-gray-500 text-center mt-4">
                We'll automatically check your verification status. Or check your email and click the link.
              </p>

              {/* Back to login/signup */}
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBackToSignup}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Back to Signup
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleGoToLogin}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </>
          )}
        </div>

        {/* Help text */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Didn't receive the email? Check your spam folder or resend above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
