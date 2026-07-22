import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "./AuthContext";
import { dbToProduct, type DBProduct } from "@/lib/useProducts";
import { toast } from "sonner";

export type CartItem = {
  product: Product;
  qty: number;
  size?: string;
  color?: string;
  productId: string;
  productName: string;
  productImage: string;
  variant: string;
  quantity: number;
  price: number;
  totalPrice: number;
};
export type AppliedCoupon = { code: string; discount: number };

const mapDbItemToCartItem = (item: any): CartItem => {
  const product = dbToProduct(item.product as DBProduct);
  return {
    product,
    qty: item.quantity,
    size: item.size || "M",
    color: item.color || "Ivory",
    productId: product.id || "",
    productName: product.name,
    productImage: product.image,
    variant: `${item.color || "Ivory"} / ${item.size || "M"}`,
    quantity: item.quantity,
    price: product.price,
    totalPrice: product.price * item.quantity,
  };
};

const mapGuestItemToCartItem = (it: any): CartItem => {
  return {
    product: it.product,
    qty: it.qty,
    size: it.size || "M",
    color: it.color || "Ivory",
    productId: it.product.id || "",
    productName: it.product.name,
    productImage: it.product.image,
    variant: `${it.color || "Ivory"} / ${it.size || "M"}`,
    quantity: it.qty,
    price: it.product.price,
    totalPrice: it.product.price * it.qty,
  };
};

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
    let dbMapped: CartItem[] = [];

    if (user) {
      try {
        const response = await apiClient.get("/cart");
        if (response?.success && response?.data) {
          const dbItems = response.data.items || [];
          
          // Map DB items to frontend CartItem format
          dbMapped = dbItems
            .filter((item: any) => item.product !== null)
            .map(mapDbItemToCartItem);
        }
      } catch (error) {
        console.error("Failed to load cart from server", error);
      }
    }

    // Load guest/custom items from localStorage
    const localCartRaw = localStorage.getItem(user ? "giftcy_custom_cart" : "giftcy_cart");
    let localItems: CartItem[] = [];
    if (localCartRaw) {
      try {
        localItems = JSON.parse(localCartRaw).map(mapGuestItemToCartItem);
      } catch (e) {
        console.error(e);
      }
    }

    if (user) {
      // Merge guest cart items from localStorage if they exist during login
      const guestCartRaw = localStorage.getItem("giftcy_cart");
      if (guestCartRaw) {
        try {
          const guestItems = JSON.parse(guestCartRaw) as CartItem[];
          if (guestItems.length > 0) {
            toast.info(`Syncing ${guestItems.length} items from your guest cart...`);
            for (const it of guestItems) {
              if (it.product.id) {
                // Sync standard products to database cart
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
              } else {
                // Keep custom products in local custom cart
                localItems.push(it);
              }
            }
            // Clear guest cart and save custom cart
            localStorage.removeItem("giftcy_cart");
            localStorage.setItem("giftcy_custom_cart", JSON.stringify(localItems.filter(i => !i.product.id)));

            // Re-fetch database cart
            const mergedRes = await apiClient.get("/cart");
            if (mergedRes?.success && mergedRes?.data) {
              const finalDbItems = mergedRes.data.items || [];
              dbMapped = finalDbItems
                .filter((item: any) => item.product !== null)
                .map(mapDbItemToCartItem);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setItems([...dbMapped, ...localItems]);
    } else {
      setItems(localItems);
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

    const isCustom = !product.id || product.slug.startsWith("custom-");

    if (isCustom) {
      // Custom Order -> Always stored in localStorage
      setItems((prev) => {
        const idx = prev.findIndex(
          (it) => it.product.slug === product.slug && it.size === size && it.color === color
        );
        let next = [...prev];
        if (idx >= 0) {
          const currentQty = next[idx].qty + qty;
          next[idx] = {
            ...next[idx],
            qty: currentQty,
            quantity: currentQty,
            totalPrice: next[idx].price * currentQty,
          };
        } else {
          next.push(mapGuestItemToCartItem({ product, qty, size, color }));
        }
        
        // Save to appropriate localStorage key
        const key = user ? "giftcy_custom_cart" : "giftcy_cart";
        const toSave = user ? next.filter(i => !i.product.id) : next;
        localStorage.setItem(key, JSON.stringify(toSave));
        return next;
      });

      toast.success(`${product.name} added to cart`);
      setOpen(true);
    } else {
      // Standard Product -> Sync to database cart if user logged in
      const tempItem = mapGuestItemToCartItem({ product, qty, size, color });
      const rollbackItems = [...items];

      setItems((prev) => {
        const idx = prev.findIndex(
          (it) => it.product.slug === product.slug && it.size === size && it.color === color
        );
        let next = [...prev];
        if (idx >= 0) {
          const currentQty = next[idx].qty + qty;
          next[idx] = {
            ...next[idx],
            qty: currentQty,
            quantity: currentQty,
            totalPrice: next[idx].price * currentQty,
          };
        } else {
          next.push(tempItem);
        }
        return next;
      });

      toast.success(`${product.name} added to cart`);
      setOpen(true);

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
            const mapped = dbItems
              .filter((item: any) => item.product !== null)
              .map(mapDbItemToCartItem);
            
            // Reload custom items as well
            const customCartRaw = localStorage.getItem("giftcy_custom_cart");
            let customItems: CartItem[] = [];
            if (customCartRaw) {
              try { customItems = JSON.parse(customCartRaw); } catch (e) {}
            }
            setItems([...mapped, ...customItems]);
          }
        } catch (error: any) {
          console.error("Failed to sync cart item to database", error);
          setItems(rollbackItems);
          toast.error(error.message || "Failed to sync cart item with database");
        }
      } else {
        setItems((prev) => {
          localStorage.setItem("giftcy_cart", JSON.stringify(prev));
          return prev;
        });
      }
    }
  };

  const remove = async (slug: string) => {
    const item = items.find((i) => i.product.slug === slug);
    if (!item) return;

    const isCustom = !item.product.id || slug.startsWith("custom-");
    const rollbackItems = [...items];

    setItems((prev) => prev.filter((i) => i.product.slug !== slug));
    toast.success(`${item.product.name} removed from cart`);

    if (isCustom) {
      const key = user ? "giftcy_custom_cart" : "giftcy_cart";
      const customCartRaw = localStorage.getItem(key);
      if (customCartRaw) {
        try {
          const list = JSON.parse(customCartRaw) as CartItem[];
          const next = list.filter((i) => i.product.slug !== slug);
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      if (user) {
        try {
          const response = await apiClient.delete(`/cart/${item.product.id}`);
          if (response?.success && response?.data) {
            const dbItems = response.data.items || [];
            const mapped = dbItems
              .filter((item: any) => item.product !== null)
              .map(mapDbItemToCartItem);
            
            const customCartRaw = localStorage.getItem("giftcy_custom_cart");
            let customItems: CartItem[] = [];
            if (customCartRaw) {
              try { customItems = JSON.parse(customCartRaw); } catch (e) {}
            }
            setItems([...mapped, ...customItems]);
          }
        } catch (error: any) {
          console.error("Failed to remove item from server cart", error);
          setItems(rollbackItems);
          toast.error(error.message || "Failed to remove item from server cart");
        }
      } else {
        setItems((prev) => {
          localStorage.setItem("giftcy_cart", JSON.stringify(prev));
          return prev;
        });
      }
    }
  };

  const updateQty = async (slug: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    const item = items.find((i) => i.product.slug === slug);
    if (!item) return;

    const isCustom = !item.product.id || slug.startsWith("custom-");
    const rollbackItems = [...items];

    setItems((prev) =>
      prev.map((i) =>
        i.product.slug === slug
          ? {
              ...i,
              qty: safeQty,
              quantity: safeQty,
              totalPrice: i.price * safeQty,
            }
          : i
      )
    );

    if (isCustom) {
      const key = user ? "giftcy_custom_cart" : "giftcy_cart";
      const customCartRaw = localStorage.getItem(key);
      if (customCartRaw) {
        try {
          const list = JSON.parse(customCartRaw) as CartItem[];
          const next = list.map((i) =>
            i.product.slug === slug ? { ...i, qty: safeQty, quantity: safeQty, totalPrice: i.price * safeQty } : i
          );
          localStorage.setItem(key, JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      if (user) {
        try {
          const response = await apiClient.put(`/cart/${item.product.id}`, {
            quantity: safeQty,
          });
          if (response?.success && response?.data) {
            const dbItems = response.data.items || [];
            const mapped = dbItems
              .filter((item: any) => item.product !== null)
              .map(mapDbItemToCartItem);
            
            const customCartRaw = localStorage.getItem("giftcy_custom_cart");
            let customItems: CartItem[] = [];
            if (customCartRaw) {
              try { customItems = JSON.parse(customCartRaw); } catch (e) {}
            }
            setItems([...mapped, ...customItems]);
          }
        } catch (error: any) {
          console.error("Failed to update cart quantity on server", error);
          setItems(rollbackItems);
          toast.error(error.message || "Failed to update quantity on server");
        }
      } else {
        // Guest local update
        setItems((prev) => {
          localStorage.setItem("giftcy_cart", JSON.stringify(prev));
          return prev;
        });
      }
    }
  };

  const clear = async () => {
    localStorage.removeItem("giftcy_custom_cart");
    localStorage.removeItem("giftcy_cart");
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
