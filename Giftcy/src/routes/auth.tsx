import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/apiClient";

export type AuthSearch = {
  tab?: "signup" | "login" | "forgot" | "reset";
  mode?: "signup" | "login" | "forgot" | "reset";
  token?: string;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    tab: (s.tab as any) || undefined,
    mode: (s.mode as any) || undefined,
    token: (s.token as string) || undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Giftcy" }] }),
  component: AuthPage,
});

/* ─── OTP Timer Hook ─── */
function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((s?: number) => {
    setSeconds(s ?? initialSeconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialSeconds]);

  const stop = useCallback(() => {
    setSeconds(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return { seconds, start, formatted: formatTime(seconds), isActive: seconds > 0 };
}

/* ─── Main Auth Page ─── */
function AuthPage() {
  const { tab, mode: queryMode, token } = Route.useSearch();
  const nav = useNavigate();
  const { signIn, signUp, verifyOTP, resendOTP, googleSignIn, user, isAdmin, claimFirstAdmin } = useAuth();
  
  const initialMode = queryMode || tab || "login";
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    initialMode === "reset" && token ? "reset" : (initialMode as any)
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const [retrievingOtp, setRetrievingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const isGoogleInitialized = useRef(false);

  const resendTimer = useCountdown(60);
  const expiryTimer = useCountdown(600); // 10 minutes

  useEffect(() => {
    const activeMode = queryMode || tab || "login";
    if (activeMode === "reset" && token) {
      setMode("reset");
    } else {
      setMode(activeMode as any);
    }
  }, [tab, queryMode, token]);

  useEffect(() => { if (user) nav({ to: isAdmin ? "/admin" : "/" }); }, [user, isAdmin, nav]);

  useEffect(() => {
    if (showOtpVerification) {
      setIsGoogleReady(false);
    }
  }, [showOtpVerification]);

  // Google Sign-In initialization
  const handleGoogleCredential = useCallback(async (response: any) => {
    setGoogleLoading(true);
    const res = await googleSignIn(response.credential);
    setGoogleLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Signed in with Google!");
    }
  }, [googleSignIn]);

  useEffect(() => {
    if (mode === "forgot" || mode === "reset") return;
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "your_google_client_id_here") return;

    const initGoogle = () => {
      if (!(window as any).google?.accounts?.id) return;
      if (!isGoogleInitialized.current) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          auto_select: false,
        });
        isGoogleInitialized.current = true;
      }
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = "";
        (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: Math.max(200, Math.min(400, googleBtnRef.current.offsetWidth || 350)),
          text: "continue_with",
          shape: "pill",
        });
        setIsGoogleReady(true);
      }
    };

    if ((window as any).google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [handleGoogleCredential, showOtpVerification, mode]);

  const handleGoToOtp = () => {
    setShowOtpVerification(true);
    setOtp("");
    expiryTimer.start(600);
    resendTimer.start(60);
  };

  const fetchStagingOtp = async () => {
    setRetrievingOtp(true);
    try {
      const response = await apiClient.get(`/auth/debug-otp/${encodeURIComponent(email)}`);
      setRetrievingOtp(false);
      if (response?.success && response?.otp) {
        setOtp(response.otp);
        toast.success(`Staging Bypass: Verification code retrieved (${response.otp})!`);
      } else {
        toast.error("Failed to retrieve code. Check if the email address is correct.");
      }
    } catch (err: any) {
      setRetrievingOtp(false);
      toast.error(err.message || "Staging code retrieval failed.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await signIn(email.trim(), password);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        if (res.requiresVerification) {
          if (res.email) setEmail(res.email);
          setEmailFailed(!!res.emailFailed);
          if (res.emailFailed) {
            toast.warning("Verification email delivery failed, but you can request a resend.");
          } else {
            toast.info("Your account needs verification. Check your email for the OTP code.");
          }
          handleGoToOtp();
          return;
        }
        toast.success("Welcome back!");
      } else if (mode === "signup") {
        const res = await signUp(email.trim(), password, name.trim());
        if (res.error) {
          if (
            res.error.toLowerCase().includes("already exists") ||
            res.error.toLowerCase().includes("already in use")
          ) {
            toast.info("An account with this email already exists. Redirecting you to Sign In.");
            setMode("login");
            nav({ to: "/auth", search: { tab: "login" } });
          } else {
            toast.error(res.error);
          }
          return;
        }
        setEmailFailed(!!res.emailFailed);
        if (res.emailFailed) {
          toast.warning(res.message || "Account created, but we couldn't send the verification email.");
        } else {
          toast.success(res.message || "Account created! Check your email for the verification code.");
        }
        handleGoToOtp();
      } else if (mode === "forgot") {
        const response = await apiClient.post("/auth/forgot-password", { email: email.trim() });
        if (response?.success) {
          toast.success("Password recovery link sent! Check your email.");
          setEmail("");
        } else {
          toast.error(response.message || "Failed to send reset link");
        }
      } else if (mode === "reset") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        const response = await apiClient.put(`/auth/reset-password/${token}`, { password });
        if (response?.success) {
          toast.success("Password reset successfully! Please log in.");
          setMode("login");
          setPassword("");
          setConfirmPassword("");
          nav({ to: "/auth", search: { tab: "login" } });
        } else {
          toast.error(response.message || "Failed to reset password");
        }
      }
    } catch (err: any) {
      console.error("Auth submit error:", err);
      toast.error(err.message || "An error occurred during authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    const res = await verifyOTP(email, otp);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      setOtp("");
      return;
    }
    toast.success("Email verified successfully! Welcome to Giftcy.");
  };

  const handleResendOtp = async () => {
    if (resendTimer.isActive) return;
    const res = await resendOTP(email);
    setEmailFailed(!!res.emailFailed);
    if (res.error) {
      toast.error(res.error);
    } else {
      if (res.emailFailed) {
        toast.warning("Failed to deliver email. Use the retrieve button below.");
      } else {
        toast.success(res.message || "New code sent!");
      }
      resendTimer.start(60);
      expiryTimer.start(600);
      setOtp("");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center p-4 lg:p-12 bg-gradient-to-br from-background via-cream to-beige" id="auth-page">
      <div className="w-full max-w-5xl grid lg:grid-cols-12 bg-card rounded-3xl overflow-hidden border border-border shadow-luxury">
        
        {/* Left column: brand aesthetic (hidden on mobile, occupies 5 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-foreground overflow-hidden flex-col justify-between p-12 text-background">
          {/* Subtle warm overlay pattern */}
          <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800')` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/90 to-foreground" />
          
          <div className="relative z-10">
            <Link to="/" className="serif text-2xl font-bold tracking-widest text-gold hover:text-gold/90 transition-colors">GIFTCY</Link>
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mt-1">Luxury Gifting</p>
          </div>
          
          <div className="relative z-10 space-y-6 my-auto">
            <h2 className="serif text-4xl leading-tight font-light text-gold-soft">
              Make Every <br />
              Gift Premium
            </h2>
            <p className="text-sm text-background/80 leading-relaxed font-light max-w-xs">
              Handcrafted in India by master karigars. Elevating celebrations with reusable fabric gift bags of silk, satin, and brocade.
            </p>
            
            <div className="space-y-4 pt-6 border-t border-background/10">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="text-xs tracking-wide text-background/90">Premium Cotton, Satin & Silk Fabrics</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="text-xs tracking-wide text-background/90">100% Reusable Eco-friendly Design</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="text-xs tracking-wide text-background/90">Traditional Craft & Hand-sewn Details</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 text-[10px] tracking-wider text-muted-foreground">
            &copy; 2026 Giftcy Inc. All rights reserved.
          </div>
        </div>

        {/* Right column: auth forms (occupies 7 cols on lg, 12 cols on smaller) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-12 bg-card">
          <AnimatePresence mode="wait">
            {showOtpVerification ? (
              /* ─── OTP Verification Screen ─── */
              <motion.div
                key="otp"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-md mx-auto"
                id="otp-verification-card"
              >
                {mode === "signup" && <StepIndicator step={2} />}

                <div className="text-center mb-6">
                  <EmailIcon />
                  <p className="text-[11px] tracking-[0.25em] uppercase text-gold mb-2">Email Verification</p>
                  <h1 className="serif text-3xl">Check your inbox</h1>
                </div>

                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  We've sent a 6-digit verification code to<br />
                  <strong className="text-foreground">{email}</strong>
                </p>

                {/* Staging Retrieval Bypass Card */}
                {emailFailed && (
                  <div className="mb-6 p-4 rounded-2xl bg-gold/10 border border-gold/20 text-xs text-foreground/90 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <svg className="text-gold mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                      <div>
                        <strong className="font-semibold block text-gold mb-0.5">Email Delivery issue</strong>
                        We had trouble delivering the verification email to your inbox. Since this application is in testing, you can bypass this by fetching the code directly:
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={fetchStagingOtp}
                      disabled={retrievingOtp}
                      className="w-full py-2.5 rounded-xl bg-gold hover:bg-gold/90 text-background text-xs tracking-wide font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      {retrievingOtp ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Retrieving...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                          Retrieve Staging Verification Code
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="mb-6">
                  <OtpDigitInput value={otp} onChange={setOtp} onComplete={submitOtp} />
                </div>

                {expiryTimer.isActive && (
                  <p className="text-xs text-center text-muted-foreground mb-4">
                    Code expires in{" "}
                    <span className={`font-mono font-bold ${expiryTimer.seconds < 60 ? "text-destructive" : "text-gold"}`}>
                      {expiryTimer.formatted}
                    </span>
                  </p>
                )}

                <button
                  onClick={submitOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 rounded-full bg-foreground text-background text-sm tracking-wide
                             disabled:opacity-40 hover:opacity-90 transition-all duration-200 font-medium mb-4"
                  id="verify-otp-btn"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Verifying…
                    </span>
                  ) : "Verify Email"}
                </button>

                {/* Staging Bypass fallback for normal modes */}
                {!emailFailed && (
                  <div className="text-center mb-4">
                    <button
                      type="button"
                      onClick={fetchStagingOtp}
                      disabled={retrievingOtp}
                      className="text-[11px] text-muted-foreground hover:text-gold transition-colors duration-200 flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                      {retrievingOtp ? "Bypassing..." : "Bypass with Staging Code (Testing)"}
                    </button>
                  </div>
                )}

                <div className="text-center mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer.isActive}
                    className={`text-sm font-medium transition-all duration-200
                      ${resendTimer.isActive
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-gold hover:text-gold/80 underline underline-offset-2"
                      }`}
                    id="resend-otp-btn"
                  >
                    {resendTimer.isActive
                      ? `Resend in ${resendTimer.formatted}`
                      : "Resend code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowOtpVerification(false); setOtp(""); }}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center justify-center gap-1"
                  id="back-to-form-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                  Back to {mode === "signup" ? "registration" : "login"}
                </button>
              </motion.div>
            ) : (
              /* ─── Login / Signup / Forgot Form ─── */
              <motion.div
                key="form"
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-md mx-auto"
                id="auth-form-card"
              >
                {mode === "signup" && <StepIndicator step={1} />}

                <div className="text-center mb-8">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Giftcy Account</p>
                  <h1 className="serif text-4xl mt-2">
                    {mode === "login" 
                      ? "Welcome back" 
                      : mode === "signup" 
                      ? "Create account" 
                      : mode === "forgot" 
                      ? "Reset Password" 
                      : "New Password"}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-2">
                    {mode === "login"
                      ? "Sign in to access your orders and wishlist"
                      : mode === "signup"
                      ? "Join Giftcy for a premium gifting experience"
                      : mode === "forgot"
                      ? "Enter your email to receive a recovery link"
                      : "Choose a strong new password below"}
                  </p>
                </div>

                {/* Tab Switcher */}
                {mode !== "forgot" && mode !== "reset" && (
                  <div className="flex p-1 bg-cream rounded-full mb-6 text-sm" id="auth-tab-switcher">
                    {(["login", "signup"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`flex-1 py-2.5 rounded-full transition-all duration-300 font-medium
                          ${mode === m
                            ? "bg-foreground text-background shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                        id={`tab-${m}`}
                      >{m === "login" ? "Sign in" : "Sign up"}</button>
                    ))}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-4" id="auth-form">
                  <AnimatePresence mode="wait">
                    {mode === "signup" && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full name"
                            className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all duration-200"
                            id="input-name"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {mode !== "reset" && (
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full pl-11 pr-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all duration-200"
                        id="input-email"
                      />
                    </div>
                  )}

                  {mode !== "forgot" && (
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === "reset" ? "New Password" : "Password"}
                        className="w-full pl-11 pr-12 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all duration-200"
                        id="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        id="toggle-password-btn"
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  )}

                  {mode === "reset" && (
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        className="w-full pl-11 pr-12 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all duration-200"
                        id="input-confirm-password"
                      />
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          nav({ to: "/auth", search: { tab: "forgot" } as any });
                        }}
                        className="text-xs text-gold hover:text-gold/80 underline underline-offset-2"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    disabled={loading}
                    className="w-full py-3.5 rounded-full bg-foreground text-background text-sm tracking-wide font-medium
                               disabled:opacity-40 hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2"
                    id="submit-auth-btn"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Please wait…
                      </>
                    ) : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send recovery link" : "Reset Password"}
                  </button>
                </form>

                {/* Back to sign in button */}
                {(mode === "forgot" || mode === "reset") && (
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        nav({ to: "/auth", search: { tab: "login" } });
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center justify-center gap-1 mx-auto"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      Back to sign in
                    </button>
                  </div>
                )}

                {/* Divider (hide for forgot/reset modes) */}
                {mode !== "forgot" && mode !== "reset" && (
                  <>
                    <div className="flex items-center gap-3 my-6">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Google Sign-In */}
                    {googleLoading ? (
                      <div className="w-full py-3 rounded-full border border-border text-sm text-muted-foreground flex items-center justify-center gap-2.5">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Signing in with Google…
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center gap-2" id="google-signin-wrapper">
                        <div
                          ref={googleBtnRef}
                          className="w-full flex justify-center"
                          id="google-signin-container"
                          style={{ display: isGoogleReady ? "flex" : "none" }}
                        />

                        {!isGoogleReady && (
                          <button
                            type="button"
                            className="w-full py-3 rounded-full border border-border text-sm text-muted-foreground hover:border-gold/50 hover:text-foreground transition-all duration-200 flex items-center justify-center gap-2.5"
                            onClick={() => {
                              const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
                              if (!clientId || clientId === "your_google_client_id_here") {
                                toast.info("Google Sign-In setup needed. See the instructions below.", {
                                  description: "Add VITE_GOOGLE_CLIENT_ID to your frontend .env and GOOGLE_CLIENT_ID to your backend .env",
                                  duration: 8000,
                                });
                              } else {
                                toast.info("Google Sign-In is loading, please try again in a moment.");
                              }
                            }}
                            id="google-signin-fallback-btn"
                          >
                            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>
                            Continue with Google
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Claim Admin (shown when user is logged in) */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 max-w-md mx-auto w-full"
            >
              <button
                onClick={async () => {
                  const r = await claimFirstAdmin();
                  r.ok ? toast.success(r.message) : toast.error(r.message);
                  if (r.ok) nav({ to: "/admin" });
                }}
                className="w-full py-3 rounded-full border border-gold text-gold text-sm hover:bg-gold/10 transition-all duration-200"
                id="claim-admin-btn"
              >Become first admin</button>
            </motion.div>
          )}

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing you agree to our terms. <Link to="/" className="underline hover:text-foreground transition-colors">Back home</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Framer Motion Variants ─── */
const pageVariants = {
  enter: { opacity: 0, x: 10 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

/* ─── UI Sub-components ─── */
function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex justify-between items-center gap-2 mb-6">
      <div className="flex-1 h-1 rounded bg-gold" />
      <div className={`flex-1 h-1 rounded ${step >= 2 ? "bg-gold" : "bg-border"}`} />
    </div>
  );
}

function EmailIcon() {
  return (
    <div className="h-16 w-16 mx-auto rounded-full bg-cream flex items-center justify-center text-gold mb-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
    </div>
  );
}

function OtpDigitInput({ value, onChange, onComplete }: { value: string; onChange: (v: string) => void; onComplete: () => void }) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val) return;
    const split = value.split("");
    split[idx] = val[val.length - 1];
    const nextVal = split.join("");
    onChange(nextVal);

    if (idx < 5 && inputsRef.current[idx + 1]) {
      inputsRef.current[idx + 1]?.focus();
    } else if (idx === 5 && nextVal.length === 6) {
      setTimeout(onComplete, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (!value[idx] && idx > 0 && inputsRef.current[idx - 1]) {
        inputsRef.current[idx - 1]?.focus();
        const split = value.split("");
        split[idx - 1] = "";
        onChange(split.join(""));
      } else {
        const split = value.split("");
        split[idx] = "";
        onChange(split.join(""));
      }
    }
  };

  return (
    <div className="flex justify-center gap-2.5">
      {[...Array(6)].map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          type="text"
          maxLength={1}
          pattern="[0-9]*"
          inputMode="numeric"
          value={value[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className="h-12 w-12 rounded-xl border border-border text-center text-lg font-mono font-bold focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 transition-all duration-200"
        />
      ))}
    </div>
  );
}
