import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { apiClient } from "@/lib/apiClient";

export type ShopSearch = {
  search?: string;
  category?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    search: (s.search as string) || undefined,
    category: (s.category as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop Premium Gift Bags — Giftcy" },
      { name: "description", content: "Browse premium reusable fabric gift bags. Wedding, festive, return gifts, potli bags, and custom printed bags." },
    ],
  }),
  component: Shop,
});

const occasions = ["All", "Wedding", "Birthday", "Festive", "Corporate"];
const colors = ["Ivory", "Gold", "Blush", "Beige", "Cream"];
const sizes = ["S", "M", "L", "XL"];

function Shop() {
  const { search, category } = Route.useSearch();
  const [occasion, setOccasion] = useState("All");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sort, setSort] = useState<string>("featured");
  const { products, loading } = useProducts();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/categories");
        if (res?.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error("Failed to load categories in shop", err);
      }
    })();
  }, []);

  const currentCategory = category
    ? categories.find((c) => c.slug.toLowerCase() === category.toLowerCase())
    : null;

  // Filter products based on active filters
  const filtered = products.filter((p) => {
    // Category Filter (from URL query param)
    if (category) {
      const catName = currentCategory ? currentCategory.name : category;
      const normalizedCat = catName.toLowerCase().replace(/-bags$/, "").replace(/s$/, ""); // normalize
      const pCat = p.category.toLowerCase().replace(/-bags$/, "").replace(/s$/, "");
      if (!pCat.includes(normalizedCat) && !normalizedCat.includes(pCat)) {
        return false;
      }
    }

    // 0. Search Query Filter
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.category.toLowerCase().includes(search.toLowerCase()) &&
      !p.description.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // 1. Occasion Filter
    if (occasion !== "All" && p.occasion !== occasion) return false;

    // 2. Color Filter
    if (selectedColor && !p.colors.includes(selectedColor)) return false;

    // 3. Size Filter
    if (selectedSize && !p.sizes.includes(selectedSize)) return false;

    // 4. Price Filter
    if (p.price > maxPrice) return false;

    return true;
  });

  // Sort products stably preserving API/original order for equal criteria
  const sorted = [...filtered]
    .map((p, idx) => ({ p, idx }))
    .sort((a, b) => {
      if (sort === "low-high") return a.p.price - b.p.price;
      if (sort === "high-low") return b.p.price - a.p.price;
      if (sort === "newest") {
        if (a.p.badge === "New" && b.p.badge !== "New") return -1;
        if (a.p.badge !== "New" && b.p.badge === "New") return 1;
        return a.idx - b.idx;
      }
      
      // Default featured sort: by priority (lower value first)
      const priorityDiff = (a.p.priority ?? 99999) - (b.p.priority ?? 99999);
      if (priorityDiff !== 0) return priorityDiff;
      
      // If priorities are equal, place Bestsellers first
      if (a.p.badge === "Bestseller" && b.p.badge !== "Bestseller") return -1;
      if (a.p.badge !== "Bestseller" && b.p.badge === "Bestseller") return 1;
      
      // Fallback to original API response order (which has newer items first)
      return a.idx - b.idx;
    })
    .map(({ p }) => p);

  const heroTitle = currentCategory ? currentCategory.name : "Premium Gift Bags";
  const heroSubtitle = currentCategory ? "The Category" : "The Collection";
  const heroDesc = currentCategory
    ? `Discover our range of premium ${currentCategory.name.toLowerCase()}.`
    : "Discover our full range of handcrafted reusable fabric bags for every occasion.";

  return (
    <>
      <section className="relative py-16 lg:py-24 border-b border-border overflow-hidden bg-cream">
        {currentCategory?.image && (
          <>
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={currentCategory.image}
              alt={currentCategory.name}
              className="absolute inset-0 w-full h-full object-cover select-none"
            />
          </>
        )}
        <div className={`relative mx-auto max-w-7xl px-5 lg:px-10 text-center ${currentCategory?.image ? "text-white z-20" : "text-foreground"}`}>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">{heroSubtitle}</p>
          <h1 className="serif text-5xl lg:text-7xl mt-3">{heroTitle}</h1>
          <p className={`mt-4 max-w-xl mx-auto ${currentCategory?.image ? "text-gray-200/90" : "text-muted-foreground"}`}>
            {heroDesc}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-28 lg:self-start space-y-8">
          <div>
            <h3 className="serif text-xl mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gold" /> Filters
            </h3>
            <div className="gold-divider mb-6" />
          </div>

          <FilterGroup title="Occasion">
            <div className="space-y-2">
              {occasions.map((o) => (
                <label key={o} className="flex items-center gap-3 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="occasion"
                    checked={occasion === o}
                    onChange={() => setOccasion(o)}
                    className="accent-foreground"
                  />
                  {o}
                </label>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Color">
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(selectedColor === c ? null : c)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition ${
                    selectedColor === c 
                      ? "border-foreground bg-foreground text-background" 
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Size">
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                  className={`h-9 w-9 rounded-full border text-xs transition ${
                    selectedSize === s 
                      ? "border-foreground bg-foreground text-background" 
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Price Limit">
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-foreground cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>₹100</span>
              <span className="font-semibold text-foreground">Up to ₹{maxPrice}</span>
              <span>₹1,000</span>
            </div>
          </FilterGroup>

          {/* Reset Filters */}
          {(occasion !== "All" || selectedColor || selectedSize || maxPrice < 1000 || search || category) && (
            <button
              onClick={() => {
                setOccasion("All");
                setSelectedColor(null);
                setSelectedSize(null);
                setMaxPrice(1000);
              }}
              className="w-full py-2.5 rounded-full border border-dashed border-gold text-gold hover:bg-gold hover:text-white transition text-xs font-medium"
            >
              Clear Active Filters
            </button>
          )}
        </aside>

        {/* GRID */}
        <div>
          {category && (
            <div className="mb-6 p-4 rounded-xl bg-cream border border-border flex items-center justify-between animate-in slide-in-from-top duration-300">
              <p className="text-sm">
                Showing category "<span className="font-semibold text-gold">{currentCategory?.name || category}</span>"
              </p>
              <Link
                to="/shop"
                search={{ category: undefined, search }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Clear Category Filter
              </Link>
            </div>
          )}

          {search && (
            <div className="mb-6 p-4 rounded-xl bg-cream border border-border flex items-center justify-between animate-in slide-in-from-top duration-300">
              <p className="text-sm">
                Showing results for "<span className="font-semibold text-gold">{search}</span>"
              </p>
              <Link
                to="/shop"
                search={{ search: undefined, category }}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Clear Search
              </Link>
            </div>
          )}
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">{sorted.length} product{sorted.length !== 1 ? "s" : ""}</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm bg-transparent border border-border rounded-full px-4 py-2 focus:border-gold outline-none"
            >
              <option value="featured">Featured / Bestsellers</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>

          {loading ? (
            <div className="py-24 text-center text-muted-foreground">Loading products...</div>
          ) : sorted.length === 0 ? (
            <div className="py-24 text-center max-w-md mx-auto">
              <p className="serif text-xl">No products match your filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or resetting the price sliders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8 animate-in fade-in duration-300">
              {sorted.map((p, i) => <ProductCard key={`${p.slug}-${i}`} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">{title}</h4>
      {children}
    </div>
  );
}
