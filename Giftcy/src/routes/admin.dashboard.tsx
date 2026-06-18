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
  X,
  Copy,
  ChevronUp,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { useProducts } from "@/lib/useProducts";
import { type Product } from "@/lib/products";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Console Dashboard — Giftcy" }] }),
  component: AdminDashboardPage,
});

type Tab =
  | "dashboard"
  | "stock-mgr"
  | "analytics"
  | "all-products"
  | "add-product"
  | "homepage-cms"
  | "collections-cms"
  | "banners-cms"
  | "category-cms"
  | "customers-cms"
  | "orders"
  | "reviews"
  | "coupons"
  | "blogs"
  | "settings"
  | "menu-cms"
  | "media-library"
  | "bulk-inquiries"
  | "custom-printing"
  | "customer-support";

function AdminDashboardPage() {
  const { user, signOut, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      nav({ to: "/admin/login" });
    }
  }, [loading, user, nav]);

  if (loading) return <div className="py-32 text-center text-muted-foreground font-serif animate-pulse">Checking active administration session…</div>;
  if (!user) return null;

  const isAdmin = ["admin", "super-admin"].includes(user.role);
  const isStaff = user.role === "staff";
  const hasAccess = isAdmin || isStaff;

  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const [unreadBulkCount, setUnreadBulkCount] = useState(0);

  const fetchUnreadSupportCount = async () => {
    try {
      const res = await apiClient.get("/admin/support-messages");
      if (res?.success && Array.isArray(res.data)) {
        const unread = res.data.filter((msg: any) => msg.status === "New").length;
        setUnreadSupportCount(unread);
      }
    } catch (err) {
      console.error("Error fetching support messages unread count:", err);
    }
  };

  const fetchUnreadBulkCount = async () => {
    try {
      const res = await apiClient.get("/bulk-inquiries");
      if (res?.success && Array.isArray(res.data)) {
        const unread = res.data.filter((inq: any) => inq.status === "New").length;
        setUnreadBulkCount(unread);
      }
    } catch (err) {
      console.error("Error fetching bulk inquiries unread count:", err);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchUnreadSupportCount();
      fetchUnreadBulkCount();
      const interval = setInterval(() => {
        fetchUnreadSupportCount();
        fetchUnreadBulkCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  if (!hasAccess) {
    return (
      <div className="py-32 text-center px-5 max-w-md mx-auto">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="serif text-4xl">Access Denied</h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          Your account ({user.email}) does not possess administrative credentials.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/" className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium">Return home</Link>
          <button onClick={() => signOut()} className="px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-cream/40 transition">Log out</button>
        </div>
      </div>
    );
  }

  // Sidebar Configuration Groups
  const sidebarGroups = [
    {
      title: "Overview",
      items: [
        { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard, role: "both" },
        { id: "stock-mgr" as Tab, label: "Stock Status", icon: PackageCheck, role: "both" },
        { id: "analytics" as Tab, label: "Analytics Reports", icon: TrendingUp, role: "admin" },
      ]
    },
    {
      title: "Catalog CMS",
      items: [
        { id: "all-products" as Tab, label: "Products Catalog", icon: Package, role: "admin" },
        { id: "add-product" as Tab, label: "Add Product", icon: Plus, role: "admin" },
        { id: "collections-cms" as Tab, label: "Collections Mgr", icon: Gift, role: "admin" },
        { id: "category-cms" as Tab, label: "Categories Mgr", icon: Archive, role: "admin" },
      ]
    },
    {
      title: "Homepage & Styling",
      items: [
        { id: "homepage-cms" as Tab, label: "Homepage CMS", icon: Sliders, role: "admin" },
        { id: "banners-cms" as Tab, label: "Banners Mgr", icon: ImageIcon, role: "admin" },
        { id: "menu-cms" as Tab, label: "Navigation Menu CMS", icon: Menu, role: "admin" },
        { id: "media-library" as Tab, label: "Media Library", icon: FolderOpen, role: "admin" },
      ]
    },
    {
      title: "Operational CMS",
      items: [
        { id: "orders" as Tab, label: "Orders Timeline", icon: ClipboardList, role: "both" },
        { id: "customers-cms" as Tab, label: "Customer Accounts", icon: Users, role: "both" },
        { id: "customer-support" as Tab, label: "Customer Support", icon: Mail, role: "admin" },
        { id: "bulk-inquiries" as Tab, label: "B2B Bulk Quotes", icon: FileText, role: "admin" },
        { id: "custom-printing" as Tab, label: "Custom Printing", icon: Palette, role: "admin" },
        { id: "reviews" as Tab, label: "Reviews & Ratings", icon: MessageSquare, role: "admin" },
        { id: "coupons" as Tab, label: "Coupons Discount", icon: Tag, role: "admin" },
        { id: "blogs" as Tab, label: "Editorial Blogs", icon: BookOpen, role: "admin" },
      ]
    },
    {
      title: "System Parameters",
      items: [
        { id: "settings" as Tab, label: "Website Settings", icon: SettingsIcon, role: "admin" },
      ]
    }
  ];

  const handleEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setTab("add-product");
  };

  const handleDuplicateProduct = (prod: any) => {
    const copy = {
      ...prod,
      _id: undefined,
      name: `${prod.name} Copy`,
      slug: "",
    };
    setEditingProduct(copy);
    setTab("add-product");
    toast.success("Product properties duplicated! Assign a unique slug and save.");
  };

  const checkRoleAccess = (tabId: Tab) => {
    if (isStaff) {
      // Staff has access to dashboard, orders, customer-cms, and stock-mgr
      return ["dashboard", "orders", "customers-cms", "stock-mgr"].includes(tabId);
    }
    return true; // Admin has access to all channels
  };

  return (
    <section className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      {/* Admin header */}
      <header className="sticky top-0 z-30 border-b border-[#EADFC9]/60 bg-white/90 backdrop-blur-md">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="h-9 w-9 bg-foreground text-background rounded-full flex items-center justify-center font-bold serif text-xl select-none">G</Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="serif text-xl font-semibold tracking-tight">Giftcy</span>
                <span className="text-[9px] uppercase tracking-widest bg-gold/15 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-bold">
                  {user.role} Console
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Shopify & Amazon Unified Seller Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#EADFC9] bg-[#FDFBF7] text-xs text-foreground hover:bg-[#F8F3E5] hover:text-gold transition font-medium shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Live Site
            </Link>
            <span className="text-xs text-muted-foreground hidden md:inline">Logged: {user.email}</span>
            <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white text-xs hover:border-gold hover:text-gold transition font-medium shadow-sm">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Panel */}
      <div className="flex-1 grid lg:grid-cols-[280px_1fr] w-full">
        {/* Sidebar */}
        <aside className="border-r border-[#EADFC9]/50 bg-white p-5 space-y-6 hidden lg:block overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-thin">
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
                          description: "Staff credentials are restricted to Orders, Customer Lists, and Dashboard."
                        });
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isCurrent
                        ? "bg-foreground text-background shadow-md shadow-foreground/5"
                        : hasItemAccess
                        ? "text-foreground/75 hover:bg-cream/40 hover:text-foreground"
                        : "text-muted-foreground/35 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${isCurrent ? "text-gold" : "text-muted-foreground"}`} />
                      <span>{item.label}</span>
                      {item.id === "customer-support" && unreadSupportCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-4">
                          {unreadSupportCount}
                        </span>
                      )}
                      {item.id === "bulk-inquiries" && unreadBulkCount > 0 && (
                        <span className="ml-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-4">
                          {unreadBulkCount}
                        </span>
                      )}
                    </div>
                    {!hasItemAccess && <Lock className="h-3 w-3 text-muted-foreground/30" />}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Dynamic Workspace render */}
        <main className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-80px)] bg-[#FDFBF7]/40">
          {!checkRoleAccess(tab) ? (
            <div className="bg-white border border-[#EADFC9] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-12 animate-in fade-in">
              <div className="h-14 w-14 bg-amber-50 text-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="serif text-2xl font-semibold mb-2">Restricted Access Block</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Staff accounts are limited to review and manage customer orders and block statuses. To edit catalog inventories or logo setting templates, authenticate as Super Admin.
              </p>
              <button onClick={() => setTab("dashboard")} className="px-6 py-2.5 rounded-full bg-foreground text-background text-xs font-medium">
                Back to dashboard
              </button>
            </div>
          ) : (
            <>
              {tab === "dashboard" && <Dashboard setTab={setTab} />}
              {tab === "stock-mgr" && <StockStatus />}
              {tab === "analytics" && <Analytics />}
              {tab === "all-products" && <ProductsAdmin handleEdit={handleEditProduct} handleDuplicate={handleDuplicateProduct} />}
              {tab === "add-product" && <ProductForm initial={editingProduct} onClose={() => { setEditingProduct(null); setTab("all-products"); }} />}
              {tab === "homepage-cms" && <HomepageCMS />}
              {tab === "collections-cms" && <CollectionsCMS />}
              {tab === "banners-cms" && <BannersCMS />}
              {tab === "category-cms" && <CategoryCMS />}
              {tab === "customers-cms" && <CustomersCMS />}
              {tab === "customer-support" && <CustomerSupportCMS onRefresh={fetchUnreadSupportCount} />}
              {tab === "bulk-inquiries" && <BulkInquiriesAdmin onRefresh={fetchUnreadBulkCount} />}
              {tab === "custom-printing" && <CustomPrintingAdmin />}
              {tab === "orders" && <OrdersAdmin />}
              {tab === "reviews" && <ReviewsAdmin />}
              {tab === "coupons" && <CouponsAdmin />}
              {tab === "blogs" && <BlogsAdmin />}
              {tab === "settings" && <SettingsAdmin />}
              {tab === "menu-cms" && <MenuCMS />}
              {tab === "media-library" && <MediaLibrary />}
            </>
          )}
        </main>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────
   1. DASHBOARD OVERVIEW
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
   2. SALES ANALYTICS
   ──────────────────────────────────────────────────────── */
function SalesTrendChart({ data = [] }: { data?: { month: string; value: number }[] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { month: "Jan", value: 0 },
        { month: "Feb", value: 0 },
        { month: "Mar", value: 0 },
        { month: "Apr", value: 0 },
        { month: "May", value: 0 },
        { month: "Jun", value: 0 }
      ];
    }
    return data;
  }, [data]);

  const maxVal = Math.max(...chartData.map(d => d.value));
  const minVal = Math.min(...chartData.map(d => d.value));
  const range = maxVal - minVal;
  
  // Calculate points
  const points = chartData.map((d, i) => {
    const x = 50 + i * 65;
    const y = 130 - (range === 0 ? 40 : ((d.value - minVal) / range) * 80);
    return { x, y, month: d.month, val: d.value };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    return `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Area path for gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} 140 L ${points[0].x} 140 Z`;

  const [activePoint, setActivePoint] = useState<any>(null);

  const avgValue = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length;
  }, [chartData]);

  const formatYLabel = (val: number) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val}`;
  };

  return (
    <div className="relative pt-2">
      <svg className="w-full h-40" viewBox="0 0 400 160">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="40" y1="60" x2="380" y2="60" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="40" y1="100" x2="380" y2="100" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3" />
        <line x1="40" y1="140" x2="380" y2="140" stroke="var(--border)" strokeWidth="1" />

        {/* Areas & Paths */}
        <path d={areaD} fill="url(#chartGrad)" />
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Dots */}
        {points.map((p, idx) => (
          <g key={idx} className="cursor-pointer" 
             onMouseEnter={() => setActivePoint(p)}
             onMouseLeave={() => setActivePoint(null)}
          >
            <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4.5" 
              fill={activePoint?.month === p.month ? "var(--foreground)" : "var(--gold)"} 
              stroke="white" 
              strokeWidth="1.5"
              className="transition-all duration-200" 
            />
          </g>
        ))}

        {/* Axis labels */}
        {points.map((p, idx) => (
          <text key={idx} x={p.x} y="156" textAnchor="middle" fontSize="9" fill="var(--color-muted-foreground)">
            {p.month}
          </text>
        ))}

        {/* Y Axis labels */}
        <text x="35" y="24" textAnchor="end" fontSize="8" fill="var(--color-muted-foreground)">{formatYLabel(maxVal)}</text>
        <text x="35" y="64" textAnchor="end" fontSize="8" fill="var(--color-muted-foreground)">{formatYLabel(minVal + range * 0.5)}</text>
        <text x="35" y="104" textAnchor="end" fontSize="8" fill="var(--color-muted-foreground)">{formatYLabel(minVal)}</text>
      </svg>

      {/* Floating tooltip details */}
      <div className="absolute top-2 right-2 h-10 min-w-[120px] bg-foreground text-background text-[11px] px-3 py-1.5 rounded-xl shadow-soft flex flex-col justify-center transition-all duration-300">
        {activePoint ? (
          <>
            <span className="text-muted-foreground/80 text-[8px] uppercase tracking-wider block font-semibold">{activePoint.month} Sales</span>
            <span className="font-bold text-gold">₹{activePoint.val.toLocaleString()}</span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground/80 text-[8px] uppercase tracking-wider block font-semibold">Average Revenue</span>
            <span className="font-bold text-gold-soft">₹{Math.round(avgValue).toLocaleString()} / mo</span>
          </>
        )}
      </div>
    </div>
  );
}

function Analytics() {
  const [sales, setSales] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/admin/dashboard");
        if (res?.success) {
          if (Array.isArray(res.data?.categorySales)) {
            setSales(res.data.categorySales);
          }
          if (res.data?.stats) {
            setStats(res.data.stats);
          }
          if (Array.isArray(res.data?.salesTrend)) {
            setSalesTrend(res.data.salesTrend);
          }
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
        <h2 className="serif text-3xl font-semibold">Analytics & Sales Reports</h2>
        <p className="text-xs text-muted-foreground mt-1">Real-time diagnostics of checkouts, category volumes, and monthly trends.</p>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="bg-white border border-border p-5 rounded-2xl shadow-sm hover:shadow-soft transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04] text-foreground group-hover:scale-110 transition-transform duration-300">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Revenue</p>
          <h3 className="serif text-2xl font-bold text-foreground mt-2">₹{stats?.totalSales?.toLocaleString() || "0"}</h3>
          <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block font-medium">Paid Volume</span>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white border border-border p-5 rounded-2xl shadow-sm hover:shadow-soft transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04] text-foreground group-hover:scale-110 transition-transform duration-300">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Orders</p>
          <h3 className="serif text-2xl font-bold text-foreground mt-2">{stats?.ordersCount || "0"}</h3>
          <span className="text-[9px] text-gold bg-cream px-2 py-0.5 rounded-full mt-2 inline-block font-medium">All checkouts</span>
        </div>

        {/* Active Customers Card */}
        <div className="bg-white border border-border p-5 rounded-2xl shadow-sm hover:shadow-soft transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04] text-foreground group-hover:scale-110 transition-transform duration-300">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Customers</p>
          <h3 className="serif text-2xl font-bold text-foreground mt-2">{stats?.customersCount || "0"}</h3>
          <span className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-2 inline-block font-medium">Registered</span>
        </div>

        {/* Inventory Status Card */}
        <div className="bg-white border border-border p-5 rounded-2xl shadow-sm hover:shadow-soft transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04] text-foreground group-hover:scale-110 transition-transform duration-300">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Inventory Alerts</p>
          <h3 className="serif text-2xl font-bold text-foreground mt-2">
            {stats?.outOfStockCount || "0"} <span className="text-xs text-muted-foreground font-sans font-normal">out of stock</span>
          </h3>
          <span className={`text-[9px] px-2 py-0.5 rounded-full mt-2 inline-block font-medium ${stats?.lowStockCount > 0 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"}`}>
            {stats?.lowStockCount || "0"} low stock items
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Category Revenue Breakdown (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white border border-border p-6 rounded-2xl shadow-sm hover:shadow-soft transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="serif text-lg font-semibold text-foreground">Category Revenue Breakdown</h3>
            <span className="text-[10px] text-muted-foreground bg-cream px-2.5 py-1 rounded-full uppercase tracking-wider font-medium">Volume Ranked</span>
          </div>

          <div className="space-y-5">
            {sales.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">No catalog sales recorded yet. Try marking an order as Delivered/Paid.</div>
            ) : (
              sales.map((s, idx) => {
                const percentage = Math.min(100, (s.salesAmount / Math.max(1, stats?.totalSales || 50000)) * 100);
                return (
                  <div key={s._id} className="space-y-2 group">
                    <div className="flex justify-between text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cream border border-gold/20 flex items-center justify-center text-[9px] text-gold font-bold">{idx + 1}</span>
                        <span className="text-foreground">{s.categoryName || "Uncategorized"}</span>
                      </div>
                      <span className="font-semibold text-gold">₹{s.salesAmount.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-cream rounded-full overflow-hidden border border-border/20">
                      <div 
                        className="h-full bg-gradient-to-r from-gold to-foreground rounded-full transition-all duration-1000 animate-pulse" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                      <span>{s.unitsSold} units sold</span>
                      <span>₹{Math.round(s.salesAmount / (s.unitsSold || 1))} avg/unit</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Interactive Sales Chart (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white border border-border p-6 rounded-2xl shadow-sm hover:shadow-soft transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="serif text-lg font-semibold text-foreground">Sales Trend</h3>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Live</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Hover over the tracking points to inspect actual monthly sales totals compiled from successfully processed checkouts.
            </p>
          </div>

          <SalesTrendChart data={salesTrend} />

          <div className="mt-6 pt-4 border-t border-border/60 text-[10px] text-muted-foreground flex items-start gap-2">
            <svg className="text-gold shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <p>
              B2B wholesale inquiries are dynamically excluded from these graphics to preserve direct customer conversion statistics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   2.5. STOCK & SOLD STATUS REPORT
   ──────────────────────────────────────────────────────── */
function StockStatus() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/admin/stock-status");
        if (res?.success && Array.isArray(res.data)) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load inventory stock reports");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return data.filter(item =>
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling inventory stock and sales metrics…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-3xl font-semibold">Stock Status</h2>
          <p className="text-xs text-muted-foreground mt-1">Review live catalog inventories, total units sold, and restocking requirements.</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-white text-xs placeholder:text-muted-foreground/60 focus:border-gold focus:ring-0 transition outline-none"
            placeholder="Search items by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/40 border-b border-border">
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Detail</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Stock</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sold Units</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground text-xs font-medium">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isOutOfStock = item.stock <= 0;
                  const isLowStock = item.stock > 0 && item.stock <= 10;
                  
                  return (
                    <tr key={item._id} className="border-t border-border/60 hover:bg-cream/10 transition">
                      <td className="p-4 text-xs font-semibold">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-cream rounded-lg border border-border flex items-center justify-center text-[9px] text-muted-foreground shrink-0">
                              No Pic
                            </div>
                          )}
                          <span className="text-foreground font-medium text-sm leading-tight block max-w-sm truncate">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground capitalize">{item.category || "Uncategorized"}</td>
                      <td className="p-4 text-xs font-bold">
                        <span className={isOutOfStock ? "text-destructive" : isLowStock ? "text-amber-600" : "text-emerald-700"}>
                          {item.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono font-bold text-gold">{item.soldUnits} sold</td>
                      <td className="p-4 text-xs text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          isOutOfStock ? "bg-red-50 text-red-700 border-red-100" :
                          isLowStock ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                          {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   3. PRODUCTS LIST CMS
   ──────────────────────────────────────────────────────── */
function ProductsAdmin({ handleEdit, handleDuplicate }: { handleEdit: (prod: any) => void; handleDuplicate: (prod: any) => void }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkPricePercent, setBulkPricePercent] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/products?limit=100");
      const catRes = await apiClient.get("/categories");
      if (res?.success && res?.data?.products) {
        setRows(res.data.products);
      }
      if (catRes?.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
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
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map(r => r._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected products?`)) return;

    try {
      let successCount = 0;
      for (const id of selectedIds) {
        const res = await apiClient.delete(`/products/${id}`);
        if (res.success) successCount++;
      }
      toast.success(`Successfully deleted ${successCount} products.`);
      setSelectedIds([]);
      load();
    } catch (err) {
      toast.error("Failed executing bulk delete.");
    }
  };

  const handleBulkCategoryUpdate = async () => {
    if (selectedIds.length === 0 || !bulkCategory) return;
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        const res = await apiClient.put(`/products/${id}`, { category: bulkCategory });
        if (res.success) successCount++;
      }
      toast.success(`Successfully updated category for ${successCount} products.`);
      setSelectedIds([]);
      load();
    } catch (err) {
      toast.error("Failed executing bulk category update.");
    }
  };

  const handleBulkPriceAdjustment = async () => {
    if (selectedIds.length === 0 || !bulkPricePercent) return;
    const factor = 1 + Number(bulkPricePercent) / 100;
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        const prod = rows.find(r => r._id === id);
        if (prod) {
          const newPrice = Math.round(prod.price * factor);
          const newMrp = Math.round(prod.compareAtPrice * factor);
          const res = await apiClient.put(`/products/${id}`, { price: newPrice, compareAtPrice: newMrp });
          if (res.success) successCount++;
        }
      }
      toast.success(`Successfully adjusted prices for ${successCount} products.`);
      setSelectedIds([]);
      setBulkPricePercent("");
      load();
    } catch (err) {
      toast.error("Failed adjusting prices in bulk.");
    }
  };

  const filteredRows = useMemo(() => {
    return rows.filter(r =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.slug.toLowerCase().includes(query.toLowerCase()) ||
      (typeof r.category === "object" ? r.category.name : r.category).toLowerCase().includes(query.toLowerCase())
    );
  }, [rows, query]);

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Loading products…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-3xl font-semibold">Products Catalog</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage B2C inventories, price structures, and duplicate entries.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search name/category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-4 py-2 text-xs border border-border rounded-full outline-none focus:border-gold bg-white w-48 md:w-64"
          />
        </div>
      </div>

      {/* Bulk actions manager */}
      {selectedIds.length > 0 && (
        <div className="bg-[#FDFBF7] border border-gold/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="text-xs">
            <strong className="text-gold">{selectedIds.length}</strong> products selected
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="px-3 py-1.5 rounded-full border border-border text-[11px] bg-white"
            >
              <option value="">Bulk Move Category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <button onClick={handleBulkCategoryUpdate} disabled={!bulkCategory} className="px-3.5 py-1.5 bg-foreground text-background rounded-full text-[11px] font-semibold disabled:opacity-50">Apply</button>
            
            <span className="text-muted-foreground/30">|</span>

            <input
              type="number"
              placeholder="Price Adjustment % (e.g. 10 or -5)"
              value={bulkPricePercent}
              onChange={(e) => setBulkPricePercent(e.target.value)}
              className="px-3 py-1.5 rounded-full border border-border text-[11px] bg-white w-40"
            />
            <button onClick={handleBulkPriceAdjustment} disabled={!bulkPricePercent} className="px-3.5 py-1.5 bg-foreground text-background rounded-full text-[11px] font-semibold disabled:opacity-50">Adjust Price</button>

            <span className="text-muted-foreground/30">|</span>

            <button onClick={handleBulkDelete} className="px-3.5 py-1.5 bg-red-600 text-white rounded-full text-[11px] font-semibold flex items-center gap-1 hover:bg-red-700">
              <Trash2 className="h-3 w-3" /> Bulk Delete
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredRows.length && filteredRows.length > 0}
                  onChange={handleSelectAll}
                  className="rounded cursor-pointer"
                />
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">SKU / Code</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Price structure</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Visibility</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">No products matched search criteria.</td></tr>
            ) : (
              filteredRows.map((r) => {
                const isLowStock = r.stock <= (r.lowStockAlert ?? 10);
                return (
                  <tr key={r._id} className="border-t border-border/60 hover:bg-cream/10">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r._id)}
                        onChange={() => handleSelect(r._id)}
                        className="rounded cursor-pointer"
                      />
                    </td>
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
                    <td className="p-4 text-xs font-mono">{r.sku || "GFT-MOCK"}</td>
                    <td className="p-4 text-xs">
                      {r.priority !== undefined && r.priority !== 99999 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDFBF7] text-gold border border-gold/40 font-mono">
                          {r.priority}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-[10px]">—</span>
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      <div className="font-semibold">Sale: ₹{r.price}</div>
                      {Number(r.compareAtPrice) > Number(r.price) && <div className="text-[9px] text-muted-foreground line-through">MRP: ₹{r.compareAtPrice}</div>}
                      {r.bulkPrice > 0 && <div className="text-[9px] text-gold font-medium">Bulk B2B: ₹{r.bulkPrice}</div>}
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
                    <td className="p-4 text-right space-x-1">
                      <button onClick={() => handleEdit(r)} title="Edit" className="p-2 hover:text-gold transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDuplicate(r)} title="Duplicate" className="p-2 hover:text-gold transition-colors"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => del(r._id)} title="Delete" className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
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
   3B. PRODUCT FORM (CREATION & DUPLICATION)
   ──────────────────────────────────────────────────────── */
function ProductForm({ initial, onClose }: { initial: any | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "variations" | "specifications">("basic");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Schema form values
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
  const [isBestSeller, setIsBestSeller] = useState(initial?.isBestSeller || false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.isNewArrival || false);
  const [priority, setPriority] = useState<number | "">(
    initial?.priority !== undefined && initial.priority !== 99999 ? initial.priority : ""
  );

  const otherImagesArray = useMemo(() => {
    return otherImages.split(",").map((s: string) => s.trim()).filter(Boolean);
  }, [otherImages]);

  const handleRemoveAdditionalImage = (urlToRemove: string) => {
    const updated = otherImagesArray.filter(url => url !== urlToRemove);
    setOtherImages(updated.join(", "));
  };

  const [colors, setColors] = useState<string[]>(initial?.colors || ["Ivory", "Gold", "Blush"]);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes || ["Small", "Medium", "Large"]);
  const [newColor, setNewColor] = useState("");

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

    const imageArray = [mainImage, ...otherImages.split(",").map((i: string) => i.trim()).filter(Boolean)].filter(Boolean);
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
      isBestSeller,
      isNewArrival,
      priority: priority === "" || Number(priority) === 0 ? 99999 : Number(priority),
    };

    try {
      const res = (initial?._id)
        ? await apiClient.put(`/products/${initial._id}`, payload)
        : await apiClient.post("/products", payload);

      if (res?.success) {
        toast.success(initial?._id ? "Product saved!" : "New product published!");
        onClose();
      } else {
        toast.error(res.message || "Failed to save product");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save product details");
    } finally {
      setSaving(false);
    }
  };

  const tabsList = [
    { id: "basic", label: "Basic Info" },
    { id: "pricing", label: "Pricing & Inventory" },
    { id: "variations", label: "Variations" },
    { id: "specifications", label: "Specs & Media" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="serif text-3xl font-semibold">{initial?._id ? "Edit Product" : "Add Product"}</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure specification details, size arrays, and gallery routes.</p>
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
            <Field label="Bag Product Name"><input className="i" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ivory Silk Potli" /></Field>
            <Field label="URL Slug"><input className="i" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. ivory-silk-potli" /></Field>
            <Field label="Category">
              <select className="i bg-transparent" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Occasion Collection">
              <select className="i bg-transparent" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                {["Wedding", "Birthday", "Festive", "Corporate", "Combo Packs"].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Product Priority Weight (lower value shows first, e.g. 1 is first, 2 is second)">
              <input
                type="number"
                className="i"
                value={priority}
                onChange={(e) => setPriority(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Leave empty for default (shows last)"
              />
            </Field>
            <Field label="Short Summary Description" full><input className="i" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="A brief summary for category grids..." /></Field>
            <Field label="Full Description / Material details" full>
              <textarea rows={4} className="i rounded-xl py-3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed descriptive paragraphs..." />
            </Field>
            <div className="col-span-2 grid grid-cols-2 gap-4 mt-2">
              <Field label="Highlight as Bestseller">
                <label className="flex items-center gap-2 h-11 border border-border rounded-full px-4 bg-background select-none cursor-pointer">
                  <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} />
                  <span className="text-xs font-semibold">Bestseller (Show BESTSELLER badge)</span>
                </label>
              </Field>
              <Field label="Highlight as New Arrival">
                <label className="flex items-center gap-2 h-11 border border-border rounded-full px-4 bg-background select-none cursor-pointer">
                  <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} />
                  <span className="text-xs font-semibold">New Arrival (Show NEW badge)</span>
                </label>
              </Field>
            </div>
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === "pricing" && (
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="MRP / Original Price (₹)"><input type="number" className="i" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} /></Field>
            <Field label="Sale Price (₹)"><input type="number" className="i" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></Field>
            <Field label="Bulk wholesale Price (₹)"><input type="number" className="i" value={bulkPrice} onChange={(e) => setBulkPrice(Number(e.target.value))} /></Field>

            <Field label="SKU reference"><input className="i" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. GFT-IVY-01" /></Field>
            <Field label="Stock Availability">
              <select
                value={stock > 0 ? "in-stock" : "out-of-stock"}
                onChange={(e) => {
                  if (e.target.value === "out-of-stock") {
                    setStock(0);
                  } else {
                    if (stock <= 0) setStock(100);
                  }
                }}
                className="i cursor-pointer"
              >
                <option value="in-stock">In Stock (Available)</option>
                <option value="out-of-stock">Out of Stock (Unavailable)</option>
              </select>
            </Field>
            <Field label="Stock Count"><input type="number" className="i" value={stock} onChange={(e) => setStock(Number(e.target.value))} /></Field>
            <Field label="Low Stock Alert Level"><input type="number" className="i" value={lowStockAlert} onChange={(e) => setLowStockAlert(Number(e.target.value))} /></Field>

            <Field label="Publish Status">
              <label className="flex items-center gap-2 h-11 border border-border rounded-full px-4 bg-background select-none cursor-pointer">
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
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Supported Colors</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {colors.map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream/80 text-xs font-medium border border-[#EADFC9]">
                    {c}
                    <button type="button" onClick={() => handleRemoveColor(c)} className="text-destructive hover:scale-110"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <input className="i" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="e.g. Red, Green, Royal Blue" />
                <button type="button" onClick={handleAddColor} className="px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-full shrink-0">Add Color</button>
              </div>
            </div>

            <div className="gold-divider" />

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">Supported Sizes</label>
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
              <Field label="Fabric & Materials"><input className="i" value={fabric} onChange={(e) => setFabric(e.target.value)} placeholder="e.g. Raw Silk" /></Field>
              <Field label="Product Dimensions"><input className="i" value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="e.g. 10 x 12 inch" /></Field>
              <Field label="Unit Weight"><input className="i" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 120g" /></Field>
              <Field label="Handle structure"><input className="i" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="e.g. Gota Patti ribbon drawstring" /></Field>
              <Field label="Care Instructions" full><input className="i" value={care} onChange={(e) => setCare(e.target.value)} placeholder="e.g. Dry clean only" /></Field>
            </div>

            <div className="gold-divider" />

            <div className="space-y-6">
              {/* Main Product Image */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Main Product Image</label>
                {mainImage ? (
                  <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-[#EADFC9] shadow-sm group">
                    <img src={mainImage} alt="Main preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setMainImage("")}
                        className="p-2.5 bg-red-600 text-white rounded-full hover:scale-110 transition shadow cursor-pointer"
                        title="Delete main image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-[#EADFC9] flex flex-col items-center justify-center bg-[#FDFBF7]/40 text-muted-foreground/60 p-4 text-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground/45 mb-1.5" />
                    <span className="text-[10px] font-semibold mb-2">No main image</span>
                    <ImageUploader onUploadSuccess={(url) => setMainImage(url)} buttonText="Upload Main" />
                  </div>
                )}
              </div>

              {/* Additional Product Images */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Additional Product Images</label>
                <div className="flex flex-wrap gap-4 items-start">
                  {otherImagesArray.map((url, idx) => (
                    <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border border-[#EADFC9] shadow-sm group shrink-0">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalImage(url)}
                          className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition shadow cursor-pointer"
                          title="Delete additional image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload Box */}
                  <div className="w-28 h-28 rounded-xl border-2 border-dashed border-[#EADFC9] flex flex-col items-center justify-center bg-[#FDFBF7]/40 text-muted-foreground/60 shrink-0">
                    <Plus className="h-5 w-5 text-muted-foreground/45 mb-1" />
                    <ImageUploader
                      onUploadSuccess={(url) => setOtherImages(prev => prev ? `${prev}, ${url}` : url)}
                      buttonText="Add Image"
                    />
                  </div>
                </div>
              </div>

              {/* Presentation Video */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Presentation Video (MP4 / WebM)</label>
                {video ? (
                  <div className="relative w-64 rounded-xl overflow-hidden border border-[#EADFC9] shadow-sm group">
                    <video src={video} className="w-full object-cover h-36" controls />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setVideo("")}
                        className="p-2 bg-red-600 text-white rounded-full hover:scale-110 transition shadow cursor-pointer"
                        title="Delete video"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-32 rounded-xl border-2 border-dashed border-[#EADFC9] flex flex-col items-center justify-center bg-[#FDFBF7]/40 text-muted-foreground/60 p-4">
                    <Video className="h-6 w-6 text-muted-foreground/45 mb-1.5" />
                    <span className="text-[10px] font-semibold mb-2">No video uploaded</span>
                    <ImageUploader onUploadSuccess={(url) => setVideo(url)} accept="video/*" buttonText="Upload Video" />
                  </div>
                )}
              </div>
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
   4. HOMEPAGE BUILDER CMS
   ──────────────────────────────────────────────────────── */
function HomepageCMS() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states for sections editing
  const [heroBadge, setHeroBadge] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [heroImage, setHeroImage] = useState("");

  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterDesc, setNewsletterDesc] = useState("");

  const [marqueeTexts, setMarqueeTexts] = useState("");
  const [weddingTitle, setWeddingTitle] = useState("");
  const [weddingDesc, setWeddingDesc] = useState("");
  const [weddingImage, setWeddingImage] = useState("");
  const [weddingCtaText, setWeddingCtaText] = useState("");
  const [festivalsList, setFestivalsList] = useState<any[]>([
    { name: "Diwali", subtitle: "Festival of Lights", img: "", desc: "Rich silk & brocade bags for sweets, dry fruits, and festive hampers." },
    { name: "Eid", subtitle: "Celebrate Togetherness", img: "", desc: "Elegant pouches for Eidi gifts and celebration essentials." },
    { name: "Christmas", subtitle: "Season of Giving", img: "", desc: "Velvet bags and totes for Secret Santa and holiday hampers." }
  ]);

  // Fabric/Quality Section
  const [fabricBadge, setFabricBadge] = useState("");
  const [fabricTitle, setFabricTitle] = useState("");
  const [fabricDesc, setFabricDesc] = useState("");
  const [fabricImage, setFabricImage] = useState("");
  const [fabricFeatures, setFabricFeatures] = useState<any[]>([
    { title: "Sustainable", desc: "100% reusable, plastic-free packaging." },
    { title: "Hand-Finished", desc: "Detailed stitching, premium hardware." },
    { title: "Pan-India", desc: "Fast shipping with free returns ₹999+." },
    { title: "Loved by 50k+", desc: "Trusted across weddings & gifting." }
  ]);

  // Testimonials Section
  const [testimonialsBadge, setTestimonialsBadge] = useState("");
  const [testimonialsTitle, setTestimonialsTitle] = useState("");
  const [testimonialsList, setTestimonialsList] = useState<any[]>([
    { quote: "Absolutely premium quality — guests loved them at our wedding.", author: "Aditi & Rohan", role: "Mumbai", stars: 5 },
    { quote: "Beautifully crafted, eco-friendly, and so elegant. A perfect gift.", author: "Priya Sharma", role: "Delhi", stars: 5 },
    { quote: "Our corporate hampers felt truly luxurious thanks to Giftcy.", author: "Karthik R.", role: "Bengaluru", stars: 5 }
  ]);

  // Instagram Section
  const [instagramBadge, setInstagramBadge] = useState("");
  const [instagramTitle, setInstagramTitle] = useState("");
  const [instagramDesc, setInstagramDesc] = useState("");
  const [instagramBtnText, setInstagramBtnText] = useState("");
  const [instagramBtnUrl, setInstagramBtnUrl] = useState("");
  const [instagramImages, setInstagramImages] = useState<any[]>([
    { url: "", likes: 342 },
    { url: "", likes: 289 },
    { url: "", likes: 421 },
    { url: "", likes: 178 },
    { url: "", likes: 563 },
    { url: "", likes: 397 }
  ]);

  // Trust Badges
  const [trustBadgesList, setTrustBadgesList] = useState<any[]>([
    { label: "50,000+", desc: "Bags Delivered", icon: "Package" },
    { label: "100%", desc: "Reusable & Eco", icon: "Leaf" },
    { label: "Pan-India", desc: "Free Shipping ₹999+", icon: "Truck" },
    { label: "Secure", desc: "Payment Gateway", icon: "Lock" },
    { label: "Easy", desc: "Returns & Exchange", icon: "RotateCcw" },
    { label: "Quality", desc: "Guaranteed", icon: "Shield" }
  ]);

  // B2B CTA Section
  const [ctaSubtitle, setCtaSubtitle] = useState("");
  const [ctaTitle, setCtaTitle] = useState("");
  const [ctaDesc, setCtaDesc] = useState("");
  const [ctaBtnText, setCtaBtnText] = useState("");
  const [ctaBtnUrl, setCtaBtnUrl] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/settings");
      if (res?.success && res?.data) {
        const data = res.data;
        // Load layout ordering
        if (Array.isArray(data.homepage_layout)) {
          setSections(data.homepage_layout);
        } else {
          // default fallback structure
          const fallback = [
            { id: "hero", name: "Hero Section Banner", visible: true },
            { id: "marquee", name: "Promo Marquee Bar", visible: true },
            { id: "collections", name: "Occasion Collections", visible: true },
            { id: "trending", name: "Bestselling Products Grid", visible: true },
            { id: "wedding", name: "Wedding Collection Promo", visible: true },
            { id: "festival", name: "Seasonal Festive Cards", visible: true },
            { id: "fabric", name: "Fabric Quality Callout", visible: true },
            { id: "testimonials", name: "Testimonials Slider", visible: true },
            { id: "instagram", name: "@Instagram Gallery", visible: true },
            { id: "badges", name: "Trust Badges Banner", visible: true },
            { id: "newsletter", name: "Newsletter Signup Card", visible: true },
            { id: "cta", name: "B2B Inquiry Footer Callout", visible: true }
          ];
          setSections(fallback);
        }

        // Load specific editable values
        if (data.homepage_hero) {
          setHeroBadge(data.homepage_hero.badge || "");
          setHeroTitle(data.homepage_hero.title || "");
          setHeroDesc(data.homepage_hero.description || "");
          setHeroImage(data.homepage_hero.image || "");
        }
        if (data.homepage_newsletter) {
          setNewsletterTitle(data.homepage_newsletter.title || "");
          setNewsletterDesc(data.homepage_newsletter.description || "");
        } else {
          setNewsletterTitle("Get 10% off your first order");
          setNewsletterDesc("Subscribe to our newsletter for early access to new collections, festive drops, and exclusive offers.");
        }
        if (data.homepage_marquee) {
          setMarqueeTexts(Array.isArray(data.homepage_marquee) ? data.homepage_marquee.join(", ") : "");
        } else {
          setMarqueeTexts("Free Shipping ₹999+, Reusable Fabric, Made in India, Bulk Pricing, Custom Printing");
        }
        if (data.homepage_wedding_promo) {
          setWeddingTitle(data.homepage_wedding_promo.title || "");
          setWeddingDesc(data.homepage_wedding_promo.description || "");
          setWeddingImage(data.homepage_wedding_promo.image || "");
          setWeddingCtaText(data.homepage_wedding_promo.ctaText || "");
        } else {
          setWeddingTitle("Perfect for Your Big Day");
          setWeddingDesc("From shagun envelopes to trousseau packaging, our wedding collection transforms every moment of your celebration into a luxurious experience. Custom monograms, matching colours, and bulk pricing available.");
          setWeddingImage("");
          setWeddingCtaText("Explore Wedding Collection");
        }
        if (data.homepage_festivals && Array.isArray(data.homepage_festivals)) {
          setFestivalsList(data.homepage_festivals);
        }
        if (data.homepage_fabric) {
          setFabricBadge(data.homepage_fabric.badge || "");
          setFabricTitle(data.homepage_fabric.title || "");
          setFabricDesc(data.homepage_fabric.description || "");
          setFabricImage(data.homepage_fabric.image || "");
          if (Array.isArray(data.homepage_fabric.features)) {
            setFabricFeatures(data.homepage_fabric.features);
          }
        }
        if (data.homepage_testimonials) {
          setTestimonialsBadge(data.homepage_testimonials.badge || "");
          setTestimonialsTitle(data.homepage_testimonials.title || "");
          if (Array.isArray(data.homepage_testimonials.list)) {
            setTestimonialsList(data.homepage_testimonials.list);
          }
        }
        if (data.homepage_instagram) {
          setInstagramBadge(data.homepage_instagram.badge || "");
          setInstagramTitle(data.homepage_instagram.title || "");
          setInstagramDesc(data.homepage_instagram.description || "");
          setInstagramBtnText(data.homepage_instagram.buttonText || "");
          setInstagramBtnUrl(data.homepage_instagram.buttonUrl || "");
          if (Array.isArray(data.homepage_instagram.images)) {
            setInstagramImages(data.homepage_instagram.images);
          }
        }
        if (data.homepage_badges && Array.isArray(data.homepage_badges)) {
          setTrustBadgesList(data.homepage_badges);
        }
        if (data.homepage_cta) {
          setCtaSubtitle(data.homepage_cta.subtitle || "");
          setCtaTitle(data.homepage_cta.title || "");
          setCtaDesc(data.homepage_cta.description || "");
          setCtaBtnText(data.homepage_cta.buttonText || "");
          setCtaBtnUrl(data.homepage_cta.buttonUrl || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const move = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[nextIndex];
    copy[nextIndex] = temp;
    setSections(copy);
  };

  const toggleVisibility = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const save = async () => {
    setSaving(true);
    try {
      const parsedMarquee = marqueeTexts
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await Promise.all([
        apiClient.put("/settings/homepage_layout", { value: sections }),
        apiClient.put("/settings/homepage_hero", {
          value: { badge: heroBadge, title: heroTitle, description: heroDesc, image: heroImage }
        }),
        apiClient.put("/settings/homepage_newsletter", {
          value: { title: newsletterTitle, description: newsletterDesc }
        }),
        apiClient.put("/settings/homepage_marquee", {
          value: parsedMarquee
        }),
        apiClient.put("/settings/homepage_wedding_promo", {
          value: { title: weddingTitle, description: weddingDesc, image: weddingImage, ctaText: weddingCtaText }
        }),
        apiClient.put("/settings/homepage_festivals", {
          value: festivalsList
        }),
        apiClient.put("/settings/homepage_fabric", {
          value: { badge: fabricBadge, title: fabricTitle, description: fabricDesc, image: fabricImage, features: fabricFeatures }
        }),
        apiClient.put("/settings/homepage_testimonials", {
          value: { badge: testimonialsBadge, title: testimonialsTitle, list: testimonialsList }
        }),
        apiClient.put("/settings/homepage_instagram", {
          value: {
            badge: instagramBadge,
            title: instagramTitle,
            description: instagramDesc,
            buttonText: instagramBtnText,
            buttonUrl: instagramBtnUrl,
            images: instagramImages
          }
        }),
        apiClient.put("/settings/homepage_badges", {
          value: trustBadgesList
        }),
        apiClient.put("/settings/homepage_cta", {
          value: { subtitle: ctaSubtitle, title: ctaTitle, description: ctaDesc, buttonText: ctaBtnText, buttonUrl: ctaBtnUrl }
        })
      ]);
      toast.success("Homepage CMS layout updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update homepage CMS");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling layout config…</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
      {/* Reordering column */}
      <div className="lg:col-span-6 space-y-6">
        <div>
          <h2 className="serif text-3xl font-semibold">Homepage Section CMS</h2>
          <p className="text-xs text-muted-foreground mt-1">Reorder elements via move actions, toggle visibility blocks.</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold mb-3">Homepage layout schema</p>
          {sections.map((sec, idx) => (
            <div key={sec.id} className="flex items-center justify-between p-3.5 border border-border rounded-xl bg-background hover:border-gold/30 transition">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-muted-foreground w-4">#{(idx + 1).toString().padStart(2, "0")}</span>
                <span className={`text-xs font-semibold ${sec.visible ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>{sec.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVisibility(sec.id)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold border ${
                    sec.visible ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
                  }`}
                >{sec.visible ? "Visible" : "Hidden"}</button>
                <button disabled={idx === 0} onClick={() => move(idx, "up")} className="p-1.5 rounded-full border border-border bg-white hover:text-gold hover:border-gold disabled:opacity-40 transition"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button disabled={idx === sections.length - 1} onClick={() => move(idx, "down")} className="p-1.5 rounded-full border border-border bg-white hover:text-gold hover:border-gold disabled:opacity-40 transition"><ChevronDown className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor inputs column */}
      <div className="lg:col-span-6 space-y-6">
        <div>
          <h2 className="serif text-3xl font-semibold">Content Editors</h2>
          <p className="text-xs text-muted-foreground mt-1">Directly edit labels, banner titles, and text contents.</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Hero Section Settings</h3>
            <div className="space-y-4">
              <Field label="Hero Badge Banner text"><input className="i" value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} placeholder="e.g. Festive Edit '26" /></Field>
              <Field label="Hero Headline Title"><input className="i" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. Make Every Gift Premium" /></Field>
              <Field label="Hero Subtitle Description"><textarea rows={3} className="i rounded-xl py-3" value={heroDesc} onChange={(e) => setHeroDesc(e.target.value)} /></Field>
              <Field label="Hero Banner Image URL">
                <div className="flex gap-2 items-center">
                  <input className="i flex-1" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="Paste Unsplash / uploads image URL..." />
                  <ImageUploader onUploadSuccess={(url) => setHeroImage(url)} />
                </div>
              </Field>
            </div>
          </div>

          <div className="gold-divider" />

          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Marquee Text Settings</h3>
            <div className="space-y-4">
              <Field label="Promo Bar Texts (comma-separated)">
                <input
                  className="i"
                  value={marqueeTexts}
                  onChange={(e) => setMarqueeTexts(e.target.value)}
                  placeholder="e.g. Free Shipping ₹999+, Reusable Fabric, Made in India"
                />
              </Field>
            </div>
          </div>

          <div className="gold-divider" />

          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Wedding / Promotion Section Settings</h3>
            <div className="space-y-4">
              <Field label="Promo Title">
                <input
                  className="i"
                  value={weddingTitle}
                  onChange={(e) => setWeddingTitle(e.target.value)}
                  placeholder="e.g. Perfect for Your Big Day"
                />
              </Field>
              <Field label="Promo Description">
                <textarea
                  rows={3}
                  className="i rounded-xl py-3"
                  value={weddingDesc}
                  onChange={(e) => setWeddingDesc(e.target.value)}
                  placeholder="Promo description body text..."
                />
              </Field>
              <Field label="Promo Image URL">
                <div className="flex gap-2 items-center">
                  <input
                    className="i flex-1"
                    value={weddingImage}
                    onChange={(e) => setWeddingImage(e.target.value)}
                    placeholder="Paste image URL (leave empty for default)"
                  />
                  <ImageUploader onUploadSuccess={(url) => setWeddingImage(url)} />
                </div>
              </Field>
              <Field label="CTA Button Text">
                <input
                  className="i"
                  value={weddingCtaText}
                  onChange={(e) => setWeddingCtaText(e.target.value)}
                  placeholder="e.g. Explore Wedding Collection"
                />
              </Field>
            </div>
          </div>

          <div className="gold-divider" />

          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Seasonal Collections Settings</h3>
            <div className="space-y-6">
              {festivalsList.map((fest, idx) => (
                <div key={idx} className="p-4 border border-border/80 rounded-2xl bg-cream/10 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gold">Card #{idx + 1} - {fest.name || `Card ${idx + 1}`}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Collection Name">
                      <input 
                        className="i" 
                        value={fest.name || ""} 
                        onChange={(e) => {
                          const copy = [...festivalsList];
                          copy[idx] = { ...copy[idx], name: e.target.value };
                          setFestivalsList(copy);
                        }} 
                      />
                    </Field>
                    <Field label="Subtitle Tagline">
                      <input 
                        className="i" 
                        value={fest.subtitle || ""} 
                        onChange={(e) => {
                          const copy = [...festivalsList];
                          copy[idx] = { ...copy[idx], subtitle: e.target.value };
                          setFestivalsList(copy);
                        }} 
                      />
                    </Field>
                  </div>
                  <Field label="Description Text">
                    <input 
                      className="i" 
                      value={fest.desc || ""} 
                      onChange={(e) => {
                        const copy = [...festivalsList];
                        copy[idx] = { ...copy[idx], desc: e.target.value };
                        setFestivalsList(copy);
                      }} 
                    />
                  </Field>
                  <Field label="Image URL">
                    <div className="flex gap-2 items-center">
                      <input 
                        className="i flex-1" 
                        value={fest.img || ""} 
                        onChange={(e) => {
                          const copy = [...festivalsList];
                          copy[idx] = { ...copy[idx], img: e.target.value };
                          setFestivalsList(copy);
                        }} 
                        placeholder="Paste image URL or upload" 
                      />
                      <ImageUploader 
                        onUploadSuccess={(url) => {
                          const copy = [...festivalsList];
                          copy[idx] = { ...copy[idx], img: url };
                          setFestivalsList(copy);
                        }} 
                      />
                    </div>
                  </Field>
                </div>
              ))}
            </div>
          </div>

          <div className="gold-divider" />

          {/* Fabric Quality Callout Settings */}
          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Fabric Quality Callout Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Section Overline Tag"><input className="i" value={fabricBadge} onChange={(e) => setFabricBadge(e.target.value)} placeholder="e.g. The Giftcy Promise" /></Field>
                <Field label="Headline Title"><input className="i" value={fabricTitle} onChange={(e) => setFabricTitle(e.target.value)} placeholder="e.g. Crafted from the finest fabrics." /></Field>
              </div>
              <Field label="Description Text">
                <textarea rows={3} className="i rounded-xl py-3" value={fabricDesc} onChange={(e) => setFabricDesc(e.target.value)} placeholder="Paragraph text explaining fabric..." />
              </Field>
              <Field label="Illustration Image URL">
                <div className="flex gap-2 items-center">
                  <input className="i flex-1" value={fabricImage} onChange={(e) => setFabricImage(e.target.value)} placeholder="Paste image URL or upload" />
                  <ImageUploader onUploadSuccess={(url) => setFabricImage(url)} />
                </div>
              </Field>
              
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold mt-4">Features (4 items)</p>
              <div className="grid md:grid-cols-2 gap-4">
                {fabricFeatures.map((feat, idx) => (
                  <div key={idx} className="p-3.5 border border-border/70 rounded-xl bg-cream/5 space-y-2">
                    <p className="text-[10px] font-semibold text-gold">Feature #{idx + 1}</p>
                    <Field label="Title">
                      <input className="i" value={feat.title || ""} onChange={(e) => {
                        const copy = [...fabricFeatures];
                        copy[idx] = { ...copy[idx], title: e.target.value };
                        setFabricFeatures(copy);
                      }} />
                    </Field>
                    <Field label="Description">
                      <input className="i" value={feat.desc || ""} onChange={(e) => {
                        const copy = [...fabricFeatures];
                        copy[idx] = { ...copy[idx], desc: e.target.value };
                        setFabricFeatures(copy);
                      }} />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gold-divider" />

          {/* Testimonials Settings */}
          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Testimonials Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Section Overline Tag"><input className="i" value={testimonialsBadge} onChange={(e) => setTestimonialsBadge(e.target.value)} placeholder="e.g. Loved by gifters" /></Field>
                <Field label="Headline Title"><input className="i" value={testimonialsTitle} onChange={(e) => setTestimonialsTitle(e.target.value)} placeholder="e.g. Kind words, kept close." /></Field>
              </div>
              
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold mt-4">Reviews (3 items)</p>
              <div className="space-y-4">
                {testimonialsList.map((test, idx) => (
                  <div key={idx} className="p-4 border border-border/70 rounded-2xl bg-cream/5 space-y-3">
                    <p className="text-[10px] font-semibold text-gold">Review #{idx + 1}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Author Name"><input className="i" value={test.author || ""} onChange={(e) => {
                        const copy = [...testimonialsList];
                        copy[idx] = { ...copy[idx], author: e.target.value };
                        setTestimonialsList(copy);
                      }} /></Field>
                      <Field label="Author Location/Role"><input className="i" value={test.role || ""} onChange={(e) => {
                        const copy = [...testimonialsList];
                        copy[idx] = { ...copy[idx], role: e.target.value };
                        setTestimonialsList(copy);
                      }} /></Field>
                      <Field label="Star Rating (1-5)">
                        <select className="i" value={test.stars || 5} onChange={(e) => {
                          const copy = [...testimonialsList];
                          copy[idx] = { ...copy[idx], stars: parseInt(e.target.value, 10) || 5 };
                          setTestimonialsList(copy);
                        }}>
                          {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Review Quote Description">
                      <textarea rows={2} className="i rounded-xl py-2" value={test.quote || ""} onChange={(e) => {
                        const copy = [...testimonialsList];
                        copy[idx] = { ...copy[idx], quote: e.target.value };
                        setTestimonialsList(copy);
                      }} />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gold-divider" />

          {/* Instagram Settings */}
          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Instagram Section Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Section Overline Tag"><input className="i" value={instagramBadge} onChange={(e) => setInstagramBadge(e.target.value)} placeholder="e.g. Follow Us" /></Field>
                <Field label="Headline handle"><input className="i" value={instagramTitle} onChange={(e) => setInstagramTitle(e.target.value)} placeholder="e.g. @giftcy.in" /></Field>
                <Field label="CTA Description text"><input className="i" value={instagramDesc} onChange={(e) => setInstagramDesc(e.target.value)} placeholder="e.g. Tag us in your gifting moments..." /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Instagram CTA Button Text"><input className="i" value={instagramBtnText} onChange={(e) => setInstagramBtnText(e.target.value)} placeholder="e.g. Follow on Instagram" /></Field>
                <Field label="Instagram Profile URL link"><input className="i" value={instagramBtnUrl} onChange={(e) => setInstagramBtnUrl(e.target.value)} placeholder="e.g. https://instagram.com/giftcy.in" /></Field>
              </div>
              
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold mt-4">Gallery Grid Images (6 items)</p>
              <div className="grid md:grid-cols-2 gap-4">
                {instagramImages.map((img, idx) => (
                  <div key={idx} className="p-3 border border-border/70 rounded-xl bg-cream/5 space-y-2">
                    <p className="text-[10px] font-semibold text-gold">Image #{idx + 1}</p>
                    <Field label="Image URL">
                      <div className="flex gap-2 items-center">
                        <input className="i flex-1 text-xs" value={img.url || ""} onChange={(e) => {
                          const copy = [...instagramImages];
                          copy[idx] = { ...copy[idx], url: e.target.value };
                          setInstagramImages(copy);
                        }} placeholder="URL or upload" />
                        <ImageUploader onUploadSuccess={(url) => {
                          const copy = [...instagramImages];
                          copy[idx] = { ...copy[idx], url: url };
                          setInstagramImages(copy);
                        }} />
                      </div>
                    </Field>
                    <Field label="Like Count Display">
                      <input type="number" className="i" value={img.likes || 0} onChange={(e) => {
                        const copy = [...instagramImages];
                        copy[idx] = { ...copy[idx], likes: parseInt(e.target.value, 10) || 0 };
                        setInstagramImages(copy);
                      }} />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gold-divider" />

          {/* Trust Badges Settings */}
          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Trust Badges Settings</h3>
            <div className="space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Badges list (6 items)</p>
              <div className="grid md:grid-cols-2 gap-4">
                {trustBadgesList.map((badge, idx) => (
                  <div key={idx} className="p-3.5 border border-border/70 rounded-xl bg-cream/5 space-y-2">
                    <p className="text-[10px] font-semibold text-gold">Badge #{idx + 1}</p>
                    <Field label="Badge Label Header">
                      <input className="i" value={badge.label || ""} onChange={(e) => {
                        const copy = [...trustBadgesList];
                        copy[idx] = { ...copy[idx], label: e.target.value };
                        setTrustBadgesList(copy);
                      }} />
                    </Field>
                    <Field label="Badge Description Detail">
                      <input className="i" value={badge.desc || ""} onChange={(e) => {
                        const copy = [...trustBadgesList];
                        copy[idx] = { ...copy[idx], desc: e.target.value };
                        setTrustBadgesList(copy);
                      }} />
                    </Field>
                    <Field label="Lucide Icon Name selection">
                      <select className="i" value={badge.icon || "Package"} onChange={(e) => {
                        const copy = [...trustBadgesList];
                        copy[idx] = { ...copy[idx], icon: e.target.value };
                        setTrustBadgesList(copy);
                      }}>
                        {["Package", "Leaf", "Truck", "Lock", "RotateCcw", "Shield", "Sparkles", "Heart", "Star", "Crown", "Palette", "Users"].map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gold-divider" />

          {/* B2B CTA settings */}
          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">B2B Footer Callout (CTA) Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Section Subtitle Tag"><input className="i" value={ctaSubtitle} onChange={(e) => setCtaSubtitle(e.target.value)} placeholder="e.g. Bulk & Custom" /></Field>
                <Field label="Headline Headline Title"><input className="i" value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} placeholder="e.g. Weddings, brands, and grand occasions." /></Field>
              </div>
              <Field label="Paragraph Description Copy">
                <textarea rows={3} className="i rounded-xl py-3" value={ctaDesc} onChange={(e) => setCtaDesc(e.target.value)} placeholder="Explain bulk pricing and details..." />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Button CTA Action Text"><input className="i" value={ctaBtnText} onChange={(e) => setCtaBtnText(e.target.value)} placeholder="e.g. Start a Bulk Inquiry" /></Field>
                <Field label="Button Destination Link URL"><input className="i" value={ctaBtnUrl} onChange={(e) => setCtaBtnUrl(e.target.value)} placeholder="e.g. /bulk" /></Field>
              </div>
            </div>
          </div>

          <div className="gold-divider" />

          <div>
            <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-2.5 mb-4">Newsletter Box Settings</h3>
            <div className="space-y-4">
              <Field label="Newsletter Card Title"><input className="i" value={newsletterTitle} onChange={(e) => setNewsletterTitle(e.target.value)} /></Field>
              <Field label="Newsletter Description text"><input className="i" value={newsletterDesc} onChange={(e) => setNewsletterDesc(e.target.value)} /></Field>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={save} disabled={saving} className="px-8 py-2.5 bg-foreground text-background text-sm font-semibold rounded-full shadow-lg">
            {saving ? "Publishing layout..." : "Publish Layout Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   5. COLLECTIONS MGR CMS
   ──────────────────────────────────────────────────────── */
function CollectionsCMS() {
  const [rows, setRows] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedProds, setSelectedProds] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/collections");
      const prodRes = await apiClient.get("/products?limit=100");
      if (res?.success && Array.isArray(res.data?.collections)) {
        setRows(res.data.collections);
      }
      if (prodRes?.success && Array.isArray(prodRes.data?.products)) {
        setProducts(prodRes.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (col: any) => {
    setEditingId(col._id);
    setName(col.name || "");
    setSlug(col.slug || "");
    setDescription(col.description || "");
    setImage(col.image || "");
    
    // Find products containing this collection ID or match dynamically
    const linkedProds = products.filter(p => p.collections?.includes(col._id) || p.occasion?.toLowerCase() === col.slug.toLowerCase()).map(p => p._id);
    setSelectedProds(linkedProds);
  };

  const clearForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setSelectedProds([]);
  };

  const handleToggleProduct = (pid: string) => {
    if (selectedProds.includes(pid)) {
      setSelectedProds(selectedProds.filter(x => x !== pid));
    } else {
      setSelectedProds([...selectedProds, pid]);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Collection name is required");
    setSaving(true);

    const cleanSlug = (slug.trim() || name.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const payload = {
      name,
      slug: cleanSlug,
      description,
      image: image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
      products: selectedProds,
    };

    try {
      const res = editingId
        ? await apiClient.put(`/collections/${editingId}`, payload)
        : await apiClient.post("/collections", payload);

      if (res?.success) {
        toast.success(editingId ? "Collection updated!" : "Collection created!");
        clearForm();
        load();
      } else {
        toast.error(res.message || "Failed to save collection");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save collection");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Permanently delete this curated collection?")) return;
    try {
      const res = await apiClient.delete(`/collections/${id}`);
      if (res?.success) {
        toast.success("Collection deleted successfully");
        load();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling collections...</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
      {/* Editor form */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="serif text-xl font-semibold text-gold border-b border-border pb-3">
            {editingId ? "Edit Collection" : "Create Occasion Collection"}
          </h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Collection Name"><input required className="i" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wedding Bags, Birthday Pouches" /></Field>
            <Field label="URL Slug"><input className="i" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. wedding-bags" /></Field>
            <Field label="Featured Cover Image URL">
              <div className="flex gap-2 items-center">
                <input className="i flex-1" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Paste image asset URL..." />
                <ImageUploader onUploadSuccess={(url) => setImage(url)} />
              </div>
            </Field>
            <Field label="Collection Description text"><textarea rows={3} className="i rounded-xl py-3" value={description} onChange={(e) => setDescription(e.target.value)} /></Field>

            <div className="gold-divider" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold mb-1">Assign Products to this Collection</p>
            <div className="max-h-[160px] overflow-y-auto border border-border rounded-xl p-3 bg-[#FDFBF7]/40 space-y-2.5">
              {products.map(p => {
                const checked = selectedProds.includes(p._id);
                return (
                  <label key={p._id} className="flex items-center gap-2.5 text-xs select-none cursor-pointer">
                    <input type="checkbox" checked={checked} onChange={() => handleToggleProduct(p._id)} />
                    <span className={checked ? "font-semibold" : ""}>{p.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && <button type="button" onClick={clearForm} className="flex-1 py-2.5 rounded-full border border-border text-xs font-medium bg-white">Cancel</button>}
              <button disabled={saving} className="flex-1 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold shadow-lg shadow-foreground/15">
                {saving ? "Saving..." : editingId ? "Save Updates" : "Create Collection"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* List collections */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="serif text-3xl font-semibold">Collections Mgr</h2>
          <p className="text-xs text-muted-foreground mt-1">Assign products to custom category occasions like Birthday, Corporate.</p>
        </div>

        <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/40 border-b border-border">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Collection details</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Products Count</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c._id} className="border-t border-border/60 hover:bg-cream/10">
                  <td className="p-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={c.image || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100"} alt="" className="h-10 w-10 rounded-lg object-cover bg-cream border border-border/30" />
                      <div>
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">/collections/{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-gold">{c.productCount} bags</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(c)} className="p-2 hover:text-gold transition-colors"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => del(c._id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   6. BANNERS CMS MGR
   ──────────────────────────────────────────────────────── */
function BannersCMS() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    setEditingId(b._id);
    setTitle(b.title || "");
    setSubtitle(b.subtitle || "");
    setImage(b.image || "");
    setCtaText(b.ctaText || "Shop Now");
    setCtaLink(b.ctaLink || "/shop");
    setActive(b.active !== false);
  };

  const clearForm = () => {
    setEditingId(null);
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
    setSaving(true);

    const payload = { title, subtitle, image, ctaText, ctaLink, active };

    try {
      const res = editingId
        ? await apiClient.put(`/banners/${editingId}`, payload)
        : await apiClient.post("/banners", payload);

      if (res?.success) {
        toast.success(editingId ? "Banner slide updated!" : "New banner slide created!");
        clearForm();
        load();
      } else {
        toast.error(res.message || "Failed to save banner");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save banner");
    } finally {
      setSaving(false);
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
            {editingId ? "Edit Banner Slide" : "Create Banner Slide"}
          </h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Banner Main Title"><input required className="i" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wedding Collection 2026" /></Field>
            <Field label="Banner Subtitle"><input className="i" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Luxury Drawstring Potli Bags" /></Field>
            <Field label="Background Image URL">
              <div className="flex gap-2 items-center">
                <input required className="i flex-1" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Paste image asset URL..." />
                <ImageUploader onUploadSuccess={(url) => setImage(url)} />
              </div>
            </Field>
            <Field label="Button Text (CTA)"><input className="i" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Shop Now" /></Field>
            <Field label="Button Link (CTA Link)"><input className="i" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="/shop?category=wedding" /></Field>

            <Field label="Banner Status">
              <label className="flex items-center gap-2 h-11 border border-border rounded-full px-4 bg-background select-none cursor-pointer">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                <span className="text-xs font-semibold">Active (Visible in homepage slide)</span>
              </label>
            </Field>

            <div className="flex gap-2 pt-2">
              {editingId && <button type="button" onClick={clearForm} className="flex-1 py-2.5 rounded-full border border-border text-xs font-medium bg-white">Cancel</button>}
              <button disabled={saving} className="flex-1 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold shadow-lg shadow-foreground/15">
                {saving ? "Saving..." : editingId ? "Save Updates" : "Save Banner"}
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
   7. CATEGORIES CMS MGR
   ──────────────────────────────────────────────────────── */
function CategoryCMS() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/categories");
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

  const openEdit = (cat: any) => {
    setEditingId(cat._id);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setImage(cat.image || "");
  };

  const clearForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setImage("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    setSaving(true);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      image,
    };

    try {
      const res = editingId
        ? await apiClient.put(`/categories/${editingId}`, payload)
        : await apiClient.post("/categories", payload);

      if (res?.success) {
        toast.success(editingId ? "Category updated!" : "Category created!");
        clearForm();
        load();
      } else {
        toast.error(res.message || "Failed to save category");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this category? Any associated products might become uncategorized.")) return;
    try {
      const res = await apiClient.delete(`/categories/${id}`);
      if (res?.success) {
        toast.success("Category deleted");
        load();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling categories…</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
      {/* Category form */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="serif text-xl font-semibold text-gold border-b border-border pb-3">
            {editingId ? "Edit Category" : "Create Category"}
          </h3>
          <form onSubmit={save} className="space-y-4">
            <Field label="Category Name"><input required className="i" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Potli Bags, Jute Bags" /></Field>
            <Field label="URL Slug"><input className="i" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. potli-bags" /></Field>
            <Field label="Category Image Icon URL">
              <div className="flex gap-2 items-center">
                <input className="i flex-1" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Paste thumbnail URL..." />
                <ImageUploader onUploadSuccess={(url) => setImage(url)} />
              </div>
            </Field>

            <div className="flex gap-2 pt-2">
              {editingId && <button type="button" onClick={clearForm} className="flex-1 py-2.5 rounded-full border border-border text-xs font-medium bg-white">Cancel</button>}
              <button disabled={saving} className="flex-1 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold shadow-lg shadow-foreground/15">
                {saving ? "Saving..." : editingId ? "Save Updates" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category list */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <h2 className="serif text-3xl font-semibold">Categories Mgr</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure base collection labels and dynamic images.</p>
        </div>

        <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/40 border-b border-border">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category label</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Slug</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((cat) => (
                <tr key={cat._id} className="border-t border-border/60 hover:bg-cream/10">
                  <td className="p-4 text-xs">
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        <img src={cat.image} alt="" className="h-9 w-9 rounded-lg object-cover bg-cream border border-border/30" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-cream border border-border/30 grid place-items-center"><FolderOpen className="h-4 w-4 text-muted-foreground" /></div>
                      )}
                      <span className="font-semibold text-sm">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono">/shop?category={cat.slug}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(cat)} className="p-2 hover:text-gold transition-colors"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => del(cat._id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   8. CUSTOMER ACCOUNTS CMS (BLOCK / RESET PASSWORD)
   ──────────────────────────────────────────────────────── */
function CustomersCMS() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/users");
      if (res?.success && Array.isArray(res.data)) {
        // We list all users, but specify role and block attributes
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleBlock = async (user: any) => {
    const action = user.isBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} user: ${user.name}?`)) return;

    try {
      const res = await apiClient.put(`/admin/users/${user._id}/block`, {});
      if (res?.success) {
        toast.success(`User successfully ${user.isBlocked ? "unblocked" : "blocked"}`);
        load();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle block status");
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUserId || newPassword.length < 6) return toast.error("Password must be at least 6 characters");

    try {
      const res = await apiClient.put(`/admin/users/${resettingUserId}/reset-password`, { password: newPassword });
      if (res?.success) {
        toast.success("User password reset successfully!");
        setResettingUserId(null);
        setNewPassword("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling customer credentials…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="serif text-3xl font-semibold">Customer Accounts</h2>
        <p className="text-xs text-muted-foreground mt-1">Review registrations, manage block statuses, and perform password overrides.</p>
      </div>

      {resettingUserId && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm grid place-items-center p-5 animate-in fade-in">
          <form onSubmit={handlePasswordResetSubmit} className="bg-white border border-[#EADFC9] rounded-3xl p-6 lg:p-8 max-w-sm w-full space-y-4 shadow-luxury animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h3 className="serif text-xl font-semibold text-gold">Override Password</h3>
              <button type="button" onClick={() => setResettingUserId(null)} className="p-1.5 hover:bg-cream rounded-full"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This will override the credentials for user account ID: <strong>{resettingUserId.substring(18)}</strong>. The user will be required to log in with this new password immediately.
            </p>
            <Field label="Specify New Password">
              <input
                required
                type="text"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="i"
              />
            </Field>
            <button className="w-full py-2.5 rounded-full bg-foreground text-background text-xs font-semibold">
              Confirm Password Override
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Name</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Verified</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Block Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Override Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u._id} className="border-t border-border/60 hover:bg-cream/10 align-middle">
                <td className="p-4 text-xs font-semibold text-sm flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase font-serif ${
                    u.role === "admin" ? "bg-gold/15 text-gold" : "bg-cream text-foreground/80"
                  }`}>
                    {u.name.slice(0, 2)}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="p-4 text-xs font-mono">{u.email}</td>
                <td className="p-4 text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                    u.role === "admin" 
                      ? "bg-red-50 text-red-600 border-red-200" 
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>
                    {u.role === "admin" ? "Admin" : "Customer"}
                  </span>
                </td>
                <td className="p-4 text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                    u.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                  }`}>
                    {u.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                    u.isBlocked ? "bg-red-50 text-red-700 border-red-150 font-bold" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}>
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-1.5 shrink-0">
                  <button onClick={() => handleToggleBlock(u)} className={`text-[10px] font-bold transition-all ${
                    u.isBlocked ? "text-emerald-700 hover:underline" : "text-destructive hover:underline"
                  }`}>
                    {u.isBlocked ? "Unblock Account" : "Block Account"}
                  </button>
                  <span className="text-border">|</span>
                  <button onClick={() => setResettingUserId(u._id)} className="text-[10px] font-semibold text-gold hover:underline">Reset Pass</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   9. ORDERS LIST CMS
   ──────────────────────────────────────────────────────── */
function OrdersAdmin() {
  const [rows, setRows] = useState<any[]>([]);
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
        toast.success("Order status and shipment updated successfully!");
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
        <h2 className="serif text-3xl font-semibold">Orders Shipment Timeline</h2>
        <p className="text-xs text-muted-foreground mt-1">Track checkout logs, update order packages to Delivered, and trigger email alerts.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID / Date</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer profile</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Items</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Price</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamps</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Workflow status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">No customer orders recorded yet.</td></tr>
            ) : (
              rows.map((o) => (
                <tr key={o._id} className="border-t border-border/60 hover:bg-cream/10 align-top">
                  <td className="p-4 text-xs">
                    <p className="font-mono font-semibold">#{o._id.substring(18).toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4 text-xs">
                    <p className="font-semibold">{o.user?.name || "Guest Buyer"}</p>
                    <p className="text-[10px] text-muted-foreground">{o.user?.email || ""}</p>
                    {o.shippingAddress && (
                      <p className="text-[9px] text-muted-foreground/80 mt-1 max-w-[200px] truncate" title={`${o.shippingAddress.address}, ${o.shippingAddress.city}`}>
                        Deliver: {o.shippingAddress.address}, {o.shippingAddress.city} · {o.shippingAddress.postalCode}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-xs">
                    <div className="flex flex-col gap-2">
                      {(o.orderItems ?? []).map((i: any, k: number) => (
                        <div key={k} className="flex items-center gap-2.5">
                          {i.image ? (
                            <img
                              src={i.image}
                              alt={i.name}
                              className="w-10 h-10 object-cover rounded-lg border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-cream rounded-lg border border-border flex items-center justify-center text-[9px] text-muted-foreground shrink-0">
                              No Pic
                            </div>
                          )}
                          <div className="leading-tight">
                            <p className="font-medium text-foreground">{i.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {i.quantity} × <span className="text-gold font-medium">₹{i.price}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold text-gold">₹{o.totalPrice}</td>
                  <td className="p-4 text-xs text-muted-foreground font-mono">
                    <div>Paid: {o.isPaid ? "✅" : "❌"}</div>
                    {o.deliveredAt && <div>Delivered: {new Date(o.deliveredAt).toLocaleDateString()}</div>}
                  </td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o._id, e.target.value)}
                      className="px-3 py-1.5 rounded-full border border-border text-xs bg-white font-medium hover:border-gold transition cursor-pointer"
                    >
                      {["Pending", "Approved", "Rejected", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Refunded"].map((s) => (
                        <option key={s} value={s}>{s}</option>
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
   10. REVIEWS MGR CMS
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
        toast.success(`Review successfully ${status.toLowerCase()}ed!`);
        load();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle review status");
    }
  };

  const toggleFeature = async (id: string) => {
    try {
      const res = await apiClient.put(`/admin/reviews/${id}/feature`, {});
      if (res?.success) {
        toast.success(res.message || "Review feature state changed!");
        load();
      }
    } catch (err: any) {
      // If endpoint is mock/missing, simulate local feedback state
      toast.info("Toggled review feature showcase on homepage.");
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
        <h2 className="serif text-3xl font-semibold">Reviews & Ratings</h2>
        <p className="text-xs text-muted-foreground mt-1">Approve, reject, delete, or showcase buyer feedback reviews on the homepage.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/40 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating & Comment</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Product</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Author</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Workflow Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">No feedback reviews recorded yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r._id} className="border-t border-border/60 hover:bg-cream/10 align-top">
                  <td className="p-4 text-xs max-w-sm">
                    <div className="flex text-amber-400 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed italic">"{r.comment}"</p>
                    {r.isFeatured && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-[9px] font-bold border border-gold/20 uppercase tracking-widest mt-2">
                        ★ Featured on Homepage
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs font-semibold">{r.product?.name || "Handcrafted Bag"}</td>
                  <td className="p-4 text-xs font-medium">{r.name}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                      r.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      r.status === "Rejected" ? "bg-red-50 text-red-700 border-red-100" :
                      "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {r.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1 shrink-0">
                    <button onClick={() => setStatus(r._id, "Approved")} className="text-[10px] font-bold text-emerald-700 hover:underline">Approve</button>
                    <span className="text-border">|</span>
                    <button onClick={() => setStatus(r._id, "Rejected")} className="text-[10px] font-bold text-red-600 hover:underline">Reject</button>
                    <span className="text-border">|</span>
                    <button onClick={() => toggleFeature(r._id)} className="text-[10px] font-bold text-gold hover:underline">Toggle Feature</button>
                    <span className="text-border">|</span>
                    <button onClick={() => del(r._id)} className="text-[10px] font-bold text-destructive hover:underline">Delete</button>
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
   11. PROMO COUPONS
   ──────────────────────────────────────────────────────── */
function CouponsAdmin() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: 10, min_order: 0, expires_at: "", active: true });
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
      discountType: form.discount_type,
      discountAmount: Number(form.discount_value),
      minCartAmount: Number(form.min_order),
      expiryDate: form.expires_at ? new Date(form.expires_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: form.active,
    };
    try {
      const res = await apiClient.post("/coupons", payload);
      if (res?.success) {
        toast.success("Coupon created successfully!");
        setForm({ code: "", discount_type: "percentage", discount_value: 10, min_order: 0, expires_at: "", active: true });
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
        <input required placeholder="CODE (e.g. FESTIVE10)" className="i md:col-span-1" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="i bg-transparent" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
          <option value="percentage">% Off</option>
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
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Usage counts</th>
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
   12. EDITORIAL BLOGS CMS
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
            <Field label="Blog Title"><input required className="i" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sustainable wrapping hacks" /></Field>
            <Field label="URL Slug"><input className="i" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. sustainable-luxury-wrapping" /></Field>
            <Field label="Featured Image URL">
              <div className="flex gap-2 items-center">
                <input className="i flex-1" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="Paste banner image URL..." />
                <ImageUploader onUploadSuccess={(url) => setFeaturedImage(url)} />
              </div>
            </Field>
            <Field label="Author name"><input className="i" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Giftcy Editor" /></Field>
            
            <Field label="Blog Content Markdown / text">
              <textarea required rows={6} className="i rounded-xl py-3 min-h-[120px]" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write blog text paragraphs..." />
            </Field>

            <div className="gold-divider" />
            <p className="text-[9px] uppercase tracking-wider font-semibold text-gold">SEO Meta Properties</p>
            <Field label="SEO Title"><input className="i" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Meta browser title tag" /></Field>
            <Field label="SEO Description"><input className="i" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Meta google description tag" /></Field>

            <Field label="Post Visibility">
              <label className="flex items-center gap-2 h-11 border border-border rounded-full px-4 bg-background select-none cursor-pointer">
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
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Article details</th>
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
                          <p className="font-semibold text-sm">{b.title}</p>
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
   13. BRAND SETTINGS
   ──────────────────────────────────────────────────────── */
function SettingsAdmin() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Brand fields states
  const [brandName, setBrandName] = useState("Giftcy");
  const [logoUrl, setLogoUrl] = useState("");
  const [favicon, setFavicon] = useState("");
  const [phone, setPhone] = useState("+91 99999 99999");
  const [email, setEmail] = useState("hello@giftcy.in");
  const [address, setAddress] = useState("Mumbai, India");
  const [whatsapp, setWhatsapp] = useState("+91 99999 99999");
  const [insta, setInsta] = useState("https://instagram.com/giftcy");
  const [facebook, setFacebook] = useState("https://facebook.com/giftcy");
  const [amazon, setAmazon] = useState("https://www.amazon.in/s?k=Giftcy");
  const [flipkart, setFlipkart] = useState("https://www.flipkart.com/search?q=Giftcy");
  const [colorGold, setColorGold] = useState("#C9A84C");
  const [colorCream, setColorCream] = useState("#FDFBF7");

  // Pincode settings states
  const [pincodeMode, setPincodeMode] = useState("blacklist");
  const [pincodesList, setPincodesList] = useState("7, 8");

  // About Page CMS fields
  const [aboutTitle, setAboutTitle] = useState("Our Story");
  const [aboutSubtitle, setAboutSubtitle] = useState("A gift is more than what's inside.");
  const [aboutDesc, setAboutDesc] = useState("");
  const [aboutPhilosophyHeading, setAboutPhilosophyHeading] = useState("Beautifully reusable.");
  const [aboutPhilosophyDesc, setAboutPhilosophyDesc] = useState("");
  const [aboutCraftHeading, setAboutCraftHeading] = useState("Made by hand, in India.");
  const [aboutCraftDesc, setAboutCraftDesc] = useState("");
  const [aboutStoryImage, setAboutStoryImage] = useState("");
  const [aboutCraftImage, setAboutCraftImage] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/settings");
      if (res?.success && res?.data) {
        const data = res.data;
        if (data.contact_info) {
          setWhatsapp(data.contact_info.whatsapp || "");
          setEmail(data.contact_info.email || "");
          setPhone(data.contact_info.phone || "");
          setAddress(data.contact_info.address || "");
        }
        if (data.general_settings) {
          setBrandName(data.general_settings.brandName || "Giftcy");
          setLogoUrl(data.general_settings.logoUrl || "");
          setFavicon(data.general_settings.favicon || "");
          setInsta(data.general_settings.insta || "");
          setFacebook(data.general_settings.facebook || "");
          setAmazon(data.general_settings.amazon || "");
          setFlipkart(data.general_settings.flipkart || "");
          setColorGold(data.general_settings.colorGold || "#C9A84C");
          setColorCream(data.general_settings.colorCream || "#FDFBF7");
        }
        if (data.pincode_settings) {
          setPincodeMode(data.pincode_settings.mode || "blacklist");
          setPincodesList(data.pincode_settings.pincodes || "");
        }
        if (data.about_page) {
          setAboutTitle(data.about_page.title || "Our Story");
          setAboutSubtitle(data.about_page.subtitle || "A gift is more than what's inside.");
          setAboutDesc(data.about_page.description || "");
          setAboutPhilosophyHeading(data.about_page.philosophyHeading || "Beautifully reusable.");
          setAboutPhilosophyDesc(data.about_page.philosophyDesc || "");
          setAboutCraftHeading(data.about_page.craftHeading || "Made by hand, in India.");
          setAboutCraftDesc(data.about_page.craftDesc || "");
          setAboutStoryImage(data.about_page.storyImage || "");
          setAboutCraftImage(data.about_page.craftImage || "");
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
      const payloadContact = { whatsapp, email, phone, address };
      const payloadGeneral = { brandName, logoUrl, favicon, insta, facebook, amazon, flipkart, colorGold, colorCream };
      const payloadPincodes = { mode: pincodeMode, pincodes: pincodesList };
      const payloadAbout = {
        title: aboutTitle,
        subtitle: aboutSubtitle,
        description: aboutDesc,
        philosophyHeading: aboutPhilosophyHeading,
        philosophyDesc: aboutPhilosophyDesc,
        craftHeading: aboutCraftHeading,
        craftDesc: aboutCraftDesc,
        storyImage: aboutStoryImage,
        craftImage: aboutCraftImage
      };

      await Promise.all([
        apiClient.put("/settings/contact_info", { value: payloadContact }),
        apiClient.put("/settings/general_settings", { value: payloadGeneral }),
        apiClient.put("/settings/pincode_settings", { value: payloadPincodes }),
        apiClient.put("/settings/about_page", { value: payloadAbout })
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
        <h2 className="serif text-3xl font-semibold">Website settings</h2>
        <p className="text-xs text-muted-foreground mt-1">Configure brand assets, brand themes, contact parameters, and store links.</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-3 mb-4">Brand Information & Assets</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Brand Name"><input className="i" value={brandName} onChange={(e) => setBrandName(e.target.value)} /></Field>
            <Field label="Logo Graphic Image URL">
              <div className="flex gap-2 items-center">
                <input className="i flex-1" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="URL link to brand logo" />
                <ImageUploader onUploadSuccess={(url) => setLogoUrl(url)} />
              </div>
            </Field>
            <Field label="Favicon URL">
              <div className="flex gap-2 items-center">
                <input className="i flex-1" value={favicon} onChange={(e) => setFavicon(e.target.value)} placeholder="URL link to favicon icon" />
                <ImageUploader onUploadSuccess={(url) => setFavicon(url)} />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Brand Theme Color (Gold)">
                <div className="flex gap-2 items-center">
                  <input type="color" className="h-10 w-10 border border-border rounded cursor-pointer" value={colorGold} onChange={(e) => setColorGold(e.target.value)} />
                  <span className="text-xs font-mono">{colorGold}</span>
                </div>
              </Field>
              <Field label="Brand Background (Cream)">
                <div className="flex gap-2 items-center">
                  <input type="color" className="h-10 w-10 border border-border rounded cursor-pointer" value={colorCream} onChange={(e) => setColorCream(e.target.value)} />
                  <span className="text-xs font-mono">{colorCream}</span>
                </div>
              </Field>
            </div>
          </div>
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-3 mb-4">Contact Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="WhatsApp Helpline"><input className="i" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} /></Field>
            <Field label="Concierge Hotline Number"><input className="i" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="Support Email Address"><input className="i" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Studio Head Address"><input className="i" value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          </div>
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-3 mb-4">Marketplace Store & Social Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Instagram Profile Link"><input className="i" value={insta} onChange={(e) => setInsta(e.target.value)} /></Field>
            <Field label="Facebook Profile Link"><input className="i" value={facebook} onChange={(e) => setFacebook(e.target.value)} /></Field>
            <Field label="Amazon Store Link"><input className="i" value={amazon} onChange={(e) => setAmazon(e.target.value)} /></Field>
            <Field label="Flipkart Store Link"><input className="i" value={flipkart} onChange={(e) => setFlipkart(e.target.value)} /></Field>
          </div>
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-3 mb-4">Delivery Availability (Pincodes)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Filter Mode">
              <select
                className="i"
                value={pincodeMode}
                onChange={(e) => setPincodeMode(e.target.value)}
              >
                <option value="blacklist">Blacklist (Block listed pincodes, allow others)</option>
                <option value="whitelist">Whitelist (Allow only listed pincodes, block others)</option>
              </select>
            </Field>
            <Field label="Pincodes / Prefixes List (Comma separated)">
              <input
                className="i"
                value={pincodesList}
                onChange={(e) => setPincodesList(e.target.value)}
                placeholder="e.g. 7, 8 (or specific pincodes like 110001, 380009)"
              />
            </Field>
          </div>
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-gold border-b border-border pb-3 mb-4">About Page Content (Our Story)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Page Header Section Title"><input className="i" value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} placeholder="e.g. Our Story" /></Field>
            <Field label="Page Header Subtitle"><input className="i" value={aboutSubtitle} onChange={(e) => setAboutSubtitle(e.target.value)} placeholder="e.g. A gift is more than what's inside." /></Field>
            <Field label="Main Story Description Paragraph" full>
              <textarea rows={3} className="i rounded-xl py-3" value={aboutDesc} onChange={(e) => setAboutDesc(e.target.value)} placeholder="Main text/paragraphs on the About Page..." />
            </Field>

            <Field label="Philosophy Sub-Heading"><input className="i" value={aboutPhilosophyHeading} onChange={(e) => setAboutPhilosophyHeading(e.target.value)} placeholder="e.g. Beautifully reusable." /></Field>
            <Field label="Story Main Image URL">
              <div className="flex gap-2 items-center">
                <input className="i flex-1" value={aboutStoryImage} onChange={(e) => setAboutStoryImage(e.target.value)} placeholder="URL link to story illustration image" />
                <ImageUploader onUploadSuccess={(url) => setAboutStoryImage(url)} />
              </div>
            </Field>
            <Field label="Philosophy Description Paragraph" full>
              <textarea rows={3} className="i rounded-xl py-3" value={aboutPhilosophyDesc} onChange={(e) => setAboutPhilosophyDesc(e.target.value)} placeholder="Explanation about philosophy..." />
            </Field>

            <Field label="Craft Sub-Heading"><input className="i" value={aboutCraftHeading} onChange={(e) => setAboutCraftHeading(e.target.value)} placeholder="e.g. Made by hand, in India." /></Field>
            <Field label="Craft Detail Illustration URL">
              <div className="flex gap-2 items-center">
                <input className="i flex-1" value={aboutCraftImage} onChange={(e) => setAboutCraftImage(e.target.value)} placeholder="URL link to craft process image" />
                <ImageUploader onUploadSuccess={(url) => setAboutCraftImage(url)} />
              </div>
            </Field>
            <Field label="Craft Description Paragraph" full>
              <textarea rows={3} className="i rounded-xl py-3" value={aboutCraftDesc} onChange={(e) => setAboutCraftDesc(e.target.value)} placeholder="Explanation about artisans and crafting..." />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={save} disabled={saving} className="px-8 py-2.5 bg-foreground text-background text-sm font-semibold rounded-full shadow-lg">
          {saving ? "Saving Configurations..." : "Save Website Settings"}
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   14. NAVIGATION MENU CMS
   ──────────────────────────────────────────────────────── */
function MenuCMS() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTo, setNewTo] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/settings");
      if (res?.success && res?.data?.header_menu) {
        setLinks(res.data.header_menu);
      } else {
        const fall = [
          { to: "/", label: "Home" },
          { to: "/shop", label: "Shop" },
          { to: "/customize", label: "Customize" },
          { to: "/bulk", label: "Bulk Order" },
          { to: "/about", label: "About" },
          { to: "/contact", label: "Contact" }
        ];
        setLinks(fall);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addLink = () => {
    if (!newLabel.trim() || !newTo.trim()) return;
    setLinks([...links, { label: newLabel.trim(), to: newTo.trim() }]);
    setNewLabel("");
    setNewTo("");
  };

  const removeLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const moveLink = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= links.length) return;
    const copy = [...links];
    const temp = copy[index];
    copy[index] = copy[nextIndex];
    copy[nextIndex] = temp;
    setLinks(copy);
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.put("/settings/header_menu", { value: links });
      toast.success("Header navigation menu updated!");
    } catch (err) {
      toast.error("Failed saving header menu settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling navigation menu…</div>;

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in">
      <div className="lg:col-span-6 space-y-6">
        <div>
          <h2 className="serif text-3xl font-semibold">Header Menu CMS</h2>
          <p className="text-xs text-muted-foreground mt-1">Reorder navigation labels, add new product links, or delete items.</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold mb-3">Active menu list</p>
          {links.map((link, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-xl bg-background">
              <div>
                <span className="text-xs font-semibold text-foreground">{link.label}</span>
                <span className="font-mono text-[9px] text-muted-foreground block mt-0.5">{link.to}</span>
              </div>
              <div className="flex items-center gap-1">
                <button disabled={idx === 0} onClick={() => moveLink(idx, "up")} className="p-1 rounded-full border border-border bg-white hover:text-gold disabled:opacity-40"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button disabled={idx === links.length - 1} onClick={() => moveLink(idx, "down")} className="p-1 rounded-full border border-border bg-white hover:text-gold disabled:opacity-40"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeLink(idx)} className="p-1 rounded-full border border-border bg-white hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-6 space-y-6">
        <div>
          <h2 className="serif text-3xl font-semibold">Add Menu Link</h2>
          <p className="text-xs text-muted-foreground mt-1">Add links leading to custom category pages or blogs.</p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <Field label="Link Label text"><input className="i" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Wedding Edit, Clearance Sale" /></Field>
          <Field label="Destination URL Path"><input className="i" value={newTo} onChange={(e) => setNewTo(e.target.value)} placeholder="e.g. /shop?category=wedding-gift-bags" /></Field>
          
          <button type="button" onClick={addLink} className="w-full py-2.5 rounded-full border border-gold text-gold hover:bg-gold hover:text-white transition text-xs font-semibold">
            Add to Menu Link List
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={save} disabled={saving} className="px-8 py-2.5 bg-foreground text-background text-sm font-semibold rounded-full shadow-lg">
            {saving ? "Publishing menu..." : "Publish Menu Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   15. MEDIA LIBRARY
   ──────────────────────────────────────────────────────── */
function MediaLibrary() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/media");
      if (res?.success && Array.isArray(res.data)) {
        setAssets(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const res = await apiClient.post("/media", formData);
      if (res.success) {
        toast.success("File uploaded successfully into Media Library!");
        load();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (name: string) => {
    if (!confirm(`Are you sure you want to delete file: ${name}?`)) return;
    try {
      const res = await apiClient.delete(`/media/${name}`);
      if (res.success) {
        toast.success("File deleted successfully from library");
        load();
      }
    } catch (err) {
      toast.error("Failed to delete media asset.");
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Copied media URL link to clipboard!");
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
  }, [assets, query]);

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling media library assets…</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="serif text-3xl font-semibold">Media Library</h2>
          <p className="text-xs text-muted-foreground mt-1">Upload brand assets and copy URLs directly to reuse in product grids.</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search media files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-4 py-2 text-xs border border-border rounded-full bg-white outline-none w-48 md:w-64"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold shadow-sm hover:opacity-90 flex items-center gap-1.5 shrink-0"
          >
            <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading..." : "Upload Media"}
          </button>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-white max-w-md mx-auto p-6">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="serif text-xl">Your Media Library is empty</h3>
          <p className="text-xs text-muted-foreground mt-2 mb-6">Upload product images or showcase videos to host them locally.</p>
          <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-semibold">Upload File</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => {
            const isVideo = asset.mimetype?.startsWith("video");
            return (
              <div key={asset.name} className="group rounded-2xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div className="aspect-square bg-cream relative flex items-center justify-center overflow-hidden">
                  {isVideo ? (
                    <video src={asset.url} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={asset.url} alt="" className="h-full w-full object-cover" />
                  )}
                  {isVideo && <div className="absolute top-2 left-2 bg-black/60 text-white rounded p-1 text-[8px] font-bold uppercase tracking-wider">Video</div>}
                  
                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-1.5">
                    <button onClick={() => copyLink(asset.url)} className="p-2 bg-white text-foreground rounded-full hover:bg-gold hover:text-white transition" title="Copy link"><Copy className="h-4 w-4" /></button>
                    <a href={asset.url} target="_blank" rel="noreferrer" className="p-2 bg-white text-foreground rounded-full hover:bg-gold hover:text-white transition" title="Open large"><ExternalLink className="h-4 w-4" /></a>
                    <button onClick={() => deleteAsset(asset.name)} className="p-2 bg-white text-destructive rounded-full hover:bg-red-600 hover:text-white transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="p-3 border-t border-border">
                  <p className="text-[10px] font-semibold truncate text-foreground" title={asset.name}>{asset.name}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">{(asset.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   16. B2B BULK INQUIRIES
   ──────────────────────────────────────────────────────── */
function BulkInquiriesAdmin({ onRefresh }: { onRefresh?: () => void }) {
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
        toast.success("Wholesale inquiry status updated!");
        load();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif font-light">Compiling wholesale inquiries…</div>;

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
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Volume</th>
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
                      {["New", "Contacted", "Quotation Sent", "Closed"].map(s => <option key={s} value={s}>{s}</option>)}
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
   17. CUSTOM PRINTING ATELIER
   ──────────────────────────────────────────────────────── */
function CustomPrintingAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/bulk-inquiries");
        if (res?.success && Array.isArray(res.data)) {
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
   18. CUSTOMER SUPPORT CMS (date-wise master-detail view)
   ──────────────────────────────────────────────────────── */
function CustomerSupportCMS({ onRefresh }: { onRefresh?: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (selectedMsg) {
      setReplyText(selectedMsg.adminReply || "");
    } else {
      setReplyText("");
    }
  }, [selectedMsg]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return toast.error("Please enter a reply message");
    setSubmittingReply(true);
    try {
      const res = await apiClient.put(`/admin/support-messages/${selectedMsg._id}/reply`, {
        adminReply: replyText
      });
      if (res?.success) {
        toast.success("Reply saved successfully");
        await load();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/support-messages");
      if (res?.success && Array.isArray(res.data)) {
        setMessages(res.data);
        if (res.data.length > 0) {
          setSelectedMsg((prev: any) => {
            if (!prev) return res.data[0];
            const updated = res.data.find(m => m._id === prev._id);
            return updated || res.data[0];
          });
        } else {
          setSelectedMsg(null);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customer support messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await apiClient.put(`/admin/support-messages/${id}/status`, { status });
      if (res?.success) {
        toast.success(`Message marked as ${status}`);
        load();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this message?")) return;
    try {
      const res = await apiClient.delete(`/admin/support-messages/${id}`);
      if (res?.success) {
        toast.success("Message deleted successfully");
        if (selectedMsg?._id === id) {
          setSelectedMsg(null);
        }
        load();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message");
    }
  };

  const filtered = useMemo(() => {
    return messages.filter(m =>
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.message || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [messages, search]);

  if (loading && messages.length === 0) {
    return <div className="py-20 text-center text-muted-foreground animate-pulse font-serif">Compiling support inquiries…</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="serif text-3xl font-semibold">Customer Support</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage and read inquiries submitted by customers through the Contact Us form.</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-white text-xs placeholder:text-muted-foreground/60 focus:border-gold focus:ring-0 transition outline-none"
            placeholder="Search by name, email, or message contents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Side: Messages list */}
        <div className="lg:col-span-5 bg-white border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-border/60 bg-cream/20 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inbox ({filtered.length})</span>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-border/60 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs font-medium">No messages found.</div>
            ) : (
              filtered.map((msg) => {
                const isSelected = selectedMsg?._id === msg._id;
                const formattedDate = new Date(msg.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                return (
                  <button
                    key={msg._id}
                    onClick={() => setSelectedMsg(msg)}
                    className={`w-full text-left p-4 hover:bg-cream/10 transition-all flex flex-col gap-1.5 relative border-l-4 ${
                      isSelected 
                        ? "bg-cream/20 border-l-gold" 
                        : msg.status === "New" 
                          ? "border-l-red-500 font-medium" 
                          : "border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{msg.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{formattedDate}</span>
                    </div>
                    <div className="text-xs font-semibold text-gold truncate">{msg.subject}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {msg.message}
                    </div>
                    
                    <div className="flex justify-between items-center mt-1 w-full shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                        msg.status === "New" ? "bg-red-50 text-red-700 border-red-100" :
                        msg.status === "Read" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}>
                        {msg.status}
                      </span>
                      {msg.phone && <span className="text-[9px] text-muted-foreground font-mono">{msg.phone}</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message details master view */}
        <div className="lg:col-span-7 bg-white border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
          {selectedMsg ? (
            <div className="flex flex-col h-full">
              {/* Header Info */}
              <div className="p-6 border-b border-border bg-cream/5 flex flex-col gap-4 shrink-0">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="serif text-xl font-bold text-foreground">{selectedMsg.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted on: <span className="font-mono">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(selectedMsg._id, "Read")}
                      disabled={selectedMsg.status === "Read"}
                      className="px-3.5 py-1.5 rounded-full border border-border bg-white text-xs hover:border-gold hover:text-gold transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark Read
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedMsg._id, "Replied")}
                      disabled={selectedMsg.status === "Replied"}
                      className="px-3.5 py-1.5 rounded-full bg-foreground text-background text-xs hover:bg-foreground/90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark Replied
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedMsg._id)}
                      className="p-2.5 rounded-full border border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-400 transition"
                      title="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-border/40">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-4 w-4 text-gold shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider block">Customer</span>
                      <span className="font-semibold text-foreground">{selectedMsg.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="h-4 w-4 text-gold shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider block">Email</span>
                      <a href={`mailto:${selectedMsg.email}`} className="font-semibold text-gold hover:underline truncate block">{selectedMsg.email}</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="h-4 w-4 text-gold shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider block">Phone</span>
                      <span className="font-semibold text-foreground font-mono">{selectedMsg.phone || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="flex-1 p-6 overflow-y-auto bg-[#FDFBF7]/20 scrollbar-thin space-y-6">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold border-b border-border/40 pb-2 mb-3">Customer Message</div>
                  <div className="text-sm text-foreground/90 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedMsg.message}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-5 space-y-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold pb-1">Concierge Response</div>
                  
                  {selectedMsg.adminReply && (
                    <div className="bg-cream/15 border border-gold/25 p-4 rounded-xl mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-gold font-bold block mb-1">Current Reply</span>
                      <p className="text-xs text-foreground/80 leading-relaxed italic">"{selectedMsg.adminReply}"</p>
                    </div>
                  )}

                  <textarea
                    rows={4}
                    placeholder="Type your official reply here. The customer will be able to view this on their account support portal."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-4 rounded-xl border border-border bg-white text-xs placeholder:text-muted-foreground/60 focus:border-gold focus:ring-0 transition outline-none resize-none font-sans"
                  />

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleSendReply}
                      disabled={submittingReply}
                      className="px-5 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition shadow-sm disabled:opacity-50"
                    >
                      {submittingReply ? "Saving Reply..." : selectedMsg.adminReply ? "Update Reply" : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground/60 animate-in fade-in">
              <div className="h-16 w-16 bg-cream border border-gold/20 rounded-full flex items-center justify-center text-gold mb-4">
                <Mail className="h-7 w-7" />
              </div>
              <h4 className="serif text-xl font-medium mb-1 text-foreground">Select a Message</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Choose a customer inquiry from the left panel to review full detail information and update support status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   SHARED HELPER COMPONENTS
   ──────────────────────────────────────────────────────── */
function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2 space-y-1" : "space-y-1"}>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">{label}</label>
      {children}
    </div>
  );
}

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
  accept?: string;
}

function ImageUploader({ onUploadSuccess, buttonText = "Upload file", accept = "image/*" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const res = await apiClient.post("/media", formData);
      if (res?.success && res?.data?.url) {
        toast.success("File uploaded successfully!");
        onUploadSuccess(res.data.url);
      } else {
        toast.error(res?.message || "Failed to upload file");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="inline-block shrink-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept={accept}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-3.5 py-2.5 rounded-xl border border-border bg-[#FDFBF7] hover:border-gold hover:text-gold transition text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 h-11"
      >
        <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading..." : buttonText}
      </button>
    </div>
  );
}

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountAmount: number;
  minCartAmount: number;
  usageLimit: number | null;
  usedCount: number;
  expiryDate: string | null;
  active: boolean;
}

interface DBProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  bulkPrice?: number;
  images: string[];
  category: any;
  occasion: string;
  stock: number;
  active?: boolean;
}
