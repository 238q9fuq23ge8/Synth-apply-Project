import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "@/lib/api";

interface AdminRouteProps {
  children: JSX.Element;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const token = localStorage.getItem("access_token");
  const location = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token) {
      setAuthorized(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post("/v1/profile/me", {});
        const profile = res.data as { is_admin?: boolean };
        setAuthorized(!!profile?.is_admin);
      } catch (err: any) {
        setAuthorized(false);
      }
    };

    verify();

    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(verify, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, location.pathname]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (authorized === null) {
    return null;
  }

  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;


