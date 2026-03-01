import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import TicketDetailModal from "./TicketDetailModal";
import FeedbackDialog from "./FeedbackDialog";

const statusColors: Record<string, string> = {
  pending: "bg-green-400 text-foreground",
  in_progress: "bg-pink-400 text-foreground",
  resolved: "bg-blue-400 text-foreground",
};

const TicketList = () => {
  // 1. Manual Auth Logic
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isGuest = localStorage.getItem("uc_guest") === "1";
  
  // Role check logic
  const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTicket, setFeedbackTicket] = useState<any>(null);

  const fetchTickets = async () => {
    try {
      // TODO: Replace with fetch('/api/get_tickets.php') for your MySQL backend
      // For now, setting an empty array to prevent rendering crashes
      setTickets([]);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    if (user || isGuest) {
      fetchTickets();
    }
  }, [user, isGuest]);

  const filteredTickets = filter === "all" ? tickets :
    filter === "pending" ? tickets.filter(t => t.status === "pending") :
    filter === "in_progress" ? tickets.filter(t => t.status === "in_progress") :
    tickets.filter(t => t.status === "resolved");

  const handleTicketClick = (t: any) => {
    setSelectedTicket(t);
  };

  const handleCloseModal = () => {
    const ticket = selectedTicket;
    setSelectedTicket(null);
    fetchTickets();

    // Show feedback dialog for resolved tickets (student only)
    if (!isStaffOrAdmin && ticket?.status === "resolved" && !isGuest) {
      setFeedbackTicket(ticket);
      setShowFeedback(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter sidebar */}
        <div className="space-y-2 min-w-[200px]">
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold"
          >
            <span className="text-lg">+</span> Filter
          </button>
          {showFilters && (
            <>            
              <p className="text-xs font-bold text-muted-foreground uppercase px-3 mb-2">Status</p>
              {[
                { id: "all", label: "All Tickets" },
                { id: "pending", label: "Pending" },
                { id: "in_progress", label: "In-Progress" },
                { id: "resolved", label: "Resolved/Closed" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id)}
                  className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                    filter === btn.id 
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm" 
                      : "hover:bg-secondary/80 text-muted-foreground"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Tickets Table */}
        <div className="flex-1 rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-8">
                  <input type="checkbox" className="form-checkbox" />
                </TableHead>
                <TableHead className="font-bold">TICKET ID</TableHead>
                <TableHead className="font-bold">SUBJECT</TableHead>
                <TableHead className="font-bold">DEPARTMENT</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold">DATE SENT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-lg font-medium">No tickets to display</p>
                      <p className="text-sm">The list is currently empty.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((t) => (
                  <TableRow 
                    key={t.id} 
                    className="cursor-pointer hover:bg-secondary/30 transition-colors" 
                    onClick={() => handleTicketClick(t)}
                  >
                    <TableCell className="w-8">
                      <input type="checkbox" className="form-checkbox" />
                    </TableCell>
                    <TableCell className="font-mono font-medium">{t.ticket_number}</TableCell>
                    <TableCell className="font-medium">{t.subject}</TableCell>
                    <TableCell>{t.departments?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[t.status] || ""} border-none`}>
                        {t.status === "in_progress" ? "In-Progress" : t.status === "resolved" ? "Resolved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.created_at ? format(new Date(t.created_at), "MMM d, yyyy") : "---"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modals */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={handleCloseModal}
          isStaff={isStaffOrAdmin}
        />
      )}

      {feedbackTicket && (
        <FeedbackDialog
          open={showFeedback}
          onClose={() => { setShowFeedback(false); setFeedbackTicket(null); }}
          departmentName={feedbackTicket.departments?.name}
          departmentId={feedbackTicket.department_id}
          ticketId={feedbackTicket.id}
        />
      )}
    </div>
  );
};

export default TicketList;