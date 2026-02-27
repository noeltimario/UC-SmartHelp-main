import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface Props {
  ticket: any;
  onClose: () => void;
  isStaff?: boolean;
}

const TicketDetailModal = ({ ticket, onClose, isStaff = false }: Props) => {
  // 1. Manual Auth instead of useAuth()
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [forwardDept, setForwardDept] = useState("");
  const [showForward, setShowForward] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  // 2. Stubbed Fetchers (No Supabase)
  const fetchMessages = async () => {
    // TODO: Replace with fetch(`/api/messages.php?ticket_id=${ticket.id}`)
    setMessages([]); 
  };

  const fetchDepartments = async () => {
    // TODO: Replace with fetch('/api/departments.php')
    setDepartments([
      { id: "1", name: "Registrar" },
      { id: "2", name: "Accounting" },
      { id: "3", name: "IT Services" }
    ]);
  };

  useEffect(() => {
    if (ticket?.id) {
      fetchMessages();
      fetchDepartments();
    }
  }, [ticket?.id]);

  const handleSendReply = async () => {
    if (!reply.trim() || !user) return;
    setLoading(true);
    
    // TODO: Implement MySQL insert via API
    console.log("Reply submitted:", reply);
    
    setReply("");
    setShowReplyBox(false);
    setLoading(false);
    toast({ title: "Reply sent (Local Mode)" });
  };

  const handleForward = async () => {
    if (!forwardDept) return;
    
    // TODO: Implement MySQL update via API
    const dept = departments.find((d) => d.id === forwardDept);
    toast({ title: `Ticket forwarded to ${dept?.name || "department"}` });
    setShowForward(false);
    onClose();
  };

  const senderName = ticket.profiles 
    ? `${ticket.profiles.first_name || ""} ${ticket.profiles.last_name || ""}`.trim() 
    : "Unknown Student";
    
  const deptName = ticket.departments?.name || "General Department";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-background border p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Ticket Details</h2>
            <p className="text-sm text-muted-foreground">ID: {ticket.ticket_number || "Draft"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg mb-6 text-sm">
          <div>
            <span className="font-semibold block text-muted-foreground">From</span>
            <span className="text-foreground">{isStaff ? senderName : "You (Student)"}</span>
          </div>
          <div>
            <span className="font-semibold block text-muted-foreground">Department</span>
            <span className="text-foreground">{deptName}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <div>
            <span className="font-semibold text-sm text-primary uppercase tracking-wider">Subject</span>
            <h3 className="text-lg font-medium">{ticket.subject}</h3>
          </div>
          <div className="bg-muted/20 p-4 rounded-lg border border-dashed">
             <span className="font-semibold text-sm text-muted-foreground block mb-2">Message Body</span>
             <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.description || "No description provided."}</p>
          </div>
        </div>

        {/* Thread History */}
        {messages.length > 0 && (
          <div className="space-y-6 mb-8">
            <h4 className="text-sm font-bold uppercase text-muted-foreground">Conversation History</h4>
            {messages.map((m) => (
              <div key={m.id} className="bg-card border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between mb-2 text-xs font-medium">
                  <span className="text-primary">{m.profiles?.first_name} {m.profiles?.last_name}</span>
                  <span className="text-muted-foreground">Just now</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Reply/Forward Forms */}
        {showReplyBox && (
          <div className="mt-6 p-4 border rounded-xl bg-secondary/10 space-y-4 animate-in slide-in-from-top-2">
            <Textarea
              placeholder="Write your response here..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[120px] bg-background"
            />
            <div className="flex gap-2">
              <Button onClick={handleSendReply} disabled={loading || !reply.trim()} className="flex-1">
                Send Reply
              </Button>
              <Button variant="outline" onClick={() => setShowReplyBox(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {showForward && (
          <div className="mt-6 p-4 border rounded-xl bg-secondary/10 space-y-4 animate-in slide-in-from-top-2">
            <p className="text-sm font-bold">Transfer to Department</p>
            <Select value={forwardDept} onValueChange={setForwardDept}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select destination..." />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleForward} disabled={!forwardDept} className="flex-1">
                Confirm Forward
              </Button>
              <Button variant="outline" onClick={() => setShowForward(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Base Action Buttons */}
        {!showReplyBox && !showForward && (
          <div className="flex gap-3 pt-6 border-t mt-6">
            <Button onClick={() => setShowReplyBox(true)} className="flex-1 py-6 text-lg font-bold">
              Reply
            </Button>
            <Button variant="outline" onClick={() => setShowForward(true)} className="flex-1 py-6 text-lg font-bold">
              Forward
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailModal;