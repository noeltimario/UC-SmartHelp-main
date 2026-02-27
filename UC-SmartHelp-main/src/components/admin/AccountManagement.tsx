import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AccountManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");
    if (profiles && roles) {
      const merged = profiles.map((p) => ({
        ...p,
        role: roles.find((r) => r.user_id === p.user_id)?.role || "student",
        role_id: roles.find((r) => r.user_id === p.user_id)?.id,
      }));
      setUsers(merged);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string, roleId: string | undefined) => {
    if (roleId) {
      await supabase.from("user_roles").update({ role: newRole as any }).eq("id", roleId);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
    }
    toast({ title: "Role updated" });
    fetchUsers();
  };

  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-xl font-bold text-foreground">Account Management</h2>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary">
              <TableHead>Last Name</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.last_name}</TableCell>
                <TableCell>{u.first_name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v) => handleRoleChange(u.user_id, v, u.role_id)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AccountManagement;
