import SectionHeading from "./SectionHeading";
import { Reveal } from "./ui/Reveal";
import { SITE_NAME } from "@/lib/constants";

const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
  `${SITE_NAME} reviews`
)}`;

/**
 * No real Google Business Profile data is connected yet. This used to show
 * three placeholder review cards with a filled 5-star rating on each — that
 * visually asserted a 5.0 rating from real clients while the badge next to
 * it said "Coming Soon," which contradicted its own disclaimer. Until real
 * reviews are connected, this section states that plainly instead of
 * simulating the social proof it doesn't have yet.
 */
export default function GoogleReviews() {
  return (
    <section
      aria-label="Google reviews"
      className="border-y border-gold/20 bg-ivory-300/50 py-12 sm:py-16"
    >
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <SectionHeading
          kicker="Google Reviews"
          title="In our clients' words"
          align="center"
          description="Real ratings and reviews will appear here once our Google Business Profile is connected."
        />

        <Reveal className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-gold/30 bg-ivory px-6 py-3">
            <span className="font-grotesk text-[13px] uppercase tracking-widest2 text-charcoal/60">
              Google Reviews · Coming Soon
            </span>
          </div>
        </Reveal>

        <Reveal className="mt-10 text-center">
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-charcoal/70 px-7 py-3.5 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-charcoal transition-colors hover:border-gold hover:text-gold-dark"
          >
            Find Us On Google →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
