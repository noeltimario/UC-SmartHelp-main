import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const Settings = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [saving, setSaving] = useState(false);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ first_name: firstName, last_name: lastName }).eq("user_id", user.id);
    setSaving(false);
    toast({ title: "Profile updated!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg py-12 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <div className="space-y-4 rounded-xl border bg-card p-6">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled />
          </div>
          <Button onClick={handleSave} disabled={saving} className="uc-gradient-btn text-primary-foreground">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
