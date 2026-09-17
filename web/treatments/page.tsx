import type { Metadata } from "next";
import { Suspense } from "react";
import SectionHeading from "@/components/SectionHeading";
import TreatmentsExplorer from "@/components/TreatmentsExplorer";

export const metadata: Metadata = {
  title: "Treatments",
  description:
    "Browse skin, hair, aesthetics and PMU & beauty treatments offered at Celebrity Aesthetic, filterable by category.",
  alternates: { canonical: "/treatments" },
};

export default function TreatmentsPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <h1 className="sr-only">All Treatments</h1>
        <SectionHeading
          kicker="Treatments"
          title="Explore every treatment we offer"
          description="Filter by category to find the right starting point — every card links through to a full treatment page with more detail."
        />
        <div className="mt-12">
          <Suspense fallback={null}>
            <TreatmentsExplorer />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
