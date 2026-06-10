import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { User, ShoppingBag, Settings, LogOut, Clock, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Giftcy" }] }),
  component: AccountPage,
});

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image: string;
  product: string;
};

type Order = {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  discountPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
};

type Tab = "overview" | "orders" | "profile";

function AccountPage() {
  const { user, loading: authLoading, signOut, refreshRole } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to access your account");
      nav({ to: "/auth" });
    }
  }, [user, authLoading, nav]);

  // Sync profile form states when user profile loads
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await apiClient.get("/orders/my-orders");
      if (response?.success && response?.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return toast.error("Name and email are required");
    
    const payload: any = { name, email };
    
    if (password) {
      if (password.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }
      if (password !== confirmPassword) {
        return toast.error("Passwords do not match");
      }
      payload.password = password;
    }

    setUpdatingProfile(true);
    try {
      const response = await apiClient.put("/auth/profile", payload);
      if (response?.success) {
        toast.success("Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
        await refreshRole(); // Refresh profile state in context
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const response = await apiClient.put(`/orders/${orderId}/cancel`, {});
      if (response?.success) {
        toast.success("Order cancelled successfully!");
        loadOrders(); // Re-fetch list
      } else {
        toast.error(response.message || "Failed to cancel order");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel order");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="py-32 text-center text-muted-foreground animate-pulse">
        Loading your account dashboard...
      </div>
    );
  }

  return (
    <section className="min-h-[80vh] bg-cream/30 py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-[240px_1fr] gap-8">
        
        {/* Account Menu Navigation */}
        <aside className="space-y-2">
          <div className="bg-background rounded-2xl border border-border p-5 text-center mb-6 shadow-sm">
            <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center text-white text-2xl font-bold shadow-soft">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="serif text-xl mt-3 font-semibold truncate">{user.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          <button
            onClick={() => setTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition font-medium ${
              tab === "overview" ? "bg-foreground text-background shadow-soft" : "hover:bg-cream bg-background border border-border/40"
            }`}
          >
            <User className="h-4.5 w-4.5" /> Overview
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition font-medium ${
              tab === "orders" ? "bg-foreground text-background shadow-soft" : "hover:bg-cream bg-background border border-border/40"
            }`}
          >
            <ShoppingBag className="h-4.5 w-4.5" /> Orders
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition font-medium ${
              tab === "profile" ? "bg-foreground text-background shadow-soft" : "hover:bg-cream bg-background border border-border/40"
            }`}
          >
            <Settings className="h-4.5 w-4.5" /> Settings
          </button>

          <div className="pt-4">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-red-50 bg-background border border-red-100 transition font-medium"
            >
              <LogOut className="h-4.5 w-4.5" /> Log out
            </button>
          </div>
        </aside>

        {/* Tab Contents View Panels */}
        <main className="bg-background rounded-3xl border border-border p-6 lg:p-8 shadow-sm">
          
          {/* TAB: OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="serif text-3xl font-semibold">Account Overview</h2>
                <p className="text-sm text-muted-foreground mt-1">Hello, {user.name}! Welcome back to your dashboard.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border p-5 flex items-center gap-4 bg-cream/20">
                  <div className="h-12 w-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">Total Orders</span>
                    <strong className="text-xl serif font-semibold">{orders.length}</strong>
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-5 flex items-center gap-4 bg-cream/20">
                  <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">Verification Status</span>
                    <strong className="text-sm font-semibold">{user.isVerified ? "Verified" : "Pending"}</strong>
                  </div>
                </div>

                <div className="rounded-2xl border border-border p-5 flex items-center gap-4 bg-cream/20">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">Account Role</span>
                    <strong className="text-sm uppercase tracking-wide font-semibold">{user.role}</strong>
                  </div>
                </div>
              </div>

              {/* Recent Order Preview */}
              <div>
                <h3 className="serif text-xl font-semibold mb-4">Recent Order</h3>
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
                    No orders placed yet. 
                    <Link to="/shop" className="text-gold font-medium inline-flex items-center gap-1 ml-1 hover:underline">
                      Shop now <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ) : (
                  <OrderCard order={orders[0]} onCancel={handleCancelOrder} />
                )}
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {tab === "orders" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="serif text-3xl font-semibold">Your Orders</h2>
                <p className="text-sm text-muted-foreground mt-1">Manage and track your recent orders and transactions.</p>
              </div>

              {loadingOrders ? (
                <div className="py-16 text-center text-muted-foreground">Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border rounded-3xl">
                  <p className="serif text-xl text-muted-foreground">You haven't placed any orders yet.</p>
                  <Link to="/shop" className="mt-4 inline-flex px-6 py-2.5 rounded-full bg-foreground text-background text-sm">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <OrderCard key={o._id} order={o} onCancel={handleCancelOrder} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE SETTINGS */}
          {tab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="serif text-3xl font-semibold">Profile Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Update your personal account credentials.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:border-gold transition"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:border-gold transition"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">New Password (optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:border-gold transition"
                  />
                </div>

                {password && (
                  <div className="animate-in fade-in duration-200">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:border-gold transition"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-6 py-3 rounded-full bg-foreground text-background hover:bg-foreground/90 transition text-sm font-semibold tracking-wide disabled:opacity-60"
                >
                  {updatingProfile ? "Updating Profile..." : "Update Profile"}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </section>
  );
}

// OrderCard helper details rendering
function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const statusColors = {
    Processing: "bg-amber-100 text-amber-800 border-amber-200",
    Shipped: "bg-blue-100 text-blue-800 border-blue-200",
    Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-soft transition bg-background">
      {/* Top Banner Summary */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-4 bg-cream/10 border-b border-border/55">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Order ID</p>
          <p className="font-mono text-sm font-semibold truncate max-w-[200px]">{order._id}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Order Date</p>
          <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Price</p>
          <p className="text-sm font-semibold text-gold">₹{order.totalPrice}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}>
            {order.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${order.isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
            {order.isPaid ? "Paid" : "Unpaid"}
          </span>
        </div>
      </div>

      {/* Primary Products Listing */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={order.orderItems[0].image} alt="" className="h-16 w-16 rounded-xl object-cover bg-secondary" />
            <div>
              <p className="font-medium">{order.orderItems[0].name}</p>
              <p className="text-xs text-muted-foreground">{order.orderItems[0].quantity} × ₹{order.orderItems[0].price}</p>
              {order.orderItems.length > 1 && (
                <p className="text-xs text-gold mt-1 font-medium">+ {order.orderItems.length - 1} more items</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-gold hover:underline"
            >
              {expanded ? "Hide details" : "View details"}
            </button>
            {order.status === "Processing" && (
              <button
                onClick={() => onCancel(order._id)}
                className="text-xs text-destructive hover:bg-red-50 py-1.5 px-3 rounded-full border border-red-100 transition"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Stepper (Always visible if not Cancelled) */}
        {order.status !== "Cancelled" && (
          <div className="mt-6 border-t border-border/40 pt-5 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4 font-semibold font-sans">Order Timeline</span>
            <div className="flex items-center justify-between relative max-w-xl mx-auto px-4">
              {/* Background connector line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-border/60 -z-0" />
              {/* Active connector line */}
              <div 
                className="absolute top-4 left-6 h-0.5 bg-gold -z-0 transition-all duration-500" 
                style={{ 
                  width: order.status === "Processing" ? "25%" : 
                         order.status === "Shipped" ? "75%" : 
                         order.status === "Delivered" ? "100%" : "0%"
                }}
              />
              
              {/* Timeline Steps */}
              {[
                { label: "Ordered", statusIdx: 0 },
                { label: "Packed", statusIdx: 1 },
                { label: "Shipped", statusIdx: 2 },
                { label: "Out for Delivery", statusIdx: 3 },
                { label: "Delivered", statusIdx: 4 }
              ].map((step, idx) => {
                const isCompleted = 
                  (order.status === "Processing" && idx <= 1) || 
                  (order.status === "Shipped" && idx <= 3) || 
                  (order.status === "Delivered" && idx <= 4);
                
                const isCurrent = 
                  (order.status === "Processing" && idx === 1) ||
                  (order.status === "Shipped" && idx === 3) ||
                  (order.status === "Delivered" && idx === 4);

                return (
                  <div key={idx} className="flex flex-col items-center relative z-10 flex-1">
                    <div 
                      className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-sans text-xs font-semibold ${
                        isCompleted 
                          ? "bg-gold border-gold text-white" 
                          : "bg-background border-border text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-gold/20 scale-105" : ""}`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-semibold tracking-wide mt-2 text-center block ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded detail description */}
        {expanded && (
          <div className="mt-5 pt-5 border-t border-border/60 grid md:grid-cols-[1fr_240px] gap-6 animate-in fade-in duration-250">
            {/* Products grid lists */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Order Items</span>
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 pb-3 border-b border-border/30 last:border-b-0">
                  <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover bg-secondary" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping details */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">Shipping Address</span>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {order.shippingAddress.address}<br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block">Payment Method</span>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  {order.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
