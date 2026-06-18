import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings in footer", err);
      }
    })();
  }, []);

  const instaLink = settings?.general_settings?.insta || "https://instagram.com/giftcy";
  const fbLink = settings?.general_settings?.facebook || "https://facebook.com/giftcy";
  const emailLink = settings?.contact_info?.email ? `mailto:${settings.contact_info.email}` : "mailto:hello@giftcy.in";

  return (
    <footer className="mt-24 border-t border-border bg-cream">
      <div className="mx-auto max-w-7xl px-5 lg:px-10 py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="serif text-3xl font-semibold">{settings?.general_settings?.brandName || "Giftcy"}<span className="text-gold">.</span></div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Premium reusable fabric gift bags, crafted for India's most cherished moments.
            </p>
            <div className="flex gap-3 mt-6">
              <a href={instaLink} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={fbLink} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={emailLink} className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:border-gold hover:text-gold transition">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-gold">Wedding Bags</Link></li>
              <li><Link to="/shop" className="hover:text-gold">Potli Bags</Link></li>
              <li><Link to="/shop" className="hover:text-gold">Return Gifts</Link></li>
              <li><Link to="/shop" className="hover:text-gold">Festive Bags</Link></li>
              <li><Link to="/shop" className="hover:text-gold">Custom Printed</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-gold">Our Story</Link></li>
              <li><Link to="/bulk" className="hover:text-gold">Bulk Orders</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
              <li><a href="/policies/shipping" className="hover:text-gold">Shipping Policy</a></li>
              <li><a href="/policies/returns" className="hover:text-gold">Returns & Refund</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to know about new collections and festive drops.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-gold"
              />
              <button className="px-4 py-2.5 rounded-full bg-foreground text-background text-sm hover:bg-foreground/90 transition">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Giftcy. Crafted in India.</p>
          <div className="flex gap-4">
            <a href="/policies/privacy" className="hover:underline hover:text-gold">Privacy Policy</a>
            <a href="/policies/terms" className="hover:underline hover:text-gold">Terms of Service</a>
          </div>
          <p>Make Every Gift Premium.</p>
        </div>
      </div>
    </footer>
  );
}
