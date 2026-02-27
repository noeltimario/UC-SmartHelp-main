import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = "student" | "staff" | "admin";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) setProfile(data as Profile);
  };

  const ensureProfileFromUser = async (user: User | null) => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!data) {
        const meta = (user.user_metadata || {}) as any;
        const fullName = meta.name || meta.full_name || `${meta.given_name || ""} ${meta.family_name || ""}`.trim();
        const parts = fullName ? fullName.split(" ") : [];
        const first = parts.shift() || "";
        const last = parts.join(" ") || "";
        await supabase.from("profiles").insert({
          user_id: user.id,
          email: user.email ?? "",
          first_name: first || "",
          last_name: last || "",
        });
      }
    } catch (e) {
      // ignore errors creating profile
      void e;
    }
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (data) setRoles(data.map((r: any) => r.role as AppRole));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
            // Ensure a profile row exists for OAuth users, then fetch profile and roles
            await ensureProfileFromUser(session.user);
            await fetchProfile(session.user.id);
            await fetchRoles(session.user.id);
          } else {
            setProfile(null);
            setRoles([]);
          }
          setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await ensureProfileFromUser(session.user);
        await fetchProfile(session.user.id);
        await fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
