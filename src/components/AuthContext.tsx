import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  claimFirstAdmin: () => Promise<{ ok: boolean; message: string }>;
  refreshRole: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRole = async (uid: string | undefined) => {
    if (!uid) return setIsAdmin(false);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setTimeout(() => checkRole(s?.user.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      checkRole(data.session?.user.id).finally(() => setLoading(false));
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };
  const signUp: AuthCtx["signUp"] = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName ?? "" }, emailRedirectTo: window.location.origin },
    });
    return error ? { error: error.message } : {};
  };
  const signOut = async () => { await supabase.auth.signOut(); };
  const claimFirstAdmin = async () => {
    const { data, error } = await supabase.rpc("claim_first_admin");
    if (error) return { ok: false, message: error.message };
    await checkRole(session?.user.id);
    return data ? { ok: true, message: "You are now an admin!" } : { ok: false, message: "An admin already exists." };
  };
  const refreshRole = async () => checkRole(session?.user.id);

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, isAdmin, loading, signIn, signUp, signOut, claimFirstAdmin, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
};
