import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery & Inspiration — Giftcy" },
      { name: "description", content: "Explore the Giftcy gallery. Real-world wedding setups, premium corporate hampers, and close-up views of our custom-printed fabric gift bags." },
    ],
  }),
  component: GalleryPage,
});

type GalleryItem = {
  id: string;
  image: string;
  title: string;
  category: "wedding" | "festive" | "corporate" | "detail";
  description: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    title: "Jaipur Sangeet Favors",
    category: "wedding",
    description: "Royal gold Banarasi silk potli bags containing rich dry fruits, aligned beautifully for a sangeet event.",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
    title: "Corporate Diwali Hampers",
    category: "corporate",
    description: "Midnight blue organic cotton gift bags with gold logo prints, curated for client appreciation.",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800",
    title: "Gold Foil Monograms",
    category: "detail",
    description: "A close-up macro view of our metallic hot-stamping custom typography on rich crimson velvet.",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800",
    title: "Festive Shagun Envelopes",
    category: "festive",
    description: "Handcrafted brocade envelopes arranged neatly for Diwali shagun ceremonies.",
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
    title: "Luxury Wedding Welcome Trousseau",
    category: "wedding",
    description: "Plush emerald velvet drawstring pouches set inside custom wedding room welcome hampers.",
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
    title: "Eco-First Jute Planter Gift Wraps",
    category: "detail",
    description: "Natural designer jute fabric wraps with leather pull drawstrings holding handcrafted ceramics.",
  },
  {
    id: "7",
    image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800",
    title: "Premium New Year Kits",
    category: "corporate",
    description: "Sophisticated grey linen portfolio sleeves with gold corner accents and branded ribbon tags.",
  },
  {
    id: "8",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
    title: "Traditional Gota-Patti Stitching",
    category: "detail",
    description: "Detail highlighting the craftsmanship of Rajasthan karigars sewing delicate gota borders.",
  },
];

function GalleryPage() {
  const [filter, setFilter] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filtered = filter === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((x) => x.category === filter);

  return (
    <>
      <section className="mx-auto max-w-5xl px-5 lg:px-10 py-16 lg:py-24 text-center">
        <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Inspiration Studio</p>
        <h1 className="serif text-5xl lg:text-7xl mt-4 leading-[1.05]">Made to inspire.</h1>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          Take a look at how our luxury reusable bags elevate weddings, festivals, corporate gifts, and bespoke retail events.
        </p>

        {/* Occasion Filter Categories */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {["all", "wedding", "festive", "corporate", "detail"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-full border text-xs tracking-wider uppercase font-semibold transition ${
                filter === cat ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50 bg-background"
              }`}
            >
              {cat === "all" ? "View All" : cat === "detail" ? "Craft Details" : cat}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry Image Grid */}
      <section className="mx-auto max-w-7xl px-5 lg:px-10 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border/80 bg-background shadow-soft hover:shadow-luxury transition duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[9px] uppercase tracking-widest text-gold-soft mb-1 font-semibold">{item.category}</span>
                <h3 className="serif text-lg text-white font-medium flex items-center gap-2">
                  {item.title} <ZoomIn className="h-4 w-4" />
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Pop-up Modal */}
      {activeItem && (
        <div
          onClick={() => setActiveItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-5 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <button
            onClick={() => setActiveItem(null)}
            className="absolute top-5 right-5 h-12 w-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:scale-105 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-background max-w-4xl w-full rounded-[2.5rem] overflow-hidden grid md:grid-cols-[1.2fr_1fr] shadow-2xl animate-in zoom-in-95 duration-250"
          >
            <div className="aspect-[4/5] md:aspect-auto md:h-[70vh] bg-cream">
              <img src={activeItem.image} alt={activeItem.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-2 block">{activeItem.category}</span>
              <h2 className="serif text-3xl lg:text-4xl font-semibold mb-4 text-balance">{activeItem.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{activeItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
