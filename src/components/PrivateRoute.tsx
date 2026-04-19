import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

interface Profile {
  id: string;
  user_id: string;
  email: string;
  role: string;
  person: "job_seeker" | "recruiter";
  onboarding_completed: boolean;
  is_admin: boolean;
  email_confirmed?: boolean;
  // add other fields if you need them
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      // Add a safety timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted && loading) {
          console.error("Auth check timed out");
          setLoading(false);
          setIsAuthenticated(false);
        }
      }, 10000); // 10 seconds safety timeout

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          if (isMounted) {
            setIsAuthenticated(false);
            setProfile(null);
            setLoading(false);
          }
          clearTimeout(timeoutId);
          return;
        }

        // Ensure Supabase session is in sync with localStorage tokens
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const refresh = localStorage.getItem("refresh_token");
          if (token && refresh) {
            await supabase.auth.setSession({
              access_token: token,
              refresh_token: refresh,
            });
          }
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (isMounted) {
            setIsAuthenticated(false);
            setProfile(null);
            setLoading(false);
          }
          clearTimeout(timeoutId);
          return;
        }

        // ✅ Check email verification
        // Skip email verification check for OAuth providers (Google, etc.)
        // OAuth users have pre-verified emails
        const isOAuthUser = user.app_metadata?.provider && user.app_metadata.provider !== 'email';
        const isEmailConfirmed = user.email_confirmed_at || user.email_confirmed || user.confirmed_at;

        if (!isOAuthUser && !isEmailConfirmed) {
          // Only email/password users need email verification
          // Store email for verification page and redirect
          localStorage.setItem("pending_verification_email", user.email || "");
          if (isMounted) {
            setIsAuthenticated(false);
            setProfile(null);
            setLoading(false);
          }
          clearTimeout(timeoutId);
          // Use window.location for immediate redirect
          window.location.href = "/verify-email";
          return;
        }

        // Fetch profile from your DB
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError || !profileData) {
          // No profile means we can't know role/onboarding state
          if (isMounted) {
            setIsAuthenticated(false);
            setProfile(null);
            setLoading(false);
          }
          clearTimeout(timeoutId);
          return;
        }

        if (isMounted) {
          setProfile(profileData as Profile);
          setIsAuthenticated(true);
          setLoading(false);
        }
        clearTimeout(timeoutId);
      } catch (error) {
        console.error("Auth / profile check failed:", error);
        if (isMounted) {
          setIsAuthenticated(false);
          setProfile(null);
          setLoading(false);
        }
        clearTimeout(timeoutId);
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />;
  }

  const isJobSeeker = profile.person === "job_seeker";
  const isRecruiter = profile.person === "recruiter";

  // Both job seekers and recruiters can access their respective dashboards without onboarding
  if (isJobSeeker) {
    // Job seekers can go directly to dashboard
    if (location.pathname === "/onboarding") {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // Recruiter → no onboarding checks, redirect away from onboarding if needed
  if (isRecruiter) {
    // adjust this path to whatever recruiter dashboard route you actually use
    const recruiterDashboardPath = "/recruiter";

    if (location.pathname === "/onboarding") {
      return <Navigate to={recruiterDashboardPath} replace />;
    }

    return <>{children}</>;
  }

  // Fallback for any unexpected `person` value
  return <>{children}</>;
};
