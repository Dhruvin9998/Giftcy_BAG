import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Tag, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/CartContext";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/components/AuthContext";
import { validateIndianPincode } from "@/lib/pincode";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Giftcy" }] }),
  component: CartPage,
});

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CartPage() {
  const { items, remove, updateQty, subtotal, coupon, applyCoupon, removeCoupon, discount, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const shipping = total > 999 || total === 0 ? 0 : 79;
  const grand = total + shipping;
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const apply = async () => {
    setApplying(true);
    const r = await applyCoupon(code);
    setApplying(false);
    r.ok ? toast.success(r.message) : toast.error(r.message);
    if (r.ok) setCode("");
  };

  const handleProceedCheckout = () => {
    if (!user) {
      toast.error("Please sign in to complete your checkout");
      nav({ to: "/auth" });
      return;
    }
    nav({ to: "/checkout" });
  };

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-10 py-14 lg:py-20">
      <h1 className="serif text-4xl lg:text-5xl">Your Cart</h1>
      <p className="text-muted-foreground mt-2">{items.length} item{items.length !== 1 ? "s" : ""}</p>

      {items.length === 0 ? (
        <div className="mt-20 text-center">
          <p className="serif text-2xl">Your cart is empty.</p>
          <Link to="/shop" className="mt-6 inline-flex px-7 py-3.5 rounded-full bg-foreground text-background text-sm">Discover the collection</Link>
        </div>
      ) : (
        <div className="mt-10 grid lg:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-6">
            {items.map((it) => (
              <div key={`${it.product.slug}-${it.size || "M"}-${it.color || "Ivory"}`} className="flex gap-5 pb-6 border-b border-border">
                <img
                  src={it.product.image}
                  alt={it.product.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; }}
                  className="h-32 w-32 rounded-xl object-cover bg-secondary"
                />
                <div className="flex-1">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{it.product.category}</p>
                      <h3 className="serif text-xl mt-1">{it.product.name}</h3>
                      {(it.size || it.color) && <p className="text-xs text-muted-foreground mt-1">{[it.color, it.size].filter(Boolean).join(" · ")}</p>}
                    </div>
                    <button onClick={() => remove(it.product.slug, it.size, it.color)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-full">
                      <button className="p-2" onClick={() => updateQty(it.product.slug, (q) => q - 1, it.size, it.color)}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="px-3 text-sm">{it.qty}</span>
                      <button className="p-2" onClick={() => updateQty(it.product.slug, (q) => q + 1, it.size, it.color)}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="serif text-lg">₹{it.product.price * it.qty}</span>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/shop" className="inline-block text-sm hover:text-gold">← Continue shopping</Link>
          </div>

          <aside className="rounded-2xl border border-border p-7 bg-cream h-fit lg:sticky lg:top-28">
            <h3 className="serif text-2xl">Order Summary</h3>

            {coupon ? (
              <div className="mt-6 flex items-center justify-between px-4 py-3 rounded-xl bg-background border border-gold/40">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-gold" />
                  <span className="font-mono font-semibold">{coupon.code}</span>
                  <span className="text-gold">−₹{coupon.discount}</span>
                </div>
                <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
              </div>
            ) : (
              <div className="mt-6 flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-background border border-border">
                  <Tag className="h-4 w-4 text-gold" />
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="flex-1 bg-transparent text-sm focus:outline-none" />
                </div>
                <button onClick={apply} disabled={applying} className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm disabled:opacity-60">{applying ? "…" : "Apply"}</button>
              </div>
            )}

            <div className="mt-6 space-y-3 text-sm">
              <Row l="Subtotal" v={`₹${subtotal}`} />
              {discount > 0 && <Row l={`Discount${coupon ? ` (${coupon.code})` : ""}`} v={`−₹${discount}`} />}
              <Row l="Shipping" v={shipping === 0 ? "Free" : `₹${shipping}`} />
            </div>
            <div className="my-5 gold-divider" />
            <div className="flex justify-between items-baseline">
              <span className="serif text-lg">Total</span>
              <span className="serif text-2xl">₹{grand}</span>
            </div>
            <button onClick={handleProceedCheckout} className="mt-6 w-full py-4 rounded-full bg-foreground text-background hover:bg-foreground/90 transition text-sm tracking-wide">
              Proceed to Checkout
            </button>
            <p className="text-xs text-muted-foreground text-center mt-3">Secure checkout · COD available</p>
          </aside>
        </div>
      )}

    </section>
  );
}

const Row = ({ l, v }: { l: string; v: string }) => (
  <div className="flex justify-between"><span className="text-muted-foreground">{l}</span><span>{v}</span></div>
);

