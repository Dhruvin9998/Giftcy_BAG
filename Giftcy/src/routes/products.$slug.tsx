import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ExternalLink, Heart, Minus, Plus, Share2, ShoppingBag, Truck } from "lucide-react";
import { getProduct as getStaticProduct, products, type Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/components/CartContext";
import { apiClient } from "@/lib/apiClient";
import { dbToProduct, type DBProduct } from "@/lib/useProducts";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await apiClient.get(`/products/${params.slug}`);
      if (res?.success && res?.data) {
        const product = dbToProduct(res.data as DBProduct);
        return { product };
      }
    } catch (err) {
      console.warn("Product not found in backend, falling back to static", err);
    }
    const product = getStaticProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Giftcy` },
          { name: "description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  component: PDP,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="serif text-4xl">Product not found</h1>
      <Link to="/shop" className="mt-6 inline-flex px-6 py-3 rounded-full bg-foreground text-background text-sm">Back to shop</Link>
    </div>
  ),
});

function PDP() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { add, setOpen } = useCart();
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 lg:px-10 py-8 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/shop" className="hover:text-foreground">Shop</Link> / <span className="text-foreground">{product.name}</span>
      </div>

      <section className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* GALLERY */}
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <div className="hidden lg:flex flex-col gap-3">
            {[product.image, product.image, product.image, product.image].map((src, i) => (
              <button key={i} className="aspect-square rounded-lg overflow-hidden border border-border hover:border-gold">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="col-span-2 lg:col-span-1 aspect-square rounded-2xl overflow-hidden bg-secondary">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* DETAILS */}
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">{product.category}</p>
          <h1 className="serif text-4xl lg:text-5xl mt-3 leading-tight">{product.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="serif text-3xl">₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-muted-foreground line-through">₹{product.mrp}</span>
                <span className="text-sm text-gold">{off}% off</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</p>

          <div className="gold-divider my-7" />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Amazon & Flipkart CTA */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a
              href="https://www.amazon.in/s?k=Giftcy+Bag"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full border border-border bg-background hover:border-gold hover:shadow-[0_4px_20px_rgba(201,168,76,0.15)] transition-all text-sm font-medium"
            >
              <span className="h-5 w-5 rounded bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">A</span>
              Buy on Amazon
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
            <a
              href="https://www.flipkart.com/search?q=Giftcy+Bag"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full border border-border bg-background hover:border-gold hover:shadow-[0_4px_20px_rgba(201,168,76,0.15)] transition-all text-sm font-medium"
            >
              <span className="h-5 w-5 rounded bg-[#2874f0] text-white flex items-center justify-center text-[10px] font-bold">F</span>
              Buy on Flipkart
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>

          {/* Color */}
          <div className="mt-7">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Color — <span className="text-foreground">{color}</span></p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-4 py-2 rounded-full border text-sm transition ${color === c ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Size</p>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-11 w-11 rounded-full border text-sm transition ${size === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-border rounded-full">
              <button className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></button>
              <span className="px-4 text-sm w-10 text-center">{qty}</span>
              <button className="p-3" onClick={() => setQty((q) => q + 1)}><Plus className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => add(product, { size, color, qty })}
              className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-foreground hover:bg-foreground hover:text-background transition text-sm"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button
              onClick={() => { add(product, { size, color, qty }); setOpen(true); }}
              className="flex-1 min-w-[180px] px-6 py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm"
            >
              Buy Now
            </button>
            <button className="h-12 w-12 rounded-full border border-border flex items-center justify-center hover:text-gold" aria-label="Wishlist"><Heart className="h-4 w-4" /></button>
            <button className="h-12 w-12 rounded-full border border-border flex items-center justify-center" aria-label="Share"><Share2 className="h-4 w-4" /></button>
          </div>

          {/* Delivery */}
          <div className="mt-7 rounded-2xl border border-border p-5 flex items-center gap-4">
            <Truck className="h-5 w-5 text-gold shrink-0" />
            <div>
              <p className="text-sm font-medium">Free shipping on orders above ₹999</p>
              <p className="text-xs text-muted-foreground mt-0.5">Estimated delivery: 3–6 business days</p>
            </div>
          </div>

          {/* Accordion */}
          <div className="mt-10 border-t border-border">
            {[
              { t: "Fabric & Material", c: "Premium reusable cotton-blend fabric with satin lining and gold-tone hardware." },
              { t: "Dimensions & Weight", c: "Medium: 22 × 28 cm · 80g. Other sizes available in the selector above." },
              { t: "Care Instructions", c: "Spot clean only. Store flat in a dry place. Avoid direct sunlight to preserve color." },
              { t: "Shipping & Returns", c: "Free shipping ₹999+. Easy 7-day returns on unused items in original packaging." },
            ].map((it) => (
              <Accordion key={it.t} title={it.t}>{it.c}</Accordion>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 py-20 lg:py-28">
        <h2 className="serif text-3xl lg:text-4xl mb-10">You may also love</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
          {related.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      </section>
    </>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full py-5 flex items-center justify-between text-left">
        <span className="serif text-lg">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-5 text-sm text-muted-foreground leading-relaxed">{children}</div>}
    </div>
  );
}
