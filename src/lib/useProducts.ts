import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { products as staticProducts, type Product } from "./products";

export type DBProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  occasion: string;
  description: string;
  price: number;
  mrp: number;
  discount_percent: number;
  image_url: string | null;
  badge: string | null;
  colors: string[];
  sizes: string[];
  stock: number;
  active: boolean;
  amazon_url: string | null;
  flipkart_url: string | null;
  created_at: string;
};

export const dbToProduct = (d: DBProduct): Product => ({
  slug: d.slug,
  name: d.name,
  category: d.category,
  occasion: d.occasion,
  price: Number(d.price),
  mrp: Number(d.mrp),
  image: d.image_url || staticProducts[0].image,
  badge: (d.badge as Product["badge"]) ?? undefined,
  colors: d.colors?.length ? d.colors : ["Ivory"],
  sizes: d.sizes?.length ? d.sizes : ["M"],
  description: d.description,
});

export function useProducts(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [list, setList] = useState<Product[]>(staticProducts);
  const [dbList, setDbList] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (opts.onlyActive) q = q.eq("active", true);
    const { data } = await q;
    const rows = (data ?? []) as DBProduct[];
    setDbList(rows);
    const mapped = rows.map(dbToProduct);
    // Merge: DB products first, then static (skip static if slug exists in db)
    const dbSlugs = new Set(rows.map((r) => r.slug));
    const merged = [...mapped, ...staticProducts.filter((p) => !dbSlugs.has(p.slug))];
    setList(merged);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [opts.onlyActive]);

  return { products: list, dbProducts: dbList, loading, reload: load };
}
