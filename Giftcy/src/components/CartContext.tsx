import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "./AuthContext";
import { dbToProduct, type DBProduct } from "@/lib/useProducts";
import { toast } from "sonner";

export type CartItem = { product: Product; qty: number; size?: string; color?: string };
export type AppliedCoupon = { code: string; discount: number };

type CartCtx = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, opts?: { size?: string; color?: string; qty?: number }) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  updateQty: (slug: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  subtotal: number;
  count: number;
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
  discount: number;
  total: number;
  loading: boolean;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [loading, setLoading] = useState(true);

  // Load cart from API or LocalStorage on login/logout
  const loadCart = useCallback(async () => {
    setLoading(true);
    if (user) {
      try {
        const response = await apiClient.get("/cart");
        if (response?.success && response?.data) {
          const dbItems = response.data.items || [];
          
          // Map DB items to frontend CartItem format
          const mapped = dbItems
            .filter((item: any) => item.product !== null)
            .map((item: any) => ({
              product: dbToProduct(item.product as DBProduct),
              qty: item.quantity,
              size: item.size || "M",
              color: item.color || "Ivory",
            }));

          // Merge guest cart items from localStorage if they exist
          const localCartRaw = localStorage.getItem("giftcy_cart");
          if (localCartRaw) {
            try {
              const localItems = JSON.parse(localCartRaw) as CartItem[];
              if (localItems.length > 0) {
                toast.info(`Syncing ${localItems.length} items from your guest cart...`);
                // Loop through local items and add to DB cart
                for (const it of localItems) {
                  try {
                    await apiClient.post("/cart", {
                      productId: it.product.id,
                      quantity: it.qty,
                      size: it.size || "M",
                      color: it.color || "Ivory",
                    });
                  } catch (err) {
                    console.error("Failed to merge cart item to database", err);
                  }
                }
                // Clear localStorage cart
                localStorage.removeItem("giftcy_cart");
                
                // Re-fetch final merged cart
                const mergedRes = await apiClient.get("/cart");
                if (mergedRes?.success && mergedRes?.data) {
                  const finalDbItems = mergedRes.data.items || [];
                  const finalMapped = finalDbItems
                    .filter((item: any) => item.product !== null)
                    .map((item: any) => ({
                      product: dbToProduct(item.product as DBProduct),
                      qty: item.quantity,
                      size: item.size || "M",
                      color: item.color || "Ivory",
                    }));
                  setItems(finalMapped);
                }
              } else {
                setItems(mapped);
              }
            } catch (e) {
              setItems(mapped);
            }
          } else {
            setItems(mapped);
          }
        }
      } catch (error) {
        console.error("Failed to load cart from server", error);
      }
    } else {
      // Guest local storage loading
      const localCart = localStorage.getItem("giftcy_cart");
      if (localCart) {
        try {
          setItems(JSON.parse(localCart));
        } catch (e) {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const add = async (product: Product, opts?: { size?: string; color?: string; qty?: number }) => {
    const qty = opts?.qty ?? 1;
    const size = opts?.size ?? "M";
    const color = opts?.color ?? "Ivory";

    if (user) {
      try {
        const response = await apiClient.post("/cart", {
          productId: product.id,
          quantity: qty,
          size,
          color,
        });
        if (response?.success && response?.data) {
          const dbItems = response.data.items || [];
          setItems(
            dbItems
              .filter((item: any) => item.product !== null)
              .map((item: any) => ({
                product: dbToProduct(item.product as DBProduct),
                qty: item.quantity,
                size: item.size || "M",
                color: item.color || "Ivory",
              }))
          );
          toast.success(`${product.name} added to cart`);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to add item to database cart");
      }
    } else {
      // Guest local update
      setItems((prev) => {
        const i = prev.findIndex((it) => it.product.slug === product.slug && it.size === size && it.color === color);
        let next = [];
        if (i >= 0) {
          next = [...prev];
          next[i] = { ...next[i], qty: next[i].qty + qty };
        } else {
          next = [...prev, { product, qty, size, color }];
        }
        localStorage.setItem("giftcy_cart", JSON.stringify(next));
        return next;
      });
      toast.success(`${product.name} added to local cart`);
    }
    setOpen(true);
  };

  const remove = async (slug: string) => {
    // Find item to get its product.id
    const item = items.find((i) => i.product.slug === slug);
    if (!item) return;

    if (user) {
      try {
        const response = await apiClient.delete(`/cart/${item.product.id}`);
        if (response?.success && response?.data) {
          const dbItems = response.data.items || [];
          setItems(
            dbItems
              .filter((item: any) => item.product !== null)
              .map((item: any) => ({
                product: dbToProduct(item.product as DBProduct),
                qty: item.quantity,
                size: item.size || "M",
                color: item.color || "Ivory",
              }))
          );
          toast.success(`${item.product.name} removed from cart`);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to remove item from cart");
      }
    } else {
      // Guest local update
      setItems((prev) => {
        const next = prev.filter((i) => i.product.slug !== slug);
        localStorage.setItem("giftcy_cart", JSON.stringify(next));
        return next;
      });
    }
  };

  const updateQty = async (slug: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    const item = items.find((i) => i.product.slug === slug);
    if (!item) return;

    if (user) {
      try {
        const response = await apiClient.put(`/cart/${item.product.id}`, {
          quantity: safeQty,
        });
        if (response?.success && response?.data) {
          const dbItems = response.data.items || [];
          setItems(
            dbItems
              .filter((item: any) => item.product !== null)
              .map((item: any) => ({
                product: dbToProduct(item.product as DBProduct),
                qty: item.quantity,
                size: item.size || "M",
                color: item.color || "Ivory",
              }))
          );
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update quantity");
      }
    } else {
      // Guest local update
      setItems((prev) => {
        const next = prev.map((i) => (i.product.slug === slug ? { ...i, qty: safeQty } : i));
        localStorage.setItem("giftcy_cart", JSON.stringify(next));
        return next;
      });
    }
  };

  const clear = async () => {
    if (user) {
      try {
        const response = await apiClient.delete("/cart/clear");
        if (response?.success) {
          setItems([]);
          setCoupon(null);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to clear cart");
      }
    } else {
      setItems([]);
      setCoupon(null);
      localStorage.removeItem("giftcy_cart");
    }
  };

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.product.price * i.qty, 0), [items]);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = useCallback(
    async (code: string) => {
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
    },
    [subtotal]
  );

  const removeCoupon = () => setCoupon(null);

  return (
    <Ctx.Provider
      value={{
        items,
        open,
        setOpen,
        add,
        remove,
        updateQty,
        clear,
        subtotal,
        count,
        coupon,
        applyCoupon,
        removeCoupon,
        discount,
        total,
        loading,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be inside CartProvider");
  return v;
};
