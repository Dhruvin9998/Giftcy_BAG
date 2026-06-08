import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/shop")({
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
  const [occasion, setOccasion] = useState("All");
  const { products } = useProducts();

  const filtered = occasion === "All" ? products : products.filter((p) => p.occasion === occasion);
  const dup = filtered;

  return (
    <>
      <section className="bg-cream py-16 lg:py-24 border-b border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 text-center">
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">The Collection</p>
          <h1 className="serif text-5xl lg:text-7xl mt-3">Premium Gift Bags</h1>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Discover our full range of handcrafted reusable fabric bags for every occasion.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-28 lg:self-start space-y-8">
          <div>
            <h3 className="serif text-xl mb-4 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-gold" /> Filters</h3>
            <div className="gold-divider mb-6" />
          </div>

          <FilterGroup title="Occasion">
            <div className="space-y-2">
              {occasions.map((o) => (
                <label key={o} className="flex items-center gap-3 cursor-pointer text-sm">
                  <input
                    type="radio"
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
                <button key={c} className="px-3 py-1.5 rounded-full border border-border text-xs hover:border-foreground transition">
                  {c}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Size">
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button key={s} className="h-9 w-9 rounded-full border border-border text-xs hover:border-foreground transition">
                  {s}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Price">
            <input type="range" min={100} max={1000} className="w-full accent-foreground" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>₹100</span><span>₹1,000</span>
            </div>
          </FilterGroup>
        </aside>

        {/* GRID */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">{dup.length} products</p>
            <select className="text-sm bg-transparent border border-border rounded-full px-4 py-2">
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8">
            {dup.map((p, i) => <ProductCard key={`${p.slug}-${i}`} product={p} index={i} />)}
          </div>
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
