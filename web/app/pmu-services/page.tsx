import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import TreatmentCard from "@/components/TreatmentCard";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import DirectionalCard from "@/components/ui/DirectionalCard";
import WordReveal from "@/components/ui/WordReveal";
import { getTreatmentsByCategory } from "@/lib/treatments";

export const metadata: Metadata = {
  title: "PMU Services",
  description:
    "Explore Crown Celebrity Aesthetic's PMU services: eyebrow microblading, lip tinting, micropigmentation and SMP.",
  alternates: { canonical: "/pmu-services" },
};

export default function PMUServicesPage() {
  const pmuTreatments = getTreatmentsByCategory("pmu");

  return (
    <div>
      <section className="border-b border-gold/20 py-16 sm:py-24">
        <Reveal className="mx-auto max-w-8xl px-5 sm:px-8">
          <p className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-gold-dark">
            PMU Services
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold uppercase leading-tight text-charcoal sm:text-5xl">
            <WordReveal text="Permanent makeup, applied with precision" />
          </h1>
          <p className="mt-6 max-w-xl font-grotesk text-[17px] leading-relaxed text-charcoal/75">
            Our PMU services cover eyebrow microblading, lip tinting,
            micropigmentation and scalp micropigmentation (SMP) — each
            approached with a consultation first, so the final result reflects
            what you actually want.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact?treatment=General%20Consultation" variant="primary">
              Book A PMU Consultation →
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <SectionHeading
            kicker="Our PMU Treatments"
            title="Four core techniques"
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pmuTreatments.map((treatment, i) => (
              <DirectionalCard key={treatment.slug} index={i} delay={i * 0.1}>
                <TreatmentCard treatment={treatment} />
              </DirectionalCard>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gold/20 bg-sage py-16 sm:py-24">
        <Reveal className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-2xl font-bold uppercase text-charcoal sm:text-3xl">
            Ready to discuss your PMU goals?
          </h2>
          <p className="mt-3 font-grotesk text-base text-charcoal/70">
            Book a consultation and we will talk through shape, tone and
            technique together.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact?treatment=General%20Consultation" variant="primary">
              Book A PMU Consultation →
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
