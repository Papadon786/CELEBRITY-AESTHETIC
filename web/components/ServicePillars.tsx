import Image from "next/image";
import Link from "next/link";
import { categoryImages } from "@/lib/images";
import SectionHeading from "./SectionHeading";
import { ButtonLink } from "./ui/Button";
import DirectionalCard from "./ui/DirectionalCard";
import { Reveal } from "./ui/Reveal";
import type { TreatmentCategory } from "@/lib/treatments";

const pillars = [
  {
    number: "01",
    name: "Skin & Injectables",
    category: "skin" as TreatmentCategory,
    href: "/treatments?category=skin",
    description:
      "Acne scars, pigmentation, Medi Facials, Korean Glass Skin, laser hair removal, Botox, fillers & HIFU.",
  },
  {
    number: "02",
    name: "Hair",
    category: "hair" as TreatmentCategory,
    href: "/treatments?category=hair",
    description:
      "Autologous protocols (GFC, PRP, BIOCELL, HF, Exosomes, CBL) and 22 precision Hair Transplant specialities.",
  },
  {
    number: "03",
    name: "PMU",
    category: "pmu" as TreatmentCategory,
    href: "/pmu-services",
    description:
      "Eyebrow microblading, semi-permanent lip blush, scalp micropigmentation (SMP), and certified PMU Academy.",
  },
];

export default function ServicePillars() {
  return (
    <section
      aria-label="Our service pillars"
      className="border-b border-gold/20 bg-ivory py-12 sm:py-16"
    >
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <SectionHeading
          kicker="Our Pillars"
          title="Treatments designed around you"
          description="A considered approach across hair restoration, clinical skin care & injectables, and permanent makeup (PMU)."
          align="center"
        />
        <Reveal className="mt-6 text-center">
          <ButtonLink href="/treatments" variant="primary">
            Explore All 33 Treatments →
          </ButtonLink>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 flex max-w-8xl snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-2 sm:px-8 sm:grid sm:grid-cols-3 sm:snap-none sm:overflow-visible sm:pb-0">
        {pillars.map((pillar, i) => (
          <DirectionalCard
            key={pillar.number}
            index={i}
            className="w-[240px] shrink-0 snap-start sm:w-auto sm:shrink"
          >
            <Link
              href={pillar.href}
              className="group relative block aspect-[2/3] w-full overflow-hidden rounded-md border border-gold/30 transition-transform duration-300 ease-out hover:-translate-y-1"
            >
              <Image
                src={categoryImages[pillar.category].src}
                alt={categoryImages[pillar.category].alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 240px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="font-grotesk text-xs text-gold-light">
                  {pillar.number}
                </span>
                <h3 className="mt-1 font-display text-lg font-bold uppercase text-ivory drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] group-hover:text-gold-light">
                  {pillar.name}
                </h3>
              </div>
            </Link>
          </DirectionalCard>
        ))}
      </div>
    </section>
  );
}
