export const SITE_NAME = "Crown Celebrity Aesthetic";
export const SITE_TAGLINE = "Hair & Skin Clinic · PMU Services & Academy";
export const SITE_URL = "https://crown-celebrity-aesthetic.com";

export const PHONE_DISPLAY = "9591047171";
export const PHONE_INTL = "919591047171";
export const EMAIL = "celebrityaestheticcrown@gmail.com";

export const WHATSAPP_BASE = `https://wa.me/${PHONE_INTL}`;

export function buildWhatsAppLink(message?: string): string {
  if (!message) return WHATSAPP_BASE;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export const DISCLAIMER =
  "Treatment suitability and outcomes vary by individual. Consultation with a qualified professional is recommended before proceeding with any treatment.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Treatments", href: "/treatments" },
  { label: "Contact", href: "/contact" },
];

/** Footer navigation — a slightly different set from the primary NAV_LINKS
 * (drops PMU Services as its own link since it's reachable via Treatments,
 * adds Results). */
export const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Treatments", href: "/treatments" },
  { label: "Academy", href: "/academy" },
  { label: "Results", href: "/results" },
  { label: "Contact", href: "/contact" },
];

export const CLINIC_ADDRESS_NAME =
  "The Celebrity Aesthetics, Hair PRP, Permanent Makeup - Satyam Hair Transplant Centre";
export const CLINIC_LAT = 12.9174467;
export const CLINIC_LNG = 77.5931932;

export const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/wHwR9bCYLRUu5Vm86";

export const GOOGLE_MAPS_EMBED_URL = `https://www.google.com/maps?q=${CLINIC_LAT},${CLINIC_LNG}&z=16&output=embed`;

/** Social links — no confirmed handles are on file yet, so these point to
 * a same-name search on each platform rather than inventing a handle.
 * Swap each `href` for the real profile URL once known. */
export const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(SITE_NAME)}`,
  },
  {
    label: "Facebook",
    href: `https://www.facebook.com/search/top?q=${encodeURIComponent(SITE_NAME)}`,
  },
];
