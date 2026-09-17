"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { categoryLabels, treatments, type TreatmentCategory } from "@/lib/treatments";
import TreatmentShowcaseCard from "./TreatmentShowcaseCard";
import DirectionalCard from "./ui/DirectionalCard";

type FilterValue = "all" | TreatmentCategory;

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "skin", label: categoryLabels.skin },
  { value: "hair", label: categoryLabels.hair },
  { value: "aesthetics", label: categoryLabels.aesthetics },
  { value: "pmu", label: categoryLabels.pmu },
];

export default function TreatmentsExplorer() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("category") as FilterValue) || "all";
  const [active, setActive] = useState<FilterValue>(
    filters.some((f) => f.value === initial) ? initial : "all"
  );

  const filtered = useMemo(() => {
    if (active === "all") return treatments;
    return treatments.filter((t) => t.category === active);
  }, [active]);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter treatments by category"
        className="flex flex-wrap gap-3"
      >
        {filters.map((filter) => {
          const isActive = active === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(filter.value)}
              className={`rounded-md border px-5 py-2.5 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 transition-colors ${
                isActive
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-charcoal/30 text-charcoal/70 hover:border-gold hover:text-gold-dark"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div key={active} className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((treatment, i) => (
          <DirectionalCard key={treatment.slug} index={i} delay={(i % 4) * 0.08}>
            <TreatmentShowcaseCard treatment={treatment} />
          </DirectionalCard>
        ))}
      </div>
    </div>
  );
}
