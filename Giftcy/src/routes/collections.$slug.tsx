import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useProducts, dbToProduct } from "@/lib/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { apiClient } from "@/lib/apiClient";

// Import collection assets
import weddingImg from "@/assets/collection-wedding.jpg";
import festiveImg from "@/assets/collection-festive.jpg";
import returnImg from "@/assets/collection-return.jpg";
import birthdayImg from "@/assets/collection-birthday.jpg";
import fabricImg from "@/assets/fabric-detail.jpg";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const title = getCollectionMeta(params.slug).title;
    return {
      meta: [
        { title: `${title} — Giftcy` },
        { name: "description", content: `Explore our premium range of handcrafted reusable fabric bags for ${title}.` },
      ],
    };
  },
  component: CollectionPage,
});

// Meta Helper mapping slug to human-readable names and images
function getCollectionMeta(slug: string) {
  const norm = slug.toLowerCase();
  switch (norm) {
    case "wedding":
    case "wedding-gift-bags":
      return { title: "Wedding Gift Bags", img: weddingImg, desc: "An opulent collection of shagun envelopes, potlis, and premium trousseau packaging to match your big day perfectly." };
    case "festive":
    case "festive-bags":
      return { title: "Festive Collection", img: festiveImg, desc: "Celebrate Diwali, Eid, Christmas, and traditional festivals with luxurious silk, brocade, and velvet gift bags." };
    case "return-gifts":
    case "return-gift-bags":
      return { title: "Return Gift Bags", img: returnImg, desc: "Delight your guests with elegant, reusable favors designed for weddings, anniversaries, and housewarming ceremonies." };
    case "birthday":
    case "birthday-bags":
      return { title: "Birthday & Favors", img: birthdayImg, desc: "Vibrant, playful, and premium fabric pouches and sacks for birthdays, baby showers, and intimate get-togethers." };
    case "potli-bags":
      return { title: "Luxury Potli Bags", img: festiveImg, desc: "Handcrafted traditional drawstrings finished with ornate tassels, pearls, and embroidery for ethnic celebrations." };
    case "custom-printed-bags":
      return { title: "Custom Printed Bags", img: fabricImg, desc: "Bespoke linen and cotton totes personalized with custom foils, monograms, and logos for corporate and family events." };
    default:
      return { title: "Curated Collection", img: fabricImg, desc: "Handcrafted reusable fabric gift bags designed to elevate your gifting experience." };
  }
}

const colors = ["Ivory", "Gold", "Blush", "Beige", "Cream"];
const sizes = ["S", "M", "L", "XL"];

function CollectionPage() {
  const { slug } = Route.useParams();
  const { products, loading: productsLoading } = useProducts();
  const [collectionData, setCollectionData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setDbLoading(true);
      try {
        const res = await apiClient.get(`/collections/${slug}`);
        if (res?.success && res?.data) {
          setCollectionData(res.data);
        } else {
          setCollectionData(null);
        }
      } catch (err) {
        console.error("Failed to load DB collection, using legacy fallback", err);
        setCollectionData(null);
      } finally {
        setDbLoading(false);
      }
    })();
  }, [slug]);

  const dbMeta = collectionData ? {
    title: collectionData.name,
    img: collectionData.image || fabricImg,
    desc: collectionData.description || "Handcrafted reusable fabric gift bags designed to elevate your gifting experience."
  } : null;

  const meta = dbMeta || getCollectionMeta(slug);

  // Filters State
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sort, setSort] = useState<string>("featured");

  // Determine product source
  const sourceProducts = collectionData?.products
    ? (collectionData.products as any[]).map(dbToProduct)
    : products;

  // Filtering Logic
  const filteredProducts = sourceProducts.filter((p) => {
    // 1. Slug occurence / Category match (only if not loaded directly from DB collection)
    if (!collectionData) {
      const normalizedSlug = slug.toLowerCase();
      const isCategoryMatch = p.category.toLowerCase().includes(normalizedSlug.replace("-bags", "")) ||
                              normalizedSlug.includes(p.category.toLowerCase().replace(" bags", "").replace(" gift", "").replace(" printed", ""));
      const isOccasionMatch = p.occasion.toLowerCase() === normalizedSlug || 
                              (normalizedSlug === "wedding-gift-bags" && p.occasion.toLowerCase() === "wedding") ||
                              (normalizedSlug === "festive-bags" && p.occasion.toLowerCase() === "festive") ||
                              (normalizedSlug === "birthday-bags" && p.occasion.toLowerCase() === "birthday");
      
      if (!isCategoryMatch && !isOccasionMatch) return false;
    }

    // 2. Color Filter
    if (selectedColor && !p.colors.includes(selectedColor)) return false;

    // 3. Size Filter
    if (selectedSize && !p.sizes.includes(selectedSize)) return false;

    // 4. Price Filter
    if (p.price > maxPrice) return false;

    return true;
  });

  // Sorting Logic stably preserving API/original order for equal criteria
  const sortedProducts = [...filteredProducts]
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

  const loading = dbLoading && productsLoading;

  return (
    <>
      {/* Dynamic Curated Hero Banner */}
      <section className="relative h-[40vh] sm:h-[50vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-black/45 z-10" />
        <img
          src={meta.img}
          alt={meta.title}
          className="absolute inset-0 w-full h-full object-cover select-none"
        />

        {/* Banner Details Card */}
        <div className="relative mx-auto max-w-4xl px-5 text-center text-white z-20 space-y-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-gold hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
          </Link>
          <h1 className="serif text-4xl sm:text-6xl tracking-wide">{meta.title}</h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-200/90 leading-relaxed font-light">
            {meta.desc}
          </p>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-[260px_1fr] gap-10">
        
        {/* FILTER SIDEBAR */}
        <aside className="lg:sticky lg:top-28 lg:self-start space-y-8">
          <div>
            <h3 className="serif text-xl mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gold" /> Filter Bags
            </h3>
            <div className="gold-divider mb-6" />
          </div>

          {/* Color filter */}
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

          {/* Size filter */}
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

          {/* Price filter */}
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
          {(selectedColor || selectedSize || maxPrice < 1000) && (
            <button
              onClick={() => {
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

        {/* PRODUCT GRID */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""} found
            </p>
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
          ) : sortedProducts.length === 0 ? (
            <div className="py-24 text-center max-w-md mx-auto">
              <p className="serif text-xl">No products match your filters.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or resetting the price sliders.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8 animate-in fade-in duration-300">
              {sortedProducts.map((p, i) => (
                <ProductCard key={`${p.slug}-${i}`} product={p} index={i} />
              ))}
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
