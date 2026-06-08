import { createFileRoute, Link } from "@tanstack/react-router";
import fabric from "@/assets/fabric-detail.jpg";
import hero from "@/assets/hero-bag.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Giftcy" },
      { name: "description", content: "Giftcy is a premium Indian gifting brand crafting reusable fabric bags for life's most cherished moments." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-5 lg:px-10 py-20 lg:py-28 text-center">
        <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Our Story</p>
        <h1 className="serif text-5xl lg:text-7xl mt-4 text-balance leading-[1.05]">
          A gift is more than what's inside.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Giftcy was born from a simple belief: the way we give matters as much as what we give. We craft reusable fabric bags that elevate every gesture — sustainable, premium, unforgettable.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <img src={hero} alt="" className="rounded-[2rem] aspect-[4/5] object-cover" />
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Philosophy</p>
          <h2 className="serif text-4xl lg:text-5xl mt-3">Beautifully reusable.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            India gifts more than any nation in the world. We believe that joy shouldn't end in a landfill. Every Giftcy bag replaces single-use paper and plastic with something the receiver will cherish, reuse, and remember.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From a wedding sangeet in Jaipur to a Diwali hamper in Bengaluru — our bags carry blessings, beautifully.
          </p>
        </div>
      </section>

      <section className="bg-cream mt-20 lg:mt-28 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-[11px] tracking-[0.25em] uppercase text-gold">Craft</p>
            <h2 className="serif text-4xl lg:text-5xl mt-3">Made by hand, in India.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              We work with master karigars and women-led ateliers across Gujarat and Rajasthan, supporting traditional craft while building modern, premium products.
            </p>
            <Link to="/shop" className="mt-8 inline-flex px-7 py-3.5 rounded-full bg-foreground text-background text-sm">Explore the collection</Link>
          </div>
          <img src={fabric} alt="" className="order-1 lg:order-2 rounded-[2rem] aspect-[4/5] object-cover" />
        </div>
      </section>
    </>
  );
}
