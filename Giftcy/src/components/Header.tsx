import { Link } from "@tanstack/react-router";
import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useWishlist } from "./WishlistContext";
import { apiClient } from "@/lib/apiClient";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/customize", label: "Customize" },
  { to: "/bulk", label: "Bulk Order" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { count, setOpen: setCart } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings in header", err);
      }
    })();
  }, []);

  const brandName = settings?.general_settings?.brandName || "Giftcy";
  const logoUrl = settings?.general_settings?.logoUrl;

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="flex h-16 lg:h-20 items-center justify-between gap-6">
          <button className="lg:hidden -ml-2 p-2" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-8 w-auto max-h-12 object-contain" />
            ) : (
              <span className="serif text-2xl lg:text-3xl font-semibold tracking-tight">
                {brandName}
                <span className="text-gold text-lg leading-none">.</span>
              </span>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gold after:transition-all hover:after:w-full"
                activeProps={{ className: "text-foreground after:w-full" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-sm tracking-wide text-gold font-medium flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1 relative">
            <button className="p-2 hover:text-gold transition-colors" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <button
                className="p-2 hover:text-gold transition-colors"
                aria-label="Account"
                onClick={() => setMenu((v) => !v)}
              >
                <User className="h-5 w-5" />
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-background shadow-luxury p-2 z-50">
                    {user ? (
                      <>
                        <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
                        <Link to="/account" onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-cream">
                          <User className="h-4 w-4" /> My Account
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-cream">
                            <LayoutDashboard className="h-4 w-4" /> Admin panel
                          </Link>
                        )}
                        <button onClick={() => { setMenu(false); signOut(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-cream text-left">
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/auth" onClick={() => setMenu(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-cream">Sign in</Link>
                        <Link to="/auth" search={{ tab: "signup" } as never} onClick={() => setMenu(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-cream">Create account</Link>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <Link
              to="/wishlist"
              className="p-2 hover:text-gold transition-colors relative hidden sm:block"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center animate-in zoom-in duration-200">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <button
              className="p-2 hover:text-gold transition-colors relative"
              aria-label="Cart"
              onClick={() => setCart(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[10px] font-medium flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[78%] max-w-sm bg-background p-6 shadow-2xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-8">
              <span className="serif text-2xl font-semibold">{brandName}</span>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col gap-1">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-3 border-b border-border serif text-xl">
                  {n.label}
                </Link>
              ))}
              <Link
                to="/wishlist"
                onClick={() => setOpen(false)}
                className="py-3 border-b border-border serif text-xl flex items-center justify-between hover:text-gold transition-colors"
              >
                <span>Wishlist</span>
                {wishlistItems.length > 0 && (
                  <span className="h-5 min-w-5 px-2 rounded-full bg-foreground text-background text-xs font-semibold flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="py-3 border-b border-border serif text-xl text-gold">Admin</Link>
              )}
              {user && (
                <Link to="/account" onClick={() => setOpen(false)} className="py-3 border-b border-border serif text-xl block">My Account</Link>
              )}
              {!user ? (
                <Link to="/auth" onClick={() => setOpen(false)} className="py-3 serif text-xl">Sign in</Link>
              ) : (
                <button onClick={() => { setOpen(false); signOut(); }} className="py-3 serif text-xl text-left w-full block">Sign out</button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
