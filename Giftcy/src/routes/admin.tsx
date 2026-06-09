import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Edit, ImagePlus, LogOut, Package, Plus, Tag, Trash2, TrendingUp, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { apiClient } from "@/lib/apiClient";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Giftcy" }] }),
  component: AdminPage,
});

type Tab = "dashboard" | "products" | "coupons" | "orders";

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  if (loading) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="py-32 text-center px-5">
        <h1 className="serif text-4xl">Admin access required</h1>
        <p className="mt-3 text-muted-foreground">Your account doesn't have admin privileges.</p>
        <Link to="/auth" className="mt-6 inline-flex px-6 py-3 rounded-full border border-gold text-gold text-sm">Claim admin role</Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "products", label: "Products", icon: Package },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "orders", label: "Orders", icon: Package },
  ];

  return (
    <section className="min-h-screen bg-cream/40">
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 py-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Giftcy</p>
            <h1 className="serif text-3xl mt-1">Admin Panel</h1>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 lg:px-10 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${tab === t.id ? "bg-foreground text-background" : "hover:bg-cream"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </aside>

        <div>
          {tab === "dashboard" && <Dashboard />}
          {tab === "products" && <ProductsAdmin />}
          {tab === "coupons" && <CouponsAdmin />}
          {tab === "orders" && <OrdersAdmin />}
        </div>
      </div>
    </section>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard() {
  const [stats, setStats] = useState({ products: 0, coupons: 0, orders: 0, revenue: 0 });
  useEffect(() => {
    (async () => {
      try {
        const [dashRes, couponRes] = await Promise.all([
          apiClient.get("/admin/dashboard"),
          apiClient.get("/coupons"),
        ]);
        if (dashRes?.success && dashRes?.data) {
          const { stats: ds } = dashRes.data;
          const couponsCount = couponRes?.success && couponRes?.data ? couponRes.data.length : 0;
          setStats({
            products: ds.productsCount ?? 0,
            coupons: couponsCount,
            orders: ds.ordersCount ?? 0,
            revenue: ds.totalSales ?? 0,
          });
        }
      } catch (err) {
        console.error("Error loading dashboard stats", err);
      }
    })();
  }, []);
  const cards = [
    { label: "Products", value: stats.products },
    { label: "Coupons", value: stats.coupons },
    { label: "Orders", value: stats.orders },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}` },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl bg-background border border-border p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
          <p className="serif text-3xl mt-2">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Products ---------- */
type DBProduct = {
  _id: string;
  slug: string;
  name: string;
  category: any;
  occasion: string;
  description: string;
  price: number;
  compareAtPrice: number;
  images: string[];
  badge: string | null;
  colors: string[];
  sizes: string[];
  stock: number;
  active: boolean;
  amazon_url: string | null;
  flipkart_url: string | null;
};

const emptyProduct: Partial<DBProduct> = {
  name: "",
  slug: "",
  category: "",
  occasion: "Wedding",
  description: "",
  price: 0,
  compareAtPrice: 0,
  images: [],
  badge: null,
  colors: [],
  sizes: [],
  stock: 100,
  active: true,
  amazon_url: "",
  flipkart_url: "",
};

function ProductsAdmin() {
  const [rows, setRows] = useState<DBProduct[]>([]);
  const [editing, setEditing] = useState<Partial<DBProduct> | null>(null);

  const load = async () => {
    try {
      const res = await apiClient.get("/products?limit=100");
      if (res?.success && res?.data?.products) {
        setRows(res.data.products);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    }
  };
  useEffect(() => { load(); }, []);

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await apiClient.delete(`/products/${id}`);
      if (res?.success) {
        toast.success("Deleted");
        load();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="serif text-2xl">Products</h2>
        <button onClick={() => setEditing({ ...emptyProduct })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground text-background text-sm">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="rounded-2xl bg-background border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet. Click "Add product" to start.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-border">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {r.images?.[0] ? (
                      <img src={r.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover bg-cream" />
                    ) : <div className="h-12 w-12 rounded-lg bg-cream grid place-items-center"><ImagePlus className="h-4 w-4 text-muted-foreground" /></div>}
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeof r.category === "object" ? r.category.name : r.category} · {r.occasion}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p>₹{r.price}</p>
                  {Number(r.compareAtPrice) > Number(r.price) && <p className="text-xs text-muted-foreground line-through">₹{r.compareAtPrice}</p>}
                </td>
                <td className="p-4">{r.stock}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${r.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {r.active !== false ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setEditing(r)} className="p-2 hover:text-gold"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => del(r._id)} className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <ProductForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function ProductForm({ initial, onClose, onSaved }: { initial: Partial<DBProduct>; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Partial<DBProduct>>(initial);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof DBProduct>(k: K, v: DBProduct[K]) => setForm((f) => ({ ...f, [k]: v }));

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/categories");
        if (res?.success && res?.data) {
          setCategories(res.data);
          if (!form.category && res.data.length > 0) {
            set("category", res.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    })();
  }, []);

  const discount = useMemo(() => {
    const mrp = Number(form.compareAtPrice ?? 0), price = Number(form.price ?? 0);
    return mrp > 0 && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  }, [form.compareAtPrice, form.price]);

  const save = async () => {
    if (!form.name || !form.price) return toast.error("Name and price are required");
    setSaving(true);

    const categoryId = typeof form.category === "object" ? form.category._id : form.category;
    if (!categoryId) {
      setSaving(false);
      return toast.error("Please select a category");
    }

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name!),
      category: categoryId,
      occasion: form.occasion || "Wedding",
      description: form.description || "",
      price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice ?? form.price),
      images: form.images?.length ? form.images : [form.images?.[0] || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800"].filter(Boolean),
      stock: Number(form.stock ?? 100),
      isBestSeller: form.badge === "Bestseller",
      isNewArrival: form.badge === "New",
      active: form.active ?? true,
      amazon_url: form.amazon_url || null,
      flipkart_url: form.flipkart_url || null,
    };

    try {
      const res = form._id
        ? await apiClient.put(`/products/${form._id}`, payload)
        : await apiClient.post("/products", payload);
      setSaving(false);
      if (res?.success) {
        toast.success(form._id ? "Updated" : "Created");
        onSaved();
      } else {
        toast.error(res.message || "Failed to save product");
      }
    } catch (err: any) {
      setSaving(false);
      toast.error(err.message || "Failed to save product");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-foreground/40 p-0 lg:p-6">
      <div className="bg-background w-full lg:max-w-3xl rounded-t-3xl lg:rounded-3xl shadow-luxury max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-5 flex items-center justify-between">
          <h3 className="serif text-2xl">{form._id ? "Edit product" : "New product"}</h3>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 grid lg:grid-cols-2 gap-5">
          <Field label="Name"><input className="i" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Slug (URL)"><input className="i" placeholder="auto" value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></Field>
          <Field label="Category">
            <select className="i" value={typeof form.category === "object" ? form.category._id : form.category} onChange={(e) => set("category", e.target.value)}>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Occasion">
            <select className="i" value={form.occasion ?? "Wedding"} onChange={(e) => set("occasion", e.target.value)}>
              {["Wedding", "Birthday", "Festive", "Corporate", "Anniversary"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Price (₹)"><input type="number" className="i" value={form.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} /></Field>
          <Field label="MRP / Compare Price (₹)"><input type="number" className="i" value={form.compareAtPrice ?? 0} onChange={(e) => set("compareAtPrice", Number(e.target.value))} /></Field>
          <Field label={`Discount (auto): ${discount}% off`}><input disabled className="i opacity-60" value={`${discount}%`} /></Field>
          <Field label="Stock"><input type="number" className="i" value={form.stock ?? 100} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
          <Field label="Badge">
            <select className="i" value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)}>
              <option value="">None</option><option>Bestseller</option><option>New</option><option>Sale</option>
            </select>
          </Field>
          <Field label="Active">
            <label className="flex items-center gap-2 h-11">
              <input type="checkbox" checked={form.active ?? true} onChange={(e) => set("active", e.target.checked)} />
              <span className="text-sm">Visible on shop</span>
            </label>
          </Field>
          <Field label="Colors (comma separated)" full><input className="i" value={Array.isArray(form.colors) ? form.colors.join(", ") : (form.colors ?? "")} onChange={(e) => set("colors", e.target.value as unknown as string[])} /></Field>
          <Field label="Sizes (comma separated)" full><input className="i" value={Array.isArray(form.sizes) ? form.sizes.join(", ") : (form.sizes ?? "")} onChange={(e) => set("sizes", e.target.value as unknown as string[])} /></Field>
          <Field label="Amazon URL" full><input className="i" value={form.amazon_url ?? ""} onChange={(e) => set("amazon_url", e.target.value)} /></Field>
          <Field label="Flipkart URL" full><input className="i" value={form.flipkart_url ?? ""} onChange={(e) => set("flipkart_url", e.target.value)} /></Field>
          <Field label="Description" full>
            <textarea rows={3} className="i min-h-[90px]" value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>

          <Field label="Product Image URL" full>
            <input className="i" placeholder="Paste image URL (e.g. Unsplash URL)" value={form.images?.[0] ?? ""} onChange={(e) => set("images", [e.target.value])} />
            {form.images?.[0] && (
              <img src={form.images[0]} alt="" className="mt-3 h-24 w-24 rounded-xl object-cover bg-cream" />
            )}
          </Field>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border p-5 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full border border-border text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-full bg-foreground text-background text-sm disabled:opacity-60">
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
      <style>{`.i{width:100%;padding:.7rem 1rem;border:1px solid hsl(var(--border));border-radius:9999px;background:transparent;font-size:.875rem;outline:none}.i:focus{border-color:var(--gold)}textarea.i{border-radius:1rem}`}</style>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "lg:col-span-2" : ""}>
      <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

/* ---------- Coupons ---------- */
type Coupon = { _id: string; code: string; discountType: string; discountAmount: number; minCartAmount: number; usageLimit: number | null; usedCount: number; expiryDate: string | null; active: boolean };

function CouponsAdmin() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: 10, min_order: 0, expires_at: "", active: true });

  const load = async () => {
    try {
      const res = await apiClient.get("/coupons");
      if (res?.success && res?.data) {
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
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
        toast.success("Coupon created");
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
    if (!confirm("Delete coupon?")) return;
    try {
      const res = await apiClient.delete(`/coupons/${id}`);
      if (res?.success) load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="serif text-2xl">Coupons</h2>

      <form onSubmit={create} className="rounded-2xl bg-background border border-border p-5 grid md:grid-cols-6 gap-3">
        <input required placeholder="CODE" className="i md:col-span-1" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select className="i" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
          <option value="percent">% off</option><option value="flat">Flat ₹ off</option>
        </select>
        <input type="number" placeholder="Value" className="i" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
        <input type="number" placeholder="Min order ₹" className="i" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} />
        <input type="date" className="i" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
        <button className="px-5 py-2.5 rounded-full bg-foreground text-background text-sm">Add coupon</button>
        <style>{`.i{padding:.7rem 1rem;border:1px solid hsl(var(--border));border-radius:9999px;background:transparent;font-size:.875rem;outline:none}`}</style>
      </form>

      <div className="rounded-2xl bg-background border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left">
            <tr><th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Min order</th><th className="p-4">Used</th><th className="p-4">Expires</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No coupons yet.</td></tr>}
            {rows.map((c) => (
              <tr key={c._id} className="border-t border-border">
                <td className="p-4 font-mono font-semibold">{c.code}</td>
                <td className="p-4">{c.discountType === "percentage" ? `${c.discountAmount}%` : `₹${c.discountAmount}`}</td>
                <td className="p-4">₹{c.minCartAmount}</td>
                <td className="p-4">{c.usedCount ?? 0}{c.usageLimit ? `/${c.usageLimit}` : ""}</td>
                <td className="p-4">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "—"}</td>
                <td className="p-4">
                  <button onClick={() => toggle(c)} className={`px-2 py-1 rounded-full text-xs ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4 text-right"><button onClick={() => del(c._id)} className="p-2 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Orders ---------- */
type Order = { _id: string; user: { name: string; email: string }; orderItems: { name: string; quantity: number; price: number }[]; itemsPrice: number; discountPrice: number; totalPrice: number; couponCode?: string | null; status: string; createdAt: string };

function OrdersAdmin() {
  const [rows, setRows] = useState<Order[]>([]);
  const load = async () => {
    try {
      const res = await apiClient.get("/admin/orders");
      if (res?.success && res?.data) {
        setRows(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      const res = await apiClient.put(`/admin/orders/${id}/status`, { status });
      if (res?.success) {
        toast.success("Order status updated");
        load();
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div>
      <h2 className="serif text-2xl mb-5">Orders</h2>
      <div className="rounded-2xl bg-background border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left">
            <tr><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Coupon</th><th className="p-4">Status</th><th className="p-4">Placed</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>}
            {rows.map((o) => (
              <tr key={o._id} className="border-t border-border align-top">
                <td className="p-4">
                  <p className="font-medium">{o.user?.name || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">{o.user?.email || ""}</p>
                </td>
                <td className="p-4">{(o.orderItems ?? []).map((i, k) => <div key={k} className="text-xs">{i.quantity}× {i.name}</div>)}</td>
                <td className="p-4">
                  <p className="font-semibold">₹{o.totalPrice}</p>
                  {o.discountPrice > 0 && <p className="text-xs text-gold">-₹{o.discountPrice}</p>}
                </td>
                <td className="p-4">{o.couponCode ?? "—"}</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)} className="px-3 py-1.5 rounded-full border border-border text-xs bg-transparent">
                    {["Processing", "Shipped", "Delivered", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
