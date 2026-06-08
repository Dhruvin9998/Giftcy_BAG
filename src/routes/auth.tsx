import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ tab: (s.tab as string) === "signup" ? "signup" : "login" }),
  head: () => ({ meta: [{ title: "Sign in — Giftcy" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { tab } = Route.useSearch();
  const nav = useNavigate();
  const { signIn, signUp, user, isAdmin, claimFirstAdmin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(tab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMode(tab); }, [tab]);
  useEffect(() => { if (user) nav({ to: isAdmin ? "/admin" : "/" }); }, [user, isAdmin, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = mode === "login" ? await signIn(email, password) : await signUp(email, password, name);
    setLoading(false);
    if (res.error) return toast.error(res.error);
    toast.success(mode === "login" ? "Welcome back" : "Account created");
  };

  return (
    <section className="min-h-[80vh] grid place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 lg:p-10 shadow-luxury">
        <div className="text-center mb-8">
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Giftcy Account</p>
          <h1 className="serif text-4xl mt-2">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        </div>

        <div className="flex p-1 bg-cream rounded-full mb-6 text-sm">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-full transition ${mode === m ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >{m === "login" ? "Sign in" : "Sign up"}</button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
              className="w-full px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold" />
          )}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="w-full px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="w-full px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:border-gold" />
          <button disabled={loading} className="w-full py-3.5 rounded-full bg-foreground text-background text-sm tracking-wide disabled:opacity-60">
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {user && (
          <button
            onClick={async () => {
              const r = await claimFirstAdmin();
              r.ok ? toast.success(r.message) : toast.error(r.message);
              if (r.ok) nav({ to: "/admin" });
            }}
            className="mt-4 w-full py-3 rounded-full border border-gold text-gold text-sm hover:bg-gold/10"
          >Become first admin</button>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          By continuing you agree to our terms. <Link to="/" className="underline">Back home</Link>
        </p>
      </div>
    </section>
  );
}
