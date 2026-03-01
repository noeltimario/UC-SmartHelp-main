import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Ticket, ClipboardList } from "lucide-react";
import NewTicketDialog from "@/components/tickets/NewTicketDialog";
import TicketList from "@/components/tickets/TicketList";
import TicketDetailModal from "@/components/tickets/TicketDetailModal";
import Chatbot from "@/components/chatbot/Chatbot";
import FeedbackDialog from "@/components/tickets/FeedbackDialog";
import { Button } from "@/components/ui/button";

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const guestFlag = localStorage.getItem("uc_guest") === "1";

    // Redirect to login when neither user nor guest flag present
    if (!savedUser && !guestFlag) {
      navigate("/login");
      return;
    }

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

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [view, setView] = useState<"home" | "tickets">("home");
  const [showFeedback, setShowFeedback] = useState(false);

  type TicketPreview = {
    id: string;
    ticket_number?: string;
    subject?: string;
    status?: string;
    created_at?: string;
    department_id?: string;
    departments?: { name?: string } | null;
  };

  const [recentTickets, setRecentTickets] = useState<TicketPreview[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketPreview | null>(null);

  useEffect(() => {
    const loadRecent = async () => {
      if (isGuest || !user) return setRecentTickets([]);
      
      // TODO: Replace this with your MySQL fetch via PHP/Node API
      // For now, we set to empty to prevent Supabase from crashing the app
      setRecentTickets([]);
    };
    loadRecent();
  }, [user, isGuest]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="rounded-xl border bg-card p-2 shadow-sm">
          <div className="container py-8 space-y-8">
            {/* Welcome banner */}
            <div className="rounded-xl uc-gradient px-8 py-6 bg-primary text-white text-center">
              <h1 className="text-2xl font-bold italic md:text-3xl">
                Welcome {user?.firstName || (isGuest ? "Guest" : "Student")}!
              </h1>
            </div>

      {view === "home" ? (
        <>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <button
                onClick={() => { if (!isGuest) setShowNewTicket(true); }}
                className={
                  "flex flex-col items-center gap-3 rounded-xl border bg-card p-8 shadow-sm transition-shadow " +
                  (isGuest ? "opacity-50 cursor-not-allowed" : "hover:shadow-md")
                }
                disabled={isGuest}
              >
                <div className="h-12 w-12">
                  <Ticket className="h-12 w-12 text-primary" />
                </div>
                <span className="text-lg font-semibold text-foreground">New Ticket</span>
                <p className="text-sm text-muted-foreground text-center">
                  {isGuest ? "Available after registering" : "Create a new support ticket"}
                </p>
              </button>

              <button
                onClick={() => { if (!isGuest) setView("tickets"); }}
                className={
                  "flex flex-col items-center gap-3 rounded-xl border bg-card p-8 shadow-sm transition-shadow " +
                  (isGuest ? "opacity-50 cursor-not-allowed" : "hover:shadow-md")
                }
                disabled={isGuest}
              >
                <div className="h-12 w-12">
                  <ClipboardList className="h-12 w-12 text-primary" />
                </div>
                <span className="text-lg font-semibold text-foreground">Check Ticket Status</span>
                <p className="text-sm text-muted-foreground text-center">
                  {isGuest ? "Available after registering" : "View and manage your tickets"}
                </p>
              </button>
            </div>

            {/* Recent tickets preview */}
            {recentTickets.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <h3 className="font-semibold mb-2">Recent Tickets</h3>
                <ul className="space-y-2">
                  {recentTickets.map((t) => (
                    <li 
                      key={t.id} 
                      className="p-2 rounded hover:bg-secondary/20 cursor-pointer" 
                      onClick={() => { setSelectedTicket(t); setView('tickets'); }}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{t.ticket_number} — {t.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.status === 'in_progress' ? 'In-Progress' : t.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Chatbot */}
            <div className="mt-6">
              <Chatbot />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setView("home")}>← Back to Dashboard</Button>
          <div className="p-8 text-center border-2 border-dashed rounded-xl">
             <p className="text-muted-foreground">Ticket List (MySQL Connection Pending)</p>
          </div>
        </div>
      )}

      {/* Modals remain, but they may need internal revisions later */}
      <NewTicketDialog open={showNewTicket} onOpenChange={setShowNewTicket} />
            <FeedbackDialog open={showFeedback} onClose={() => setShowFeedback(false)} />
            {selectedTicket && (
              <TicketDetailModal
                ticket={selectedTicket}
                onClose={() => { setSelectedTicket(null); setView('home'); }}
                isStaff={false}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;