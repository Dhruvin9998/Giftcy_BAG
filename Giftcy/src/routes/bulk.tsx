import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Crown, MessageCircle, Upload } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/bulk")({
  head: () => ({
    meta: [
      { title: "Bulk Orders & Custom Printing — Giftcy" },
      { name: "description", content: "Bulk fabric gift bags for weddings, corporates, and brands. Custom printing, monograms, and MOQ pricing." },
    ],
  }),
  component: Bulk,
});

function Bulk() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");
  const [artworkUrl, setArtworkUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [waNumber, setWaNumber] = useState("919999999999");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data?.contact_info?.whatsapp) {
          const cleanNum = res.data.contact_info.whatsapp.replace(/\D/g, "");
          if (cleanNum) {
            setWaNumber(cleanNum);
          }
        }
      } catch (err) {
        console.error("Failed to load settings in Bulk", err);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !qty || !occasion || !message) {
      return toast.error("Please fill in all required fields (Name, Email, Phone, Quantity, Occasion, and Message).");
    }
    setSubmitting(true);

    try {
      const res = await apiClient.post("/bulk-inquiries/submit", {
        name,
        mobile: phone,
        email,
        companyName: company,
        inquiryType: occasion,
        quantity: Number(qty),
        message,
        logoUrl: artworkUrl || null
      });
      if (res?.success) {
        toast.success("Bulk order inquiry submitted successfully! Our team will contact you in 24 hours.");
        setName("");
        setCompany("");
        setEmail("");
        setPhone("");
        setQty("");
        setOccasion("");
        setMessage("");
        setArtworkUrl("");
      } else {
        toast.error(res.message || "Failed to submit inquiry.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const mockUpload = () => {
    setArtworkUrl("https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800");
    toast.success("Mock artwork logo uploaded successfully!");
  };

  return (
    <>
      <section className="bg-cream py-20 lg:py-28 border-b border-border">
        <div className="mx-auto max-w-4xl px-5 lg:px-10 text-center">
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">B2B & Custom</p>
          <h1 className="serif text-5xl lg:text-7xl mt-4 leading-[1.05] text-balance">
            Bulk gifting, beautifully done.
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            From 100 wedding favors to 50,000 branded corporate hampers — we craft custom-printed bags with monograms, logos, and signature finishes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-10 py-16 lg:py-24 grid lg:grid-cols-3 gap-5">
        {[
          { i: Crown, t: "Wedding Bulk", d: "From 100 pieces. Custom monograms, names, and dates printed in gold foil.", price: "From ₹89/bag" },
          { i: Building2, t: "Corporate Gifting", d: "Branded with your logo. Premium hampers for clients, teams, and events.", price: "From ₹109/bag" },
          { i: Upload, t: "Custom Printing", d: "Upload your artwork. Choose fabric, size, and quantity — we handle the rest.", price: "MOQ 50 bags" },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-border p-7 hover-lift bg-background">
            <div className="h-12 w-12 rounded-full bg-cream flex items-center justify-center text-gold"><c.i className="h-5 w-5" /></div>
            <h3 className="serif text-2xl mt-5">{c.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
            <p className="mt-5 text-xs tracking-[0.2em] uppercase text-gold">{c.price}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-5 lg:px-10 pb-24">
        <div className="rounded-[2rem] border border-border p-8 lg:p-14 bg-cream">
          <h2 className="serif text-4xl">Start your inquiry</h2>
          <p className="text-muted-foreground mt-2">Fill in your details — our team responds within 24 hours.</p>

          <form onSubmit={handleSubmit} className="mt-10 grid sm:grid-cols-2 gap-5">
            <Field label="Full name" placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Field label="Brand / Company" placeholder="Optional" value={company} onChange={(e) => setCompany(e.target.value)} />
            <Field label="Email" type="email" placeholder="you@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Field label="Phone / Mobile" required placeholder="+91 99999 99999" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Field label="Quantity" placeholder="e.g. 500" required value={qty} onChange={(e) => setQty(e.target.value)} />
            <Field label="Occasion" placeholder="Wedding, Diwali, Corporate..." required value={occasion} onChange={(e) => setOccasion(e.target.value)} />

            <div className="sm:col-span-2">
              <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Upload artwork / logo</label>
              <div onClick={mockUpload} className="mt-2 border border-dashed border-border rounded-2xl p-8 text-center bg-background hover:border-gold transition cursor-pointer">
                <Upload className="h-6 w-6 mx-auto text-gold" />
                {artworkUrl ? (
                  <div className="text-sm text-emerald-600 mt-2 font-medium">Artwork uploaded successfully! (logo_mockup.png)</div>
                ) : (
                  <>
                    <p className="mt-2 text-sm">Drop your file here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF · up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Tell us about your project</label>
              <textarea rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 w-full px-5 py-4 rounded-2xl bg-background border border-border focus:outline-none focus:border-gold" />
            </div>

            <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={submitting} className="px-7 py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm disabled:opacity-60">
                {submitting ? "Submitting Inquiry..." : "Submit Inquiry"}
              </button>
              <a href={`https://wa.me/${waNumber}`} className="px-7 py-3.5 rounded-full bg-[#25D366] text-white inline-flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
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
