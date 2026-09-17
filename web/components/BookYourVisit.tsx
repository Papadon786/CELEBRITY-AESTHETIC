import SectionHeading from "./SectionHeading";
import BookingForm from "./BookingForm";
import DirectionalCard from "./ui/DirectionalCard";

const checklist = [
  "Personalised consultation",
  "Skin, hair & aesthetic concerns",
  "For men & women",
  "Appointment-based care",
];

export default function BookYourVisit({
  presetTreatment,
}: {
  presetTreatment?: string;
}) {
  return (
    <section aria-label="Book your visit" className="bg-sage-dark py-16 sm:py-24">
      <div className="mx-auto grid max-w-8xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <DirectionalCard direction="left">
          <SectionHeading
            kicker="Book Your Visit"
            title="Your journey starts with a consultation"
            description="Tell us what you'd like help with and our team will assist you with the next step."
            light
          />
          <ul className="mt-8 space-y-4">
            {checklist.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 font-grotesk text-base text-ivory/85"
              >
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold-light/60 text-gold-light"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6.2 4.6 9 10 2.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </DirectionalCard>

        <DirectionalCard
          direction="right"
          id="booking-form"
          className="scroll-mt-28 rounded-xl border border-gold/20 bg-ivory-100 p-6 shadow-xl sm:p-10"
        >
          <BookingForm presetTreatment={presetTreatment} />
        </DirectionalCard>
      </div>
    </section>
  );
}
