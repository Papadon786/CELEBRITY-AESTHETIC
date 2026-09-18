import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import PhotoPanel from "@/components/ui/PhotoPanel";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import WordReveal from "@/components/ui/WordReveal";
import WhatsAppButton from "@/components/WhatsAppButton";
import { academyImage } from "@/lib/images";

export const metadata: Metadata = {
  title: "Academy",
  description:
    "Crown Celebrity Aesthetic Academy focuses on PMU training, technique and professional development.",
  alternates: { canonical: "/academy" },
};

const focusAreas = [
  {
    title: "Training",
    text: "Structured, hands-on learning designed around real technique rather than theory alone.",
  },
  {
    title: "Technique",
    text: "Close attention to tool handling, pigment work and precision across PMU disciplines.",
  },
  {
    title: "Professional Development",
    text: "Guidance intended to support practitioners as they build their own practice.",
  },
];

const tbcFields = [
  { label: "Course Fees", value: "To be confirmed" },
  { label: "Duration", value: "To be confirmed" },
  { label: "Certification", value: "To be confirmed" },
  { label: "Placement Support", value: "To be confirmed" },
];

export default function AcademyPage() {
  return (
    <div>
      <section className="border-b border-gold/20 py-16 sm:py-24">
        <div className="mx-auto grid max-w-8xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <Reveal>
            <p className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-gold-dark">
              Crown Celebrity Aesthetic Academy
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight text-charcoal sm:text-5xl">
              <WordReveal text="Training in precision PMU technique" />
            </h1>
            <p className="mt-6 max-w-lg font-grotesk text-[17px] leading-relaxed text-charcoal/75">
              Our Academy is focused on sharing the technique and precision
              behind our PMU services with practitioners building their own
              craft.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact?treatment=General%20Consultation" variant="primary">
                Enquire About The Academy →
              </ButtonLink>
              <WhatsAppButton />
            </div>
          </Reveal>
          <Reveal>
            <PhotoPanel
              src={academyImage.src}
              alt={academyImage.alt}
              aspect="aspect-[4/5]"
              sizes="(min-width: 1024px) 45vw, 90vw"
            />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-gold/20 py-16 sm:py-24">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <SectionHeading kicker="What We Focus On" title="Training built around three pillars" />
          <RevealStagger className="mt-12 grid grid-cols-1 divide-y divide-gold/15 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            {focusAreas.map((area) => (
              <RevealItem key={area.title} className="py-6 first:pt-0 sm:px-6 sm:py-0 sm:first:pl-0">
                <span className="block h-px w-8 bg-gold" />
                <h3 className="mt-4 font-display text-xl font-bold uppercase text-charcoal">
                  {area.title}
                </h3>
                <p className="mt-3 font-grotesk text-base leading-relaxed text-charcoal/70">
                  {area.text}
                </p>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <SectionHeading
            kicker="Course Details"
            title="Details being finalised"
            description="The specifics below are not yet confirmed. Please reach out directly for the most current information."
          />
          <RevealStagger className="mt-12 grid grid-cols-1 gap-6 border-t border-gold/20 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {tbcFields.map((field) => (
              <RevealItem key={field.label} className="border-l-2 border-gold/40 pl-4">
                <dt className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-charcoal/60">
                  {field.label}
                </dt>
                <dd className="mt-2 font-grotesk text-base italic text-charcoal/70">
                  {field.value}
                </dd>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="border-t border-gold/20 bg-sage-dark py-16 sm:py-24">
        <Reveal className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-2xl font-bold uppercase text-ivory sm:text-3xl">
            Interested in training with us?
          </h2>
          <p className="mt-3 font-grotesk text-base text-ivory/80">
            Get in touch and we will share the latest Academy information as
            it becomes available.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact?treatment=General%20Consultation" variant="ivoryOnDark">
              Enquire About The Academy →
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
