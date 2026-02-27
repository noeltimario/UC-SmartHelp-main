import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

const ReviewAnalytics = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles:user_id(first_name, last_name), departments(name)");
      if (data) {
        setReviews(data);
        setComments(data.filter((r) => r.comment));
      }
      const { data: depts } = await supabase.from("departments").select("id, name");
      if (depts) setDepartments(depts);
    };
    fetchData();
  }, []);

  const filtered = selectedDept === "all"
    ? reviews
    : reviews.filter((r) => r.department_id === selectedDept);

  const filteredComments = selectedDept === "all"
    ? comments
    : comments.filter((r) => r.department_id === selectedDept);

  const helpful = filtered.filter((r) => r.helpful).length;
  const notHelpful = filtered.filter((r) => !r.helpful).length;

  const chartData = [
    { name: "Helpful", value: helpful },
    { name: "Not Helpful", value: notHelpful },
  ];

  const selectedDeptName = selectedDept === "all"
    ? "All Departments"
    : departments.find((d) => d.id === selectedDept)?.name || "";

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Review Analytic</h2>
        {selectedDept !== "all" && (
          <p className="text-sm text-muted-foreground">This review is only for {selectedDeptName}</p>
        )}
      </div>

      {/* Department filter */}
      <Select value={selectedDept} onValueChange={setSelectedDept}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select Office to View Reviews" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Chart */}
      <div>
        <h3 className="text-center font-semibold text-foreground mb-4">USER FEEDBACK</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: "Number of Users", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(217, 85%, 45%)">
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comments table */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Comments/ Suggestions</h3>
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableBody>
              {filteredComments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">No comments yet.</TableCell>
                </TableRow>
              ) : (
                filteredComments.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium w-48">
                      {c.profiles?.first_name} {c.profiles?.last_name}
                    </TableCell>
                    <TableCell>{c.comment}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalytics;
