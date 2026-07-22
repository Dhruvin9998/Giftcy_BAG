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
  images?: string[];
  badge?: "Bestseller" | "New" | "Sale";
  colors: string[];
  sizes: string[];
  description: string;
  priority?: number;
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
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
