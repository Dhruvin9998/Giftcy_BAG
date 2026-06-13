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

  return {
    id: d._id,
    slug: d.slug || "",
    name: d.name || "Unnamed Product",
    category: typeof d.category === "object" && d.category ? d.category.name : (d.category || "Bags"),
    occasion: d.occasion || "Wedding",
    price: isNaN(priceVal) ? 0 : priceVal,
    mrp: isNaN(comparePriceVal) ? priceVal : comparePriceVal,
    image: d.images?.[0] || fallbackImage,
    images: d.images && d.images.length > 0 ? d.images : [d.images?.[0] || fallbackImage],
    badge: d.isBestSeller ? "Bestseller" : d.isNewArrival ? "New" : undefined,
    colors: ["Ivory", "Gold", "Blush"],
    sizes: ["S", "M", "L"],
    description: d.description || "",
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
