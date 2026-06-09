import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

export type Product = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  occasion: string;
  price: number;
  mrp: number;
  image: string;
  badge?: "Bestseller" | "New" | "Sale";
  colors: string[];
  sizes: string[];
  description: string;
};

export const products: Product[] = [
  {
    slug: "ivory-silk-potli",
    name: "Ivory Silk Potli",
    category: "Potli Bags",
    occasion: "Wedding",
    price: 249,
    mrp: 349,
    image: p1,
    badge: "Bestseller",
    colors: ["Ivory", "Gold", "Blush"],
    sizes: ["S", "M", "L"],
    description:
      "Handcrafted ivory silk potli with a satin drawstring. Reusable, premium fabric — designed for weddings, return gifts, and luxury packaging.",
  },
  {
    slug: "regal-gold-embroidered",
    name: "Regal Gold Embroidered",
    category: "Wedding Gift Bags",
    occasion: "Wedding",
    price: 329,
    mrp: 449,
    image: p2,
    badge: "New",
    colors: ["Gold", "Ivory"],
    sizes: ["M", "L"],
    description:
      "An opulent gold-embroidered fabric bag with traditional motifs. Perfect for shagun, sangeet favors, and festive gifting.",
  },
  {
    slug: "blush-tassel-pouch",
    name: "Blush Tassel Pouch",
    category: "Return Gift Bags",
    occasion: "Birthday",
    price: 179,
    mrp: 229,
    image: p3,
    badge: "Sale",
    colors: ["Blush", "Cream"],
    sizes: ["S", "M"],
    description:
      "Soft blush fabric pouch finished with a hand-knotted gold tassel. A delicate, reusable favor for birthdays and intimate celebrations.",
  },
  {
    slug: "monogram-linen-tote",
    name: "Monogram Linen Tote",
    category: "Custom Printed Bags",
    occasion: "Corporate",
    price: 299,
    mrp: 399,
    image: p4,
    colors: ["Beige", "Ivory"],
    sizes: ["M", "L", "XL"],
    description:
      "Premium linen tote with gold foil monogram. Ideal for corporate gifting, hampers, and bespoke wedding favors.",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
