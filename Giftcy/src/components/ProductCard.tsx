import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useState } from "react";
import { QuickViewDialog } from "./QuickViewDialog";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const isWishlisted = has(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
      className="group"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
        <Link to="/products/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        </Link>
        {product.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] tracking-[0.15em] uppercase">
            {product.badge}
          </span>
        )}
        
        {/* Wishlist Button */}
        <button
          aria-label="Wishlist"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product); }}
          className={`absolute top-3 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center transition hover:text-gold ${
            isWishlisted ? "text-gold opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-gold" : ""}`} />
        </button>

        {/* Quick View Button */}
        <button
          aria-label="Quick View"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
          className="absolute top-14 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:text-gold"
        >
          <Eye className="h-4 w-4" />
        </button>

        {/* Quick Add Button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(product); }}
          className="absolute bottom-3 left-3 right-3 py-2.5 rounded-full bg-foreground text-background text-xs tracking-wide opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
        </button>
      </div>

      <Link to="/products/$slug" params={{ slug: product.slug }} className="block mt-4 px-1">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{product.category}</p>
        <h3 className="serif text-xl mt-1 leading-tight group-hover:text-gold transition-colors">{product.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-medium">₹{product.price}</span>
          {product.mrp > product.price && (
            <>
              <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
              <span className="text-xs text-gold">{off}% off</span>
            </>
          )}
        </div>
      </Link>

      {/* Conditionally Render Quick View Modal */}
      {quickViewOpen && (
        <QuickViewDialog
          product={product}
          open={quickViewOpen}
          setOpen={setQuickViewOpen}
        />
      )}
    </motion.div>
  );
}
