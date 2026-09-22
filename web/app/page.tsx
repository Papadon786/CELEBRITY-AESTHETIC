import type { Metadata } from "next";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import AboutSection from "@/components/AboutSection";
import ServicePillars from "@/components/ServicePillars";
import SignatureExperience from "@/components/SignatureExperience";
import PhilosophySection from "@/components/PhilosophySection";
import GoogleReviews from "@/components/GoogleReviews";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Crown Celebrity Aesthetic — Hair & Skin Clinic, PMU Services & Academy",
  description:
    "A consultation-led hair and skin clinic offering skin, hair and PMU treatments, plus a dedicated PMU academy.",
  alternates: { canonical: "/" },
};

// Homepage journey: introduce → explore treatments → build trust →
// experience signature services → read reviews → book.
// Detailed treatment info intentionally stays off this page — it lives on
// the dedicated /treatments pages.
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicePillars />
      <AboutSection />
      <SignatureExperience />
      <PhilosophySection />
      <GoogleReviews />
      <CTASection />
    </>
  );
}
