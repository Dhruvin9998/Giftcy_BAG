import { useEffect, useState } from "react";
import { apiClient } from "./apiClient";
import { products as staticProducts, type Product } from "./products";

export type DBProduct = {
  _id: string;
  slug: string;
  name: string;
  category: { _id: string; name: string; slug: string } | string;
  occasion?: string;
  description: string;
  price: number;
  compareAtPrice: number;
  images: string[];
  stock: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  active?: boolean;
  amazon_url?: string | null;
  flipkart_url?: string | null;
  createdAt: string;
  priority?: number;
};

const getCleanImageUrl = (url: string | undefined): string => {
  if (!url) return "";
  
  let cleaned = url;
  
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const backendBase = apiUrl ? apiUrl.replace(/\/api\/v1\/?$/, "") : "";

  // 1. If we have a remote backend domain configured, rewrite localhost URLs
  if (backendBase && !backendBase.includes("localhost") && !backendBase.includes("127.0.0.1")) {
    if (cleaned.includes("localhost:5098") || cleaned.includes("127.0.0.1:5098")) {
      cleaned = cleaned.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5098/, backendBase);
    }
  }
  
  // 2. If the current site or backend is loaded over HTTPS, upgrade http:// to https:// to prevent Mixed Content
  const isSecure = (typeof window !== "undefined" && window.location.protocol === "https:") || backendBase.startsWith("https://");
  if (isSecure && cleaned.startsWith("http://")) {
    cleaned = cleaned.replace(/^http:\/\//, "https://");
  }
  
  return cleaned;
};

export const dbToProduct = (d: DBProduct): Product => {
  if (!d || typeof d !== "object" || !d._id) {
    const fallbackImage = staticProducts[0]?.image || "";
    return {
      id: typeof d === "string" ? d : "",
      slug: "unknown-product",
      name: "Unknown Product",
      category: "Bags",
      occasion: "Wedding",
      price: 0,
      mrp: 0,
      image: fallbackImage,
      images: [fallbackImage],
      colors: ["Ivory", "Gold", "Blush"],
      sizes: ["S", "M", "L"],
      description: "",
    };
  }

  const priceVal = d.price !== undefined && d.price !== null ? Number(d.price) : 0;
  const comparePriceVal = d.compareAtPrice !== undefined && d.compareAtPrice !== null ? Number(d.compareAtPrice) : priceVal;
  const fallbackImage = staticProducts[0]?.image || "";

  const cleanedImage = getCleanImageUrl(d.images?.[0]) || fallbackImage;
  const cleanedImages = d.images && d.images.length > 0 
    ? (d.images.map(img => getCleanImageUrl(img)).filter(Boolean) as string[])
    : [cleanedImage];

  return {
    id: d._id,
    slug: d.slug || "",
    name: d.name || "Unnamed Product",
    category: typeof d.category === "object" && d.category ? d.category.name : (d.category || "Bags"),
    occasion: d.occasion || "Wedding",
    price: isNaN(priceVal) ? 0 : priceVal,
    mrp: isNaN(comparePriceVal) ? priceVal : comparePriceVal,
    image: cleanedImage,
    images: cleanedImages,
    badge: d.isBestSeller ? "Bestseller" : d.isNewArrival ? "New" : undefined,
    colors: ["Ivory", "Gold", "Blush"],
    sizes: ["S", "M", "L"],
    description: d.description || "",
    priority: d.priority !== undefined ? d.priority : 99999,
  };
};

export function useProducts(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [list, setList] = useState<Product[]>(staticProducts);
  const [dbList, setDbList] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/products?limit=100");
      if (response?.success && response?.data?.products) {
        const rows = response.data.products as DBProduct[];
        setDbList(rows);
        const mapped = rows.map(dbToProduct);
        // Merge: DB products first, then static (skip static if slug exists in db)
        const dbSlugs = new Set(rows.map((r) => r.slug));
        const merged = [...mapped, ...staticProducts.filter((p) => !dbSlugs.has(p.slug))];
        setList(merged);
        
        if (typeof window !== "undefined") {
          localStorage.setItem("giftcy_products_db_list", JSON.stringify(rows));
          localStorage.setItem("giftcy_products_list", JSON.stringify(merged));
        }
      }
    } catch (err) {
      console.error("Error loading products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [opts.onlyActive]);

  return { products: list, dbProducts: dbList, loading, reload: load };
}
