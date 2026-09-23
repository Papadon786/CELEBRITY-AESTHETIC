import Link from "next/link";
import Logo from "./Logo";
import WhatsAppButton from "./WhatsAppButton";
import { Reveal, RevealItem, RevealStagger } from "./ui/Reveal";
import {
  CLINIC_ADDRESS,
  EMAIL,
  FOOTER_LINKS,
  GOOGLE_MAPS_URL,
  PHONE_DISPLAY,
} from "@/lib/constants";

/** Generic UI glyphs (not brand marks) for the contact list — plain 24x24
 * stroke icons, kept to a single consistent line weight. */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.5 2.5.8 3.8.9.6 0 1 .5 1 1v3.6c0 .6-.5 1-1 1C10.8 21.5 2.5 13.2 2.5 3.8c0-.5.4-1 1-1H7c.6 0 1 .4 1 1 .1 1.3.4 2.6.9 3.8.2.3.1.7-.2 1L6.6 10.8Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 5.5h17v13h-17v-13Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l8 6.5L20 6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21.5s7-6.3 7-11.7a7 7 0 0 0-14 0c0 5.4 7 11.7 7 11.7Z"
      />
      <circle cx="12" cy="9.8" r="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="site-footer" className="border-t border-gold/20 bg-charcoal">
      <RevealStagger className="mx-auto grid max-w-8xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-4">
        <RevealItem className="md:col-span-2">
          <Logo variant="light" size="large" />
          <p className="mt-4 font-grotesk text-base text-ivory/75 max-w-md">
            Premier consultation-led clinic for advanced hair restoration,
            clinical skin care, and certified IATAM Academy training.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <WhatsAppButton variant="light" />
          </div>
        </RevealItem>

        <RevealItem>
          <h3 className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-gold-light">
            Explore
          </h3>
          <ul className="mt-4 space-y-3">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-grotesk text-base text-ivory/80 hover:text-gold-light"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </RevealItem>

        <RevealItem>
          <h3 className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-gold-light">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 font-grotesk text-base text-ivory/80">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5"><PinIcon /></span>
              <span>{CLINIC_ADDRESS}</span>
            </li>
            <li>
              <a
                href={`tel:+${PHONE_DISPLAY}`}
                className="flex items-center gap-2.5 hover:text-gold-light"
              >
                <PhoneIcon />
                +91 {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2.5 break-all hover:text-gold-light"
              >
                <MailIcon />
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-gold-light"
              >
                <PinIcon />
                Find Us On Maps →
              </a>
            </li>
          </ul>
        </RevealItem>
      </RevealStagger>

      <Reveal className="border-t border-ivory/15">
        <div className="mx-auto grid max-w-8xl grid-cols-1 items-center gap-3 px-5 py-6 text-center sm:grid-cols-3 sm:px-8">
          <p className="font-grotesk text-[13px] text-ivory/60">
            © 2026 Crown Celebrity Aesthetic. All rights reserved.
          </p>
          <a
            href="https://naazailabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-grotesk text-[13px] text-ivory/60 hover:text-gold-light sm:justify-self-center"
          >
            Designed and developed by Naaz AI Labs
          </a>
          <div className="flex justify-center gap-6 sm:justify-self-end">
            <Link
              href="/privacy"
              className="font-grotesk text-[13px] text-ivory/60 hover:text-gold-light"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-grotesk text-[13px] text-ivory/60 hover:text-gold-light"
            >
              Terms
            </Link>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
