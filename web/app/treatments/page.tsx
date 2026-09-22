import type { Metadata } from "next";
import { Suspense } from "react";
import SectionHeading from "@/components/SectionHeading";
import TreatmentsExplorer from "@/components/TreatmentsExplorer";

export const metadata: Metadata = {
  title: "Treatments",
  description:
    "Browse hair restoration, skin care, and PMU treatments offered at Crown Celebrity Aesthetic, filterable by category.",
  alternates: { canonical: "/treatments" },
};

export default function TreatmentsPage() {
  return (
    <div className="pb-16 sm:pb-24">
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url(/backgrounds/hair-treatments-bg.png)" }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-ivory/85" />
        <div className="mx-auto max-w-8xl px-5 py-16 sm:px-8 sm:py-24">
          <h1 className="sr-only">All Treatments</h1>
          <SectionHeading
            kicker="Treatments"
            title="Explore every treatment we offer"
            description="Filter by category to find the right starting point — every card links through to a full treatment page with more detail."
          />
        </div>
      </div>
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="mt-12">
          <Suspense fallback={null}>
            <TreatmentsExplorer />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
