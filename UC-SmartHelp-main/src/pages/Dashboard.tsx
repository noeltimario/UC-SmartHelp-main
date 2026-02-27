import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// Lazy-load sub-dashboards to prevent one broken file from crashing the whole app
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import StaffDashboard from "@/components/dashboard/StaffDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import GuestDashboard from "@/components/dashboard/GuestDashboard";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const guestFlag = localStorage.getItem("uc_guest") === "1";

    // 1. Check Auth Status
    if (!savedUser && !guestFlag) {
      navigate("/login");
      return;
    }

    // 2. Set State
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user session:", e);
        localStorage.removeItem("user");
        navigate("/login");
      }
    }

    setIsGuest(guestFlag);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Determine which view to render
  const renderView = () => {
    if (isGuest) return <GuestDashboard />;
    
    // Normalize role to lowercase to avoid "Admin" vs "admin" mismatches
    const role = user?.role?.toLowerCase() || "student";

    switch (role) {
      case "admin":
        return <AdminDashboard />;
      case "staff":
        return <StaffDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {isGuest ? "Guest" : user?.firstName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            {isGuest 
              ? "You are viewing the dashboard with limited access." 
              : `Logged in as ${user?.role || 'Student'}`}
          </p>
        </header>

        {/* Dynamic Dashboard Content */}
        <div className="rounded-xl border bg-card p-2 shadow-sm">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;