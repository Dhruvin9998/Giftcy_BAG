import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "./AuthContext";
import { dbToProduct, type DBProduct } from "@/lib/useProducts";
import { toast } from "sonner";

type WishlistCtx = {
  items: Product[];
  loading: boolean;
  toggle: (product: Product) => Promise<void>;
  has: (productId: string | undefined) => boolean;
  clearLocal: () => void;
};

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist on mount or auth change
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      if (user) {
        try {
          const response = await apiClient.get("/wishlist");
          if (response?.success && response?.data) {
            const dbProducts = (response.data.products || []) as DBProduct[];
            const mapped = dbProducts.map(dbToProduct);
            setItems(mapped);

            // Merge guest wishlist items from localStorage if any exist
            const localWishlistRaw = localStorage.getItem("giftcy_wishlist");
            if (localWishlistRaw) {
              const localItems = JSON.parse(localWishlistRaw) as Product[];
              if (localItems.length > 0) {
                // Find products that are in local wishlist but NOT in db wishlist
                const dbProductIds = new Set(dbProducts.map((p) => p._id));
                const itemsToMerge = localItems.filter((li) => li.id && !dbProductIds.has(li.id));

                if (itemsToMerge.length > 0) {
                  toast.info(`Syncing ${itemsToMerge.length} items from your guest wishlist...`);
                  for (const item of itemsToMerge) {
                    try {
                      await apiClient.post(`/wishlist/${item.id!}`, {});
                    } catch (err) {
                      console.error("Failed to sync item to database wishlist", err);
                    }
                  }
                  // Re-fetch wishlist after merging
                  const updatedResponse = await apiClient.get("/wishlist");
                  if (updatedResponse?.success && updatedResponse?.data) {
                    setItems((updatedResponse.data.products || []).map(dbToProduct));
                  }
                }
                localStorage.removeItem("giftcy_wishlist");
              }
            }
          }
        } catch (error) {
          console.error("Failed to load wishlist from server", error);
        }
      } else {
        // Load guest wishlist from localStorage
        const localWishlist = localStorage.getItem("giftcy_wishlist");
        if (localWishlist) {
          try {
            setItems(JSON.parse(localWishlist));
          } catch (e) {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
      setLoading(false);
    };

    loadWishlist();
  }, [user]);

  const toggle = async (product: Product) => {
    const isWishlisted = items.some((i) => i.id === product.id);
    let newItems: Product[] = [];

    if (isWishlisted) {
      newItems = items.filter((i) => i.id !== product.id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      newItems = [...items, product];
      toast.success(`${product.name} added to wishlist`);
    }

    if (user) {
      if (!product.id) return;
      try {
        const response = await apiClient.post(`/wishlist/${product.id}`, {});
        if (response?.success && response?.data) {
          const dbProducts = (response.data.products || []) as DBProduct[];
          setItems(dbProducts.map(dbToProduct));
        } else {
          // Fallback UI update on failure
          setItems(newItems);
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to update wishlist on server");
      }
    } else {
      // Guest local storage update
      setItems(newItems);
      localStorage.setItem("giftcy_wishlist", JSON.stringify(newItems));
    }
  };

  const has = (productId: string | undefined) => {
    if (!productId) return false;
    return items.some((i) => i.id === productId);
  };

  const clearLocal = () => {
    setItems([]);
    localStorage.removeItem("giftcy_wishlist");
  };

  return (
    <Ctx.Provider value={{ items, loading, toggle, has, clearLocal }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWishlist = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWishlist must be inside WishlistProvider");
  return v;
};
