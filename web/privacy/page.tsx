import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Crown Celebrity Aesthetic.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <h1 className="font-display text-3xl font-bold uppercase text-charcoal sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-6 font-grotesk text-base leading-relaxed text-charcoal/70">
        This is a placeholder Privacy Policy page. A complete privacy policy
        describing how enquiries submitted through this website (including
        via our WhatsApp booking form) are handled will be published here.
        This website does not store form submissions on a server — the
        booking form on this site opens WhatsApp with your details prefilled,
        and no database or backend is used.
      </p>
      <p className="mt-4 font-grotesk text-base leading-relaxed text-charcoal/70">
        For any questions in the meantime, please contact us directly using
        the details in our footer.
      </p>
    </div>
  );
}
