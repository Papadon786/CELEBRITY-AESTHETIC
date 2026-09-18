"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { categoryImages } from "@/lib/images";
import SectionHeading from "./SectionHeading";
import { ButtonLink } from "./ui/Button";
import DirectionalCard from "./ui/DirectionalCard";
import { categoryLabels, type TreatmentCategory } from "@/lib/treatments";

/** Drag (or touch-drag) the divider to reveal more of the before/after
 * side — a plain pointer-driven clip-path slider, no extra library. */
function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Drag to compare before and after"
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) updateFromClientX(e.clientX);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
        if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
      }}
      className="relative aspect-[4/3] w-full cursor-ew-resize touch-none select-none"
    >
      <Image src={afterSrc} alt={afterAlt} fill sizes="(min-width: 1024px) 33vw, 90vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          sizes="(min-width: 1024px) 33vw, 90vw"
          className="object-cover grayscale"
        />
      </div>

      <div className="absolute inset-y-0 w-0.5 bg-ivory" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-charcoal shadow">
          ↔
        </span>
      </div>

      <span className="absolute left-2 top-2 rounded bg-charcoal/70 px-2 py-0.5 font-grotesk text-[11px] uppercase tracking-widest2 text-ivory">
        Before
      </span>
      <span className="absolute right-2 top-2 rounded bg-gold-dark/90 px-2 py-0.5 font-grotesk text-[11px] uppercase tracking-widest2 text-ivory">
        After
      </span>
    </div>
  );
}

/**
 * Placeholder before/after entries — real comparison photography isn't
 * connected yet, so these reuse category stock imagery for both sides and
 * say so plainly, the same honesty policy Testimonials/GoogleReviews
 * follow rather than fabricating results.
 */
const placeholderResults: {
  treatment: string;
  category: TreatmentCategory;
}[] = [
  { treatment: "Laser Hair Removal", category: "skin" },
  { treatment: "Carbon Laser Facial", category: "skin" },
  { treatment: "Advanced PRP", category: "hair" },
  { treatment: "Botox Wrinkle Softening", category: "skin" },
  { treatment: "Eyebrow Microblading", category: "pmu" },
  { treatment: "Hydra Facial", category: "skin" },
];

const filters: ("all" | "hair" | "skin" | "pmu")[] = ["all", "hair", "skin", "pmu"];
const filterLabels: Record<"all" | "hair" | "skin" | "pmu", string> = {
  all: "All",
  hair: categoryLabels.hair,
  skin: categoryLabels.skin,
  pmu: categoryLabels.pmu,
};

export default function ResultsSection({ showCta = true }: { showCta?: boolean }) {
  const [activeFilter, setActiveFilter] = useState<"all" | TreatmentCategory>("all");

  const visible = placeholderResults.filter(
    (r) => activeFilter === "all" || r.category === activeFilter
  );

  return (
    <section aria-label="Results" className="border-y border-gold/20 bg-ivory-300/50 py-12 sm:py-16">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <SectionHeading
          kicker="Results"
          title="See the difference"
          align="center"
          description="Placeholder comparisons — real before &amp; after client photography will replace these once collected and consented for use."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`rounded-full border px-5 py-2 font-grotesk text-[13px] uppercase tracking-widest2 transition-colors ${
                activeFilter === filter
                  ? "border-gold-dark bg-charcoal text-ivory"
                  : "border-charcoal/25 text-charcoal/70 hover:border-gold-dark hover:text-gold-dark"
              }`}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>

        <div
          key={activeFilter}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((result, i) => (
            <DirectionalCard
              key={result.treatment}
              index={i}
              delay={(i % 3) * 0.1}
              className="overflow-hidden rounded-md border border-gold/30 bg-ivory"
            >
              <BeforeAfterSlider
                beforeSrc={categoryImages[result.category].src}
                afterSrc={categoryImages[result.category].src}
                beforeAlt={`Before — ${result.treatment} (placeholder)`}
                afterAlt={`After — ${result.treatment} (placeholder)`}
              />
              <div className="p-4">
                <p className="font-grotesk text-[13px] uppercase tracking-widest2 text-gold-dark">
                  {categoryLabels[result.category]}
                </p>
                <h3 className="mt-1 font-display text-base font-bold uppercase text-charcoal">
                  {result.treatment}
                </h3>
              </div>
            </DirectionalCard>
          ))}
        </div>

        {showCta && (
          <div className="mt-12 text-center">
            <ButtonLink href="/results" variant="primary">
              View All Results →
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
