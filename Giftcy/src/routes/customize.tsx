import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ShoppingBag, Download, ArrowRight, Palette, MessageCircle } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { apiClient } from "@/lib/apiClient";
import type { Product } from "@/lib/products";
import hero from "@/assets/hero-bag.jpg";

export const Route = createFileRoute("/customize")({
  head: () => ({
    meta: [
      { title: "Customize Your Gift Bag — Giftcy" },
      { name: "description", content: "Design your own luxury reusable fabric gift bag — choose fabric, color, size, and packaging. Live preview." },
      { property: "og:title", content: "Customize Your Gift Bag — Giftcy" },
      { property: "og:description", content: "Design your own luxury reusable fabric gift bag. Live preview, instant pricing." },
    ],
  }),
  component: CustomizePage,
});

// ---------- Options ----------
const FABRICS = [
  { id: "silk", label: "Pure Silk", price: 120, blurb: "Lustrous, regal drape — ideal for weddings.", swatch: "linear-gradient(135deg,#f6e3c1,#d9b173)" },
  { id: "cotton", label: "Organic Cotton", price: 60, blurb: "Soft, breathable, everyday luxury.", swatch: "linear-gradient(135deg,#f3ece0,#d9c9ad)" },
  { id: "jute", label: "Designer Jute", price: 70, blurb: "Earthy, eco-first texture.", swatch: "linear-gradient(135deg,#c8a172,#8a6638)" },
  { id: "velvet", label: "Royal Velvet", price: 150, blurb: "Plush, opulent, statement gifting.", swatch: "linear-gradient(135deg,#7a1d2b,#3a0a14)" },
  { id: "linen", label: "Belgian Linen", price: 95, blurb: "Crisp, modern, minimal.", swatch: "linear-gradient(135deg,#ece4d4,#bdb097)" },
  { id: "brocade", label: "Banarasi Brocade", price: 180, blurb: "Heritage weave with gold zari.", swatch: "linear-gradient(135deg,#7a5a1d,#caa24b)" },
] as const;

const COLORS = [
  { id: "ivory", label: "Ivory", hex: "#f4ead7" },
  { id: "gold", label: "Royal Gold", hex: "#c8a24b" },
  { id: "blush", label: "Blush Rose", hex: "#e9b8b1" },
  { id: "emerald", label: "Emerald", hex: "#0f5e4a" },
  { id: "wine", label: "Wine", hex: "#6b1f2e" },
  { id: "midnight", label: "Midnight", hex: "#13233f" },
  { id: "sage", label: "Sage", hex: "#9fb097" },
  { id: "noir", label: "Noir", hex: "#1a1a1a" },
];

const SIZES = [
  { id: "S", label: "Small", dims: "18 × 22 cm", price: 0 },
  { id: "M", label: "Medium", dims: "22 × 28 cm", price: 30 },
  { id: "L", label: "Large", dims: "28 × 34 cm", price: 70 },
  { id: "XL", label: "X-Large", dims: "34 × 42 cm", price: 110 },
];

const PACKAGING = [
  { id: "kraft", label: "Kraft Sleeve", price: 0 },
  { id: "box", label: "Rigid Gift Box", price: 90 },
  { id: "ribbon", label: "Silk Ribbon Wrap", price: 45 },
];

const BASE = 149;

function CustomizePage() {
  const { add } = useCart();
  const [fabric, setFabric] = useState<string>(FABRICS[0].id);
  const [color, setColor] = useState(COLORS[1].hex);
  const [colorLabel, setColorLabel] = useState(COLORS[1].label);
  const [size, setSize] = useState("M");
  const [pack, setPack] = useState("kraft");
  const [qty, setQty] = useState(25);
  const [waNumber, setWaNumber] = useState("919999999999");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data?.contact_info?.whatsapp) {
          const cleanNum = res.data.contact_info.whatsapp.replace(/\D/g, "");
          if (cleanNum) setWaNumber(cleanNum);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    })();
  }, []);

  const price = useMemo(() => {
    const f = FABRICS.find((x) => x.id === fabric)!.price;
    const s = SIZES.find((x) => x.id === size)!.price;
    const p = PACKAGING.find((x) => x.id === pack)!.price;
    return BASE + f + s + p;
  }, [fabric, size, pack]);

  const total = price * qty;
  const discount = qty >= 100 ? 0.15 : qty >= 50 ? 0.1 : qty >= 25 ? 0.05 : 0;
  const finalTotal = Math.round(total * (1 - discount));

  const addToCart = () => {
    const product: Product = {
      slug: `custom-${Date.now()}`,
      name: `Custom ${FABRICS.find((x) => x.id === fabric)!.label} Bag`,
      category: "Custom Design",
      occasion: "Custom",
      price,
      mrp: Math.round(price * 1.3),
      image: hero,
      colors: [colorLabel],
      sizes: [size],
      description: `Custom ${FABRICS.find((x) => x.id === fabric)!.label.toLowerCase()} bag in ${colorLabel}, size ${size}.`,
    };
    add(product, { size, color: colorLabel, qty });
  };

  return (
    <>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 pt-12 lg:pt-20 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/60">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground">Bespoke Studio</span>
        </div>
        <h1 className="serif text-5xl lg:text-7xl mt-5 leading-[1.02] text-balance">
          Design your own <em className="text-gold not-italic">gift bag</em>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          Curate fabric, color, size, and packaging. Watch your piece come to life.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-10 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16">
        {/* LIVE PREVIEW */}
        <div className="lg:sticky lg:top-24 self-start">
          <motion.div
            key={`${fabric}-${color}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-luxury bg-cream"
            style={{ background: FABRICS.find((x) => x.id === fabric)!.swatch }}
          >
            {/* Bag shape */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <svg viewBox="0 0 300 380" className="h-full w-full drop-shadow-2xl">
                <defs>
                  <linearGradient id="bagFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.95" />
                    <stop offset="100%" stopColor={color} stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Drawstring handle */}
                <path d="M70 60 Q150 0 230 60" fill="none" stroke="#caa24b" strokeWidth="3" />
                {/* Bag body */}
                <path
                  d="M55 80 Q55 75 60 75 L240 75 Q245 75 245 80 L260 350 Q260 360 250 360 L50 360 Q40 360 40 350 Z"
                  fill="url(#bagFill)"
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                />
                <path
                  d="M55 80 Q55 75 60 75 L240 75 Q245 75 245 80 L260 350 Q260 360 250 360 L50 360 Q40 360 40 350 Z"
                  fill="url(#shine)"
                />
                {/* Cinch fold */}
                <path d="M55 90 Q150 110 245 90" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
              </svg>
            </div>

            <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur text-[10px] tracking-[0.2em] uppercase">
              Live Preview
            </div>

          </motion.div>

          {/* Summary chips */}
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {[
              FABRICS.find((x) => x.id === fabric)!.label,
              colorLabel,
              `Size ${size}`,
              PACKAGING.find((x) => x.id === pack)!.label,
            ].map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-full bg-cream border border-border">{s}</span>
            ))}
          </div>
        </div>

        {/* CONFIGURATOR */}
        <div className="space-y-10">
          {/* Fabric */}
          <Group step="01" title="Choose your fabric">
            <div className="grid grid-cols-2 gap-3">
              {FABRICS.map((f) => {
                const active = fabric === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFabric(f.id)}
                    className={`text-left rounded-xl border p-3 transition ${active ? "border-foreground shadow-soft" : "border-border hover:border-foreground/40"}`}
                  >
                    <div className="h-16 rounded-lg" style={{ background: f.swatch }} />
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-medium">{f.label}</span>
                      {active && <Check className="h-4 w-4 text-gold" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{f.blurb}</p>

                  </button>
                );
              })}
            </div>
          </Group>

          {/* Color */}
          <Group step="02" title="Pick a color" caption={colorLabel}>
            <div className="flex flex-wrap items-center gap-3">
              {COLORS.map((c) => {
                const active = color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.id}
                    onClick={() => { setColor(c.hex); setColorLabel(c.label); }}
                    aria-label={c.label}
                    className={`relative h-12 w-12 rounded-full transition ${active ? "ring-2 ring-offset-2 ring-foreground" : "ring-1 ring-border hover:ring-foreground/40"}`}
                    style={{ background: c.hex }}
                  >
                    {active && <Check className="h-4 w-4 absolute inset-0 m-auto text-white mix-blend-difference" />}
                  </button>
                );
              })}

              {/* Custom Color Picker (Spectrum Wheel) */}
              <div className="relative group">
                <button
                  type="button"
                  title="Pick any custom color"
                  className={`relative h-12 w-12 rounded-full flex items-center justify-center transition overflow-hidden ${
                    !COLORS.some((c) => c.hex.toLowerCase() === color.toLowerCase())
                      ? "ring-2 ring-offset-2 ring-foreground"
                      : "ring-1 ring-border hover:ring-foreground/40"
                  }`}
                  style={{
                    background: !COLORS.some((c) => c.hex.toLowerCase() === color.toLowerCase())
                      ? color
                      : "conic-gradient(from 180deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                  }}
                >
                  <Palette className="h-5 w-5 text-white drop-shadow mix-blend-difference" />
                  <input
                    type="color"
                    value={color.startsWith("#") && color.length === 7 ? color : "#c8a24b"}
                    onChange={(e) => {
                      const hex = e.target.value;
                      setColor(hex);
                      setColorLabel(`Custom (${hex.toUpperCase()})`);
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    title="Click to open custom color picker"
                  />
                </button>
              </div>

              {/* Direct HEX Code Input */}
              <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-border bg-background text-xs">
                <span className="text-muted-foreground font-mono">#</span>
                <input
                  type="text"
                  maxLength={6}
                  value={color.startsWith("#") ? color.slice(1) : color}
                  onChange={(e) => {
                    const cleanHex = e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
                    const fullHex = `#${cleanHex}`;
                    setColor(fullHex);
                    const match = COLORS.find((c) => c.hex.toLowerCase() === fullHex.toLowerCase());
                    setColorLabel(match ? match.label : `Custom (${fullHex.toUpperCase()})`);
                  }}
                  placeholder="HEX Code"
                  className="w-20 bg-transparent font-mono uppercase focus:outline-none text-foreground font-medium"
                />
              </div>
            </div>
          </Group>

          {/* Size */}
          <Group step="03" title="Select size">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SIZES.map((s) => {
                const active = size === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    className={`rounded-xl border p-3 text-left transition ${active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40"}`}
                  >
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className={`text-[11px] mt-0.5 ${active ? "text-background/70" : "text-muted-foreground"}`}>{s.dims}</div>

                  </button>
                );
              })}
            </div>
          </Group>

          {/* Step 04: Contact Us & WhatsApp Link Section */}
          <Group step="04" title="Custom Monogram & Logo Printing" caption="Connect with our design team">
            <div className="rounded-2xl border border-border bg-cream p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Need Custom Embroidery, Logo Printing, or Monograms?</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Chat directly with our gifting concierge on WhatsApp to send your logo photo, text monogram, or special design requirements.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I would like to inquire about custom monogram/logo printing for my gift bags.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a] transition shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground text-foreground text-xs font-semibold hover:bg-foreground hover:text-background transition"
                >
                  Contact Us <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Group>

          {/* Packaging */}
          <Group step="05" title="Packaging">
            <Pills items={PACKAGING} value={pack} onChange={setPack} />
          </Group>

          {/* Quantity */}
          <Group step="06" title="Quantity">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={500}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="flex-1 accent-foreground"
              />
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 px-3 py-2 rounded-xl border border-border text-center text-sm"
              />
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {[10, 25, 50, 100, 250].map((n) => (
                <button
                  key={n}
                  onClick={() => setQty(n)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition ${qty === n ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40"}`}
                >
                  {n} pcs
                </button>
              ))}
            </div>
          </Group>

          <div className="rounded-2xl border border-border bg-cream p-6">
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={addToCart}
                className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background text-sm hover:bg-foreground/90"
              >
                <ShoppingBag className="h-4 w-4" /> Add Custom Order
              </button>
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I would like to inquire about a custom gift bag order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] text-white text-sm font-medium hover:bg-[#20bd5a] transition"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
              <Link
                to="/contact"
                className="h-12 w-12 rounded-full border border-border flex items-center justify-center hover:text-gold"
                title="Contact Us"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 text-center">
              Sample dispatch in 4–6 days · Bulk delivery in 14–21 days · Free design consultation
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Group({ step, title, caption, children }: { step: string; title: string; caption?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="serif text-2xl">
          <span className="text-gold text-sm tracking-[0.25em] mr-3">{step}</span>
          {title}
        </h3>
        {caption && <span className="text-xs text-muted-foreground">{caption}</span>}
      </div>
      {children}
    </div>
  );
}

function Pills<T extends { id: string; label: string; price: number }>({
  items,
  value,
  onChange,
}: {
  items: readonly T[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={`px-4 py-2.5 rounded-full border text-sm transition ${active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40"}`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
