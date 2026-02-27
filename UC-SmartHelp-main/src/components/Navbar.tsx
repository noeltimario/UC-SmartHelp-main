import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import logo from "@/assets/uc-smarthelp-logo.jpg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Manual Auth Check: Get user data from localStorage
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isGuest = localStorage.getItem("uc_guest") === "1";

  const handleSignOut = () => {
    // Clear everything
    localStorage.removeItem("uc_guest");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Determine roles from our stored user object
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const isLoggedIn = !!user || isGuest;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="UC SmartHelp" className="h-10 w-auto" />
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/announcements" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Announcements
          </Link>
          <Link to="/uc-map" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            UC map
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact Us
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary overflow-hidden border-2 border-primary/10 hover:bg-primary/30 transition-all">
                  {isGuest ? (
                    <UserIcon className="h-5 w-5" />
                  ) : (
                    <span>{(user?.firstName?.[0] || user?.fullName?.[0] || "U").toUpperCase()}</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Profile Header */}
                <div className="flex flex-col p-2 border-b mb-1">
                  <span className="text-sm font-bold">
                    {isGuest ? "Guest User" : user?.fullName || "User"}
                  </span>
                  {!isGuest && (
                    <span className="text-xs text-muted-foreground">{user?.role?.toUpperCase()}</span>
                  )}
                </div>

                {/* Shared Menu Items */}
                {!isGuest && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      Account Settings
                    </DropdownMenuItem>
                    {(isAdmin || isStaff) && (
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        Reviews
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Show Login/Get Started only on Home Page if not logged in */
            location.pathname === "/" && (
              <Button onClick={() => navigate("/login")} className="uc-gradient-btn text-primary-foreground">
                GET STARTED
              </Button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;