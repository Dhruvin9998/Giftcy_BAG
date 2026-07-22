import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/CartContext";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/components/AuthContext";

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
  const [placing, setPlacing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Razorpay">("COD");
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    city: "",
    state: "",
    pincode: "",
  });

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
    setShowCheckout(true);
  };

  const place = async () => {
    if (!form.name || !form.email || !form.address || !form.city || !form.state || !form.pincode) {
      return toast.error("Please fill all shipping details");
    }
    if (!form.phone) return toast.error("Phone number is required for checkout");
    setPlacing(true);
    try {
      let fallbackProductId = "";
      if (items.some((i) => !i.product.id)) {
        try {
          const cachedDbRaw = localStorage.getItem("giftcy_products_db_list");
          if (cachedDbRaw) {
            const list = JSON.parse(cachedDbRaw);
            if (list.length > 0) {
              fallbackProductId = list[0]._id || list[0].id;
            }
          }
          if (!fallbackProductId) {
            const prodRes = await apiClient.get("/products?limit=1");
            if (prodRes?.success && prodRes?.data?.products?.length > 0) {
              fallbackProductId = prodRes.data.products[0]._id || prodRes.data.products[0].id;
            }
          }
        } catch (e) {
          console.error("Failed to resolve fallback product id for custom cart item", e);
        }
        if (!fallbackProductId) {
          fallbackProductId = "6a2cf9cb75f4b065ed8eddb6";
        }
      }

      const orderItems = items.map((i) => ({
        product: i.product.id || fallbackProductId,
        quantity: i.qty,
      }));

      const payload = {
        orderItems,
        shippingAddress: {
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.pincode,
          country: "India",
          phone: form.phone,
        },
        paymentMethod,
        couponCode: coupon?.code ?? null,
        shippingPrice: shipping,
        taxPrice: 0,
      };

      const response = await apiClient.post("/orders", payload);
      if (response?.success && response?.data) {
        if (paymentMethod === "COD") {
          toast.success("Order placed successfully! We'll be in touch.");
          await clear();
          setShowCheckout(false);
          nav({ to: "/account" });
        } else if (paymentMethod === "Razorpay") {
          const { razorpayOrderId, amount, currency } = response.data;
          const loaded = await loadRazorpayScript();
          if (!loaded) {
            setPlacing(false);
            return toast.error("Failed to load Razorpay payment gateway script.");
          }

          const options = {
            key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_mockkey",
            amount,
            currency,
            name: "Giftcy",
            description: "Premium Fabric Gift Bags",
            order_id: razorpayOrderId,
            prefill: {
              name: form.name,
              email: form.email,
              contact: form.phone,
            },
            theme: {
              color: "#c8956b",
            },
            handler: async (resp: any) => {
              try {
                setPlacing(true);
                const verifyRes = await apiClient.post("/orders/verify-razorpay", {
                  razorpayOrderId: resp.razorpay_order_id,
                  razorpayPaymentId: resp.razorpay_payment_id,
                  signature: resp.razorpay_signature,
                });

                if (verifyRes?.success) {
                  toast.success("Payment verified & Order completed successfully!");
                  await clear();
                  setShowCheckout(false);
                  nav({ to: "/account" });
                } else {
                  toast.error(verifyRes.message || "Failed to verify payment signature");
                }
              } catch (err: any) {
                toast.error(err.message || "Something went wrong during payment verification");
              } finally {
                setPlacing(false);
              }
            },
            modal: {
              ondismiss: () => {
                setPlacing(false);
                toast.warning("Payment checkout cancelled.");
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      } else {
        toast.error(response?.message || "Failed to place order");
        setPlacing(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong while placing the order");
      setPlacing(false);
    }
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
              <div key={it.product.slug} className="flex gap-5 pb-6 border-b border-border">
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
                    <button onClick={() => remove(it.product.slug)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-full">
                      <button className="p-2" onClick={() => updateQty(it.product.slug, it.qty - 1)}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="px-3 text-sm">{it.qty}</span>
                      <button className="p-2" onClick={() => updateQty(it.product.slug, it.qty + 1)}><Plus className="h-3.5 w-3.5" /></button>
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

      {showCheckout && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-5" onClick={() => setShowCheckout(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-background rounded-3xl p-7 lg:p-9 w-full max-w-md shadow-luxury max-h-[92vh] overflow-y-auto animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="serif text-2xl">Checkout</h3>
              <button onClick={() => setShowCheckout(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="i" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="i" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="i" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea rows={2} className="i" placeholder="Shipping address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="i" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input className="i" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <input className="i" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              
              {/* Payment Method */}
              <div className="mt-4 pt-3 border-t border-border">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Payment Method</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`py-2.5 px-3 rounded-full border text-xs font-semibold uppercase tracking-wider transition ${
                      paymentMethod === "COD" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                    }`}
                  >
                    Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Razorpay")}
                    className={`py-2.5 px-3 rounded-full border text-xs font-semibold uppercase tracking-wider transition ${
                      paymentMethod === "Razorpay" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                    }`}
                  >
                    Online (Razorpay)
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="serif text-2xl">₹{grand}</span>
            </div>
            <button onClick={place} disabled={placing} className="mt-5 w-full py-3.5 rounded-full bg-foreground text-background text-sm font-medium tracking-wider uppercase disabled:opacity-60">
              {placing ? "Processing…" : `Pay ₹${grand}`}
            </button>
            <style>{`.i{width:100%;padding:.75rem 1rem;border:1px solid hsl(var(--border));border-radius:1rem;background:transparent;font-size:.875rem;outline:none}.i:focus{border-color:var(--gold)}`}</style>
          </div>
        </div>
      )}
    </section>
  );
}

const Row = ({ l, v }: { l: string; v: string }) => (
  <div className="flex justify-between"><span className="text-muted-foreground">{l}</span><span>{v}</span></div>
);

