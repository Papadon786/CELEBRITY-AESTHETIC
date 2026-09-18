import Link from "next/link";
import type { Treatment } from "@/lib/treatments";
import { getTreatmentImage } from "@/lib/images";
import PhotoPanel from "./ui/PhotoPanel";
import { ButtonLink } from "./ui/Button";

/**
 * E-commerce-style product card: image on top, name, short description and
 * a "Book Now" button underneath — sits in a grid alongside other cards
 * rather than a single full-width row.
 */
export default function TreatmentShowcaseCard({ treatment }: { treatment: Treatment }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-md border border-gold/20 bg-sage transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold-dark/40 hover:shadow-lg">
      <div className="overflow-hidden">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <PhotoPanel
            src={getTreatmentImage(treatment).src}
            alt={getTreatmentImage(treatment).alt}
            aspect="aspect-square"
            bare
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-grotesk text-[10px] font-semibold uppercase tracking-wider text-gold-dark">
            {treatment.subCategoryLabel || treatment.category}
          </span>
          {treatment.badge && (
            <span className="rounded bg-gold/20 px-2 py-0.5 font-grotesk text-[9px] font-semibold uppercase tracking-wider text-charcoal">
              {treatment.badge}
            </span>
          )}
        </div>
        <h3 className="font-display text-base font-bold uppercase leading-tight text-charcoal">
          {treatment.name}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 font-grotesk text-[13px] leading-relaxed text-charcoal/65">
          {treatment.description}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <ButtonLink
            href={`/contact?treatment=${encodeURIComponent(treatment.name)}`}
            variant="primary"
            className="w-full !bg-charcoal !px-4 !py-2.5 !text-[12px] !text-ivory hover:!bg-charcoal-light"
          >
            Book Now →
          </ButtonLink>
          <Link
            href={`/treatments/${treatment.slug}`}
            className="text-center font-grotesk text-[12px] font-semibold uppercase tracking-widest2 text-charcoal/60 hover:text-gold-dark"
          >
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );
}
