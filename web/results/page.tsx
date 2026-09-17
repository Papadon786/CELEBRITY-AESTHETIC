import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import ResultsSection from "@/components/ResultsSection";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Results",
  description:
    "Before and after results across skin, hair, aesthetics and PMU treatments at Celebrity Aesthetic.",
  alternates: { canonical: "/results" },
};

export default function ResultsPage() {
  return (
    <div>
      <section className="border-b border-gold/20 py-16 sm:py-24">
        <Reveal className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-gold-dark">
            Results
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight text-charcoal sm:text-5xl">
            See the difference
          </h1>
          <p className="mt-6 font-grotesk text-[17px] leading-relaxed text-charcoal/75">
            Individual results vary. A consultation is the best way to
            discuss what a realistic outcome could look like for you.
          </p>
        </Reveal>
      </section>

      <ResultsSection showCta={false} />

      <Reveal className="py-16 text-center sm:py-24">
        <h2 className="font-display text-2xl font-bold uppercase text-charcoal sm:text-3xl">
          Curious what&apos;s possible for you?
        </h2>
        <p className="mt-3 font-grotesk text-base text-charcoal/70">
          Book a consultation to discuss your goals with a professional.
        </p>
        <div className="mt-8">
          <ButtonLink href="/contact" variant="primary">
            Book A Consultation →
          </ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
