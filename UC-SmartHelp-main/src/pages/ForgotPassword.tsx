import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    toast({ title: "Check your email", description: "Password reset link sent." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl uc-gradient p-8 shadow-xl">
          <h2 className="text-center text-2xl font-bold text-primary-foreground">Reset Password</h2>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-primary-foreground">Email:</Label>
              <Input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card/90 border-0" />
            </div>
            <Button type="submit" disabled={loading} className="w-full uc-gradient-btn text-primary-foreground font-semibold">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <p className="text-center text-sm text-primary-foreground/80">
            <Link to="/login" className="hover:underline">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
