import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  departmentName?: string;
  departmentId?: string;
  ticketId?: string;
}

const FeedbackDialog = ({ open, onClose, departmentName, departmentId, ticketId }: Props) => {
  // 1. Manual Auth Logic
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  
  const { toast } = useToast();
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const title = departmentName
    ? `Was ${departmentName} Helpful?`
    : "Was this page Helpful?";

  const handleSubmit = async () => {
    // Basic validation
    if (helpful === null) {
      toast({ title: "Please select Yes or No", variant: "destructive" });
      return;
    }

    setLoading(true);

    // TODO: Replace this with your MySQL fetch/POST call
    // Example: await fetch('/api/submit_feedback.php', { method: 'POST', body: ... })
    
    console.log("Feedback data:", {
      userId: user?.id || "guest",
      helpful,
      comment: comment.trim(),
      departmentId,
      ticketId
    });

    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      toast({ 
        title: "Feedback Received!", 
        description: "Thank you for helping us improve our services." 
      });
      setHelpful(null);
      setComment("");
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl bg-background border p-8 shadow-2xl mx-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground leading-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">Your feedback helps us provide better support.</p>
          </div>

          {/* Rating Selection */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setHelpful(true)}
              className={`flex-1 h-12 text-base font-semibold transition-all ${
                helpful === true 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Yes, it was
            </Button>
            <Button
              type="button"
              onClick={() => setHelpful(false)}
              className={`flex-1 h-12 text-base font-semibold transition-all ${
                helpful === false 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              No, not really
            </Button>
          </div>

          {/* Comment Area */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Comments or Suggestions <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="bg-muted/30 border-muted focus:ring-primary min-h-[100px] resize-none"
            />
          </div>

          {/* Submit Action */}
          <Button
            onClick={handleSubmit}
            disabled={helpful === null || loading}
            className="w-full py-6 text-lg font-bold shadow-lg transition-transform active:scale-95"
          >
            {loading ? "Submitting..." : "SUBMIT FEEDBACK"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDialog;