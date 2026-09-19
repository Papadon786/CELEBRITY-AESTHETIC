import Link from "next/link";
import type { Treatment } from "@/lib/treatments";
import { categoryLabels } from "@/lib/treatments";
import { getTreatmentImage } from "@/lib/images";
import PhotoPanel from "./ui/PhotoPanel";

export default function TreatmentCard({
  treatment,
  compact = false,
}: {
  treatment: Treatment;
  compact?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col rounded-md border border-gold/20 bg-ivory-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold-dark/40 hover:shadow-lg">
      <div className="overflow-hidden rounded-t-md">
        <div className="transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <PhotoPanel
            src={getTreatmentImage(treatment).src}
            alt={getTreatmentImage(treatment).alt}
            aspect="aspect-[4/3]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            bare
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-grotesk text-[11px] font-semibold uppercase tracking-widest2 text-gold">
          {categoryLabels[treatment.category]}
        </p>
        <h3 className="mt-2 font-display text-lg font-bold uppercase text-charcoal">
          {treatment.name}
        </h3>
        {!compact && (
          <p className="mt-2 flex-1 font-grotesk text-base leading-relaxed text-charcoal/65">
            {treatment.description}
          </p>
        )}
        <p className="mt-2 font-grotesk text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
          No Cost EMI available on all services
        </p>
        <Link
          href={`/treatments/${treatment.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-charcoal transition-[gap,color] group-hover:gap-2.5 group-hover:text-gold-dark"
        >
          View Treatment <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
