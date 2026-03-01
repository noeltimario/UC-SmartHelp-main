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
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const topicMap: { [key: string]: string[] } = {
    "1": [ // Accounting Office
      "Tuition fee breakdown",
      "Payment verification (GCash, bank, etc.)",
      "Promissory Notes",
      "Official receipt request",
      "Refund requests",
      "Balance inquiry",
    ],
    "2": [ // Cashiers Office
      "Payment Inquiry",
      "Tuition Payment",
      "Payment Verification",
      "Official Receipt Request",
      "Balance Inquiry",
      "Installment Payment",
      "Overpayment Concern",
      "Refund Request",
      "Payment Deadline Inquiry",
      "GCash/Online Payment Issue",
      "Payment Posting Delay",
      "Miscellaneous Fees Payment",
      "Lost Receipt Concern",
      "Payment Adjustment Request",
      "Down Payment Concern",
    ],
    "3": [ // Clinic
      "Vaccination Inquiry",
      "First Aid Concern",
      "Health Assessment",
      "Medicine Availability Inquiry",
      "Dental Checkup Inquiry",
      "Clinic Schedule Inquiry",
      "Emergency Assistance",
      "Medical Consultation",
      "Health Record Request",
      "Medical Certificate Request",
    ],
    "4": [ // CCS Office
      "Subject Prerequisites Inquiry",
      "Schedule Conflict Concern",
      "Faculty Consultation Request",
      "Capstone/Thesis Guidelines",
      "Internship/OJT Requirements",
      "Department Clearance Request",
      "Subject Enrollment Assistance",
      "Section Assignment Concern",
      "Academic Advising",
      "Curriculum Inquiry",
      "Department Announcement/Update",
      "Student Organization/Club Concern",
    ],
    "5": [ // Registrar Office
      "Enrollment Concern",
      "Subject Registration",
      "Add/Drop Subjects",
      "Transcript of Records Request",
      "Certificate Request",
      "Grade Inquiry",
      "Grade Correction",
      "Graduation Requirements",
      "Student Records Update",
      "Transfer Credentials",
      "Honorable Dismissal",
      "Schedule Concern",
      "Section Change Request",
      "Clearance Concern",
      "Diploma Request",
    ],
    "6": [ // SAO (Student Affairs Office)
      "Bullying or complaint reports",
      "Student discipline concerns",
      "Uniform Exemption Requirements",
      "Enrollment Requirements",
    ],
    "7": [ // Scholarship Office
      "Scholarship Application",
      "Scholarship Requirements",
      "Scholarship Eligibility",
      "Scholarship Status",
      "Scholarship Renewal",
      "Scholarship Grades Compliance",
      "Scholarship Discount Concern",
      "Scholarship Allowance",
      "Scholarship Verification",
      "Scholarship Appeal",
      "Scholarship Cancellation",
      "Scholarship Transfer",
      "Scholarship Document Submission",
      "External Scholarship Concern",
      "Scholarship Deadline Inquiry",
    ],
  };

  useEffect(() => {
    const deptList = [
      { id: "1", name: "Accounting Office" },
      { id: "2", name: "Cashiers Office" },
      { id: "3", name: "Clinic" },
      { id: "4", name: "CCS Office" },
      { id: "5", name: "Registrar Office" },
      { id: "6", name: "SAO (Student Affairs Office)" },
      { id: "7", name: "Scholarship Office" },
    ];
    setDepartments(deptList);
  }, []);

  useEffect(() => {
    setTopic("");
  }, [departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !departmentId) {
      toast({ title: "Error", description: "Please select a department", variant: "destructive" });
      return;
    }
    if (!topic) {
      toast({ title: "Error", description: "Please select a topic", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("tickets").insert({
      subject: topic,
      description,
      department_id: departmentId,
      sender_id: user.id,
      ticket_number: "TEMP",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket submitted!" });
      setTopic("");
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
            <Label>Subject/Topic:</Label>
            {departmentId ? (
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                <SelectContent>
                  {topicMap[departmentId]?.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-sm">
                Please select a department first
              </div>
            )}
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
