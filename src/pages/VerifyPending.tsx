import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://jobbot-production-ddd9.up.railway.app";

export default function VerifyPending() {
  const navigate = useNavigate();
  const email = localStorage.getItem("pending_verification_email") || "";
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Poll verification status every 5 seconds
  useEffect(() => {
    if (!email) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/v1/auth/check-verification/${encodeURIComponent(email)}`
        );
        const data = await res.json();
        if (data.is_verified) {
          clearInterval(interval);
          toast.success("Email verified! Please log in.");
          navigate("/login?verified=true");
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResending(true);
    try {
      await api.post("/v1/auth/resend-verification", { email });
      // Always show positive feedback (security best practice)
      toast.success("Verification email sent! Check your inbox.");
      setResendCooldown(60); // disable for 60 seconds
    } catch {
      toast.success("Verification email sent! Check your inbox.");
      setResendCooldown(60);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed mb-2">
          We sent a verification link to
        </p>
        {email && (
          <p className="text-[#3b82f6] font-semibold text-[14px] mb-4">{email}</p>
        )}
        <p className="text-gray-400 text-[13px] mb-8">
          Please follow the instructions in the email to activate your account.
          This page will automatically redirect once verified.
        </p>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="w-full py-3 rounded-xl bg-[#3b82f6] text-white font-bold text-[14px] hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
        >
          {resendCooldown > 0
            ? `Resend Email (${resendCooldown}s)`
            : resending
            ? "Sending..."
            : "Resend Verification Email"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition"
        >
          Back To Login
        </button>
      </div>
    </div>
  );
}
