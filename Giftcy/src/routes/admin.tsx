import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardList,
  Coins,
  Crown,
  Database,
  Download,
  Edit,
  Eye,
  FileText,
  FolderOpen,
  Gift,
  Globe,
  Heart,
  Image as ImageIcon,
  ImagePlus,
  LayoutDashboard,
  Leaf,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Package,
  PackageCheck,
  Palette,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Shield,
  ShoppingBag,
  Sliders,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  User,
  Users,
  Video,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { apiClient } from "@/lib/apiClient";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — Giftcy" }] }),
  component: AdminPage,
});

type Tab =
  | "dashboard"
  | "all-products"
  | "add-product"
  | "orders"
  | "customers"
  | "bulk-inquiries"
  | "custom-printing"
  | "reviews"
  | "coupons"
  | "blogs"
  | "banners"
  | "analytics"
  | "settings";

function AdminPage() {
  const { user, signOut, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      nav({ to: "/auth" });
    }
  }, [loading, user, nav]);

  if (loading) return <div className="py-32 text-center text-muted-foreground font-serif animate-pulse">Loading secure session…</div>;
  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isStaff = user.role === "staff";
  const hasAccess = isAdmin || isStaff;

  if (!hasAccess) {
    return (
      <div className="py-32 text-center px-5 max-w-md mx-auto">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="serif text-4xl">Admin Portal</h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          Your account ({user.email}) does not have administrative or staff privileges.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/" className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium">Back home</Link>
          <button onClick={() => signOut()} className="px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-cream/40 transition">Sign out</button>
        </div>
      </div>
    );
  }

  // Sidebar Tabs Config
  const sidebarGroups = [
    {
      title: "Overview",
      items: [
        { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard, role: "both" },
        { id: "analytics" as Tab, label: "Analytics & Sales", icon: TrendingUp, role: "admin" },
      ]
    },
    {
      title: "Catalog",
      items: [
        { id: "all-products" as Tab, label: "All Products", icon: Package, role: "admin" },
        { id: "add-product" as Tab, label: "Add Product", icon: Plus, role: "admin" },
      ]
    },
    {
      title: "Management",
      items: [
        { id: "orders" as Tab, label: "Orders", icon: ClipboardList, role: "both" },
        { id: "customers" as Tab, label: "Customers", icon: Users, role: "both" },
        { id: "bulk-inquiries" as Tab, label: "Bulk Inquiries", icon: FileText, role: "admin" },
        { id: "custom-printing" as Tab, label: "Custom Printing", icon: Palette, role: "admin" },
        { id: "reviews" as Tab, label: "Reviews", icon: MessageSquare, role: "admin" },
        { id: "coupons" as Tab, label: "Promo Coupons", icon: Tag, role: "admin" },
      ]
    },
    {
      title: "Content & Settings",
      items: [
        { id: "blogs" as Tab, label: "Blogs Editor", icon: BookOpen, role: "admin" },
        { id: "banners" as Tab, label: "Hero Banners", icon: ImageIcon, role: "admin" },
        { id: "settings" as Tab, label: "Website Settings", icon: SettingsIcon, role: "admin" },
      ]
    }
  ];

  const handleEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setTab("add-product");
  };

  const checkRoleAccess = (tabId: Tab) => {
    if (isStaff) {
      // Staff can only access: dashboard, orders, customers
      return ["dashboard", "orders", "customers"].includes(tabId);
    }
    return true; // Admin can access everything
  };

  return (
    <section className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#EADFC9]/60 bg-white/80 backdrop-blur">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-foreground text-background rounded-full flex items-center justify-center font-bold serif text-xl">G</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="serif text-xl font-semibold tracking-tight">Giftcy</span>
                <span className="text-[9px] uppercase tracking-widest bg-gold/15 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-semibold">
                  {user.role}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Concierge CMS Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
            <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white text-xs hover:border-gold hover:text-gold transition font-medium">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid lg:grid-cols-[260px_1fr] w-full">
        {/* Sidebar */}
        <aside className="border-r border-[#EADFC9]/50 bg-white p-5 space-y-6 hidden lg:block">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <p className="text-[9px] font-bold tracking-[0.25em] text-gold uppercase px-3 mb-2">{group.title}</p>
              {group.items.map((item) => {
                const isCurrent = tab === item.id || (item.id === "all-products" && tab === "add-product" && editingProduct);
                const hasItemAccess = checkRoleAccess(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (hasItemAccess) {
                        if (item.id === "add-product") setEditingProduct(null);
                        setTab(item.id);
                      } else {
                        toast.error("Restricted Action", {
                          description: "Staff role is limited to Orders, Customers, and Dashboard stats."
                        });
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isCurrent
                        ? "bg-foreground text-background shadow-md shadow-foreground/5"
                        : hasItemAccess
                        ? "text-foreground/75 hover:bg-cream/40 hover:text-foreground"
                        : "text-muted-foreground/45 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${isCurrent ? "text-gold" : "text-muted-foreground"}`} />
                      <span>{item.label}</span>
                    </div>
                    {!hasItemAccess && <Lock className="h-3 w-3 text-muted-foreground/40" />}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Content Workspace */}
        <main className="p-6 md:p-8 overflow-y-auto">
          {!checkRoleAccess(tab) ? (
            <div className="bg-white border border-[#EADFC9] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-12 animate-in fade-in">
              <div className="h-14 w-14 bg-amber-50 text-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="serif text-2xl font-semibold mb-2">Restricted Access</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                This section contains administrative settings. Staff profiles are restricted to viewing and managing orders, shipment updates, and customer lists.
              </p>
              <button onClick={() => setTab("dashboard")} className="px-6 py-2.5 rounded-full bg-foreground text-background text-xs font-medium">
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {tab === "dashboard" && <Dashboard setTab={setTab} />}
              {tab === "analytics" && <Analytics />}
              {tab === "all-products" && <ProductsAdmin handleEdit={handleEditProduct} />}
              {tab === "add-product" && <ProductForm initial={editingProduct} onClose={() => { setEditingProduct(null); setTab("all-products"); }} />}
              {tab === "orders" && <OrdersAdmin />}
              {tab === "customers" && <CustomersAdmin />}
              {tab === "bulk-inquiries" && <BulkInquiriesAdmin />}
              {tab === "custom-printing" && <CustomPrintingAdmin />}
              {tab === "reviews" && <ReviewsAdmin />}
              {tab === "coupons" && <CouponsAdmin />}
              {tab === "blogs" && <BlogsAdmin />}
              {tab === "banners" && <BannersAdmin />}
              {tab === "settings" && <SettingsAdmin />}
            </>
          )}
        </main>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   1. DASHBOARD
   ──────────────────────────────────────────────────────── */
function Dashboard({ setTab }: { setTab: (t: Tab) => void }) {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0, pending: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/admin/dashboard");
        if (res?.success && res?.data) {
          const { stats: ds, recentOrders: ro } = res.data;
          setStats({
            products: ds.productsCount ?? 0,
            customers: ds.customersCount ?? 0,
            orders: ds.ordersCount ?? 0,
            revenue: ds.totalSales ?? 0,
            pending: ds.pendingOrdersCount ?? 0,
            lowStock: ds.lowStockCount ?? 0,
          });
          if (Array.isArray(ro)) setRecentOrders(ro);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: Coins, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Total Orders", value: stats.orders, icon: ClipboardList, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Pending Orders", value: stats.pending, icon: RotateCcw, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Low Stock Items", value: stats.lowStock, valueColor: stats.lowStock > 0 ? "text-destructive" : "", icon: Archive, color: "text-red-600 bg-red-50 border-red-100" },
    { label: "Total Customers", value: stats.customers, icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Total Products", value: stats.products, icon: Package, color: "text-pink-600 bg-pink-50 border-pink-100" },
  ];

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling metrics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Dashboard</h2>
        <p className="text-xs text-muted-foreground mt-1">Real-time metrics, inventory alerts, and order status updates.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white border border-border p-5 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p>
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center border ${c.color}`}><c.icon className="h-3.5 w-3.5" /></div>
            </div>
            <p className={`serif text-3xl mt-4 font-bold ${c.valueColor || "text-foreground"}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="serif text-lg font-semibold">Recent Orders</h3>
            <button onClick={() => setTab("orders")} className="text-xs text-gold hover:underline flex items-center gap-1">
              View all orders <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream/40 border-b border-border">
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Items</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-xs">No orders recorded yet.</td></tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o._id} className="border-t border-border/60 hover:bg-cream/10">
                      <td className="p-3 text-xs">
                        <p className="font-semibold">{o.user?.name || "Guest"}</p>
                        <p className="text-[10px] text-muted-foreground">{o.user?.email || ""}</p>
                      </td>
                      <td className="p-3 text-xs max-w-xs truncate">
                        {(o.orderItems ?? []).map((item: any, idx: number) => (
                          <span key={idx} className="inline-block mr-1.5 bg-cream/70 text-[9px] px-2 py-0.5 rounded text-foreground border border-border/30">
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                      </td>
                      <td className="p-3 text-xs font-bold text-gold">₹{o.totalPrice}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          o.status === "Processing" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          o.status === "Shipped" ? "bg-blue-50 text-blue-700 border-blue-100" :
                          o.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          "bg-red-50 text-red-700 border-red-100"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-[#EADFC9] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="serif text-lg font-semibold border-b border-[#EADFC9]/50 pb-3 text-gold">Concierge Quick Guide</h3>
            <ul className="mt-4 space-y-3.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>**Admin Mode**: Full rights to edit catalogs, upload logo inquiry templates, write blogs, and modify system settings.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Users className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>**Staff Mode**: Access is restricted. Staff users can review B2C sales orders and customer lists but cannot access settings or CMS banners.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Package className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>**Low Stock Alerts**: Any product with a stock count below 10 is highlighted immediately in the low-stock counter.</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-[#FDFBF7] border border-[#EADFC9]/50 text-[10px] text-muted-foreground">
            Connected to <strong>In-Memory mock database</strong> fallback.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   2. ANALYTICS
   ──────────────────────────────────────────────────────── */
function Analytics() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/admin/dashboard");
        if (res?.success && Array.isArray(res.data?.categorySales)) {
          setSales(res.data.categorySales);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling sales analytics...</div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Analytics & Sales</h2>
        <p className="text-xs text-muted-foreground mt-1">Breakdown of sales amounts, units sold, and top categories.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="serif text-lg font-semibold mb-4">Category Revenue Breakdown</h3>
          <div className="space-y-4">
            {sales.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">No catalog sales recorded.</div>
            ) : (
              sales.map((s) => (
                <div key={s._id} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{s.categoryName}</span>
                    <span className="font-semibold text-gold">₹{s.salesAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full bg-cream rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(100, (s.salesAmount / 50000) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{s.unitsSold} units sold</span>
                    <span>{Math.round(s.salesAmount / (s.unitsSold || 1))} avg/unit</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-center text-center">
          <div className="h-16 w-16 bg-cream border border-gold/20 rounded-full flex items-center justify-center text-gold mx-auto mb-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h4 className="serif text-xl font-medium mb-2">Automated Forecasts</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Analytics reports compile automatically from paid checkout logs. B2B wholesale inquiries are excluded from these graphics to keep statistics clean.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   3. PRODUCTS
   ──────────────────────────────────────────────────────── */
function ProductsAdmin({ handleEdit }: { handleEdit: (prod: any) => void }) {
  const [rows, setRows] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/products?limit=100");
      if (res?.success && res?.data?.products) {
        setRows(res.data.products);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await apiClient.delete(`/products/${id}`);
      if (res?.success) {
        toast.success("Product deleted successfully");
        load();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Fetching catalog…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Products</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage B2C collections, stock values, and pricing variations.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">SKU</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Pricing</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">No products created yet.</td></tr>
            ) : (
              rows.map((r) => {
                const isLowStock = r.stock <= (r.stock ?? 10); // alert on <= lowStockAlert or 10
                return (
                  <tr key={r._id} className="border-t border-border/60 hover:bg-cream/10">
                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-3">
                        {r.images?.[0] ? (
                          <img src={r.images[0]} alt="" className="h-11 w-11 rounded-lg object-cover bg-cream border border-border/30" />
                        ) : (
                          <div className="h-11 w-11 rounded-lg bg-cream border border-border/30 grid place-items-center"><ImagePlus className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{r.name}</p>
                          <p className="text-[10px] text-gold uppercase tracking-wider mt-0.5">
                            {typeof r.category === "object" ? r.category.name : r.category} · {r.occasion}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono">{r.amazon_url ? "GFT-CMS-" + r.slug.substring(0,4).toUpperCase() : "GFT-MOCK"}</td>
                    <td className="p-4 text-xs">
                      <div className="font-semibold">₹{r.price}</div>
                      {Number(r.compareAtPrice) > Number(r.price) && <div className="text-[10px] text-muted-foreground line-through">₹{r.compareAtPrice}</div>}
                    </td>
                    <td className="p-4 text-xs">
                      <span className={`font-semibold ${isLowStock ? "text-destructive font-bold" : "text-foreground"}`}>{r.stock}</span>
                      {isLowStock && <span className="block text-[8px] font-bold text-destructive uppercase tracking-wider mt-0.5">Low Stock</span>}
                    </td>
                    <td className="p-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${r.active !== false ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-muted text-muted-foreground border-border"}`}>
                        {r.active !== false ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(r)} className="p-2 hover:text-gold transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => del(r._id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   3B. PRODUCT FORM (ADD/EDIT)
   ──────────────────────────────────────────────────────── */
function ProductForm({ initial, onClose }: { initial: any | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "variations" | "specifications">("basic");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Expanded Product States
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription || "");
  const [category, setCategory] = useState(typeof initial?.category === "object" ? initial.category._id : initial?.category || "");
  const [occasion, setOccasion] = useState(initial?.occasion || "Wedding");

  const [mrp, setMrp] = useState(initial?.compareAtPrice || 0);
  const [price, setPrice] = useState(initial?.price || 0);
  const [bulkPrice, setBulkPrice] = useState(initial?.bulkPrice || 0);

  const [sku, setSku] = useState(initial?.sku || "");
  const [stock, setStock] = useState(initial?.stock || 100);
  const [lowStockAlert, setLowStockAlert] = useState(initial?.lowStockAlert || 10);
  const [published, setPublished] = useState(initial?.active !== false);

  const [mainImage, setMainImage] = useState(initial?.images?.[0] || "");
  const [otherImages, setOtherImages] = useState(initial?.images?.slice(1).join(", ") || "");
  const [video, setVideo] = useState(initial?.video || "");

  // Variations
  const [colors, setColors] = useState<string[]>(initial?.colors || ["Ivory", "Gold", "Blush"]);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes || ["Small", "Medium", "Large"]);
  const [newColor, setNewColor] = useState("");

  // Specs
  const [fabric, setFabric] = useState(initial?.specifications?.fabric || "Silk / Satin blend");
  const [dimensions, setDimensions] = useState(initial?.specifications?.dimensions || "10 x 12 inch");
  const [weight, setWeight] = useState(initial?.specifications?.weight || "120g");
  const [handle, setHandle] = useState(initial?.specifications?.handle || "Cotton Rope drawstring");
  const [care, setCare] = useState(initial?.specifications?.care || "Hand Wash Only");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/categories");
        if (res?.success && Array.isArray(res.data)) {
          setCategories(res.data);
          if (!category && res.data.length > 0) setCategory(res.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleAddColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const handleRemoveColor = (c: string) => {
    setColors(colors.filter(x => x !== c));
  };

  const handleToggleSize = (s: string) => {
    if (sizes.includes(s)) {
      setSizes(sizes.filter(x => x !== s));
    } else {
      setSizes([...sizes, s]);
    }
  };

  const saveProduct = async () => {
    if (!name.trim()) return toast.error("Product name is required");
    if (!price) return toast.error("Product price is required");
    setSaving(true);

    const imageArray = [mainImage, ...otherImages.split(",").map(i => i.trim()).filter(Boolean)].filter(Boolean);
    if (imageArray.length === 0) imageArray.push("https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800");

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description,
      shortDescription,
      category,
      occasion,
      price: Number(price),
      compareAtPrice: Number(mrp),
      bulkPrice: Number(bulkPrice),
      stock: Number(stock),
      sku: sku || "GFT-" + occasion.substring(0,3).toUpperCase() + "-" + Math.floor(100 + Math.random()*900),
      lowStockAlert: Number(lowStockAlert),
      active: published,
      colors,
      sizes,
      images: imageArray,
      video,
      specifications: { fabric, dimensions, weight, handle, care },
    };

    try {
      const res = initial?._id
        ? await apiClient.put(`/products/${initial._id}`, payload)
        : await apiClient.post("/products", payload);

      if (res?.success) {
        toast.success(initial?._id ? "Product updated successfully!" : "Product created successfully!");
        onClose();
      } else {
        toast.error(res.message || "Failed to save product");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const tabsList = [
    { id: "basic", label: "Basic Info" },
    { id: "pricing", label: "Pricing & Stock" },
    { id: "variations", label: "Variations" },
    { id: "specifications", label: "Specs & Media" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="serif text-3xl font-semibold">{initial?._id ? "Edit Product" : "Add New Bag"}</h2>
          <p className="text-xs text-muted-foreground mt-1">Setup specifications, variations, and image cover URLs.</p>
        </div>
        <button onClick={onClose} className="px-4 py-2 rounded-full border border-border text-xs bg-white font-medium hover:bg-cream/40">Cancel</button>
      </div>

      <div className="flex border-b border-border">
        {tabsList.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition ${
              activeTab === t.id ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t.label}</button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm min-h-[350px]">
        {/* BASIC TAB */}
        {activeTab === "basic" && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Bag Product Name"><input className="i" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Regal Gold Embroidered" /></Field>
            <Field label="URL Slug"><input className="i" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. regal-gold-embroidered" /></Field>
            <Field label="Category">
              <select className="i bg-transparent" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Occasion">
              <select className="i bg-transparent" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                {["Wedding", "Birthday", "Festive", "Corporate", "Combo Packs"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Short Summary Description" full><input className="i" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="A brief 1-sentence sales summary..." /></Field>
            <Field label="Full Description / Material details" full>
              <textarea rows={4} className="i rounded-xl py-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Write details about craftsmanship, fabrics, design motifs, history..." />
            </Field>
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === "pricing" && (
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="MRP / Compare Price (₹)"><input type="number" className="i" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} /></Field>
            <Field label="Sale Price (₹)"><input type="number" className="i" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></Field>
            <Field label="Bulk Price (B2B / 100+ units) (₹)"><input type="number" className="i" value={bulkPrice} onChange={(e) => setBulkPrice(Number(e.target.value))} /></Field>

            <Field label="SKU / Reference Identifier"><input className="i" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. GFT-WED-001" /></Field>
            <Field label="Stock Quantity"><input type="number" className="i" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></Field>
            <Field label="Low Stock Alert Threshold"><input type="number" className="i" value={lowStockAlert} onChange={(e) => setLowStockAlert(Number(e.target.value))} /></Field>

            <Field label="Publish Status">
              <label className="flex items-center gap-2 h-11 border border-border rounded-full px-4 bg-background">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span className="text-xs font-semibold">Active & Published on Web</span>
              </label>
            </Field>
          </div>
        )}

        {/* VARIATIONS TAB */}
        {activeTab === "variations" && (
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Color Combinations</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {colors.map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream/80 text-xs font-medium border border-[#EADFC9]">
                    {c}
                    <button type="button" onClick={() => handleRemoveColor(c)} className="text-destructive hover:scale-110"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <input className="i" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Add Custom Color (e.g. Navy Blue)" />
                <button type="button" onClick={handleAddColor} className="px-4 py-2 bg-foreground text-background text-xs font-medium rounded-full shrink-0">Add Color</button>
              </div>
            </div>

            <div className="gold-divider" />

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Sizes Supported</label>
              <div className="flex gap-3">
                {["Small", "Medium", "Large", "XL", "Bespoke"].map(sz => {
                  const selected = sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleToggleSize(sz)}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold border transition ${
                        selected ? "bg-foreground text-background border-foreground shadow" : "bg-white text-muted-foreground border-border hover:border-foreground"
                      }`}
                    >{sz}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SPECS TAB */}
        {activeTab === "specifications" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Fabric Type"><input className="i" value={fabric} onChange={(e) => setFabric(e.target.value)} placeholder="e.g. Cotton-Blend" /></Field>
              <Field label="Dimensions"><input className="i" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="e.g. 10 x 12 inch" /></Field>
              <Field label="Bag Weight"><input className="i" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 120g" /></Field>
              <Field label="Handle Type"><input className="i" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="e.g. Cotton Rope Drawstring" /></Field>
              <Field label="Care Instructions" full><input className="i" value={care} onChange={(e) => setCare(e.target.value)} placeholder="e.g. Hand Wash Only" /></Field>
            </div>

            <div className="gold-divider" />

            <div className="space-y-4">
              <Field label="Main Product Image URL" full>
                <input className="i" value={mainImage} onChange={(e) => setMainImage(e.target.value)} placeholder="Paste Unsplash or static cover URL..." />
              </Field>
              <Field label="Additional Image URLs (Comma-separated list)" full>
                <input className="i" value={otherImages} onChange={(e) => setOtherImages(e.target.value)} placeholder="URL 1, URL 2, URL 3..." />
              </Field>
              <Field label="Product Video URL (MP4 or Youtube)" full>
                <input className="i" value={video} onChange={(e) => setVideo(e.target.value)} placeholder="Paste product presentation video URL..." />
              </Field>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-cream/40">Cancel</button>
        <button onClick={saveProduct} disabled={saving} className="px-8 py-2.5 bg-foreground text-background text-sm font-semibold rounded-full disabled:opacity-60 shadow-lg shadow-foreground/15">
          {saving ? "Saving Product..." : "Save Product Details"}
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   4. ORDERS
   ──────────────────────────────────────────────────────── */
function OrdersAdmin() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/orders");
      if (res?.success && Array.isArray(res.data)) {
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      const res = await apiClient.put(`/admin/orders/${id}/status`, { status });
      if (res?.success) {
        toast.success("Order status updated successfully!");
        load();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Loading order logs…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Orders</h2>
        <p className="text-xs text-muted-foreground mt-1">Track payments, pack shipments, and transition delivery tags.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID / Date</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Items</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Method</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">No orders received yet.</td></tr>
            ) : (
              rows.map((o) => (
                <tr key={o._id} className="border-t border-border/60 hover:bg-cream/10 align-top">
                  <td className="p-4 text-xs">
                    <p className="font-mono font-semibold">#{o._id.substring(18).toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 text-xs">
                    <p className="font-semibold">{o.user?.name || "Guest"}</p>
                    <p className="text-[10px] text-muted-foreground">{o.user?.email || ""}</p>
                  </td>
                  <td className="p-4 text-xs">
                    {(o.orderItems ?? []).map((i, k) => (
                      <div key={k} className="text-[11px] leading-relaxed mb-0.5">
                        {i.quantity}× {i.name} <span className="text-muted-foreground">(₹{i.price})</span>
                      </div>
                    ))}
                  </td>
                  <td className="p-4 text-xs font-bold text-gold">₹{o.totalPrice}</td>
                  <td className="p-4 text-xs font-semibold text-muted-foreground">COD (Cash on Delivery)</td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o._id, e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-border text-xs bg-white font-medium hover:border-gold transition cursor-pointer"
                    >
                      {["Pending", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Refunded"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   5. CUSTOMERS
   ──────────────────────────────────────────────────────── */
function CustomersAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/users");
      if (res?.success && Array.isArray(res.data)) {
        // Filter out admin users, show only buyers/customers
        setRows(res.data.filter((u: any) => u.role === "user"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Loading buyers profiles…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Customers</h2>
        <p className="text-xs text-muted-foreground mt-1">Review registered user lists, credentials, and verification dates.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Buyer Profile</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Registered Email</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Verified</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Joining Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">No registered customers yet.</td></tr>
            ) : (
              rows.map((u) => (
                <tr key={u._id} className="border-t border-border/60 hover:bg-cream/10">
                  <td className="p-4 text-xs font-semibold text-sm">{u.name}</td>
                  <td className="p-4 text-xs font-mono">{u.email}</td>
                  <td className="p-4 text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      u.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                    }`}>
                      {u.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   6. BULK INQUIRIES
   ──────────────────────────────────────────────────────── */
function BulkInquiriesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/bulk-inquiries");
      if (res?.success && Array.isArray(res.data)) {
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      const res = await apiClient.put(`/bulk-inquiries/${id}/status`, { status });
      if (res?.success) {
        toast.success("Bulk inquiry status updated!");
        load();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling wholesale inquiries…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Bulk B2B Inquiries</h2>
        <p className="text-xs text-muted-foreground mt-1">Review wholesale quotes, guest count inquiries, and contact status.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Inquiry Details</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact details</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Name</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Quantity</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Logo / Art</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Workflow Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">No B2B wholesale inquiries submitted.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-t border-border/60 hover:bg-cream/10 align-top">
                  <td className="p-4 text-xs">
                    <p className="font-semibold text-sm">{r.name}</p>
                    <p className="text-[10px] text-gold uppercase tracking-wider mt-0.5">{r.inquiryType} Gifting</p>
                    <p className="text-muted-foreground text-[11px] mt-2 max-w-xs leading-relaxed italic">"{r.message}"</p>
                  </td>
                  <td className="p-4 text-xs">
                    <p className="font-semibold">{r.mobile}</p>
                    <p className="text-[10px] text-muted-foreground">{r.email}</p>
                  </td>
                  <td className="p-4 text-xs font-medium">{r.companyName || "—"}</td>
                  <td className="p-4 text-xs font-bold text-gold">{r.quantity} bags</td>
                  <td className="p-4 text-xs">
                    {r.logoUrl ? (
                      <a href={r.logoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-cream/30 hover:border-gold hover:text-gold transition font-medium text-[10px]">
                        <Download className="h-3 w-3" /> Get Artwork
                      </a>
                    ) : <span className="text-muted-foreground text-[10px]">No Logo Attached</span>}
                  </td>
                  <td className="p-4">
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r._id, e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-border text-xs bg-white font-medium hover:border-gold transition cursor-pointer"
                    >
                      {["New", "Contacted", "Quotation Sent", "Closed"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   7. CUSTOM PRINTING
   ──────────────────────────────────────────────────────── */
function CustomPrintingAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/bulk-inquiries");
        if (res?.success && Array.isArray(res.data)) {
          // Show only bulk inquiries that actually requested customized custom printing with logos
          setRows(res.data.filter((i: any) => i.logoUrl || i.message.toLowerCase().includes("custom") || i.message.toLowerCase().includes("logo") || i.message.toLowerCase().includes("print")));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling customized requests…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Custom Printing Atelier</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage B2B orders with custom logo vector graphics and custom text prints.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Artwork Specification</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">B2B client</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Volume</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Vector Logo File</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">No active custom logo prints requested.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-t border-border/60 hover:bg-cream/10">
                  <td className="p-4 text-xs">
                    <p className="font-semibold text-sm">Bespoke Foil Monogramming</p>
                    <p className="text-muted-foreground text-[10px] italic mt-1 max-w-xs truncate">"{r.message}"</p>
                  </td>
                  <td className="p-4 text-xs">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.companyName || r.email}</p>
                  </td>
                  <td className="p-4 text-xs font-bold text-gold">{r.quantity} pieces</td>
                  <td className="p-4">
                    {r.logoUrl ? (
                      <a href={r.logoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-emerald-50 text-emerald-800 hover:border-emerald-500 hover:text-emerald-950 transition font-medium text-[10px]">
                        <Download className="h-3.5 w-3.5" /> Download Vector File
                      </a>
                    ) : <span className="text-muted-foreground text-[10px]">Text Print only (No Vector File)</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   8. REVIEWS
   ──────────────────────────────────────────────────────── */
function ReviewsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/reviews");
      if (res?.success && Array.isArray(res.data)) {
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      const res = await apiClient.put(`/reviews/${id}/status`, { status });
      if (res?.success) {
        toast.success(`Review ${status.toLowerCase()} successfully!`);
        load();
      } else {
        toast.error(res.message || "Failed to update review status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update review status");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      const res = await apiClient.delete(`/reviews/${id}`);
      if (res?.success) {
        toast.success("Review deleted successfully");
        load();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling feedback reviews…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Reviews Management</h2>
        <p className="text-xs text-muted-foreground mt-1">Approve, reject, or archive customer mehendi/wedding feedbacks.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating & Comment</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Author</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">No feedback reviews recorded yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-t border-border/60 hover:bg-cream/10 align-top">
                  <td className="p-4 text-xs max-w-sm">
                    <div className="flex text-amber-400 mb-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed italic">"{r.comment}"</p>
                    {/* Media Attachments */}
                    {Array.isArray(r.photos) && r.photos.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {r.photos.map((p: string, idx: number) => (
                          <img key={idx} src={p} alt="" className="h-9 w-9 rounded object-cover border border-border bg-cream" />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-xs font-semibold">{r.product?.name || "Premium Bag"}</td>
                  <td className="p-4 text-xs font-medium">{r.name}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                      r.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      r.status === "Rejected" ? "bg-red-50 text-red-700 border-red-100" :
                      "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {r.status || "Approved"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 shrink-0">
                    <button onClick={() => setStatus(r._id, "Approved")} className="text-[10px] font-semibold text-emerald-700 hover:underline">Approve</button>
                    <span className="text-border">|</span>
                    <button onClick={() => setStatus(r._id, "Rejected")} className="text-[10px] font-semibold text-red-600 hover:underline">Reject</button>
                    <span className="text-border">|</span>
                    <button onClick={() => del(r._id)} className="text-[10px] font-semibold text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   9. COUPONS
   ──────────────────────────────────────────────────────── */
type Coupon = { _id: string; code: string; discountType: string; discountAmount: number; minCartAmount: number; usageLimit: number | null; usedCount: number; expiryDate: string | null; active: boolean };

function CouponsAdmin() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: 10, min_order: 0, expires_at: "", active: true });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/coupons");
      if (res?.success && res?.data) {
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discount_type === "percent" ? "percentage" : "flat",
      discountAmount: Number(form.discount_value),
      minCartAmount: Number(form.min_order),
      expiryDate: form.expires_at ? new Date(form.expires_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: form.active,
    };
    try {
      const res = await apiClient.post("/coupons", payload);
      if (res?.success) {
        toast.success("Coupon created successfully!");
        setForm({ code: "", discount_type: "percent", discount_value: 10, min_order: 0, expires_at: "", active: true });
        load();
      } else {
        toast.error(res.message || "Failed to create coupon");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon");
    }
  };

  const toggle = async (c: Coupon) => {
    try {
      const res = await apiClient.put(`/coupons/${c._id}/toggle`, {});
      if (res?.success) load();
    } catch (err) {
      console.error(err);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Permanently delete this coupon?")) return;
    try {
      const res = await apiClient.delete(`/coupons/${id}`);
      if (res?.success) load();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Loading coupon logs…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Promo Coupons</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure percentage discounts and minimum basket subtotal rules.</p>
      </div>

      <form onSubmit={create} className="rounded-2xl bg-white border border-border p-5 grid md:grid-cols-6 gap-3">
        <input required placeholder="CODE" className="i md:col-span-1" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="i bg-transparent" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
          <option value="percent">% Off</option>
          <option value="flat">Flat ₹ Off</option>
        </select>
        <input type="number" placeholder="Value" className="i" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
        <input type="number" placeholder="Min Order ₹" className="i" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} />
        <input type="date" className="i" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
        <button className="px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold">Add Coupon</button>
      </form>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Code</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Discount</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Min Order</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Usage Counts</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Expires</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">No coupons registered yet.</td></tr>
            ) : (
              rows.map((c) => (
                <tr key={c._id} className="border-t border-border/60 hover:bg-cream/10">
                  <td className="p-4 font-mono font-semibold text-xs text-sm">{c.code}</td>
                  <td className="p-4 text-xs">{c.discountType === "percentage" ? `${c.discountAmount}%` : `₹${c.discountAmount}`}</td>
                  <td className="p-4 text-xs">₹{c.minCartAmount}</td>
                  <td className="p-4 text-xs">{c.usedCount ?? 0} usages</td>
                  <td className="p-4 text-xs">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "—"}</td>
                  <td className="p-4">
                    <button onClick={() => toggle(c)} className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${c.active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-muted text-muted-foreground border-border"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => del(c._id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   10. BLOGS
   ──────────────────────────────────────────────────────── */
function BlogsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/blogs");
      if (res?.success && Array.isArray(res.data)) {
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (blog: any) => {
    setEditing(blog);
    setTitle(blog.title || "");
    setSlug(blog.slug || "");
    setFeaturedImage(blog.featuredImage || "");
    setContent(blog.content || "");
    setMetaTitle(blog.metaTitle || "");
    setMetaDescription(blog.metaDescription || "");
    setAuthor(blog.author || "");
    setPublished(blog.published !== false);
  };

  const clearForm = () => {
    setEditing(null);
    setTitle("");
    setSlug("");
    setFeaturedImage("");
    setContent("");
    setMetaTitle("");
    setMetaDescription("");
    setAuthor("");
    setPublished(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error("Title and content are required");

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      featuredImage: featuredImage || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
      content,
      metaTitle,
      metaDescription,
      author: author || "Giftcy Editor",
      published
    };

    try {
      const res = editing?._id
        ? await apiClient.put(`/blogs/${editing._id}`, payload)
        : await apiClient.post("/blogs", payload);

      if (res?.success) {
        toast.success(editing?._id ? "Blog post updated successfully!" : "Blog post published!");
        clearForm();
        load();
      } else {
        toast.error(res.message || "Failed to save blog");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save blog");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Permanently delete this editorial post?")) return;
    try {
      const res = await apiClient.delete(`/blogs/${id}`);
      if (res?.success) {
        toast.success("Blog post deleted successfully");
        load();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling blogs logs…</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
      {/* Blog form editor */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="serif text-xl font-semibold text-gold border-b border-border pb-3">
            {editing ? "Edit Editorial Blog" : "Compose Editorial Blog"}
          </h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Blog Title"><input required className="i" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wedding Favors Guide" /></Field>
            <Field label="URL Slug"><input className="i" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. sustainable-luxury-wrapping" /></Field>
            <Field label="Featured Image URL"><input className="i" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="Unsplash / static path URL" /></Field>
            <Field label="Author name"><input className="i" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Giftcy Concierge Editor" /></Field>
            
            <Field label="Blog Content Markdown / text">
              <textarea required rows={6} className="i rounded-xl py-3 min-h-[120px]" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write editorial text paragraphs..." />
            </Field>

            <div className="gold-divider" />
            <p className="text-[9px] uppercase tracking-wider font-semibold text-gold">SEO Meta Properties</p>
            <Field label="SEO Title"><input className="i" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></Field>
            <Field label="SEO Description"><input className="i" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} /></Field>

            <Field label="Post Visibility">
              <label className="flex items-center gap-2 h-11 border border-border rounded-full px-4 bg-background">
                <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <span className="text-xs font-semibold">Published (Visible on blogs page)</span>
              </label>
            </Field>

            <div className="flex gap-2 pt-2">
              {editing && <button type="button" onClick={clearForm} className="flex-1 py-2.5 rounded-full border border-border text-xs font-medium bg-white">Cancel</button>}
              <button className="flex-1 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold shadow-lg shadow-foreground/15">
                {editing ? "Save Updates" : "Publish Blog Post"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Blogs list */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="serif text-3xl font-semibold">Blogs Editor</h2>
          <p className="text-xs text-muted-foreground mt-1">Compose newsletters, fabric guides, and wedding planning tips.</p>
        </div>

        <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/40 border-b border-border">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Article</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Author</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">No blogs published yet.</td></tr>
              ) : (
                rows.map((b) => (
                  <tr key={b._id} className="border-t border-border/60 hover:bg-cream/10">
                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={b.featuredImage} alt="" className="h-10 w-10 rounded-lg object-cover bg-cream border border-border/30" />
                        <div>
                          <p className="font-semibold">{b.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">/blog/{b.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-medium text-muted-foreground">{b.author || "Editor"}</td>
                    <td className="p-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${b.published ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-muted text-muted-foreground border-border"}`}>
                        {b.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(b)} className="p-2 hover:text-gold transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => del(b._id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   11. BANNERS
   ──────────────────────────────────────────────────────── */
function BannersAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState("");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [ctaLink, setCtaLink] = useState("/shop");
  const [active, setActive] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/banners");
      if (res?.success && Array.isArray(res.data)) {
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (b: any) => {
    setEditing(b);
    setTitle(b.title || "");
    setSubtitle(b.subtitle || "");
    setImage(b.image || "");
    setCtaText(b.ctaText || "Shop Now");
    setCtaLink(b.ctaLink || "/shop");
    setActive(b.active !== false);
  };

  const clearForm = () => {
    setEditing(null);
    setTitle("");
    setSubtitle("");
    setImage("");
    setCtaText("Shop Now");
    setCtaLink("/shop");
    setActive(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) return toast.error("Title and image URL are required");

    const payload = { title, subtitle, image, ctaText, ctaLink, active };

    try {
      const res = editing?._id
        ? await apiClient.put(`/banners/${editing._id}`, payload)
        : await apiClient.post("/banners", payload);

      if (res?.success) {
        toast.success(editing?._id ? "Banner slide updated!" : "New banner slide created!");
        clearForm();
        load();
      } else {
        toast.error(res.message || "Failed to save banner");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save banner");
    }
  };

  const del = async (id: string) => {
    if (!confirm("Permanently delete this slider banner?")) return;
    try {
      const res = await apiClient.delete(`/banners/${id}`);
      if (res?.success) {
        toast.success("Banner deleted successfully");
        load();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling slider banners…</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
      {/* Banner form */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="serif text-xl font-semibold text-gold border-b border-border pb-3">
            {editing ? "Edit Banner Slide" : "Create Banner Slide"}
          </h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Banner Main Title"><input required className="i" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wedding Collection 2026" /></Field>
            <Field label="Banner Subtitle"><input className="i" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Luxury Drawstring Potli Bags" /></Field>
            <Field label="Background Image URL"><input required className="i" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Unsplash/CDN banner cover image" /></Field>
            <Field label="Button Text (CTA)"><input className="i" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Shop Now" /></Field>
            <Field label="Button Link (CTA Link)"><input className="i" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="/shop?category=wedding" /></Field>

            <Field label="Banner Status">
              <label className="flex items-center gap-2 h-11 border border-border rounded-full px-4 bg-background">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                <span className="text-xs font-semibold">Active (Visible in homepage slide)</span>
              </label>
            </Field>

            <div className="flex gap-2 pt-2">
              {editing && <button type="button" onClick={clearForm} className="flex-1 py-2.5 rounded-full border border-border text-xs font-medium bg-white">Cancel</button>}
              <button className="flex-1 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold shadow-lg shadow-foreground/15">
                {editing ? "Save Updates" : "Save Banner"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Banner list */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="serif text-3xl font-semibold">Hero Banners</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure sliders, season badges, and call-to-action buttons.</p>
        </div>

        <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/40 border-b border-border">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Banner slide details</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action link</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">No custom banners added.</td></tr>
              ) : (
                rows.map((b) => (
                  <tr key={b._id} className="border-t border-border/60 hover:bg-cream/10">
                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={b.image} alt="" className="h-10 w-16 rounded-lg object-cover bg-cream border border-border/30" />
                        <div>
                          <p className="font-semibold text-sm">{b.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{b.subtitle || "Slider banner"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-gold">{b.ctaLink} ({b.ctaText})</td>
                    <td className="p-4 text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${b.active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-muted text-muted-foreground border-border"}`}>
                        {b.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(b)} className="p-2 hover:text-gold transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => del(b._id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   12. SETTINGS
   ──────────────────────────────────────────────────────── */
function SettingsAdmin() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // States
  const [brandName, setBrandName] = useState("Giftcy");
  const [logoUrl, setLogoUrl] = useState("");
  const [phone, setPhone] = useState("+91 99999 99999");
  const [email, setEmail] = useState("hello@giftcy.in");
  const [address, setAddress] = useState("Mumbai, India");
  const [whatsapp, setWhatsapp] = useState("+91 99999 99999");
  const [insta, setInsta] = useState("https://instagram.com/giftcy");
  const [facebook, setFacebook] = useState("https://facebook.com/giftcy");
  const [amazon, setAmazon] = useState("https://www.amazon.in/s?k=Giftcy");
  const [flipkart, setFlipkart] = useState("https://www.flipkart.com/search?q=Giftcy");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/settings");
      if (res?.success && res?.data) {
        const data = res.data;
        // Load contact info
        if (data.contact_info) {
          setWhatsapp(data.contact_info.whatsapp || "");
          setEmail(data.contact_info.email || "");
          setPhone(data.contact_info.phone || "");
          setAddress(data.contact_info.address || "");
        }
        // Load general info
        if (data.general_settings) {
          setBrandName(data.general_settings.brandName || "Giftcy");
          setLogoUrl(data.general_settings.logoUrl || "");
          setInsta(data.general_settings.insta || "");
          setFacebook(data.general_settings.facebook || "");
          setAmazon(data.general_settings.amazon || "");
          setFlipkart(data.general_settings.flipkart || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payloadContact = {
        whatsapp,
        email,
        phone,
        address
      };
      const payloadGeneral = {
        brandName,
        logoUrl,
        insta,
        facebook,
        amazon,
        flipkart
      };

      await Promise.all([
        apiClient.put("/settings/contact_info", { value: payloadContact }),
        apiClient.put("/settings/general_settings", { value: payloadGeneral })
      ]);

      toast.success("Website settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Loading brand configurations…</div>;

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <div>
        <h2 className="serif text-3xl font-semibold">Website Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure brand parameters, social links, and external marketplace links.</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-3 mb-4">Brand Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Brand Name"><input className="i" value={brandName} onChange={(e) => setBrandName(e.target.value)} /></Field>
            <Field label="Logo Image URL"><input className="i" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Paste brand logo graphic URL..." /></Field>
          </div>
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-3 mb-4">Contact Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="WhatsApp Helpline"><input className="i" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></Field>
            <Field label="Concierge Phone Line"><input className="i" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="Support Email Address"><input className="i" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Studio Physical Address"><input className="i" value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          </div>
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-3 mb-4">Marketplace & Social Media Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Instagram Profile Link"><input className="i" value={insta} onChange={(e) => setInsta(e.target.value)} /></Field>
            <Field label="Facebook Profile Link"><input className="i" value={facebook} onChange={(e) => setFacebook(e.target.value)} /></Field>
            <Field label="Amazon Store Link"><input className="i" value={amazon} onChange={(e) => setAmazon(e.target.value)} /></Field>
            <Field label="Flipkart Store Link"><input className="i" value={flipkart} onChange={(e) => setFlipkart(e.target.value)} /></Field>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={save} disabled={saving} className="px-8 py-2.5 bg-foreground text-background text-sm font-semibold rounded-full shadow-lg disabled:opacity-50">
          {saving ? "Saving Configurations..." : "Save Website Settings"}
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   SHARED HELPER COMPONENTS
   ──────────────────────────────────────────────────────── */
function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
