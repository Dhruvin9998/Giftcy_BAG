import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Sparkles, Truck, Heart } from "lucide-react";
import hero from "@/assets/hero-bag.jpg";
import wedding from "@/assets/collection-wedding.jpg";
import festive from "@/assets/collection-festive.jpg";
import ret from "@/assets/collection-return.jpg";
import birthday from "@/assets/collection-birthday.jpg";
import fabric from "@/assets/fabric-detail.jpg";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Giftcy — Make Every Gift Premium" },
      { name: "description", content: "Premium reusable fabric gift bags for weddings, festivals, and luxury Indian gifting." },
    ],
  }),
  component: Home,
});

const collections = [
  { name: "Wedding", img: wedding, count: 42 },
  { name: "Festive", img: festive, count: 28 },
  { name: "Return Gifts", img: ret, count: 36 },
  { name: "Birthday", img: birthday, count: 22 },
];

const testimonials = [
  { q: "Absolutely premium quality — guests loved them at our wedding.", a: "Aditi & Rohan", role: "Mumbai" },
  { q: "Beautifully crafted, eco-friendly, and so elegant. A perfect gift.", a: "Priya Sharma", role: "Delhi" },
  { q: "Our corporate hampers felt truly luxurious thanks to Giftcy.", a: "Karthik R.", role: "Bengaluru" },
];

function Home() {
  const { products: displayProducts } = useProducts();
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 pt-10 lg:pt-20 pb-20 lg:pb-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/60 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Festive Edit '26</span>
            </div>
            <h1 className="serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl mt-6 leading-[0.95] text-balance">
              Make Every Gift <em className="text-gold not-italic font-normal">Premium</em>
            </h1>
            <p className="mt-6 text-base lg:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Reusable fabric gift bags, handcrafted in India for weddings, festivals, and life's most precious moments.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition text-sm tracking-wide"
              >
                Shop the Collection
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/bulk"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-foreground/20 hover:border-foreground transition text-sm tracking-wide"
              >
                Bulk Inquiry
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                ["50k+", "Bags gifted"],
                ["100%", "Reusable"],
                ["4.9★", "Loved by"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="serif text-3xl text-foreground">{n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-luxury">
              <img src={hero} alt="Giftcy luxury fabric gift bag" width={1600} height={1200} className="h-full w-full object-cover" />
            </div>
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 glass rounded-2xl p-5 shadow-soft hidden sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold to-gold-soft" />
                <div>
                  <div className="text-xs text-muted-foreground">Handcrafted</div>
                  <div className="serif text-lg">in India</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MARQUEE / TRUST */}
      <section className="border-y border-border bg-cream py-6">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 flex flex-wrap items-center justify-around gap-6 text-xs tracking-[0.2em] uppercase text-muted-foreground">
          {["Free Shipping ₹999+", "Reusable Fabric", "Made in India", "Bulk Pricing", "Custom Printing"].map((t) => (
            <span key={t} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-gold" /> {t}</span>
          ))}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 py-20 lg:py-28">
        <div className="flex items-end justify-between mb-10 lg:mb-14">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Shop by Occasion</p>
            <h2 className="serif text-4xl lg:text-5xl mt-3">Curated Collections</h2>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-2 text-sm hover:text-gold">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {collections.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Link to="/shop" className="group block relative aspect-[3/4] rounded-2xl overflow-hidden">
                <img src={c.img} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-background">
                  <p className="text-[10px] tracking-[0.2em] uppercase opacity-80">{c.count} pieces</p>
                  <h3 className="serif text-2xl lg:text-3xl mt-1">{c.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 pb-20 lg:pb-28">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Trending Now</p>
          <h2 className="serif text-4xl lg:text-5xl mt-3">Our Bestsellers</h2>
          <div className="gold-divider mx-auto mt-6 w-24" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
          {displayProducts.slice(0, 4).map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      </section>

      {/* FABRIC QUALITY */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-soft"
          >
            <img src={fabric} alt="Premium fabric detail" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-gold">The Giftcy Promise</p>
            <h2 className="serif text-4xl lg:text-5xl mt-3">Crafted from the finest fabrics.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed max-w-lg">
              Each Giftcy bag is sewn from premium reusable fabric — soft to the touch, beautifully finished, and made to be loved long after the gift is opened.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 gap-6">
              {[
                { i: Leaf, t: "Sustainable", d: "100% reusable, plastic-free packaging." },
                { i: Sparkles, t: "Hand-Finished", d: "Detailed stitching, premium hardware." },
                { i: Truck, t: "Pan-India", d: "Fast shipping with free returns ₹999+." },
                { i: Heart, t: "Loved by 50k+", d: "Trusted across weddings & gifting." },
              ].map(({ i: Icon, t, d }) => (
                <div key={t} className="flex gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-background border border-border flex items-center justify-center text-gold">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{t}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 py-20 lg:py-28">
        <div className="text-center mb-14">
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Loved by gifters</p>
          <h2 className="serif text-4xl lg:text-5xl mt-3">Kind words, kept close.</h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.a}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-background p-8 hover-lift"
            >
              <div className="text-gold text-2xl serif">"</div>
              <blockquote className="serif text-xl leading-snug mt-2">{t.q}</blockquote>
              <figcaption className="mt-6 pt-4 border-t border-border text-sm">
                <div className="font-medium">{t.a}</div>
                <div className="text-muted-foreground text-xs mt-0.5">{t.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 pb-24">
        <div className="rounded-[2rem] bg-gradient-to-br from-foreground to-foreground/85 text-background p-10 lg:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-gold)" }} />
          <div className="relative">
            <p className="text-[11px] tracking-[0.25em] uppercase text-gold-soft">Bulk & Custom</p>
            <h2 className="serif text-4xl lg:text-6xl mt-4 text-balance">
              Weddings, brands, and grand occasions.
            </h2>
            <p className="mt-5 text-background/70 max-w-xl mx-auto">
              Custom-printed bags, monograms, and bulk pricing for 50–50,000 units. We make your gifting unforgettable.
            </p>
            <Link
              to="/bulk"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-background text-foreground hover:bg-background/90 text-sm tracking-wide"
            >
              Start a Bulk Inquiry <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
