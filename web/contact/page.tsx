import type { Metadata } from "next";
import ContactSection from "@/components/ContactSection";
import BookYourVisit from "@/components/BookYourVisit";
import CTASection from "@/components/CTASection";
import SectionHeading from "@/components/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import {
  buildWhatsAppLink,
  GOOGLE_MAPS_URL,
  GOOGLE_MAPS_EMBED_URL,
  CLINIC_ADDRESS_NAME,
} from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";
import DirectionalCard from "@/components/ui/DirectionalCard";

export const metadata: Metadata = {
  title: "Contact & Booking",
  description:
    "Book a consultation with Crown Celebrity Aesthetic. Complete the form to send your enquiry via WhatsApp.",
  alternates: { canonical: "/contact" },
};

const quickHelp = [
  {
    title: "Have A Question?",
    text: "Browse our frequently asked questions below.",
    href: "/faq",
    cta: "View FAQ →",
    icon: "question" as const,
  },
  {
    title: "Want To Book?",
    text: "Fill in the form and we'll confirm your slot over WhatsApp.",
    href: "#booking-form",
    cta: "Book Consultation →",
    icon: "calendar" as const,
  },
  {
    title: "Need A Quick Response?",
    text: "Message us directly on WhatsApp for the fastest reply.",
    href: buildWhatsAppLink(),
    cta: "WhatsApp Us →",
    icon: "chat" as const,
    external: true,
  },
];

function QuickHelpIcon({ icon }: { icon: "question" | "calendar" | "chat" }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "calendar":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M3.5 9.5h17M8 3v4M16 3v4" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.1-3.4A7.96 7.96 0 0 1 4 12Z" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.6 9.2a2.4 2.4 0 1 1 3.4 2.2c-.9.5-1 .9-1 1.6" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ treatment?: string }>;
}) {
  const params = await searchParams;
  return (
    <div>
      <h1 className="sr-only">Contact &amp; Booking</h1>

      <ContactSection />

      <BookYourVisit presetTreatment={params.treatment} />

      {/* Find Us */}
      <section className="border-b border-gold/20 py-16 sm:py-24">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <SectionHeading kicker="Find Us" title="Your visit starts here" />
          <Reveal className="mt-10">
            <div className="aspect-[16/7] w-full overflow-hidden rounded-xl border border-gold/20">
              <iframe
                src={GOOGLE_MAPS_EMBED_URL}
                title={`Map showing ${CLINIC_ADDRESS_NAME}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-6">
              <ButtonLink href={GOOGLE_MAPS_URL} variant="secondary" target="_blank" rel="noopener noreferrer">
                Get Directions →
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Quick help */}
      <section className="border-b border-gold/20 py-16 sm:py-24">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {quickHelp.map((item, i) => (
              <DirectionalCard
                key={item.title}
                index={i}
                delay={i * 0.1}
                className="group flex min-h-[300px] flex-col rounded-xl border border-gold/20 bg-sage p-9 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-gold hover:bg-gold hover:shadow-lg"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ivory text-gold-dark">
                  <QuickHelpIcon icon={item.icon} />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold uppercase text-charcoal">
                  {item.title}
                </h3>
                <p className="mt-3 flex-1 font-grotesk text-base leading-relaxed text-charcoal/70">
                  {item.text}
                </p>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="mt-6 inline-flex items-center gap-1 font-grotesk text-sm font-semibold uppercase tracking-widest2 text-gold-dark group-hover:text-charcoal"
                >
                  {item.cta}
                </a>
              </DirectionalCard>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
