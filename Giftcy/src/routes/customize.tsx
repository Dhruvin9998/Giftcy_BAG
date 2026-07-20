import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ShoppingBag, Download, ArrowRight, Palette, Upload, Image as ImageIcon, X } from "lucide-react";
import { useCart } from "@/components/CartContext";
import type { Product } from "@/lib/products";
import hero from "@/assets/hero-bag.jpg";

export const Route = createFileRoute("/customize")({
  head: () => ({
    meta: [
      { title: "Customize Your Gift Bag — Giftcy" },
      { name: "description", content: "Design your own luxury reusable fabric gift bag — choose fabric, color, size, handle, monogram, and packaging. Live preview." },
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
  const [monogram, setMonogram] = useState("");
  const [font, setFont] = useState<"serif" | "sans" | "script">("serif");
  const [qty, setQty] = useState(25);
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [designFileName, setDesignFileName] = useState<string>("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesignFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setDesignImage(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDesignImage = () => {
    setDesignImage(null);
    setDesignFileName("");
  };

  const price = useMemo(() => {
    const f = FABRICS.find((x) => x.id === fabric)!.price;
    const s = SIZES.find((x) => x.id === size)!.price;
    const p = PACKAGING.find((x) => x.id === pack)!.price;
    const m = monogram.trim() || designImage ? 35 : 0;
    return BASE + f + s + p + m;
  }, [fabric, size, pack, monogram, designImage]);

  const total = price * qty;
  const discount = qty >= 100 ? 0.15 : qty >= 50 ? 0.1 : qty >= 25 ? 0.05 : 0;
  const finalTotal = Math.round(total * (1 - discount));

  const addToCart = () => {
    const customText = monogram.trim() ? ` — "${monogram.trim()}"` : designFileName ? ` — Custom Logo` : "";
    const product: Product = {
      slug: `custom-${Date.now()}`,
      name: `Custom ${FABRICS.find((x) => x.id === fabric)!.label} Bag${customText}`,
      category: "Custom Design",
      occasion: "Custom",
      price,
      mrp: Math.round(price * 1.3),
      image: hero,
      colors: [colorLabel],
      sizes: [size],
      description: `Custom ${FABRICS.find((x) => x.id === fabric)!.label.toLowerCase()} bag in ${colorLabel}, size ${size}.${designFileName ? ` Custom design photo: ${designFileName}.` : ""}`,
    };
    add(product, { size, color: colorLabel, qty });
  };

  const fontClass = font === "serif" ? "font-serif italic" : font === "script" ? "font-serif" : "font-sans tracking-widest uppercase";

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
          Curate fabric, color, size, monogram, or custom logo. Watch your piece come to life — priced instantly.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-10 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16">
        {/* LIVE PREVIEW */}
        <div className="lg:sticky lg:top-24 self-start">
          <motion.div
            key={`${fabric}-${color}-${monogram}-${font}-${designFileName}`}
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
                
                {/* Uploaded Custom Logo Image Preview */}
                {designImage && (
                  <image
                    href={designImage}
                    x="100"
                    y={monogram.trim() ? "145" : "160"}
                    width="100"
                    height="90"
                    preserveAspectRatio="xMidYMid meet"
                    className="drop-shadow-md opacity-90"
                  />
                )}

                {/* Monogram Vector Text */}
                {monogram.trim() && (
                  <text
                    x="150"
                    y={designImage ? "265" : "215"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#caa24b"
                    fontSize={monogram.length > 14 ? "14" : monogram.length > 8 ? "18" : "24"}
                    fontWeight="600"
                    fontStyle={font === "serif" ? "italic" : "normal"}
                    fontFamily={font === "serif" ? "Georgia, serif" : font === "script" ? "Brush Script MT, Great Vibes, cursive, serif" : "system-ui, sans-serif"}
                    letterSpacing={font === "sans" ? "3" : "1"}
                    className="drop-shadow-sm select-none"
                  >
                    {monogram.trim()}
                  </text>
                )}
              </svg>
            </div>

            <div className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur text-[10px] tracking-[0.2em] uppercase">
              Live Preview
            </div>
            <div className="absolute bottom-5 right-5 px-4 py-2 rounded-full bg-foreground text-background text-xs">
              ₹{price} <span className="opacity-60">/ pc</span>
            </div>
          </motion.div>

          {/* Summary chips */}
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {[
              FABRICS.find((x) => x.id === fabric)!.label,
              colorLabel,
              `Size ${size}`,
              monogram.trim() ? `Monogram: "${monogram.trim()}"` : null,
              designFileName ? `Logo: ${designFileName}` : null,
              PACKAGING.find((x) => x.id === pack)!.label,
            ].filter(Boolean).map((s) => (
              <span key={s!} className="px-3 py-1.5 rounded-full bg-cream border border-border">{s}</span>
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
                    <p className="text-[11px] text-gold mt-1">+ ₹{f.price}</p>
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
                    <div className={`text-[11px] mt-1 ${active ? "text-gold-soft" : "text-gold"}`}>+ ₹{s.price}</div>
                  </button>
                );
              })}
            </div>
          </Group>

          {/* Monogram & Custom Logo Upload */}
          <Group step="04" title="Personal monogram & design upload" caption="Optional · + ₹35">
            <div className="space-y-4">
              {/* Single Line Text Monogram Input */}
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Text Monogram (Single Line)</label>
                <input
                  type="text"
                  value={monogram}
                  onChange={(e) => setMonogram(e.target.value.replace(/[\r\n]/g, "").slice(0, 24))}
                  placeholder="e.g. A & R, Sharma Wedding"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-foreground outline-none text-sm font-medium"
                />
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground mr-1">Font style:</span>
                  {(["serif", "script", "sans"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFont(f)}
                      className={`px-3 py-1.5 rounded-full border text-xs capitalize transition ${font === f ? "border-foreground bg-foreground text-background font-semibold" : "border-border hover:border-foreground/40 text-muted-foreground"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Design / Logo Photo Upload */}
              <div className="pt-2 border-t border-border/60">
                <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Upload Logo / Design Photo</label>
                {designImage ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-cream">
                    <div className="flex items-center gap-3">
                      <img src={designImage} alt="Uploaded Design" className="h-10 w-10 object-contain rounded border bg-white" />
                      <div>
                        <div className="text-xs font-medium truncate max-w-[200px]">{designFileName}</div>
                        <div className="text-[10px] text-gold font-medium">Uploaded & projected on preview</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeDesignImage}
                      className="p-1.5 rounded-full hover:bg-background text-muted-foreground hover:text-foreground transition"
                      title="Remove design photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="relative flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-dashed border-border hover:border-foreground bg-background hover:bg-cream/50 cursor-pointer transition text-xs text-muted-foreground">
                    <Upload className="h-4 w-4 text-gold" />
                    <span className="font-medium">Upload design photo or logo (PNG / JPG / SVG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                )}
              </div>
            </div>
          </Group>

          {/* Packaging */}
          <Group step="05" title="Packaging">
            <Pills items={PACKAGING} value={pack} onChange={setPack} />
          </Group>

          {/* Quantity */}
          <Group step="06" title="Quantity" caption={discount ? `${Math.round(discount * 100)}% bulk discount applied` : "Tip: 25+ unlocks discounts"}>
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

          {/* Totals */}
          <div className="rounded-2xl border border-border bg-cream p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Unit price</span>
              <span>₹{price}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Quantity</span>
              <span>× {qty}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm mt-2 text-gold">
                <span>Bulk discount</span>
                <span>− ₹{total - finalTotal}</span>
              </div>
            )}
            <div className="gold-divider my-4" />
            <div className="flex items-baseline justify-between">
              <span className="serif text-xl">Total</span>
              <span className="serif text-3xl">₹{finalTotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={addToCart}
                className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-foreground text-background text-sm hover:bg-foreground/90"
              >
                <ShoppingBag className="h-4 w-4" /> Add Custom Order
              </button>
              <Link
                to="/bulk"
                className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-foreground text-sm hover:bg-foreground hover:text-background transition"
              >
                Request Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => window.print()}
                className="h-12 w-12 rounded-full border border-border flex items-center justify-center hover:text-gold"
                aria-label="Save design"
              >
                <Download className="h-4 w-4" />
              </button>
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
            {it.price > 0 && <span className={`ml-2 text-[11px] ${active ? "text-gold-soft" : "text-gold"}`}>+₹{it.price}</span>}
          </button>
        );
      })}
    </div>
  );
}
