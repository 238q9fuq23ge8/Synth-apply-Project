import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Reuse existing login endpoint; backend must return/allow token
      const res = await api.post("/v1/auth/login", { email, password });
      const { access_token } = res.data || {};
      if (access_token) {
        localStorage.setItem("access_token", access_token);
      }

      const me = await api.post("/v1/profile/me", {});
      if (!me.data?.is_admin) {
        setError("Admin access required.");
        setLoading(false);
        return;
      }

      navigate("/admin", { replace: true });
    } catch (err: any) {
      setError("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-4 flex flex-col items-center">
          <img src={ScopeLogo} alt="Scope AI" className="w-12 h-12 mb-2" />
          <h1 className="text-xl font-semibold">Admin Sign in</h1>
          <p className="text-xs text-muted-foreground">Use your admin credentials</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full btn-hero" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;


