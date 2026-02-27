import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewTicketDialog = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("departments").select("id, name").then(({ data }) => {
      if (data) setDepartments(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("tickets").insert({
      subject,
      description,
      department_id: departmentId,
      sender_id: user.id,
      ticket_number: "TEMP",
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket submitted!" });
      setSubject("");
      setDescription("");
      setDepartmentId("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Ticket</DialogTitle>
          <p className="text-sm text-muted-foreground">Please fill out the form below and click submit when you're done.</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>To:</Label>
            <Select value={departmentId} onValueChange={setDepartmentId} required>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subject:</Label>
            <Input placeholder="Enter the title of this ticket" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Description:</Label>
            <p className="text-xs text-muted-foreground">(Kindly state your Id number in your message if you're a student)</p>
            <Textarea placeholder="Describe your concern..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} />
          </div>
          <Button type="submit" disabled={loading} className="w-full uc-gradient-btn text-primary-foreground font-semibold">
            {loading ? "Submitting..." : "SUBMIT"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTicketDialog;
