import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { apiClient } from "@/lib/apiClient";

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
    try {
      const response = await apiClient.get(`/coupons/validate/${trimmed}?subtotal=${subtotal}`);
      if (response?.success && response?.data) {
        const couponData = response.data;
        let calculatedDiscount = 0;
        if (couponData.discountType === "percentage" || couponData.discountType === "percent") {
          calculatedDiscount = (subtotal * couponData.discountAmount) / 100;
        } else {
          calculatedDiscount = couponData.discountAmount;
        }
        calculatedDiscount = Math.min(calculatedDiscount, subtotal);
        setCoupon({
          code: trimmed.toUpperCase(),
          discount: calculatedDiscount,
        });
        return { ok: true, message: response.message || "Coupon applied" };
      }
      return { ok: false, message: response.message || "Invalid coupon" };
    } catch (error: any) {
      return { ok: false, message: error.message || "Failed to apply coupon" };
    }
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
