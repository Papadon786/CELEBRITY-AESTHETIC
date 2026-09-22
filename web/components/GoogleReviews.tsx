import SectionHeading from "./SectionHeading";
import { Reveal } from "./ui/Reveal";
import { SITE_NAME } from "@/lib/constants";
import { GOOGLE_REVIEWS } from "@/lib/reviews";

const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
  `${SITE_NAME} reviews`
)}`;

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-gold-dark" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.2}
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

/** Real Google Business Profile reviews — see lib/reviews.ts. */
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
          description={`${GOOGLE_REVIEWS.length}+ five-star reviews from real clients on Google.`}
        />

        <Reveal className="mt-10">
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:thin]">
            {GOOGLE_REVIEWS.map((review) => (
              <div
                key={review.name}
                className="w-[85vw] shrink-0 snap-start rounded-xl border border-gold/20 bg-ivory p-6 sm:w-[360px]"
              >
                <StarRow rating={review.rating} />
                <p className="mt-3 font-grotesk text-[15px] leading-relaxed text-charcoal/80 line-clamp-6">
                  {review.text}
                </p>
                <div className="mt-4 flex items-center justify-between font-grotesk text-[13px] text-charcoal/60">
                  <span className="font-semibold text-charcoal">{review.name}</span>
                  <span>{review.when}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-10 text-center">
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-charcoal/70 px-7 py-3.5 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-charcoal transition-colors hover:border-gold hover:text-gold-dark"
          >
            Read More On Google →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
