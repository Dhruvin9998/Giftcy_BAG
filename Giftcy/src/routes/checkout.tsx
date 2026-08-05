import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, CreditCard, Lock, MapPin, Tag, ShieldCheck, QrCode, Sparkles, Calendar, User, Phone, Mail, Home, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { validateIndianPincode } from "@/lib/pincode";
import { apiClient } from "@/lib/apiClient";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Secure Checkout — Giftcy" }] }),
  component: CheckoutPage,
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

function CheckoutPage() {
  const { items, subtotal, coupon, discount, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.info("Your cart is empty. Redirecting to shop...");
      nav({ to: "/shop" });
    }
  }, [items, nav]);

  // Steps state: 1 = Address, 2 = Order Summary, 3 = Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address Step form
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    state: user?.state ?? "",
    pincode: user?.pincode ?? "",
  });

  // Dynamically update form when user profile resolves from backend
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
        city: prev.city || user.city || "",
        state: prev.state || user.state || "",
        pincode: prev.pincode || user.pincode || "",
      }));
    }
  }, [user]);

  const [pincodeSettings, setPincodeSettings] = useState<{ mode: string; pincodes: string } | null>(null);
  const [isPincodeChecking, setIsPincodeChecking] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [codNotAllowed, setCodNotAllowed] = useState(false);

  // Payment Step active tab state
  const [activePaymentTab, setActivePaymentTab] = useState<"UPI" | "CARD" | "EMI" | "COD" | "GIFT_CARD">("UPI");

  // Loading/Submit states
  const [placing, setPlacing] = useState(false);

  // Fetch settings for pincodes
  useEffect(() => {
    const fetchPincodeSettings = async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data?.pincode_settings) {
          setPincodeSettings(res.data.pincode_settings);
        }
      } catch (err) {
        console.error("Failed to load pincode settings", err);
      }
    };
    fetchPincodeSettings();
  }, []);

  // Validate pincode dynamically
  useEffect(() => {
    if (form.pincode.length === 6) {
      const checkPincode = async () => {
        setIsPincodeChecking(true);
        setPincodeError("");
        setCodNotAllowed(false);
        const result = await validateIndianPincode(form.pincode, pincodeSettings);
        setIsPincodeChecking(false);
        if (result.valid) {
          if (result.serviceable) {
            setForm((prev) => ({
              ...prev,
              city: result.city || prev.city,
              state: result.state || prev.state,
            }));
            setCodNotAllowed(false);
          } else {
            setPincodeError("Standard shipping is unavailable for this pincode.");
            setCodNotAllowed(true);
            // Default to UPI if COD is not allowed
            if (activePaymentTab === "COD") {
              setActivePaymentTab("UPI");
            }
          }
        } else {
          setPincodeError(result.error || "Invalid pincode.");
          setCodNotAllowed(true);
          if (activePaymentTab === "COD") {
            setActivePaymentTab("UPI");
          }
        }
      };
      checkPincode();
    } else {
      setPincodeError("");
      setCodNotAllowed(false);
    }
  }, [form.pincode, pincodeSettings]);

  // Pricing calculations
  const standardShipping = total > 999 || total === 0 ? 0 : 79;
  const platformFee = 9; // Platform fee applied for checkout
  const codFee = activePaymentTab === "COD" ? 29 : 0; // Nominal handling charge for COD

  // Calculate dynamic savings banner
  const simulatedMrp = Math.round(total * 1.4); // Mock MRP showing discount
  const simulatedDiscount = simulatedMrp - total;
  const totalSavings = simulatedDiscount + discount;

  const grandTotal = total + standardShipping + platformFee + codFee;

  // Handle Address Submission (Step 1 -> Step 2)
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill all delivery details.");
      return;
    }
    if (pincodeError) {
      toast.error(pincodeError);
      return;
    }

    // Save address to user profile in the database (if logged in)
    if (user) {
      try {
        await apiClient.put("/auth/profile", {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        });
      } catch (err) {
        console.error("Failed to save address to profile", err);
        // Non-blocking — continue to next step even if save fails
      }
    }

    setStep(2);
  };

  // Handle order creation / payment
  const handlePlaceOrder = async () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error("Please complete delivery details first.");
      setStep(1);
      return;
    }

    if (codNotAllowed && activePaymentTab === "COD") {
      toast.error("Cash on Delivery (COD) is not available for this pincode.");
      return;
    }

    setPlacing(true);

    try {
      // Find fallback product if any item has missing DB ID
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
        size: i.size || "M",
        color: i.color || "Ivory",
      }));

      const isCod = activePaymentTab === "COD";

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
        paymentMethod: isCod ? "COD" : "Razorpay",
        couponCode: coupon?.code ?? null,
        shippingPrice: standardShipping + codFee, // Combine shipping & cod fee
        taxPrice: platformFee, // Use taxPrice to represent platform fee
      };

      const response = await apiClient.post("/orders", payload);

      if (response?.success && response?.data) {
        if (isCod) {
          toast.success("Order placed successfully via Cash on Delivery!");
          await clear();
          nav({ to: "/account" });
        } else {
          // Razorpay payment flow
          const { razorpayOrderId, amount, currency } = response.data;
          const loaded = await loadRazorpayScript();
          if (!loaded) {
            setPlacing(false);
            return toast.error("Failed to load Razorpay payment script.");
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
              color: "#caa24b", // Brand gold color
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
    } catch (err: any) {
      toast.error(err.message || "Something went wrong while placing the order");
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#343330]">
      {/* Secure checkout header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e5ded4] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step > 1) setStep((prev) => (prev - 1) as any);
                else nav({ to: "/cart" });
              }}
              className="p-2 hover:bg-[#f2eee7] rounded-full transition-colors duration-200"
              title="Go Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link to="/" className="serif text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
              Giftcy<span className="text-[#caa24b]">.</span>
            </Link>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center gap-4 md:gap-8 max-w-md">
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>
                {step > 1 ? <Check className="h-3 w-3 stroke-[3]" /> : "1"}
              </span>
              <span className={`hidden sm:inline text-xs font-medium ${step === 1 ? "text-foreground" : "text-muted-foreground"}`}>Address</span>
            </div>
            <div className="h-px w-8 bg-[#e5ded4]" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>
                {step > 2 ? <Check className="h-3 w-3 stroke-[3]" /> : "2"}
              </span>
              <span className={`hidden sm:inline text-xs font-medium ${step === 2 ? "text-foreground" : "text-muted-foreground"}`}>Order Summary</span>
            </div>
            <div className="h-px w-8 bg-[#e5ded4]" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 3 ? "bg-[#caa24b] text-white" : "border border-border text-muted-foreground"}`}>
                3
              </span>
              <span className={`hidden sm:inline text-xs font-medium ${step === 3 ? "text-foreground" : "text-muted-foreground"}`}>Payment</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden md:inline">100% Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Main content grid */}
      <main className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          {/* Active Step Panel */}
          <div className="space-y-6">

            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-[#e5ded4] p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-[#f5f1e8] flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#caa24b]" />
                  </div>
                  <div>
                    <h2 className="serif text-2xl font-bold">Delivery Address</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">We'll deliver your premium gifts to this address</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#e5ded4] to-transparent my-5" />

                <form onSubmit={handleAddressSubmit} className="space-y-5">
                  {/* Contact Details Section */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#caa24b] mb-3">Contact Details</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                        <input
                          className="i"
                          placeholder="First Name Last Name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                        <input
                          className="i"
                          placeholder="Phone Number"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                      <input
                        className="i"
                        placeholder="example@gmail.com"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#e5ded4] to-transparent" />

                  {/* Shipping Address Section */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#caa24b] mb-3">Shipping Address</p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flat / House No. / Area / Street</label>
                      <input
                        className="i"
                        placeholder="Enter your full address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pincode</label>
                        <input
                          className="i font-mono"
                          placeholder="Enter pincode"
                          maxLength={6}
                          value={form.pincode}
                          onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })}
                          required
                        />
                        {isPincodeChecking && <p className="text-[10px] text-muted-foreground mt-1 px-1 animate-pulse">Checking pincode...</p>}
                        {pincodeError && <p className="text-[10px] text-destructive mt-1 px-1">{pincodeError}</p>}
                        {!isPincodeChecking && !pincodeError && form.pincode.length === 6 && (
                          <p className="text-[10px] text-emerald-700 mt-1 px-1 font-medium">🟢 Serviceable & COD Available</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</label>
                        <input
                          className="i"
                          placeholder="City"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</label>
                        <input
                          className="i"
                          placeholder="State"
                          value={form.state}
                          onChange={(e) => setForm({ ...form, state: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-[#e5ded4] to-transparent" />

                  {/* Submit with trust badge */}
                  <div className="space-y-3">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/95 hover-lift shadow-sm text-sm tracking-wider uppercase transition-all duration-300"
                    >
                      Save & Continue
                    </button>
                    <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1.5">
                      <Lock className="h-3 w-3" /> Your information is safe and encrypted
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Order Summary */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Delivery Info Summary */}
                <div className="bg-white rounded-2xl border border-[#e5ded4] p-6 shadow-sm flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#caa24b]">Deliver To:</span>
                    <h4 className="font-semibold text-base">{form.name}</h4>
                    <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                      {form.address}, {form.city}, {form.state} - <span className="font-mono">{form.pincode}</span>
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Phone: {form.phone}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-border hover:border-foreground hover:bg-[#fdfbf7] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200"
                  >
                    Change
                  </button>
                </div>

                {/* Items List */}
                <div className="bg-white rounded-2xl border border-[#e5ded4] p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <h3 className="serif text-xl font-bold">Review Order Items</h3>
                    <span className="text-xs font-medium text-muted-foreground bg-[#f2eee7] px-2.5 py-1 rounded-full">{items.reduce((acc, it) => acc + it.qty, 0)} items</span>
                  </div>
                  <div className="divide-y divide-border">
                    {items.map((it) => (
                      <div key={`${it.product.slug}-${it.size || "M"}-${it.color || "Ivory"}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; }}
                          className="h-20 w-20 rounded-xl object-cover bg-secondary border border-border"
                        />
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">{it.product.category}</span>
                          <h4 className="serif text-lg font-bold leading-tight">{it.product.name}</h4>
                          {(it.size || it.color) && (
                            <p className="text-xs text-muted-foreground">
                              Variant: <span className="font-semibold">{[it.color, it.size].filter(Boolean).join(" · ")}</span>
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">Qty: <span className="font-semibold text-foreground">{it.qty}</span></span>
                            <span className="serif text-base font-bold text-foreground">₹{it.product.price * it.qty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3.5 flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#caa24b] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">Estimated Delivery</h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">Delivery agent will open the package so you can check for correct product and damage. Share OTP to accept delivery.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-[#e5ded4] p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 border-b border-border pb-4">
                  <Lock className="h-5 w-5 text-emerald-700" />
                  <h3 className="serif text-2xl font-bold">Select Payment Option</h3>
                </div>

                <div className="grid md:grid-cols-[200px_1fr] border border-border rounded-xl overflow-hidden min-h-[350px]">

                  {/* Left Sidebar Menu */}
                  <div className="bg-[#fdfbf8] border-r border-border divide-y divide-border">
                    <button
                      onClick={() => setActivePaymentTab("UPI")}
                      className={`w-full py-4 px-4 text-left text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${activePaymentTab === "UPI" ? "bg-white border-l-4 border-[#caa24b] text-foreground" : "text-muted-foreground hover:bg-[#f2eee7]/50"}`}
                    >
                      <QrCode className="h-4 w-4 text-[#caa24b]" />
                      UPI / QR Code
                    </button>

                    <button
                      onClick={() => setActivePaymentTab("CARD")}
                      className={`w-full py-4 px-4 text-left text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${activePaymentTab === "CARD" ? "bg-white border-l-4 border-[#caa24b] text-foreground" : "text-muted-foreground hover:bg-[#f2eee7]/50"}`}
                    >
                      <CreditCard className="h-4 w-4 text-[#caa24b]" />
                      Credit / Debit Card
                    </button>

                    <button
                      onClick={() => setActivePaymentTab("EMI")}
                      className={`w-full py-4 px-4 text-left text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${activePaymentTab === "EMI" ? "bg-white border-l-4 border-[#caa24b] text-foreground" : "text-muted-foreground hover:bg-[#f2eee7]/50"}`}
                    >
                      <Sparkles className="h-4 w-4 text-[#caa24b]" />
                      EMI Options
                    </button>

                    <button
                      disabled={codNotAllowed}
                      onClick={() => setActivePaymentTab("COD")}
                      className={`w-full py-4 px-4 text-left text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${codNotAllowed ? "opacity-40 cursor-not-allowed" : ""} ${activePaymentTab === "COD" ? "bg-white border-l-4 border-[#caa24b] text-foreground" : "text-muted-foreground hover:bg-[#f2eee7]/50"}`}
                    >
                      <Truck className="h-4 w-4 text-[#caa24b]" />
                      Cash on Delivery
                    </button>

                    <button
                      onClick={() => setActivePaymentTab("GIFT_CARD")}
                      className={`w-full py-4 px-4 text-left text-xs font-bold tracking-wider uppercase transition-colors flex items-center gap-3 ${activePaymentTab === "GIFT_CARD" ? "bg-white border-l-4 border-[#caa24b] text-foreground" : "text-muted-foreground hover:bg-[#f2eee7]/50"}`}
                    >
                      <Tag className="h-4 w-4 text-[#caa24b]" />
                      Gift Card
                    </button>
                  </div>

                  {/* Center Content Pane */}
                  <div className="p-6 bg-white flex flex-col justify-center items-center">

                    {activePaymentTab === "UPI" && (
                      <div className="w-full max-w-sm text-center space-y-4">
                        <h4 className="serif text-xl font-bold">Scan QR and Pay</h4>
                        <div className="p-4 border border-dashed border-[#caa24b]/40 rounded-2xl inline-block bg-[#fdfbf8] shadow-inner relative group">
                          {/* Simulated QR Code */}
                          <div className="w-44 h-44 bg-white flex flex-col items-center justify-center border border-border rounded-xl shadow-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(#caa24b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                            <QrCode className="w-28 h-28 text-muted-foreground opacity-35" />
                            <span className="text-[10px] font-bold text-[#caa24b] mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-mono">UPI ID: giftcy@upi</span>
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center opacity-100 transition-opacity">
                              <span className="text-xs font-bold text-foreground px-3 py-1 bg-white border rounded-full shadow-sm">QR Code Blurred</span>
                              <span className="text-[9px] text-muted-foreground mt-1 px-4">Pay using secure Razorpay gateway</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center gap-3 items-center opacity-70">
                          <img src="https://img.icons8.com/color/48/google-pay.png" className="h-6 object-contain" alt="Google Pay" />
                          <img src="https://img.icons8.com/color/48/phonepe.png" className="h-6 object-contain" alt="PhonePe" />
                          <img src="https://img.icons8.com/color/48/paytm.png" className="h-6 object-contain" alt="Paytm" />
                        </div>

                        <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-normal">
                          Do not hit back or close this screen until the transaction is complete.
                        </p>

                        <button
                          onClick={handlePlaceOrder}
                          disabled={placing}
                          className="w-full py-3.5 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/95 hover-lift text-sm tracking-wider uppercase mt-4"
                        >
                          {placing ? "Processing..." : `Pay ₹${grandTotal}`}
                        </button>
                      </div>
                    )}

                    {activePaymentTab === "CARD" && (
                      <div className="w-full max-w-md space-y-4">
                        <h4 className="serif text-xl font-bold">Credit / Debit / ATM Card</h4>
                        <div className="p-5 bg-gradient-to-br from-[#4d4b47] to-[#2b2a27] rounded-xl text-white space-y-6 shadow-md relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-6 -mt-6" />
                          <div className="flex justify-between items-start">
                            <span className="serif text-lg font-bold tracking-widest text-[#caa24b]">Giftcy.</span>
                            <CreditCard className="h-8 w-8 text-white/50" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-widest text-white/40 block">Card Number</span>
                            <p className="font-mono text-lg tracking-widest">••••  ••••  ••••  ••••</p>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="space-y-0.5">
                              <span className="text-[8px] uppercase tracking-widest text-white/40 block">Cardholder</span>
                              <span className="text-xs uppercase font-medium tracking-wider">YOUR FULL NAME</span>
                            </div>
                            <div className="space-y-0.5 text-right">
                              <span className="text-[8px] uppercase tracking-widest text-white/40 block">Expiry</span>
                              <span className="font-mono text-xs">MM/YY</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            We support Visa, Mastercard, RuPay, Maestro and Diners Club card payments powered securely by Razorpay.
                          </p>

                          <button
                            onClick={handlePlaceOrder}
                            disabled={placing}
                            className="w-full py-3.5 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/95 hover-lift text-sm tracking-wider uppercase"
                          >
                            {placing ? "Processing..." : `Pay ₹${grandTotal} via Card`}
                          </button>
                        </div>
                      </div>
                    )}

                    {activePaymentTab === "EMI" && (
                      <div className="w-full max-w-sm text-center space-y-4">
                        <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-[#caa24b]">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <h4 className="serif text-xl font-bold">Credit Card EMI</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Easy monthly installment options are available for HDFC, ICICI, SBI, Axis, Kotak and other major credit cards. Select EMI on the Razorpay screen.
                        </p>
                        <button
                          onClick={handlePlaceOrder}
                          disabled={placing}
                          className="w-full py-3.5 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/95 hover-lift text-sm tracking-wider uppercase mt-2"
                        >
                          {placing ? "Processing..." : `Continue to EMI Options`}
                        </button>
                      </div>
                    )}

                    {activePaymentTab === "COD" && (
                      <div className="w-full max-w-sm text-center space-y-5">
                        <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto text-[#caa24b]">
                          <Truck className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="serif text-xl font-bold">Cash on Delivery</h4>
                          <p className="text-xs text-amber-800 bg-amber-50/70 border border-amber-100 rounded-xl p-3.5 leading-relaxed font-medium">
                            ⚠️ A nominal handling fee of <strong>₹29</strong> will be charged for orders placed using COD. Save ₹29 by choosing an online payment mode now!
                          </p>
                        </div>

                        <button
                          onClick={handlePlaceOrder}
                          disabled={placing}
                          className="w-full py-3.5 rounded-xl bg-[#caa24b] text-white font-semibold hover:bg-[#b08c3d] hover-lift text-sm tracking-wider uppercase"
                        >
                          {placing ? "Placing Order..." : "Confirm & Place Order"}
                        </button>
                      </div>
                    )}

                    {activePaymentTab === "GIFT_CARD" && (
                      <div className="w-full max-w-sm space-y-4">
                        <h4 className="serif text-xl font-bold text-center">Have a Giftcy Gift Card?</h4>
                        <div className="space-y-3">
                          <input className="i font-mono uppercase text-center" placeholder="GIFT-XXXX-XXXX-XXXX" />
                          <input className="i font-mono text-center" placeholder="4-Digit PIN" maxLength={4} type="password" />
                          <button
                            type="button"
                            onClick={() => toast.error("This gift card is invalid or has expired.")}
                            className="w-full py-3 border border-[#caa24b] text-[#caa24b] hover:bg-amber-50/50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                          >
                            Apply Gift Card
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            )}

          </div>

          {/* Right Column: Price Details & Coupons (Sticky Sidebar) */}
          <aside className="space-y-6">

            {/* Price Details Card */}
            <div className="bg-white rounded-2xl border border-[#e5ded4] p-6 shadow-sm space-y-4 h-fit">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">Price Details</h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MRP ({items.reduce((acc, it) => acc + it.qty, 0)} items)</span>
                  <span className="line-through text-muted-foreground font-mono">₹{simulatedMrp}</span>
                </div>

                <div className="flex justify-between text-[#caa24b]">
                  <span>Discount</span>
                  <span className="font-mono">−₹{simulatedDiscount}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount {coupon && `(${coupon.code})`}</span>
                    <span className="font-mono">−₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fees</span>
                  <span className="font-mono">{standardShipping === 0 ? "FREE" : `₹${standardShipping}`}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-mono">₹{platformFee}</span>
                </div>

                {activePaymentTab === "COD" && (
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>Payment Handling Fee (COD)</span>
                    <span className="font-mono font-semibold">₹{codFee}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#e5ded4] pt-3.5 flex justify-between items-baseline">
                <span className="serif text-lg font-bold">Total Amount</span>
                <span className="serif text-2xl font-bold font-mono">₹{grandTotal}</span>
              </div>

              {/* Savings Success Banner */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>You'll save ₹{totalSavings} on this order!</span>
              </div>

              {/* Conditional step-based bottom button */}
              {step === 1 && (
                <button
                  onClick={handleAddressSubmit}
                  className="w-full py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/95 hover-lift shadow-sm text-sm tracking-wider uppercase mt-4"
                >
                  Continue to Summary
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-4 rounded-xl bg-[#caa24b] text-white font-semibold hover:bg-[#b08c3d] hover-lift shadow-sm text-sm tracking-wider uppercase mt-4 animate-pulse"
                >
                  Proceed to Payment
                </button>
              )}

              {step === 3 && activePaymentTab !== "COD" && (
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full py-4 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/95 hover-lift shadow-sm text-sm tracking-wider uppercase mt-4"
                >
                  {placing ? "Processing..." : `Pay ₹${grandTotal}`}
                </button>
              )}
            </div>

            {/* Security trust badge */}
            <div className="text-center space-y-2.5 px-4">
              <div className="flex justify-center gap-4 text-muted-foreground opacity-60">
                <ShieldCheck className="h-8 w-8 stroke-[1.5]" />
                <Lock className="h-8 w-8 stroke-[1.5]" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Safe and Secure Payments. Your transaction details are encrypted using SSL technology and processed securely through Razorpay.
              </p>
            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}
