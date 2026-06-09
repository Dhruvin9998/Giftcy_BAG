import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient } from "@/lib/apiClient";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
};

type AuthCtx = {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  claimFirstAdmin: () => Promise<{ ok: boolean; message: string }>;
  refreshRole: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkProfile = async (token: string) => {
    try {
      const response = await apiClient.get("/auth/profile");
      if (response?.success && response?.data?.user) {
        const u = response.data.user;
        const mappedUser: AuthUser = {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
        };
        setUser(mappedUser);
        setIsAdmin(u.role === "admin");
      } else {
        signOutLocal();
      }
    } catch (error) {
      signOutLocal();
    } finally {
      setLoading(false);
    }
  };

  const signOutLocal = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      if (response?.success && response?.data) {
        const { token, user: u } = response.data;
        localStorage.setItem("token", token);
        const mappedUser: AuthUser = {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
        };
        setUser(mappedUser);
        setIsAdmin(u.role === "admin");
        return {};
      }
      return { error: response.message || "Failed to sign in" };
    } catch (error: any) {
      return { error: error.message || "Invalid credentials" };
    }
  };

  const signUp: AuthCtx["signUp"] = async (email, password, fullName) => {
    try {
      const response = await apiClient.post("/auth/signup", { email, password, name: fullName });
      if (response?.success) {
        return {}; // Signup success, needs OTP verification
      }
      return { error: response.message || "Failed to sign up" };
    } catch (error: any) {
      return { error: error.message || "Registration failed" };
    }
  };

  const verifyOTP: AuthCtx["verifyOTP"] = async (email, otp) => {
    try {
      const response = await apiClient.post("/auth/verify-otp", { email, otp });
      if (response?.success && response?.data) {
        const { token, user: u } = response.data;
        localStorage.setItem("token", token);
        const mappedUser: AuthUser = {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
        };
        setUser(mappedUser);
        setIsAdmin(u.role === "admin");
        return {};
      }
      return { error: response.message || "Verification failed" };
    } catch (error: any) {
      return { error: error.message || "OTP Verification failed" };
    }
  };

  const signOut = async () => {
    signOutLocal();
  };

  const claimFirstAdmin = async () => {
    try {
      const response = await apiClient.put("/auth/claim-first-admin", {});
      if (response?.success && response?.data?.user) {
        const u = response.data.user;
        setUser({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
        });
        setIsAdmin(true);
        return { ok: true, message: "You are now an admin!" };
      }
      return { ok: false, message: response.message || "An admin already exists." };
    } catch (error: any) {
      return { ok: false, message: error.message || "Failed to claim admin status." };
    }
  };

  const refreshRole = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      await checkProfile(token);
    }
  };

  return (
    <Ctx.Provider value={{ user, isAdmin, loading, signIn, signUp, verifyOTP, signOut, claimFirstAdmin, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
};
