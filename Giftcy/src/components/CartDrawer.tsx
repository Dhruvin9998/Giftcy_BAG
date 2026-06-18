import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "./CartContext";

export function CartDrawer() {
  const { open, setOpen, items, remove, updateQty, subtotal } = useCart();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40 animate-in fade-in" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[440px] bg-background shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="serif text-2xl">Your Cart</h3>
          <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <p className="serif text-xl">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-2">Discover our premium gifting collection.</p>
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="mt-6 px-6 py-3 rounded-full bg-foreground text-background text-sm hover:bg-foreground/90"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {items.map((it) => (
                <div key={it.product.slug} className="flex gap-4">
                  <img
                    src={it.product.image}
                    alt={it.product.name}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; }}
                    className="h-24 w-24 rounded-lg object-cover bg-secondary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="serif text-lg leading-tight">{it.product.name}</p>
                      <button onClick={() => remove(it.product.slug)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground">{it.product.category}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-full">
                        <button className="p-1.5" onClick={() => updateQty(it.product.slug, it.qty - 1)}><Minus className="h-3 w-3" /></button>
                        <span className="px-3 text-sm">{it.qty}</span>
                        <button className="p-1.5" onClick={() => updateQty(it.product.slug, it.qty + 1)}><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="font-medium">₹{it.product.price * it.qty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping & taxes calculated at checkout.</p>
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="block text-center w-full py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition text-sm tracking-wide"
              >
                Checkout — ₹{subtotal}
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
