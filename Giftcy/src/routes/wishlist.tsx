import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Your Wishlist — Giftcy" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, toggle, loading } = useWishlist();
  const { add } = useCart();

  const handleAddAllToCart = async () => {
    if (items.length === 0) return;
    toast.info("Adding all items to cart...");
    for (const item of items) {
      await add(item, { qty: 1 });
    }
    toast.success("All items added to cart!");
  };

  if (loading) {
    return (
      <div className="py-32 text-center text-muted-foreground">
        <span className="serif text-xl animate-pulse">Loading your wishlist...</span>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-10 py-14 lg:py-20">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-10">
        <div>
          <h1 className="serif text-4xl lg:text-5xl">Your Wishlist</h1>
          <p className="text-muted-foreground mt-2">
            {items.length} item{items.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" /> Move all to cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center max-w-md mx-auto py-16 px-6 glass rounded-[2rem] border border-border/60">
          <p className="serif text-2xl text-foreground">Your wishlist is empty.</p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Explore our curated collections of premium reusable fabric bags and save your favorites here.
          </p>
          <Link
            to="/shop"
            className="mt-8 group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:bg-foreground/90 transition text-sm tracking-wide"
          >
            Discover the Collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((product) => {
            const off = product.mrp > product.price 
              ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
              : 0;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-background border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-soft transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {off > 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold text-white text-[10px] font-semibold tracking-wider uppercase">
                      {off}% OFF
                    </span>
                  )}
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => toggle(product)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive shadow-sm hover:scale-105 transition-all"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Details Container */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-gold font-medium">
                      {product.category}
                    </span>
                    <h3 className="serif text-lg font-medium mt-1 leading-tight group-hover:text-gold transition-colors">
                      <Link to="/products/$slug" params={{ slug: product.slug }}>
                        {product.name}
                      </Link>
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="serif text-base font-semibold text-foreground">₹{product.price}</span>
                      {product.mrp > product.price && (
                        <span className="text-xs text-muted-foreground line-through">₹{product.mrp}</span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    onClick={() => add(product, { qty: 1 })}
                    className="w-full mt-4 py-2.5 rounded-full border border-foreground hover:bg-foreground hover:text-background transition-all text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
