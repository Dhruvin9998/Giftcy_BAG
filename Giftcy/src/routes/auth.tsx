import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export type AuthSearch = {
  tab?: "signup" | "login";
};

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    tab: s.tab === "signup" ? "signup" : s.tab === "login" ? "login" : undefined,
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

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return { seconds, start, formatted: formatTime(seconds), isActive: seconds > 0 };
}

/* ─── OTP Digit Input Component ─── */
function OtpDigitInput({ value, onChange, onComplete }: {
  value: string;
  onChange: (val: string) => void;
  onComplete: () => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const arr = value.split("");
    while (arr.length < 6) arr.push("");
    arr[index] = char;
    const newVal = arr.join("").slice(0, 6);
    onChange(newVal);
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newVal.length === 6 && !newVal.includes("")) {
      setTimeout(onComplete, 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
    if (pasted.length === 6) {
      setTimeout(onComplete, 100);
    }
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 border-border bg-background
                     focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
                     transition-all duration-200"
          id={`otp-digit-${i}`}
        />
      ))}
    </div>
  );
}

/* ─── Step Indicator ─── */
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
          ${step >= 1 ? "bg-gold text-white" : "bg-border text-muted-foreground"}`}>
          {step > 1 ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          ) : "1"}
        </div>
        <span className={`text-xs font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>Register</span>
      </div>
      <div className={`w-10 h-0.5 rounded-full transition-all duration-500 ${step >= 2 ? "bg-gold" : "bg-border"}`} />
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
          ${step >= 2 ? "bg-gold text-white" : "bg-border text-muted-foreground"}`}>
          2
        </div>
        <span className={`text-xs font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>Verify</span>
      </div>
    </div>
  );
}

/* ─── Email Icon ─── */
function EmailIcon() {
  return (
    <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M22 7l-10 6L2 7" />
      </svg>
    </div>
  );
}

/* ─── Page Transition Wrapper ─── */
const pageVariants = {
  enter: { opacity: 0, y: 20, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

/* ─── Main Auth Page ─── */
function AuthPage() {
  const { tab } = Route.useSearch();
  const nav = useNavigate();
  const { signIn, signUp, verifyOTP, resendOTP, googleSignIn, user, isAdmin, claimFirstAdmin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(tab || "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const resendTimer = useCountdown(60);
  const expiryTimer = useCountdown(600); // 10 minutes

  useEffect(() => { setMode(tab || "login"); }, [tab]);
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
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "your_google_client_id_here") return;

    // Wait for GSI script to load
    const initGoogle = () => {
      if (!(window as any).google?.accounts?.id) return;
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        auto_select: false,
      });
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

    // Try immediately, or wait for script
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
  }, [handleGoogleCredential, showOtpVerification]);

  const handleGoToOtp = () => {
    setShowOtpVerification(true);
    setOtp("");
    expiryTimer.start(600);
    resendTimer.start(60);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "login") {
      const res = await signIn(email, password);
      setLoading(false);
      if (res.error) return toast.error(res.error);
      if (res.requiresVerification) {
        if (res.email) setEmail(res.email);
        toast.info("Your account needs verification. Check your email for the OTP code.");
        handleGoToOtp();
        return;
      }
      toast.success("Welcome back!");
    } else {
      const res = await signUp(email, password, name);
      setLoading(false);
      if (res.error) return toast.error(res.error);
      toast.success("Account created! Check your email for the verification code.");
      handleGoToOtp();
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
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || "New code sent!");
      resendTimer.start(60);
      expiryTimer.start(600);
      setOtp("");
    }
  };

  return (
    <section className="min-h-[80vh] grid place-items-center px-5 py-16" id="auth-page">
      <div className="w-full max-w-md">
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
              className="rounded-3xl border border-border bg-background p-8 lg:p-10 shadow-luxury"
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

              {/* OTP Digit Inputs */}
              <div className="mb-6">
                <OtpDigitInput value={otp} onChange={setOtp} onComplete={submitOtp} />
              </div>

              {/* Expiry Timer */}
              {expiryTimer.isActive && (
                <p className="text-xs text-center text-muted-foreground mb-4">
                  Code expires in{" "}
                  <span className={`font-mono font-bold ${expiryTimer.seconds < 60 ? "text-destructive" : "text-gold"}`}>
                    {expiryTimer.formatted}
                  </span>
                </p>
              )}

              {/* Verify Button */}
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

              {/* Resend OTP */}
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

              {/* Back Button */}
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
            /* ─── Login / Signup Form ─── */
            <motion.div
              key="form"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="rounded-3xl border border-border bg-background p-8 lg:p-10 shadow-luxury"
              id="auth-form-card"
            >
              {mode === "signup" && <StepIndicator step={1} />}

              <div className="text-center mb-8">
                <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Giftcy Account</p>
                <h1 className="serif text-4xl mt-2">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h1>
                <p className="text-xs text-muted-foreground mt-2">
                  {mode === "login"
                    ? "Sign in to access your orders and wishlist"
                    : "Join Giftcy for a premium gifting experience"}
                </p>
              </div>

              {/* Tab Switcher */}
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

                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
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

                {mode === "login" && (
                  <div className="text-right">
                    <Link to="/auth" search={{ tab: "login" }} className="text-xs text-gold hover:text-gold/80 underline underline-offset-2">
                      Forgot password?
                    </Link>
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
                  ) : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              {/* Divider */}
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
                  {/* Google sign-in container managed dynamically by GSI library, empty in React to avoid unmount crash */}
                  <div
                    ref={googleBtnRef}
                    className="w-full flex justify-center"
                    id="google-signin-container"
                    style={{ display: isGoogleReady ? "flex" : "none" }}
                  />

                  {/* Fallback button managed safely by React, displayed only when Google isn't ready */}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Claim Admin (shown when user is logged in) */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
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
    </section>
  );
}
