"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionHeading from "./SectionHeading";
import TreatmentCard from "./TreatmentCard";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { getTreatmentsByCategory, type TreatmentCategory } from "@/lib/treatments";

const categories: TreatmentCategory[] = ["skin", "hair", "aesthetics", "pmu"];

// One representative treatment per category — a single 4-card row for the
// four core areas, not a repeated 4-cards-per-category block.
const featuredPerCategory = categories.map(
  (category) => getTreatmentsByCategory(category)[0]
);

export default function OurTreatments() {
  return (
    <section
      id="treatments"
      aria-label="Our treatments"
      className="bg-ivory py-20 sm:py-28"
    >
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            kicker="Our Treatments"
            title="Four areas of focused, personalised care"
            description="A starting point across skin, hair, aesthetics and PMU — explore the full range on the Treatments page."
          />
          <Link
            href="/treatments"
            className="mb-1 hidden shrink-0 font-grotesk text-[13px] uppercase tracking-widest2 text-charcoal/70 hover:text-gold-dark sm:block"
          >
            View All Treatments →
          </Link>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featuredPerCategory.map(
            (treatment) =>
              treatment && (
                <motion.div key={treatment.slug} variants={fadeUp}>
                  <TreatmentCard treatment={treatment} compact />
                </motion.div>
              )
          )}
        </motion.div>

        <Link
          href="/treatments"
          className="mt-8 inline-block font-grotesk text-[13px] uppercase tracking-widest2 text-charcoal/70 hover:text-gold-dark sm:hidden"
        >
          View All Treatments →
        </Link>
      </div>
    </section>
  );
}
