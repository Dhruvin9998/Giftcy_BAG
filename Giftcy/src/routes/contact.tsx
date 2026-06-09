import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

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
        <form className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Name" placeholder="Your full name" />
            <Field label="Email" type="email" placeholder="you@email.com" />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Phone" placeholder="+91 99999 99999" />
            <Field label="Subject" placeholder="What's it about?" />
          </div>
          <div>
            <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Message</label>
            <textarea rows={6} placeholder="Tell us a little more..." className="mt-2 w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-gold transition" />
          </div>
          <button className="px-7 py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm tracking-wide">Send message</button>
        </form>

        <aside className="space-y-3">
          <InfoCard icon={MessageCircle} title="WhatsApp" value="+91 99999 99999" href="https://wa.me/919999999999" accent />
          <InfoCard icon={Mail} title="Email" value="hello@giftcy.in" href="mailto:hello@giftcy.in" />
          <InfoCard icon={Phone} title="Phone" value="+91 99999 99999" href="tel:+919999999999" />
          <InfoCard icon={MapPin} title="Studio" value="Mumbai, India" />
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
