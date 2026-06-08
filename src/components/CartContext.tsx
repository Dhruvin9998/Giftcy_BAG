import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

export type CartItem = { product: Product; qty: number; size?: string; color?: string };
export type AppliedCoupon = { code: string; discount: number };

type CartCtx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, opts?: { size?: string; color?: string; qty?: number }) => void;
  remove: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
  discount: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  const add: CartCtx["add"] = (product, opts) => {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.product.slug === product.slug);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + (opts?.qty ?? 1) };
        return next;
      }
      return [...prev, { product, qty: opts?.qty ?? 1, size: opts?.size, color: opts?.color }];
    });
    setOpen(true);
  };

  const remove = (slug: string) => setItems((p) => p.filter((i) => i.product.slug !== slug));
  const updateQty = (slug: string, qty: number) =>
    setItems((p) => p.map((i) => (i.product.slug === slug ? { ...i, qty: Math.max(1, qty) } : i)));
  const clear = () => { setItems([]); setCoupon(null); };

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.product.price * i.qty, 0), [items]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return { ok: false, message: "Enter a code" };
    const { data, error } = await supabase.rpc("validate_coupon", { _code: trimmed, _subtotal: subtotal });
    if (error) return { ok: false, message: error.message };
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.valid) return { ok: false, message: row?.message ?? "Invalid coupon" };
    setCoupon({ code: trimmed.toUpperCase(), discount: Number(row.discount) });
    return { ok: true, message: row.message ?? "Coupon applied" };
  }, [subtotal]);

  const removeCoupon = () => setCoupon(null);

  return (
    <Ctx.Provider value={{ items, open, setOpen, add, remove, updateQty, clear, subtotal, count, coupon, applyCoupon, removeCoupon, discount, total }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be inside CartProvider");
  return v;
};
