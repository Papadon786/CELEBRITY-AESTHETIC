import { buildWhatsAppLink, PHONE_DISPLAY, PHONE_INTL } from "@/lib/constants";

/**
 * Fixed bottom-right quick-access stack — WhatsApp and a one-tap phone
 * call. Site-wide (mounted in the root layout), so it floats above every
 * page's content without needing per-page wiring.
 */
export default function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={buildWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
          <path d="M12.031 0h-.062C5.406 0 .13 5.278.13 11.766c0 2.587.834 4.988 2.253 6.943L.782 24l5.44-1.442a11.66 11.66 0 0 0 5.746 1.517h.005c6.585 0 11.86-5.28 11.86-11.768a11.7 11.7 0 0 0-3.462-8.32A11.65 11.65 0 0 0 12.031 0m6.938 18.638a9.82 9.82 0 0 1-6.94 2.876h-.004a9.72 9.72 0 0 1-4.98-1.362l-.357-.212-3.229.856.862-3.15-.233-.362a9.71 9.71 0 0 1-1.487-5.185c0-5.377 4.373-9.75 9.751-9.75 2.604 0 5.05 1.017 6.888 2.854a9.7 9.7 0 0 1 2.859 6.9c0 5.378-4.373 9.75-9.13 9.535" />
        </svg>
      </a>

      <a
        href={`tel:+${PHONE_INTL}`}
        aria-label={`Call us at +91 ${PHONE_DISPLAY}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.5 2.5.8 3.8.9.6 0 1 .5 1 1v3.6c0 .6-.5 1-1 1C10.8 21.5 2.5 13.2 2.5 3.8c0-.5.4-1 1-1H7c.6 0 1 .4 1 1 .1 1.3.4 2.6.9 3.8.2.3.1.7-.2 1L6.6 10.8Z"
          />
        </svg>
      </a>
    </div>
  );
}
