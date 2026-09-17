import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Celebrity Aesthetic.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <h1 className="font-display text-3xl font-bold uppercase text-charcoal sm:text-4xl">
        Terms
      </h1>
      <p className="mt-6 font-grotesk text-base leading-relaxed text-charcoal/70">
        This is a placeholder Terms page. Complete terms of use for this
        website will be published here.
      </p>
      <p className="mt-4 font-grotesk text-base leading-relaxed text-charcoal/70">
        Information on this website is provided for general informational
        purposes only and does not constitute medical advice. Treatment
        suitability and outcomes vary by individual, and a consultation with
        a qualified professional is recommended before proceeding with any
        treatment.
      </p>
    </div>
  );
}
