import SectionHeading from "./SectionHeading";
import ParallaxImage from "./ui/ParallaxImage";
import DirectionalCard from "./ui/DirectionalCard";
import { Reveal, RevealItem, RevealStagger } from "./ui/Reveal";
import { academyImage } from "@/lib/images";

const features = [
  {
    title: "Personalized",
    description:
      "Every plan is shaped around your individual concern rather than a one-size-fits-all package.",
  },
  {
    title: "Comprehensive",
    description:
      "Skin, hair and PMU services are considered together, under one roof.",
  },
  {
    title: "Consultation-Led",
    description:
      "Recommendations follow an honest conversation, never a fixed script.",
  },
  {
    title: "Refined",
    description:
      "A calm, considered environment designed around your comfort from arrival to aftercare.",
  },
];

export default function PhilosophySection() {
  return (
    <section aria-label="Our philosophy" className="bg-sage py-12 sm:py-16">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Swapped visual order vs. AboutSection above (text now leads,
              image trails) so the two homepage feature sections alternate
              which side leads, not just which side each element enters
              from. */}
          <DirectionalCard direction="right" className="lg:order-2">
            <ParallaxImage
              src={academyImage.src}
              alt={academyImage.alt}
              aspect="aspect-square"
              sizes="(min-width: 1024px) 35vw, 90vw"
            />
          </DirectionalCard>

          <div className="flex h-full flex-col justify-center lg:order-1">
            <Reveal>
              <SectionHeading kicker="Our Philosophy" title="Care that starts with you" />
            </Reveal>

            <RevealStagger className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
              {features.map((feature, i) => (
                <RevealItem key={feature.title}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-dark font-grotesk text-sm text-gold-dark">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold uppercase text-charcoal">
                    {feature.title}
                  </h3>
                  <p className="mt-2 font-grotesk text-base leading-relaxed text-charcoal/70">
                    {feature.description}
                  </p>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </div>
      </div>
    </section>
  );
}
