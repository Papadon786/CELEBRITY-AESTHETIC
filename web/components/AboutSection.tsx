import SectionHeading from "./SectionHeading";
import PhotoPanel from "./ui/PhotoPanel";
import ParallaxImage from "./ui/ParallaxImage";
import DirectionalCard from "./ui/DirectionalCard";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
import { interiorImage } from "@/lib/images";

export default function AboutSection() {
  return (
    <section aria-label="About Crown Celebrity Aesthetic" className="py-12 sm:py-16">
      <div className="mx-auto grid max-w-8xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <DirectionalCard direction="left">
          <ParallaxImage
            src={interiorImage.src}
            alt={interiorImage.alt}
            aspect="aspect-[5/6]"
            sizes="(min-width: 1024px) 45vw, 90vw"
          />
        </DirectionalCard>

        <div className="flex flex-col justify-center">
          <SectionHeading
            kicker="About Us"
            title="A considered approach to skin, hair &amp; PMU"
            script="est. attention"
          />
          <Reveal>
            <p className="mt-6 max-w-lg font-grotesk text-[17px] leading-relaxed text-charcoal/75">
              Crown Celebrity Aesthetic brings together hair restoration,
              hair transplant specialities, clinical skin care &amp; aesthetics,
              and certified PMU services within a single, premier consultation-led practice.
              Every visit begins with an in-depth diagnostic assessment — understanding your
              anatomy, your goals, and charting a tailored clinical path forward.
            </p>
            <p className="mt-4 max-w-lg font-grotesk text-[17px] leading-relaxed text-charcoal/75">
              Alongside client treatments, our academy shares technique and
              precision with the next generation of PMU professionals.
            </p>

            <div className="mt-8 divider-gold max-w-xs" />
            <div className="mt-8">
              <ButtonLink href="/about" variant="primary">
                Discover Our Approach →
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
