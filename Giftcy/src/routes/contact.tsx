import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Giftcy" },
      { name: "description", content: "Get in touch with Giftcy for orders, bulk inquiries, and gifting questions." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in or register to submit a support inquiry.");
      nav({ to: "/auth" });
      return;
    }
    if (!name || !email || !subject || !message) {
      return toast.error("Please fill in all required fields.");
    }
    setSubmitting(true);
    try {
      const res = await apiClient.post("/contact", { name, email, phone, subject, message });
      if (res?.success) {
        toast.success("Message submitted successfully! We will get back to you shortly.");
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(res.message || "Failed to submit message.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactWa = settings?.contact_info?.whatsapp || "+91 99999 99999";
  const contactEmail = settings?.contact_info?.email || "hello@giftcy.in";
  const contactPhone = settings?.contact_info?.phone || "+91 99999 99999";
  const contactAddr = settings?.contact_info?.address || "Mumbai, India";

  // Clean WhatsApp number for link href (remove non-digits)
  const waClean = contactWa.replace(/\D/g, "");

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-10 py-20 lg:py-28">
      <div className="max-w-2xl">
        <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Say hello</p>
        <h1 className="serif text-5xl lg:text-7xl mt-4 leading-[1.05]">Let's talk gifting.</h1>
        <p className="mt-5 text-muted-foreground">
          Questions about an order, customization, or a bulk wedding requirement? Our gifting concierge is here to help.
        </p>
      </div>

      <div className="mt-14 grid lg:grid-cols-[1fr_360px] gap-12">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" placeholder="Your full name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Field label="Email" type="email" placeholder="you@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Phone" placeholder="+91 99999 99999" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Field label="Subject" placeholder="What's it about?" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Message</label>
            <textarea rows={6} placeholder="Tell us a little more..." required value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-gold transition" />
          </div>
          <button type="submit" disabled={submitting} className="px-7 py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm tracking-wide disabled:opacity-60">
            {submitting ? "Sending..." : "Send message"}
          </button>
        </form>

        <aside className="space-y-3">
          <InfoCard icon={MessageCircle} title="WhatsApp" value={contactWa} href={`https://wa.me/${waClean}`} accent />
          <InfoCard icon={Mail} title="Email" value={contactEmail} href={`mailto:${contactEmail}`} />
          <InfoCard icon={Phone} title="Phone" value={contactPhone} href={`tel:${contactPhone}`} />
          <InfoCard icon={MapPin} title="Studio" value={contactAddr} />
        </aside>
      </div>
    </section>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground">{label}</label>
      <input {...rest} className="mt-2 w-full px-5 py-3.5 rounded-full bg-background border border-border focus:outline-none focus:border-gold transition" />
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, href, accent }: { icon: typeof Mail; title: string; value: string; href?: string; accent?: boolean }) {
  const inner = (
    <div className={`rounded-2xl border border-border p-5 flex items-center gap-4 hover-lift ${accent ? "bg-cream" : "bg-background"}`}>
      <div className="h-11 w-11 rounded-full bg-background border border-border flex items-center justify-center text-gold"><Icon className="h-4 w-4" /></div>
      <div>
        <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">{title}</div>
        <div className="serif text-lg mt-0.5">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}
