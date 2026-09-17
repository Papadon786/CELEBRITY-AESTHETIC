/**
 * A quiet, always-on trust strip right under the hero — a seamless
 * marquee of the practice's actual claims (consultation-led, the four
 * service areas, academy-trained staff), not invented stats like a
 * specific client count or press logos we don't have.
 */
const trustItems = [
  "Consultation-Led Care",
  "Skin · Hair · Aesthetics · PMU",
  "Academy-Trained Practitioners",
  "Personalised Treatment Plans",
  "Honest, No-Pressure Advice",
  "Skin, Hair & PMU Under One Roof",
];

export default function TrustBar() {
  return (
    <div
      aria-label="Why clients choose us"
      className="mt-4 overflow-hidden border-y-4 border-gold bg-charcoal py-2.5 sm:mt-6 sm:py-3"
    >
      {/* The item list renders twice back-to-back; the track then scrolls
          exactly -50% of its own width, so the seam between the first and
          second copy is invisible mid-loop. */}
      <div className="marquee-track flex w-max shrink-0 items-center gap-10">
        {[...trustItems, ...trustItems].map((item, i) => (
          <span
            key={i}
            aria-hidden={i >= trustItems.length}
            className="flex items-center gap-10 whitespace-nowrap font-grotesk text-sm font-semibold uppercase tracking-widest2 text-gold-light"
          >
            <span>{item}</span>
            <span aria-hidden="true" className="text-base text-gold-light/50">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
