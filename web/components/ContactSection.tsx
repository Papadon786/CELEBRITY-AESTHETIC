import SectionHeading from "./SectionHeading";
import ParallaxImage from "./ui/ParallaxImage";
import DirectionalCard from "./ui/DirectionalCard";
import { ButtonLink } from "./ui/Button";
import WhatsAppButton from "./WhatsAppButton";
import { EMAIL, PHONE_DISPLAY, buildWhatsAppLink } from "@/lib/constants";
import { interiorImage } from "@/lib/images";

const infoItems = [
  { label: "Call Us", value: `+91 ${PHONE_DISPLAY}`, href: `tel:+${PHONE_DISPLAY}` },
  { label: "WhatsApp", value: `+91 ${PHONE_DISPLAY}`, href: buildWhatsAppLink() },
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
];

export default function ContactSection() {
  return (
    <section aria-label="Contact introduction" className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-8xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <DirectionalCard direction="left">
          <SectionHeading
            kicker="Contact & Booking"
            title="Let's talk about your treatment"
            description="Have a concern, need treatment guidance, or want to schedule a consultation? Our team is here to help."
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="#booking-form" variant="primary">
              Book An Appointment →
            </ButtonLink>
            <WhatsAppButton />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-gold/20 pt-8 sm:grid-cols-3">
            {infoItems.map((item) => (
              <div key={item.label}>
                <p className="font-grotesk text-[11px] font-semibold uppercase tracking-widest2 text-gold-dark">
                  {item.label}
                </p>
                <a
                  href={item.href}
                  className="mt-1 block font-grotesk text-sm text-charcoal/75 hover:text-gold-dark"
                >
                  {item.value}
                </a>
              </div>
            ))}
          </div>
        </DirectionalCard>

        <DirectionalCard direction="right">
          <ParallaxImage
            src={interiorImage.src}
            alt={interiorImage.alt}
            aspect="aspect-[4/5]"
            sizes="(min-width: 1024px) 45vw, 90vw"
          />
        </DirectionalCard>
      </div>
    </section>
  );
}
