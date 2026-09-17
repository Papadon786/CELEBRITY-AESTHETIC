import { buildWhatsAppLink } from "@/lib/constants";

/**
 * Plain WhatsApp click-to-chat button (no prefilled message unless one is
 * passed in). Used sparingly — final CTA and footer only — per brand
 * restraint guidance.
 */
export default function WhatsAppButton({
  message,
  variant = "dark",
  label = "WHATSAPP US →",
  className = "",
}: {
  message?: string;
  variant?: "dark" | "light";
  label?: string;
  className?: string;
}) {
  const styles =
    variant === "light"
      ? "border border-ivory/60 text-ivory hover:bg-ivory/10"
      : "border border-charcoal/60 text-charcoal hover:bg-charcoal/5";
  return (
    <a
      href={buildWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-md px-7 py-3.5 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${styles} ${className}`}
    >
      {label}
    </a>
  );
}
