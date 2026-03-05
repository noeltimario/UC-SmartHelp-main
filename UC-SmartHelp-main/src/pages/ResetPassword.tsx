import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!" });
      navigate("/studentdashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl uc-gradient p-8 shadow-xl">
          <h2 className="text-center text-2xl font-bold text-primary-foreground">Set New Password</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-primary-foreground">New Password:</Label>
              <Input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-card/90 border-0" />
            </div>
            <Button type="submit" disabled={loading} className="w-full uc-gradient-btn text-primary-foreground font-semibold">
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
