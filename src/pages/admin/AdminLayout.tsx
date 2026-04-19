import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  LayoutDashboard, 
  DollarSign, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
      isActive
        ? "bg-gradient-to-r hover:text-white btn-hero from-primary to-accent text-white shadow-md"
        : "text-foreground/70 hover:bg-muted hover:text-foreground "
    );

    const handleLogout = () => {
      localStorage.clear();
      navigate("/admin/login");
    };

  return (
    <div className="flex bg-slate-50/50">
      <aside className="hidden md:block sticky top-16 h-[calc(100vh-64px)] w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 flex flex-col p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Administration</h2>
          <nav className="space-y-1">
            <NavLink to="/admin" end className={linkClass}>
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </NavLink>
            <NavLink to="/admin/users" className={linkClass}>
              <Users className="w-4 h-4" />
              Users
            </NavLink>
            <NavLink to="/admin/revenue" className={linkClass}>
              <DollarSign className="w-4 h-4" />
              Revenue
            </NavLink>
            <NavLink to="/admin/system" className={linkClass}>
              <Settings className="w-4 h-4" />
              System
            </NavLink>
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-bold" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/30">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;


