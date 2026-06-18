import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Minus, Plus, ShoppingBag, X, Heart, ExternalLink } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";

type QuickViewDialogProps = {
  product: Product;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function QuickViewDialog({ product, open, setOpen }: QuickViewDialogProps) {
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);

  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const wishlisted = has(product.id);

  const handleAddToCart = async () => {
    await add(product, { size, color, qty });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl w-[92vw] p-0 overflow-hidden bg-background rounded-3xl border border-border shadow-luxury">
        <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
        <DialogDescription className="sr-only">Quick view modal for purchasing {product.name}</DialogDescription>
        
        {/* Close Button Override */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-50 p-2 rounded-full bg-background/80 hover:bg-background border border-border/40 hover:text-gold transition shadow-sm"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2 gap-0 max-h-[85vh] md:max-h-none overflow-y-auto">
          {/* Visual Showcase (Left) */}
          <div className="relative aspect-square md:aspect-auto bg-secondary flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; }}
              className="h-full w-full object-cover"
            />
            {off > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-gold text-white text-[10px] font-semibold tracking-wider uppercase">
                {off}% OFF
              </span>
            )}
          </div>

          {/* Details Panel (Right) */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-gold font-medium">
                  {product.category}
                </span>
                <h2 className="serif text-3xl mt-1 leading-tight text-foreground">{product.name}</h2>
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="serif text-2xl font-bold">₹{product.price}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
                    <span className="text-xs text-gold font-semibold">{off}% off</span>
                  </>
                )}
              </div>

              <div className="gold-divider" />

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Variant Selectors */}
              <div className="space-y-4">
                {/* Color Selector */}
                {product.colors.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                      Color: <strong className="text-foreground font-medium">{color}</strong>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`px-3 py-1 rounded-full border text-xs transition-all ${
                            color === c
                              ? "border-foreground bg-foreground text-background font-medium"
                              : "border-border hover:border-foreground"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {product.sizes.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                      Size: <strong className="text-foreground font-medium">{size}</strong>
                    </span>
                    <div className="flex gap-1.5">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`h-9 w-9 rounded-full border text-xs transition-all flex items-center justify-center ${
                            size === s
                              ? "border-foreground bg-foreground text-background font-medium"
                              : "border-border hover:border-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Qty & Actions */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-border rounded-full h-11 shrink-0">
                  <button className="px-3 py-2 text-muted-foreground hover:text-foreground" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm w-8 text-center select-none">{qty}</span>
                  <button className="px-3 py-2 text-muted-foreground hover:text-foreground" onClick={() => setQty((q) => q + 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggle(product)}
                  className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all ${
                    wishlisted 
                      ? "border-gold text-gold bg-gold/5" 
                      : "border-border hover:border-foreground text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-4 w-4 ${wishlisted ? "fill-gold" : ""}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 transition text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
