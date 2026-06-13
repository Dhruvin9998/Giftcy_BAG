import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";

export const Route = createFileRoute("/policies/$slug")({
  head: ({ params }) => {
    const titles: Record<string, string> = {
      shipping: "Shipping & Delivery Policy — Giftcy",
      returns: "Returns & Refund Policy — Giftcy",
      privacy: "Privacy Policy — Giftcy",
      terms: "Terms of Service — Giftcy",
    };
    return {
      meta: [
        { title: titles[params.slug] || "Policies — Giftcy" },
        { name: "description", content: "Read Giftcy policies, terms, and shipping guarantees." },
      ],
    };
  },
  component: PolicyPage,
});

type PolicyContent = {
  title: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
};

const POLICIES: Record<string, PolicyContent> = {
  shipping: {
    title: "Shipping & Delivery Policy",
    lastUpdated: "June 09, 2026",
    sections: [
      {
        heading: "Processing Times",
        body: "Standard stock orders are processed and shipped within 1–2 business days. Custom printed or personalized orders require 4–6 business days for design mockups and production before dispatch."
      },
      {
        heading: "Domestic Shipping Rates & Estimates",
        body: "We offer free standard shipping on orders above ₹999 across India. For orders under ₹999, a flat shipping charge of ₹75 applies. Standard delivery takes 3–5 business days to major metro areas, and up to 7 business days for regional areas."
      },
      {
        heading: "Express Shipping",
        body: "Need it faster? Express shipping options are available at checkout for ₹150, delivering within 1–2 business days to eligible metro codes."
      },
      {
        heading: "Order Tracking",
        body: "When your order ships, you will receive an email and WhatsApp message with tracking links. You can also view shipping status inside your account dashboard under the orders tab."
      }
    ]
  },
  returns: {
    title: "Returns & Refund Policy",
    lastUpdated: "June 09, 2026",
    sections: [
      {
        heading: "14-Day Return Window",
        body: "We offer hassle-free returns on all standard stock items within 14 days of delivery. The items must be unused, in their original packaging, and in the same condition as received."
      },
      {
        heading: "Exceptions / Non-Returnable Items",
        body: "Bespoke custom-printed bags, customized monogrammed items, and B2B bulk orders are made-to-order and cannot be returned or refunded unless they arrive damaged or defective."
      },
      {
        heading: "Damages and Issues",
        body: "Please inspect your order upon receipt. If an item is defective, damaged, or incorrect, contact us immediately at hello@giftcy.in or WhatsApp +91 99999 99999 so we can make it right."
      },
      {
        heading: "Refunds",
        body: "Once we receive and inspect your returned items, your refund will be processed and automatically credited back to your original payment method within 5–7 business days. For COD orders, we will request your bank details to process a direct bank transfer."
      }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "June 09, 2026",
    sections: [
      {
        heading: "Information We Collect",
        body: "We collect information you provide directly to us when creating accounts, placing orders, subscribing to newsletters, or submitting bulk inquiries. This includes name, email address, shipping address, phone number, and payment credentials."
      },
      {
        heading: "How We Use Your Information",
        body: "We use the information to process orders, handle payments, send shipping notifications, communicate B2B quotations, customize fabric bags, and offer tailored discount programs."
      },
      {
        heading: "Security",
        body: "We implement advanced industry-standard SSL encryption and partner with secure payment processing gateways like Razorpay to protect your data. We do not sell or trade your personal information to third parties."
      }
    ]
  },
  terms: {
    title: "Terms of Service",
    lastUpdated: "June 09, 2026",
    sections: [
      {
        heading: "Agreement to Terms",
        body: "By accessing and placing orders on Giftcy, you agree to comply with and be bound by these Terms of Service. Please read them carefully before using our platform."
      },
      {
        heading: "Product Customization & Proofs",
        body: "For customized orders, the design proof confirmed by the user via the bespoke interface or email is final. Giftcy is not liable for typographical errors, logo misalignments, or color variations present in the user-approved artwork."
      },
      {
        heading: "Intellectual Property",
        body: "All content on this website, including designs, images, logos, copy, and product layouts, is the exclusive property of Giftcy and protected by Indian copyright laws."
      },
      {
        heading: "Limitation of Liability",
        body: "Giftcy is not liable for any indirect, incidental, or consequential damages arising from the use of our products or the inability to access our online services."
      }
    ]
  }
};

function PolicyPage() {
  const { slug } = Route.useParams();
  const policy = POLICIES[slug];
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res?.success && res?.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings in PolicyPage", err);
      }
    })();
  }, []);

  if (!policy) {
    return (
      <div className="py-32 text-center px-5">
        <h1 className="serif text-4xl">Policy not found</h1>
        <p className="mt-3 text-muted-foreground">The policy document you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex px-6 py-3 rounded-full border border-gold text-gold text-sm">Back to Home</Link>
      </div>
    );
  }

  const contactEmail = settings?.contact_info?.email || "hello@giftcy.in";
  const contactWa = settings?.contact_info?.whatsapp || "+91 99999 99999";

  const formatBody = (body: string) => {
    return body
      .replace("hello@giftcy.in", contactEmail)
      .replace("+91 99999 99999", contactWa);
  };

  return (
    <section className="mx-auto max-w-4xl px-5 lg:px-10 py-12 lg:py-20 min-h-[70vh]">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="border border-border/80 rounded-[2.5rem] bg-background shadow-soft p-8 lg:p-14">
        <header className="mb-10 pb-6 border-b border-border/60 flex flex-wrap justify-between items-baseline gap-4">
          <div>
            <h1 className="serif text-3xl lg:text-4xl font-semibold text-foreground">{policy.title}</h1>
            <p className="text-xs text-muted-foreground mt-2">Last updated: {policy.lastUpdated}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-border text-[10px] uppercase font-semibold text-gold tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Secured Giftcy Guarantee
          </div>
        </header>

        <div className="space-y-8">
          {policy.sections.map((sect, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="serif text-xl font-semibold text-foreground">{sect.heading}</h3>
              <p className="text-muted-foreground text-sm lg:text-base leading-relaxed text-justify">{formatBody(sect.body)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
