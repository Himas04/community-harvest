import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Heart, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const dashboardPath = role ? `/dashboard/${role}` : "/";

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Heart className="h-6 w-6 fill-primary" />
          LeftoverLove
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <User className="h-4 w-4" />
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-background p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/about" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>About</Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Profile</Link>
                <Button variant="ghost" size="sm" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Sign out</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Log in</Link>
                <Link to="/signup" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
