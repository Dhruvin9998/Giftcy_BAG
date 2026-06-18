import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient } from "@/lib/apiClient";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  phone?: string;
  address?: string;
};

type SignInResult = { error?: string; requiresVerification?: boolean; email?: string; emailFailed?: boolean; user?: AuthUser };

type AuthCtx = {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string; emailFailed?: boolean; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ error?: string }>;
  resendOTP: (email: string) => Promise<{ error?: string; message?: string; emailFailed?: boolean }>;
  googleSignIn: (credential: string) => Promise<{ error?: string }>;
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
          phone: u.phone,
          address: u.address,
        };
        setUser(mappedUser);
        setIsAdmin(u.role === "admin");
      } else {
        signOutLocal();
      }
    } catch (error) {
      console.error("Token verification failed", error);
      localStorage.removeItem("token");
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
        const { token, user: u, requiresVerification, emailFailed } = response.data;
        if (requiresVerification) {
          return { requiresVerification: true, email, emailFailed: !!emailFailed };
        }
        localStorage.setItem("token", token);
        const mappedUser: AuthUser = {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
          phone: u.phone,
          address: u.address,
        };
        setUser(mappedUser);
        setIsAdmin(u.role === "admin");
        return { user: mappedUser };
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
        return { 
          emailFailed: !!response.data?.emailFailed, 
          message: response.message 
        }; // Signup success, return mail send status
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
          phone: u.phone,
          address: u.address,
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

  const resendOTP: AuthCtx["resendOTP"] = async (email) => {
    try {
      const response = await apiClient.post("/auth/resend-otp", { email });
      if (response?.success) {
        return { 
          message: response.message || "A new verification code has been sent.",
          emailFailed: !!response.data?.emailFailed
        };
      }
      return { error: response.message || "Failed to resend code" };
    } catch (error: any) {
      return { error: error.message || "Failed to resend verification code" };
    }
  };

  const googleSignIn: AuthCtx["googleSignIn"] = async (credential) => {
    try {
      const response = await apiClient.post("/auth/google-login", { credential });
      if (response?.success && response?.data) {
        const { token, user: u } = response.data;
        localStorage.setItem("token", token);
        const mappedUser: AuthUser = {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
          phone: u.phone,
          address: u.address,
        };
        setUser(mappedUser);
        setIsAdmin(u.role === "admin");
        return {};
      }
      return { error: response.message || "Google sign-in failed" };
    } catch (error: any) {
      return { error: error.message || "Google authentication failed" };
    }
  };

  const signOut = async () => {
    signOutLocal();
    sessionStorage.setItem("loggedOut", "true");
    window.location.href = "/";
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
          phone: u.phone,
          address: u.address,
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
    <Ctx.Provider value={{ user, isAdmin, loading, signIn, signUp, verifyOTP, resendOTP, googleSignIn, signOut, claimFirstAdmin, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
};
