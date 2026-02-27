import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TicketList from "@/components/tickets/TicketList";
import ReviewAnalytics from "@/components/analytics/ReviewAnalytics";
import AccountManagement from "@/components/admin/AccountManagement";
import ChatbotAnalytics from "@/components/analytics/ChatbotAnalytics";

interface DeptStat {
  name: string;
  all: number;
  pending: number;
  in_progress: number;
  resolved: number;
}

const AdminDashboard = () => {
  // 1. Manual Auth: Replace useAuth with localStorage
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  
  const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
  const [view, setView] = useState<"dashboard" | "tickets" | "accounts" | "reviews">("dashboard");

  useEffect(() => {
    const fetchStats = async () => {
      // TODO: Replace with MySQL fetch (e.g., fetch('/api/admin_stats.php'))
      // Setting mock data for now to ensure the UI renders without crashing
      const mockStats: DeptStat[] = [
        { name: "Registrar", all: 0, pending: 0, in_progress: 0, resolved: 0 },
        { name: "Accounting", all: 0, pending: 0, in_progress: 0, resolved: 0 },
        { name: "IT Services", all: 0, pending: 0, in_progress: 0, resolved: 0 },
      ];
      setDeptStats(mockStats);
    };
    fetchStats();
  }, []);

  const navItems = [
    { key: "dashboard", label: "Dashboard Overview" },
    { key: "tickets", label: "Manage Tickets" },
    { key: "accounts", label: "User Accounts" },
    { key: "reviews", label: "Feedback & Reviews" },
  ] as const;

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <div className="px-3 py-4 bg-primary/5 rounded-xl mb-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">System Administrator</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email || "admin@uc.edu.ph"}</p>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex w-full items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  view === item.key 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-[600px] bg-card rounded-2xl border p-6 shadow-sm">
          {view === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Helpdesk Analytics</h2>
                <Badge variant="outline" className="px-3 py-1">Real-time Data</Badge>
              </div>

              {/* Departments Stats Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Departmental Breakdown
                </h3>
                <div className="rounded-xl border overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-bold">Department</TableHead>
                        <TableHead className="text-center font-bold">Total Tickets</TableHead>
                        <TableHead className="text-center font-bold">Pending</TableHead>
                        <TableHead className="text-center font-bold">In-Progress</TableHead>
                        <TableHead className="text-center font-bold">Resolved</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deptStats.length > 0 ? (
                        deptStats.map((d) => (
                          <TableRow key={d.name} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{d.name}</TableCell>
                            <TableCell className="text-center">{d.all}</TableCell>
                            <TableCell className="text-center">
                                <span className="text-amber-600 font-semibold">{d.pending}</span>
                            </TableCell>
                            <TableCell className="text-center text-blue-600 font-semibold">{d.in_progress}</TableCell>
                            <TableCell className="text-center text-green-600 font-semibold">{d.resolved}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                            No department data available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Chatbot Analytics Section */}
              <div className="pt-4 border-t">
                <ChatbotAnalytics />
              </div>
            </div>
          )}

          {/* Sub-view Rendering */}
          <div className="animate-in slide-in-from-right-4 duration-500">
            {view === "tickets" && <TicketList />}
            {view === "accounts" && <AccountManagement />}
            {view === "reviews" && <ReviewAnalytics />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;