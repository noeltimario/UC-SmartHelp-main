import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import TicketDetailModal from "@/components/tickets/TicketDetailModal";
import ReviewAnalytics from "@/components/analytics/ReviewAnalytics";

// Define a local type to replace Supabase generated types
type Ticket = {
  id: string;
  ticket_number: string;
  subject: string;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
  sender_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
  departments?: {
    name: string;
  };
};

const StaffDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ pending: 0, in_progress: 0, resolved: 0 });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [view, setView] = useState<"tickets" | "reviews">("tickets");

  // Get current user from localStorage instead of useAuth
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const fetchData = async () => {
    // TODO: Replace this with your MySQL fetch call (e.g., fetch('/api/tickets.php'))
    // For now, we set empty to prevent the Supabase 'client' from crashing the app
    setTickets([]);
    setStats({ pending: 0, in_progress: 0, resolved: 0 });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    // TODO: Implement MySQL update call here
    toast({ 
      title: "Status update requested", 
      description: `Target status: ${newStatus}. (Database connection pending)` 
    });
    
    // Optimistic UI update for demo purposes
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus as any } : t));
  };

  if (view === "reviews") {
    return (
      <div className="container py-8 space-y-6">
        <button onClick={() => setView("tickets")} className="text-sm text-primary hover:underline">
          &larr; Back to Dashboard
        </button>
        <ReviewAnalytics />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header with Switcher */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staff Overview</h1>
        <button 
          onClick={() => setView("reviews")}
          className="text-sm bg-secondary px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
        >
          View Analytics & Reviews
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl p-6 text-center shadow-sm" style={{ backgroundColor: "hsl(120, 70%, 75%)" }}>
          <p className="text-4xl font-bold text-foreground">{stats.pending}</p>
          <p className="text-sm font-medium text-foreground mt-1">Pending Tickets</p>
        </div>
        <div className="rounded-xl p-6 text-center shadow-sm" style={{ backgroundColor: "hsl(300, 60%, 75%)" }}>
          <p className="text-4xl font-bold text-foreground">{stats.in_progress}</p>
          <p className="text-sm font-medium text-foreground mt-1">In-Progress Tickets</p>
        </div>
        <div className="rounded-xl p-6 text-center shadow-sm" style={{ backgroundColor: "hsl(250, 60%, 80%)" }}>
          <p className="text-4xl font-bold text-foreground">{stats.resolved}</p>
          <p className="text-sm font-medium text-foreground mt-1">Resolved/Closed</p>
        </div>
      </div>

      {/* Tickets Table */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">All Tickets</h2>
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">TICKET ID</TableHead>
                <TableHead className="font-bold">SUBJECT</TableHead>
                <TableHead className="font-bold">SENDER</TableHead>
                <TableHead className="font-bold">DATE SENT</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    No tickets currently assigned.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((t) => (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => setSelectedTicket(t)}>
                    <TableCell className="font-medium">{t.ticket_number}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>
                      {t.profiles ? `${t.profiles.first_name} ${t.profiles.last_name}` : "Unknown User"}
                    </TableCell>
                    <TableCell>{format(new Date(t.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select value={t.status} onValueChange={(v) => handleStatusChange(t.id, v)}>
                        <SelectTrigger className="w-36 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In-Progress</SelectItem>
                          <SelectItem value="resolved">Resolved/Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => { setSelectedTicket(null); fetchData(); }}
          isStaff={true}
        />
      )}
    </div>
  );
};

export default StaffDashboard;