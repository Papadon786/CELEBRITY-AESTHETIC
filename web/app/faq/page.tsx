import type { Metadata } from "next";
import FAQAccordion from "@/components/FAQAccordion";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about booking, treatments and consultations at Celebrity Aesthetic.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <div>
      <FAQAccordion />
      <CTASection />
    </div>
  );
}
