import Image from "next/image";
import Link from "next/link";
import { getTreatmentBySlug, categoryLabels } from "@/lib/treatments";
import { getTreatmentImage } from "@/lib/images";
import { ButtonLink } from "./ui/Button";
import SectionHeading from "./SectionHeading";
import DirectionalCard from "./ui/DirectionalCard";
import { Reveal } from "./ui/Reveal";

/** Curated slugs for the homepage's signature showcase — a small
 * hand-picked set, not the full catalogue (that lives on /treatments). */
const SIGNATURE_SLUGS = [
  "laser-hair-removal",
  "carbon-laser-facial",
  "hydra-facial",
  "advanced-prp",
  "botox",
  "lip-tinting",
] as const;

const signatureTreatments = SIGNATURE_SLUGS.map((slug) => {
  const treatment = getTreatmentBySlug(slug);
  if (!treatment) throw new Error(`Signature treatment "${slug}" not found`);
  return treatment;
});

export default function SignatureExperience() {
  return (
    <section aria-label="Signature treatments" className="bg-ivory py-12 sm:py-16">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <SectionHeading
          kicker="Signature Experience"
          title="Treatments our clients return for"
          description="A small selection of the treatments most requested during consultation."
          align="center"
        />

        <Reveal className="mt-6 text-center">
          <ButtonLink href="/treatments" variant="primary">
            View All Treatments →
          </ButtonLink>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3">
          {signatureTreatments.map((treatment, i) => {
            const image = getTreatmentImage(treatment);
            return (
              <DirectionalCard key={treatment.slug} index={i} delay={(i % 3) * 0.1}>
                <Link
                  href={`/treatments/${treatment.slug}`}
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-md border border-gold/30 transition-transform duration-300 ease-out hover:-translate-y-1"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, 45vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent transition-colors duration-300 group-hover:from-black/90"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-grotesk text-[13px] uppercase tracking-widest2 text-gold-light">
                      {categoryLabels[treatment.category]}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-bold uppercase leading-snug text-ivory drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
                      {treatment.name}
                    </h3>
                    <p className="mt-2 font-grotesk text-[11px] font-semibold uppercase tracking-wide text-gold-light">
                      No Cost EMI available on all services
                    </p>
                    <span className="mt-3 inline-block font-grotesk text-[13px] uppercase tracking-widest2 text-ivory/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      View →
                    </span>
                  </div>
                </Link>
              </DirectionalCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
