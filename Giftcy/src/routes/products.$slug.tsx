import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Heart, Minus, Plus, Share2, ShoppingBag, Truck } from "lucide-react";
import { getProduct as getStaticProduct, products, type Product } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useAuth } from "@/components/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { useProducts, dbToProduct, type DBProduct } from "@/lib/useProducts";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    try {
      const res = await apiClient.get(`/products/${params.slug}`);
      if (res?.success && res?.data) {
        const product = dbToProduct(res.data as DBProduct);
        return { product };
      }
    } catch (err) {
      console.error("Product not found in backend", err);
    }
    throw notFound();
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
  const { toggle, has } = useWishlist();
  const { user } = useAuth();
  const isWishlisted = has(product.id);
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.clientWidth * index,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index !== activeIndex && index >= 0 && index < images.length) {
      setActiveIndex(index);
    }
  };

  const nextSlide = () => {
    const nextIndex = (activeIndex + 1) % images.length;
    scrollToSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = (activeIndex - 1 + images.length) % images.length;
    scrollToSlide(prevIndex);
  };
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "loading" | "available" | "unavailable">("idle");
  const [pincodeSettings, setPincodeSettings] = useState<{ mode: string; pincodes: string } | null>(null);

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchPincodeSettings = async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data?.pincode_settings) {
          setPincodeSettings(res.data.pincode_settings);
        }
      } catch (err) {
        console.error("Failed to load pincode settings", err);
      }
    };
    fetchPincodeSettings();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    setPincode("");
    setPincodeStatus("idle");
    fetchReviews();
  }, [product]);

  const fetchReviews = async () => {
    if (!product.id) return;
    setLoadingReviews(true);
    try {
      const res = await apiClient.get(`/reviews/${product.id}`);
      if (res?.success && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    setPincodeStatus("loading");

    const mode = pincodeSettings?.mode || "blacklist";
    const listStr = pincodeSettings?.pincodes || "7, 8";
    const patterns = listStr
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    setTimeout(() => {
      const isMatched = patterns.some((pattern) => pincode.startsWith(pattern));
      let available = false;
      if (mode === "whitelist") {
        available = isMatched;
      } else {
        available = !isMatched;
      }

      if (available) {
        setPincodeStatus("available");
      } else {
        setPincodeStatus("unavailable");
      }
    }, 600);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.id) return;
    if (!comment.trim()) return toast.error("Please enter a comment");
    setSubmittingReview(true);
    try {
      const res = await apiClient.post(`/reviews/${product.id}`, { rating, comment });
      if (res?.success) {
        toast.success("Review submitted successfully!");
        setComment("");
        setRating(5);
        fetchReviews();
      } else {
        toast.error(res.message || "Failed to submit review");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review. Note: Reviews require a delivered purchase of this product.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const { products: dbProductsList } = useProducts();
  const related = dbProductsList.filter((p) => p.slug !== product.slug).slice(0, 4);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    } else {
      toast.error("Clipboard copy not supported on this browser.");
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 lg:px-10 py-8 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/shop" className="hover:text-foreground">Shop</Link> / <span className="text-foreground">{product.name}</span>
      </div>

      <section className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* GALLERY */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr] gap-4 relative group/gallery">
            {/* Desktop Thumbnails */}
            <div className="hidden lg:flex flex-col gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`aspect-square rounded-lg overflow-hidden border transition ${
                    activeIndex === i ? "border-gold shadow-sm ring-1 ring-gold" : "border-border hover:border-gold"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Carousel Wrapper */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
              {/* Scrollable container */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((src, i) => (
                  <div key={i} className="h-full w-full shrink-0 snap-center">
                    <img src={src} alt={`${product.name} - ${i + 1}`} className="h-full w-full object-cover select-none" />
                  </div>
                ))}
              </div>

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white hover:scale-115 active:scale-90 transition-all duration-200 cursor-pointer drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.55)]"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white hover:scale-115 active:scale-90 transition-all duration-200 cursor-pointer drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.55)]"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Dots Indicator under the main image */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === i ? "w-6 bg-gold" : "w-2 bg-border hover:bg-gold/45"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Mobile Thumbnails */}
          {images.length > 1 && (
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-none">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`h-16 w-16 shrink-0 rounded-lg overflow-hidden border transition ${
                    activeIndex === i ? "border-gold shadow-sm ring-1 ring-gold" : "border-border"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">{product.category}</p>
          <h1 className="serif text-4xl lg:text-5xl mt-3 leading-tight">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex text-gold text-sm">
              {[...Array(5)].map((_, i) => (
                <span key={i}>{i < Math.round(Number(avgRating)) ? "★" : "☆"}</span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
          </div>

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
            <button
              onClick={() => toggle(product)}
              className={`h-12 w-12 rounded-full border flex items-center justify-center transition-all ${
                isWishlisted ? "border-gold text-gold bg-gold/5" : "border-border hover:border-foreground text-muted-foreground"
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-gold" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="h-12 w-12 rounded-full border border-border flex items-center justify-center hover:border-foreground text-muted-foreground hover:text-foreground transition-all"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Delivery */}
          <div className="mt-7 rounded-2xl border border-border p-5 flex items-center gap-4">
            <Truck className="h-5 w-5 text-gold shrink-0" />
            <div>
              <p className="text-sm font-medium">Free shipping on orders above ₹999</p>
              <p className="text-xs text-muted-foreground mt-0.5">Estimated delivery: 3–6 business days</p>
            </div>
          </div>

          {/* Pincode Availability Checker */}
          <div className="mt-5 rounded-2xl border border-border p-5 bg-cream/10">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Check Delivery Availability</h4>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="flex-1 px-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-gold bg-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90"
              >
                {pincodeStatus === "loading" ? "Checking..." : "Check"}
              </button>
            </form>
            {pincodeStatus === "available" && (
              <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1">
                <span>🟢</span> Delivery Available! Expected delivery: 3–5 business days. COD available.
              </p>
            )}
            {pincodeStatus === "unavailable" && (
              <p className="text-xs text-destructive font-medium mt-2 flex items-center gap-1">
                <span>🔴</span> Sorry, standard delivery is currently unavailable to this pincode.
              </p>
            )}
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

      {/* REVIEWS SECTION */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 py-16 border-t border-border mt-16">
        <div className="grid lg:grid-cols-[320px_1fr] gap-10 lg:gap-16">
          {/* Summary Ratings Column */}
          <div className="space-y-6">
            <div>
              <h2 className="serif text-3xl font-semibold text-foreground">Customer Reviews</h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-4xl font-bold font-serif text-foreground">{avgRating}</span>
                <div>
                  <div className="flex text-gold text-lg">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < Math.round(Number(avgRating)) ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{reviews.length} rating{reviews.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
            
            {/* Stars breakdown */}
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="w-10 hover:text-foreground transition cursor-pointer">{stars} star</span>
                    <div className="flex-1 h-2 bg-cream rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right font-medium">{Math.round(percentage)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List & Write Review Column */}
          <div className="space-y-10">
            {/* Write a Review Section */}
            {user ? (
              <div className="rounded-3xl border border-border p-6 lg:p-8 bg-cream/10 shadow-sm animate-in fade-in duration-200">
                <h3 className="serif text-xl mb-4 font-semibold text-foreground">Write a customer review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 block">Rating</label>
                    <div className="flex gap-1.5 text-2xl text-gold">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="hover:scale-110 transition-transform active:scale-95"
                        >
                          {star <= rating ? "★" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 block">Review comment</label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike? How was the fabric quality?"
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:outline-none focus:border-gold text-sm placeholder:text-muted-foreground/45 transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-3 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting Review..." : "Submit Review"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground bg-cream/5">
                <p className="text-sm">Please <Link to="/auth" search={{ tab: "login" }} className="text-gold font-medium hover:underline">sign in</Link> to write a customer review.</p>
              </div>
            )}

            {/* List */}
            <div className="space-y-6">
              <h3 className="serif text-xl font-semibold mb-4 text-foreground border-b border-border/60 pb-2">Customer Feedback</h3>
              {loadingReviews ? (
                <div className="py-8 text-center text-muted-foreground text-sm animate-pulse">Loading feedback...</div>
              ) : reviews.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <p className="serif text-lg text-foreground mb-1">No reviews yet</p>
                  <p className="text-xs">Be the first to review this product after your purchase!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-border/50 pb-6 last:border-b-0 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gold/15 text-gold flex items-center justify-center text-xs font-bold font-serif uppercase">
                            {(r.name || "Customer").slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground block">{r.name || "Customer"}</span>
                            <div className="flex text-gold text-xs mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed pl-10 pr-2">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
