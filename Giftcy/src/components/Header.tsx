import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, LayoutDashboard, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useWishlist } from "./WishlistContext";
import { apiClient } from "@/lib/apiClient";
import { useProducts } from "@/lib/useProducts";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { count, setOpen: setCart } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { products } = useProducts();
  const [settings, setSettings] = useState<any>(null);
  const navigate = useNavigate();

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
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:text-gold transition-colors"
              aria-label="Search"
            >
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

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-md flex flex-col justify-start animate-in fade-in duration-300">
          <div className="mx-auto max-w-4xl w-full px-6 py-6 flex flex-col h-full overflow-hidden">
            {/* Header close button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 rounded-full hover:bg-cream/50 text-foreground transition-all duration-200"
                aria-label="Close search"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Input form */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="Search premium gift bags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full text-2xl lg:text-4xl serif outline-none bg-transparent text-foreground border-b border-gold/30 pb-4 focus:border-gold transition-colors placeholder:text-muted-foreground/30 pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    navigate({ to: "/shop", search: { search: searchQuery.trim() } });
                    setSearchOpen(false);
                  }
                }}
              />
              <Search className="absolute right-2 top-2 h-6 w-6 text-muted-foreground/50" />
            </div>

            {/* Popular/Recent Searches & Live Results */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-none">
              {searchQuery.trim() === "" ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-semibold">Popular Searches</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {["Potli Bags", "Wedding Gift Bags", "Return Gift Bags", "Custom Printed Bags", "Silk", "Linen"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-4 py-2 rounded-full bg-cream hover:bg-gold hover:text-white transition duration-200 text-sm border border-border/50 text-foreground/80 font-medium"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-semibold font-sans">Shop by Occasion</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: "Weddings & Ceremonies", label: "Wedding", bg: "bg-cream/40" },
                        { name: "Birthdays & Parties", label: "Birthday", bg: "bg-cream/40" },
                        { name: "Festivals & Celebrations", label: "Festive", bg: "bg-cream/40" },
                        { name: "Corporate Favors", label: "Corporate", bg: "bg-cream/40" }
                      ].map((occ) => (
                        <Link
                          key={occ.label}
                          to="/shop"
                          search={{ search: undefined } as any}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className={`p-4 rounded-xl ${occ.bg} hover:border-gold hover:shadow-luxury border border-border/40 transition-all duration-200 block group`}
                        >
                          <span className="serif text-base block group-hover:text-gold transition-colors">{occ.name}</span>
                          <span className="text-xs text-muted-foreground">Explore collection</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest">
                      {products.filter(
                        (p) =>
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length} product{products.filter(
                        (p) =>
                          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length !== 1 ? "s" : ""} found
                    </span>
                    {products.filter(
                      (p) =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length > 0 && (
                      <Link
                        to="/shop"
                        search={{ search: searchQuery }}
                        onClick={() => setSearchOpen(false)}
                        className="text-xs text-gold font-medium hover:underline flex items-center gap-1"
                      >
                        View all in shop →
                      </Link>
                    )}
                  </div>

                  {products.filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.description.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground animate-in fade-in duration-300">
                      <p className="serif text-lg text-foreground mb-1">No matches for "{searchQuery}"</p>
                      <p className="text-sm">Try checking your spelling or looking for keywords like 'potli', 'gold', or 'bag'.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products
                        .filter(
                          (p) =>
                            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((p) => (
                          <Link
                            key={p.slug}
                            to="/products/$slug"
                            params={{ slug: p.slug }}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-cream border border-transparent hover:border-border/60 transition-all duration-200 group"
                          >
                            <div className="h-16 w-16 rounded-lg overflow-hidden bg-cream border border-border/40 shrink-0">
                              <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] tracking-[0.15em] uppercase text-gold block font-semibold">{p.category}</span>
                              <span className="serif text-base text-foreground font-medium block truncate group-hover:text-gold transition-colors">{p.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm font-semibold">₹{p.price}</span>
                                {p.mrp > p.price && (
                                  <span className="text-xs text-muted-foreground line-through">₹{p.mrp}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
