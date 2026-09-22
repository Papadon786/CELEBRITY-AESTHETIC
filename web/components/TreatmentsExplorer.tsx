"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  categoryLabels,
  treatments,
  type TreatmentCategory,
  type TreatmentSubCategory,
} from "@/lib/treatments";
import TreatmentShowcaseCard from "./TreatmentShowcaseCard";
import DirectionalCard from "./ui/DirectionalCard";

type FilterType = "all" | TreatmentCategory | TreatmentSubCategory;

const mainFilters: { value: "all" | TreatmentCategory; label: string }[] = [
  { value: "all", label: `All Treatments (${treatments.length})` },
  { value: "skin", label: categoryLabels.skin },
  { value: "hair", label: categoryLabels.hair },
  { value: "pmu", label: categoryLabels.pmu },
];

export default function TreatmentsExplorer() {
  const searchParams = useSearchParams();
  const rawCat = searchParams.get("category");
  const initialCategory = (rawCat === "aesthetics" ? "skin" : rawCat) as TreatmentCategory | null;
  const initialSubCategory = searchParams.get("subCategory") as TreatmentSubCategory | null;

  const [activeFilter, setActiveFilter] = useState<FilterType>(
    initialSubCategory || initialCategory || "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = treatments;

    if (activeFilter !== "all") {
      list = list.filter(
        (t) => t.category === activeFilter || t.subCategory === activeFilter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.subCategoryLabel.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeFilter, searchQuery]);

  return (
    <div>
      {/* Search and Primary Filters */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div
          role="tablist"
          aria-label="Filter treatments by category"
          className="flex flex-wrap gap-2.5"
        >
          {mainFilters.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-md border px-4 py-2 font-grotesk text-[13px] font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-charcoal/20 bg-ivory text-charcoal/75 hover:border-gold hover:text-gold-dark"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Instant Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GFC, PRP, FUE, Acne..."
            className="w-full rounded-md border border-charcoal/25 bg-ivory px-4 py-2 text-sm font-grotesk text-charcoal placeholder-charcoal/45 transition-colors focus:border-gold focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-charcoal/50 hover:text-charcoal"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div className="mt-8 flex items-center justify-between">
        <p className="font-grotesk text-xs uppercase tracking-widest text-charcoal/60">
          Showing {filtered.length} clinical treatment{filtered.length === 1 ? "" : "s"}
        </p>
        {(activeFilter !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setActiveFilter("all");
              setSearchQuery("");
            }}
            className="font-grotesk text-xs text-gold-dark hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Treatment Cards Grid */}
      {filtered.length > 0 ? (
        <div key={activeFilter + searchQuery} className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((treatment, i) => (
            <DirectionalCard key={treatment.slug} index={i} delay={(i % 4) * 0.05}>
              <TreatmentShowcaseCard treatment={treatment} />
            </DirectionalCard>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-xl border border-dashed border-charcoal/20 py-16 text-center">
          <p className="font-display text-lg font-bold text-charcoal">
            No treatments found matching your criteria.
          </p>
          <p className="mt-2 text-sm text-charcoal/60 font-grotesk">
            Try a different search keyword or reset filters to browse our full catalog.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveFilter("all");
              setSearchQuery("");
            }}
            className="mt-5 rounded-md bg-gold px-5 py-2 text-xs font-semibold uppercase tracking-wider text-charcoal"
          >
            Show All Treatments
          </button>
        </div>
      )}
    </div>
  );
}
