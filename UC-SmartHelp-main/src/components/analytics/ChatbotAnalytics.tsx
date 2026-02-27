import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ChatbotAnalytics = () => {
  const [totalMessages, setTotalMessages] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [peakTime, setPeakTime] = useState("N/A");

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Get today's messages
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: messages } = await supabase
        .from("chatbot_messages")
        .select("user_id, created_at")
        .gte("created_at", today.toISOString());

      if (messages) {
        setTotalMessages(messages.length);
        const uniqueUsers = new Set(messages.map((m) => m.user_id));
        setActiveUsers(uniqueUsers.size);

        // Calculate peak hour
        const hourCounts: Record<number, number> = {};
        messages.forEach((m) => {
          const hour = new Date(m.created_at).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const peakHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
        if (peakHour) {
          const h = parseInt(peakHour[0]);
          const start = h % 12 || 12;
          const end = (h + 2) % 12 || 12;
          const startAmPm = h < 12 ? "AM" : "PM";
          const endAmPm = (h + 2) < 12 ? "AM" : "PM";
          setPeakTime(`${start}:00 ${startAmPm}- ${end}:00 ${endAmPm}`);
        }
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Chatbot Analytic</h2>
      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
        {/* Total Messages - Blue card */}
        <div className="rounded-xl p-8 text-center text-primary-foreground" style={{ backgroundColor: "hsl(217, 70%, 55%)" }}>
          <p className="text-5xl font-bold">{totalMessages}</p>
          <p className="text-sm mt-2">Total Messages Today</p>
        </div>
        {/* Active Users - Gold card */}
        <div className="rounded-xl p-8 text-center text-primary-foreground" style={{ backgroundColor: "hsl(38, 50%, 55%)" }}>
          <p className="text-5xl font-bold">{activeUsers}</p>
          <p className="text-sm mt-2">Active Users</p>
        </div>
      </div>
      {/* Peak Time - Green card */}
      <div className="max-w-sm mx-auto">
        <div className="rounded-xl p-8 text-center text-primary-foreground" style={{ backgroundColor: "hsl(120, 60%, 40%)" }}>
          <p className="text-3xl font-bold">{peakTime}</p>
          <p className="text-sm mt-2">Peak Time</p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotAnalytics;
