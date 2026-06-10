import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Giftcy" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { signIn, user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      const isAuthorized = ["admin", "super-admin", "staff"].includes(user.role);
      if (isAuthorized) {
        nav({ to: "/admin/dashboard" });
      }
    }
  }, [user, loading, nav]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBtnLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        toast.error(res.error);
        setBtnLoading(false);
        return;
      }

      // Check if logged in user is admin/staff
      if (res.user) {
        const role = res.user.role;
        const isAuthorized = ["admin", "super-admin", "staff"].includes(role);
        if (isAuthorized) {
          toast.success(`Welcome to Giftcy Management Console, ${res.user.name}!`);
          nav({ to: "/admin/dashboard" });
        } else {
          toast.error("Access Denied", {
            description: "Your account does not have administrative or staff privileges.",
          });
          // Sign out immediately to clear normal user session from admin login context
          await signOut();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to authenticate");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center font-serif text-muted-foreground animate-pulse">
          Validating admin session…
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#FDFBF7] grid place-items-center px-5 py-16 font-sans">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-[#EADFC9] bg-white p-8 lg:p-10 shadow-luxury"
        >
          <div className="text-center mb-8">
            <div className="h-14 w-14 bg-foreground text-background rounded-full flex items-center justify-center font-bold serif text-2xl mx-auto mb-4">
              G
            </div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-gold font-semibold">
              Giftcy Control Engine
            </p>
            <h1 className="serif text-3xl mt-2 font-semibold">Admin Panel Login</h1>
            <p className="text-xs text-muted-foreground mt-2">
              Authorized credentials required for Super Admin, Admin, and Staff channels.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email address"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 text-sm transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secure access password"
                className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 text-sm transition-all"
              />
            </div>

            <button
              disabled={btnLoading}
              className="w-full py-3.5 rounded-full bg-foreground text-background text-xs font-semibold tracking-wider uppercase
                         hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-foreground/10"
            >
              {btnLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-background" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADFC9]/50 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div className="text-[10px] text-muted-foreground leading-relaxed">
              <strong>Security Alert:</strong> IP access logs and login attempts are tracked. Any unauthorized access attempts will trigger account locking flags.
            </div>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          <Link to="/" className="underline hover:text-foreground transition-colors">
            Back to customer website
          </Link>
        </p>
      </div>
    </section>
  );
}
