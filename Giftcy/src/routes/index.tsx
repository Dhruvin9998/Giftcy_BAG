import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Leaf,
  Sparkles,
  Truck,
  Heart,
  Shield,
  RotateCcw,
  Lock,
  Package,
  Star,
  Crown,
  Palette,
  Users,
  Instagram,
  Mail,
  ChevronRight,
} from "lucide-react";
import hero from "@/assets/hero-bag.jpg";
import wedding from "@/assets/collection-wedding.jpg";
import festive from "@/assets/collection-festive.jpg";
import ret from "@/assets/collection-return.jpg";
import birthday from "@/assets/collection-birthday.jpg";
import fabric from "@/assets/fabric-detail.jpg";
import weddingShowcase from "@/assets/wedding-showcase.png";
import festivalDiwali from "@/assets/festival-diwali.png";
import festivalEid from "@/assets/festival-eid.png";
import festivalChristmas from "@/assets/festival-christmas.png";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

export const Route = createFileRoute("/")(
  {
    head: () => ({
      meta: [
        { title: "Giftcy — Make Every Gift Premium" },
        {
          name: "description",
          content:
            "Premium reusable fabric gift bags for weddings, festivals, and luxury Indian gifting.",
        },
      ],
    }),
    component: Home,
  },
);

const collections = [
  { name: "Wedding", img: wedding, count: 42 },
  { name: "Festive", img: festive, count: 28 },
  { name: "Return Gifts", img: ret, count: 36 },
  { name: "Birthday", img: birthday, count: 22 },
];

const testimonials = [
  {
    q: "Absolutely premium quality — guests loved them at our wedding.",
    a: "Aditi & Rohan",
    role: "Mumbai",
    stars: 5,
  },
  {
    q: "Beautifully crafted, eco-friendly, and so elegant. A perfect gift.",
    a: "Priya Sharma",
    role: "Delhi",
    stars: 5,
  },
  {
    q: "Our corporate hampers felt truly luxurious thanks to Giftcy.",
    a: "Karthik R.",
    role: "Bengaluru",
    stars: 5,
  },
];

const festivals = [
  {
    name: "Diwali",
    subtitle: "Festival of Lights",
    img: festivalDiwali,
    desc: "Rich silk & brocade bags for sweets, dry fruits, and festive hampers.",
  },
  {
    name: "Eid",
    subtitle: "Celebrate Togetherness",
    img: festivalEid,
    desc: "Elegant pouches for Eidi gifts and celebration essentials.",
  },
  {
    name: "Christmas",
    subtitle: "Season of Giving",
    img: festivalChristmas,
    desc: "Velvet bags and totes for Secret Santa and holiday hampers.",
  },
];

const weddingFeatures = [
  {
    icon: Crown,
    title: "Premium Fabrics",
    desc: "Silk, satin, and brocade options",
  },
  {
    icon: Palette,
    title: "Custom Colors",
    desc: "Match your wedding theme perfectly",
  },
  {
    icon: Users,
    title: "Bulk Pricing",
    desc: "Special rates for 100+ pieces",
  },
];

const trustBadges = [
  { icon: Package, label: "50,000+", desc: "Bags Delivered" },
  { icon: Leaf, label: "100%", desc: "Reusable & Eco" },
  { icon: Truck, label: "Pan-India", desc: "Free Shipping ₹999+" },
  { icon: Lock, label: "Secure", desc: "Payment Gateway" },
  { icon: RotateCcw, label: "Easy", desc: "Returns & Exchange" },
  { icon: Shield, label: "Quality", desc: "Guaranteed" },
];

/* Instagram-style gallery images — reuse existing product/collection images */
const instaImages = [
  { src: wedding, likes: 342 },
  { src: festive, likes: 289 },
  { src: ret, likes: 421 },
  { src: birthday, likes: 178 },
  { src: fabric, likes: 563 },
  { src: hero, likes: 397 },
];

function Home() {
  const { products: displayProducts, loading } = useProducts();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [dbCollections, setDbCollections] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data) {
          setSettings(res.data);
        }
        const colRes = await apiClient.get("/collections");
        if (colRes?.success && Array.isArray(colRes.data?.collections)) {
          setDbCollections(colRes.data.collections);
        }
        const bannersRes = await apiClient.get("/banners");
        if (bannersRes?.success && Array.isArray(bannersRes.data)) {
          setBanners(bannersRes.data);
        }
      } catch (err) {
        console.error("Failed to load settings or collections or banners", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const heroBadge = settings?.homepage_hero?.badge || "Festive Edit '26";
  const heroTitle = settings?.homepage_hero?.title || "Make Every Gift Premium";
  const heroDesc = settings?.homepage_hero?.description || "Reusable fabric gift bags, handcrafted in India for weddings, festivals, and life's most precious moments.";
  const heroImage = settings?.homepage_hero?.image || hero;

  const marqueeList = settings?.homepage_marquee || [
    "Free Shipping ₹999+",
    "Reusable Fabric",
    "Made in India",
    "Bulk Pricing",
    "Custom Printing",
  ];

  const weddingPromoTitle = settings?.homepage_wedding_promo?.title || "Perfect for Your Big Day";
  const weddingPromoDesc = settings?.homepage_wedding_promo?.description || "From shagun envelopes to trousseau packaging, our wedding collection transforms every moment of your celebration into a luxurious experience. Custom monograms, matching colours, and bulk pricing available.";
  const weddingPromoImage = settings?.homepage_wedding_promo?.image || weddingShowcase;
  const weddingPromoCta = settings?.homepage_wedding_promo?.ctaText || "Explore Wedding Collection";

  const rawFestivals = settings?.homepage_festivals;
  const festivalsList = Array.isArray(rawFestivals) && rawFestivals.length > 0
    ? rawFestivals.map((rf: any, idx: number) => {
        const fallback = festivals[idx] || festivals[0];
        return {
          name: rf.name || fallback.name,
          subtitle: rf.subtitle || fallback.subtitle,
          img: rf.img || fallback.img,
          desc: rf.desc || fallback.desc
        };
      })
    : festivals;

  // Fabric Section
  const fabricBadge = settings?.homepage_fabric?.badge || "The Giftcy Promise";
  const fabricTitle = settings?.homepage_fabric?.title || "Crafted from the finest fabrics.";
  const fabricDesc = settings?.homepage_fabric?.description || "Each Giftcy bag is sewn from premium reusable fabric — soft to the touch, beautifully finished, and made to be loved long after the gift is opened.";
  const fabricImage = settings?.homepage_fabric?.image || fabric;
  const rawFabricFeatures = settings?.homepage_fabric?.features;
  const defaultFeatures = [
    { title: "Sustainable", desc: "100% reusable, plastic-free packaging." },
    { title: "Hand-Finished", desc: "Detailed stitching, premium hardware." },
    { title: "Pan-India", desc: "Fast shipping with free returns ₹999+." },
    { title: "Loved by 50k+", desc: "Trusted across weddings & gifting." }
  ];
  const fabricFeaturesList = Array.isArray(rawFabricFeatures) && rawFabricFeatures.length > 0
    ? rawFabricFeatures.map((rf: any, idx: number) => {
        const fallback = defaultFeatures[idx] || defaultFeatures[0];
        return {
          title: rf.title || fallback.title,
          desc: rf.desc || fallback.desc
        };
      })
    : defaultFeatures;

  // Testimonials Section
  const testimonialsBadge = settings?.homepage_testimonials?.badge || "Loved by gifters";
  const testimonialsTitle = settings?.homepage_testimonials?.title || "Kind words, kept close.";
  const rawTestimonials = settings?.homepage_testimonials?.list;
  const testimonialsList = Array.isArray(rawTestimonials) && rawTestimonials.length > 0
    ? rawTestimonials.map((rt: any, idx: number) => {
        const fallback = testimonials[idx] || testimonials[0];
        return {
          q: rt.quote || fallback.q,
          a: rt.author || fallback.a,
          role: rt.role || fallback.role,
          stars: rt.stars || fallback.stars || 5
        };
      })
    : testimonials;

  // Instagram Section
  const instagramBadge = settings?.homepage_instagram?.badge || "Follow Us";
  const instagramTitle = settings?.homepage_instagram?.title || "@giftcy.in";
  const instagramDesc = settings?.homepage_instagram?.description || "Tag us in your gifting moments for a chance to be featured.";
  const instagramBtnText = settings?.homepage_instagram?.buttonText || "Follow on Instagram";
  const instagramBtnUrl = settings?.homepage_instagram?.buttonUrl || "https://instagram.com/giftcy.in";
  const rawInstagramImages = settings?.homepage_instagram?.images;
  const instagramImagesList = Array.isArray(rawInstagramImages) && rawInstagramImages.length > 0
    ? rawInstagramImages.map((ri: any, idx: number) => {
        const fallback = instaImages[idx] || instaImages[0];
        return {
          src: ri.url || fallback.src,
          likes: ri.likes || fallback.likes || 0
        };
      })
    : instaImages;

  // Trust Badges Section
  const badgeIcons: { [key: string]: any } = {
    Package, Leaf, Truck, Lock, RotateCcw, Shield, Sparkles, Heart, Star, Crown, Palette, Users
  };
  const rawBadges = settings?.homepage_badges;
  const trustBadgesList = Array.isArray(rawBadges) && rawBadges.length > 0
    ? rawBadges.map((rb: any, idx: number) => {
        const fallback = trustBadges[idx] || trustBadges[0];
        const IconComponent = badgeIcons[rb.icon] || fallback.icon;
        return {
          icon: IconComponent,
          label: rb.label || fallback.label,
          desc: rb.desc || fallback.desc
        };
      })
    : trustBadges;

  // B2B CTA Section
  const ctaSubtitle = settings?.homepage_cta?.subtitle || "Bulk & Custom";
  const ctaTitle = settings?.homepage_cta?.title || "Weddings, brands, and grand occasions.";
  const ctaDesc = settings?.homepage_cta?.description || "Custom-printed bags, monograms, and bulk pricing for 50–50,000 units. We make your gifting unforgettable.";
  const ctaBtnText = settings?.homepage_cta?.buttonText || "Start a Bulk Inquiry";
  const ctaBtnUrl = settings?.homepage_cta?.buttonUrl || "/bulk";

  const homepageStats = settings?.homepage_stats || [
    { value: "50k+", label: "Bags gifted" },
    { value: "100%", label: "Reusable" },
    { value: "4.9★", label: "Loved by" }
  ];

  const sectionsOrder = settings?.homepage_layout || [
    { id: "hero", visible: true },
    { id: "marquee", visible: true },
    { id: "collections", visible: true },
    { id: "trending", visible: true },
    { id: "wedding", visible: true },
    { id: "festival", visible: true },
    { id: "fabric", visible: true },
    { id: "testimonials", visible: true },
    { id: "instagram", visible: true },
    { id: "badges", visible: true },
    { id: "newsletter", visible: true },
    { id: "cta", visible: true }
  ];

  return (
    <>
      {sectionsOrder.map((section: any) => {
        if (section.visible === false) return null;

        switch (section.id) {
          case "hero":
            const hasBanners = banners.length > 0;
            const currentTitle = hasBanners ? banners[activeBannerIdx].title : heroTitle;
            const currentSubtitle = hasBanners ? banners[activeBannerIdx].subtitle : heroDesc;
            const currentImage = hasBanners ? banners[activeBannerIdx].image : heroImage;
            const currentCtaText = hasBanners ? (banners[activeBannerIdx].ctaText || "Shop Now") : "Shop the Collection";
            const currentCtaLink = hasBanners ? (banners[activeBannerIdx].ctaLink || "/shop") : "/shop";

            return (
              <section key="hero" className="relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-5 lg:px-10 pt-10 lg:pt-20 pb-20 lg:pb-32 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                  <motion.div
                    key={`hero-content-${activeBannerIdx}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                    className="lg:col-span-6"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/60 backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5 text-gold" />
                      <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
                        {hasBanners ? `Featured Slide #${activeBannerIdx + 1}` : heroBadge}
                      </span>
                    </div>
                    <h1 className="serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl mt-6 leading-[0.95] text-balance">
                      {currentTitle}
                    </h1>
                    <p className="mt-6 text-base lg:text-lg text-muted-foreground max-w-lg leading-relaxed">
                      {currentSubtitle}
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                      <Link
                        to={currentCtaLink}
                        className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition text-sm tracking-wide"
                      >
                        {currentCtaText}
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
                      {homepageStats.map((item: any, idx: number) => (
                        <div key={idx}>
                          <div className="serif text-3xl text-foreground">{item.value}</div>
                          <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    key={`hero-img-${activeBannerIdx}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                    className="lg:col-span-6 relative animate-in fade-in zoom-in-95 duration-700"
                  >
                    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-luxury">
                      <img
                        src={currentImage}
                        alt="Giftcy luxury fabric gift bag"
                        width={1600}
                        height={1200}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Slide Selector Indicators */}
                    {hasBanners && banners.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10">
                        {banners.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            onClick={() => setActiveBannerIdx(dotIdx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              dotIdx === activeBannerIdx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/75"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -bottom-6 -left-6 glass rounded-2xl p-5 shadow-soft hidden sm:block"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gold to-gold-soft" />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Handcrafted
                          </div>
                          <div className="serif text-lg">in India</div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </section>
            );

          case "marquee":
            return (
              <section key="marquee" className="border-y border-border bg-cream py-6">
                <div className="mx-auto max-w-7xl px-5 lg:px-10 flex flex-wrap items-center justify-around gap-6 text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  {marqueeList.map((t: string) => (
                    <span key={t} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-gold" /> {t}
                    </span>
                  ))}
                </div>
              </section>
            );

          case "collections":
            const blankPlaceholder = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='100%' height='100%' fill='%23F6F4EE'/></svg>";
            const activeCollections = dbCollections.length > 0
              ? dbCollections.map((col) => ({
                  name: col.name,
                  img: col.image || blankPlaceholder,
                  count: col.productCount || 0,
                  slug: col.slug,
                }))
              : [
                  { name: "Wedding", img: blankPlaceholder, count: 0, slug: "wedding-gift-bags" },
                  { name: "Festive", img: blankPlaceholder, count: 0, slug: "festive-bags" },
                  { name: "Return Gifts", img: blankPlaceholder, count: 0, slug: "return-gift-bags" },
                  { name: "Birthday", img: blankPlaceholder, count: 0, slug: "birthday" },
                ];

            return (
              <section key="collections" className="mx-auto max-w-7xl px-5 lg:px-10 py-20 lg:py-28">
                <div className="flex items-end justify-between mb-10 lg:mb-14">
                  <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-gold">
                      Shop by Occasion
                    </p>
                    <h2 className="serif text-4xl lg:text-5xl mt-3">
                      Curated Collections
                    </h2>
                  </div>
                  <Link
                    to="/shop"
                    className="hidden sm:inline-flex items-center gap-2 text-sm hover:text-gold"
                  >
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {activeCollections.map((c, i) => (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                    >
                      <Link
                        to="/collections/$slug"
                        params={{ slug: c.slug }}
                        className="group block relative aspect-[3/4] rounded-2xl overflow-hidden"
                      >
                        <img
                          src={c.img}
                          alt={c.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5 text-background">
                          <p className="text-[10px] tracking-[0.2em] uppercase opacity-80">
                            {c.count} pieces
                          </p>
                          <h3 className="serif text-2xl lg:text-3xl mt-1">{c.name}</h3>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            );

          case "trending":
            return (
              <section key="trending" className="mx-auto max-w-7xl px-5 lg:px-10 pb-20 lg:pb-28">
                <div className="text-center mb-12">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-gold">
                    Trending Now
                  </p>
                  <h2 className="serif text-4xl lg:text-5xl mt-3">Our Bestsellers</h2>
                  <div className="gold-divider mx-auto mt-6 w-24" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
                  {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                          <div className="space-y-2 px-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      ))
                    : displayProducts
                        .slice(0, 4)
                        .map((p, i) => (
                          <ProductCard key={p.slug} product={p} index={i} />
                        ))}
                </div>
              </section>
            );

          case "wedding":
            return (
              <section key="wedding" className="bg-cream py-20 lg:py-28 overflow-hidden">
                <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                    className="relative"
                  >
                    <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-luxury">
                      <img
                        src={weddingPromoImage}
                        alt="Luxury wedding gift bags collection"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -bottom-4 -right-4 glass rounded-2xl p-4 shadow-soft hidden sm:flex items-center gap-3"
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Trusted by
                        </div>
                        <div className="serif text-base font-semibold">
                          10,000+ couples
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.15 }}
                  >
                    <p className="text-[11px] tracking-[0.25em] uppercase text-gold">
                      Wedding Collection
                    </p>
                    <h2 className="serif text-4xl lg:text-5xl mt-3 text-balance">
                      {weddingPromoTitle}
                    </h2>
                    <p className="mt-5 text-muted-foreground leading-relaxed max-w-lg">
                      {weddingPromoDesc}
                    </p>

                    <div className="mt-8 space-y-5">
                      {weddingFeatures.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="flex items-start gap-4">
                          <div className="h-11 w-11 shrink-0 rounded-xl bg-background border border-border flex items-center justify-center text-gold shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{title}</div>
                            <div className="text-sm text-muted-foreground mt-0.5">
                              {desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/shop"
                      className="group mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition text-sm tracking-wide"
                    >
                      {weddingPromoCta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </div>
              </section>
            );

          case "festival":
            return (
              <section key="festival" className="mx-auto max-w-7xl px-5 lg:px-10 py-20 lg:py-28">
                <div className="text-center mb-14">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-gold">
                    Celebrate Every Festival
                  </p>
                  <h2 className="serif text-4xl lg:text-5xl mt-3">
                    Seasonal Collections
                  </h2>
                  <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                    Curated gift bags for every celebration on the Indian calendar — from
                    Diwali to Christmas.
                  </p>
                  <div className="gold-divider mx-auto mt-6 w-24" />
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                  {festivalsList.map((f, i) => (
                    <motion.div
                      key={f.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    >
                      <Link
                        to="/shop"
                        className="group block rounded-2xl overflow-hidden border border-border bg-background hover-lift"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={f.img}
                            alt={`${f.name} gift bags`}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                          <div className="absolute bottom-4 left-4 text-background">
                            <p className="text-[10px] tracking-[0.2em] uppercase opacity-80">
                              {f.subtitle}
                            </p>
                            <h3 className="serif text-2xl mt-0.5">{f.name}</h3>
                          </div>
                        </div>
                        <div className="p-5">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {f.desc}
                          </p>
                          <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-gold">
                            Shop {f.name}{" "}
                            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            );

          case "fabric":
            return (
              <section key="fabric" className="bg-cream py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-soft"
                  >
                    <img
                      src={fabricImage}
                      alt="Premium fabric detail"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                  <div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-gold">
                      {fabricBadge}
                    </p>
                    <h2 className="serif text-4xl lg:text-5xl mt-3">
                      {fabricTitle}
                    </h2>
                    <p className="mt-5 text-muted-foreground leading-relaxed max-w-lg">
                      {fabricDesc}
                    </p>
                    <div className="mt-10 grid sm:grid-cols-2 gap-6">
                      {fabricFeaturesList.map(({ title, desc }) => {
                        let Icon = Sparkles;
                        const tLower = title.toLowerCase();
                        if (tLower.includes("sustain") || tLower.includes("eco") || tLower.includes("green") || tLower.includes("leaf")) Icon = Leaf;
                        else if (tLower.includes("hand") || tLower.includes("stitch") || tLower.includes("sparkle") || tLower.includes("craft")) Icon = Sparkles;
                        else if (tLower.includes("shipping") || tLower.includes("deliv") || tLower.includes("truck") || tLower.includes("india") || tLower.includes("pan")) Icon = Truck;
                        else if (tLower.includes("love") || tLower.includes("heart") || tLower.includes("trust") || tLower.includes("happy") || tLower.includes("50k")) Icon = Heart;

                        return (
                          <div key={title} className="flex gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-background border border-border flex items-center justify-center text-gold">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{title}</div>
                              <div className="text-sm text-muted-foreground mt-0.5">
                                {desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "testimonials":
            return (
              <section key="testimonials" className="mx-auto max-w-7xl px-5 lg:px-10 py-20 lg:py-28">
                <div className="text-center mb-14">
                  <p className="text-[11px] tracking-[0.25em] uppercase text-gold">
                    {testimonialsBadge}
                  </p>
                  <h2 className="serif text-4xl lg:text-5xl mt-3">
                    {testimonialsTitle}
                  </h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                  {testimonialsList.map((t, i) => (
                    <motion.figure
                      key={t.a}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="rounded-2xl border border-border bg-background p-8 hover-lift"
                    >
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: t.stars }).map((_, si) => (
                          <Star
                            key={si}
                            className="h-4 w-4 fill-gold text-gold"
                          />
                        ))}
                      </div>
                      <blockquote className="serif text-xl leading-snug">
                        "{t.q}"
                      </blockquote>
                      <figcaption className="mt-6 pt-4 border-t border-border text-sm">
                        <div className="font-medium">{t.a}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">
                          {t.role}
                        </div>
                      </figcaption>
                    </motion.figure>
                  ))}
                </div>
              </section>
            );

          case "instagram":
            return (
              <section key="instagram" className="py-20 lg:py-28 bg-cream">
                <div className="mx-auto max-w-7xl px-5 lg:px-10">
                  <div className="text-center mb-14">
                    <p className="text-[11px] tracking-[0.25em] uppercase text-gold">
                      {instagramBadge}
                    </p>
                    <h2 className="serif text-4xl lg:text-5xl mt-3">
                      {instagramTitle}
                    </h2>
                    <p className="mt-3 text-muted-foreground text-sm">
                      {instagramDesc}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                    {instagramImagesList.map((img, i) => (
                      <motion.a
                        key={i}
                        href={instagramBtnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        className="group relative aspect-square rounded-xl overflow-hidden"
                      >
                        <img
                          src={img.src}
                          alt={`Giftcy Instagram post ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-3 text-white">
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <Heart className="h-4 w-4 fill-white" /> {img.likes}
                            </span>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <a
                      href={instagramBtnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-foreground/20 hover:border-foreground transition text-sm tracking-wide"
                    >
                      <Instagram className="h-4 w-4" />
                      {instagramBtnText}
                    </a>
                  </div>
                </div>
              </section>
            );

          case "badges":
            return (
              <section key="badges" className="mx-auto max-w-7xl px-5 lg:px-10 py-16 lg:py-20">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4">
                  {trustBadgesList.map((badge, i) => (
                    <motion.div
                      key={badge.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                      className="text-center group"
                    >
                      <div className="mx-auto h-14 w-14 rounded-2xl bg-cream border border-border flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-colors duration-300">
                        <badge.icon className="h-6 w-6" />
                      </div>
                      <div className="serif text-xl font-semibold mt-3">
                        {badge.label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {badge.desc}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );

          case "newsletter":
            return (
              <section key="newsletter" className="mx-auto max-w-7xl px-5 lg:px-10 pb-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="rounded-[2rem] p-10 lg:p-16 text-center relative overflow-hidden"
                  style={{ background: "var(--gradient-cream)" }}
                >
                  <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-gold)" }} />
                  <div className="relative">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-background/80 backdrop-blur border border-border flex items-center justify-center text-gold mb-6">
                      <Mail className="h-6 w-6" />
                    </div>
                    <p className="text-[11px] tracking-[0.25em] uppercase text-gold">
                      Stay Updated
                    </p>
                    <h2 className="serif text-3xl lg:text-4xl mt-3 text-balance">
                      {settings?.homepage_newsletter?.title || "Get 10% off your first order"}
                    </h2>
                    <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
                      {settings?.homepage_newsletter?.description || "Subscribe to our newsletter for early access to new collections, festive drops, and exclusive offers."}
                    </p>
                    <form
                      onSubmit={handleNewsletter}
                      className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    >
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="flex-1 px-5 py-3.5 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
                      />
                      <button
                        type="submit"
                        className="px-7 py-3.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition tracking-wide"
                      >
                        {subscribed ? "✓ Subscribed!" : "Subscribe"}
                      </button>
                    </form>
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      No spam, ever. Unsubscribe anytime.
                    </p>
                  </div>
                </motion.div>
              </section>
            );

          case "cta":
            return (
              <section key="cta" className="mx-auto max-w-7xl px-5 lg:px-10 pb-24">
                <div className="rounded-[2rem] bg-gradient-to-br from-foreground to-foreground/85 text-background p-10 lg:p-20 text-center relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: "var(--gradient-gold)" }}
                  />
                  <div className="relative">
                    <p className="text-[11px] tracking-[0.25em] uppercase text-gold-soft">
                      {ctaSubtitle}
                    </p>
                    <h2 className="serif text-4xl lg:text-6xl mt-4 text-balance">
                      {ctaTitle}
                    </h2>
                    <p className="mt-5 text-background/70 max-w-xl mx-auto">
                      {ctaDesc}
                    </p>
                    <Link
                      to={ctaBtnUrl}
                      className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-background text-foreground hover:bg-background/90 text-sm tracking-wide"
                    >
                      {ctaBtnText} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
