import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold gradient-text">AI JobApply</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/scope-jobs">
            <Button variant="ghost">Scope Jobs</Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup">
            <Button className="btn-gradient">Start Free</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
