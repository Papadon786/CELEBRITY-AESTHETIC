import type { Metadata } from "next";
import Image from "next/image";
import PhotoPanel from "@/components/ui/PhotoPanel";
import SectionHeading from "@/components/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import DirectionalCard from "@/components/ui/DirectionalCard";
import ScrollTimeline from "@/components/ui/ScrollTimeline";
import WordReveal from "@/components/ui/WordReveal";
import CTASection from "@/components/CTASection";
import { categoryImages, clinicSpaceImages, getTreatmentImage, interiorImage, teamPhotos } from "@/lib/images";
import { getTreatmentBySlug } from "@/lib/treatments";

const advancedTechImage = getTreatmentImage(getTreatmentBySlug("mnrf")!);

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Celebrity Aesthetic's consultation-led approach to skin, hair, aesthetics and PMU services.",
  alternates: { canonical: "/about" },
};

const philosophySteps = [
  {
    number: "01",
    title: "Listen",
    text: "Understand your history, your concerns and what brought you in.",
  },
  {
    number: "02",
    title: "Diagnose",
    text: "Identify the right technique for your specific skin, hair or goal.",
  },
  {
    number: "03",
    title: "Personalise",
    text: "Build a treatment plan around you — never a fixed package.",
  },
];

const journeySteps = [
  { number: "01", title: "Consult", text: "Understand your concern in full." },
  { number: "02", title: "Assess", text: "Evaluate your skin, hair or aesthetic goals." },
  { number: "03", title: "Personalise", text: "Build a treatment plan suited to you." },
  { number: "04", title: "Follow Up", text: "Monitor your treatment journey with us." },
];

const teamMembers = [
  {
    name: "Naziya Baig",
    role: "Cosmetologist & Trichologist",
  },
  {
    name: "Reehal Baig",
    role: "Mechanical Engineer, Entrepreneur & Fashion Influencer — Model, Actor & Casting Director",
  },
];

const focusAreas = [
  {
    name: "Skin",
    image: categoryImages.skin,
    text: "From facials to laser-based and pigmentation-focused techniques, always discussed against your specific skin.",
  },
  {
    name: "Hair",
    image: categoryImages.hair,
    text: "Scalp and hair-focused approaches, considered against the underlying cause of your concern.",
  },
  {
    name: "Aesthetics",
    image: categoryImages.aesthetics,
    text: "Injectable and device-based techniques introduced only after a thorough conversation.",
  },
  {
    name: "PMU",
    image: categoryImages.pmu,
    text: "Semi-permanent makeup delivered with the same care and precision as our clinical treatments.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-gold/20 py-10 sm:py-14">
        <div className="mx-auto grid max-w-8xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <DirectionalCard direction="left">
            <p className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-gold-dark">
              About Celebrity Aesthetic
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight text-charcoal sm:text-5xl">
              <WordReveal text="A practice built around" />
              <span className="font-accent mt-1 block text-3xl font-normal text-gold-dark sm:text-4xl">
                <WordReveal text="the conversation first" />
              </span>
            </h1>
            <p className="mt-6 max-w-lg font-grotesk text-[17px] leading-relaxed text-charcoal/75">
              Celebrity Aesthetic brings skin, hair, aesthetics and PMU
              services together within one consultation-led practice. We
              believe the right treatment plan begins with genuinely
              understanding your concern.
            </p>
            <div className="mt-8">
              <ButtonLink href="/contact" variant="primary">
                Book A Consultation →
              </ButtonLink>
            </div>
          </DirectionalCard>
          <DirectionalCard direction="right">
            <div className="relative">
              <PhotoPanel
                src={interiorImage.src}
                alt={interiorImage.alt}
                aspect="aspect-[4/5]"
                sizes="(min-width: 1024px) 45vw, 90vw"
              />
              <div className="absolute -bottom-5 left-5 max-w-[220px] rounded-md border border-gold/40 bg-ivory px-4 py-3 shadow-md sm:left-6">
                <p className="font-grotesk text-[11px] font-semibold uppercase tracking-widest2 text-gold-dark">
                  Personalized Care
                </p>
                <p className="mt-1 font-grotesk text-[13px] text-charcoal/70">
                  Skin · Hair · Aesthetics · PMU
                </p>
              </div>
            </div>
          </DirectionalCard>
        </div>
      </section>

      {/* Our Philosophy — text + numbered steps */}
      <section className="border-b border-gold/20 py-10 sm:py-14">
        <div className="mx-auto grid max-w-8xl items-start gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            kicker="Our Philosophy"
            title="Your treatment plan is unique. So is our approach."
            description="Before any technique is discussed, we take time to understand your history, your goals and what a realistic outcome looks like for you."
          />
          <ScrollTimeline steps={philosophySteps} />
        </div>
      </section>

      {/* What We Do — dark band */}
      <section className="bg-sage-dark py-10 sm:py-14">
        <Reveal className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <SectionHeading
            kicker="What We Do"
            title="Comprehensive care. One destination."
            description="From facials to advanced aesthetics and PMU, our clinic brings specialised treatments together under one roof."
            align="center"
            light
          />
        </Reveal>
      </section>

      {/* Meet The Team */}
      <section className="border-b border-gold/20 py-10 sm:py-14">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <SectionHeading
            kicker="Meet The Team"
            title="Expertise you can trust. Care you can feel."
          />
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-12 sm:grid-cols-2">
            {teamMembers.map((member, i) => (
              <DirectionalCard
                key={i}
                index={i}
                delay={i * 0.1}
                className="overflow-hidden rounded-md border border-gold/30 bg-ivory-100"
              >
                <PhotoPanel
                  src={teamPhotos[i].src}
                  alt={teamPhotos[i].alt}
                  aspect="aspect-[4/5]"
                  bare
                  objectPosition="top"
                  sizes="(min-width: 640px) 45vw, 90vw"
                />
                <div className="p-7">
                  <p className="font-grotesk text-xs font-semibold uppercase tracking-widest2 text-gold-dark">
                    Team Member 0{i + 1}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold uppercase text-charcoal">
                    {member.name}
                  </h3>
                  <p className="mt-1 font-grotesk text-base text-charcoal/60">
                    {member.role}
                  </p>
                </div>
              </DirectionalCard>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach — 4-step journey */}
      <section className="border-b border-gold/20 py-10 sm:py-14">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <SectionHeading
            kicker="Our Approach"
            title="Care that follows your journey"
            align="center"
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step, i) => (
              <DirectionalCard
                key={step.number}
                index={i}
                delay={i * 0.1}
                className="group rounded-xl bg-sage p-7 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:bg-gold hover:shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory font-grotesk text-sm font-semibold text-gold-dark transition-colors group-hover:bg-ivory">
                  {step.number}
                </span>
                <h3 className="mt-5 font-display text-lg font-bold uppercase text-charcoal">
                  {step.title}
                </h3>
                <p className="mt-2 font-grotesk text-base leading-relaxed text-charcoal/70">
                  {step.text}
                </p>
              </DirectionalCard>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Technology */}
      <section className="border-b border-gold/20 py-10 sm:py-14">
        <div className="mx-auto grid max-w-8xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <DirectionalCard direction="left">
            <PhotoPanel
              src={advancedTechImage.src}
              alt={advancedTechImage.alt}
              aspect="aspect-[4/5]"
            />
          </DirectionalCard>
          <DirectionalCard direction="right">
            <SectionHeading
              kicker="Advanced Technology"
              title="Modern technology. Thoughtful treatment."
              description="We combine clinical expertise with advanced treatment technologies to offer personalised solutions across skin, hair, aesthetics and PMU."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {["Laser", "PRP", "MNRF", "HIFU", "Botox", "Fillers"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gold/40 px-4 py-1.5 font-grotesk text-[13px] text-charcoal/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </DirectionalCard>
        </div>
      </section>

      {/* Comprehensive care — 4-card grid */}
      <section className="border-b border-gold/20 py-10 sm:py-14">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <SectionHeading
            kicker="Personalized Care"
            title="Considered across every area we treat"
            align="center"
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {focusAreas.map((area, i) => (
              <DirectionalCard
                key={area.name}
                index={i}
                delay={i * 0.1}
                className="overflow-hidden rounded-md border border-gold/30"
              >
                <PhotoPanel
                  src={area.image.src}
                  alt={area.image.alt}
                  aspect="aspect-[4/3]"
                  bare
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
                />
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold uppercase text-charcoal">
                    {area.name}
                  </h3>
                  <p className="mt-2 font-grotesk text-sm leading-relaxed text-charcoal/70">
                    {area.text}
                  </p>
                </div>
              </DirectionalCard>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic Experience — Pinterest-style masonry gallery */}
      <section className="border-b border-gold/20 py-10 sm:py-14">
        <div className="mx-auto max-w-8xl px-5 sm:px-8">
          <SectionHeading kicker="Clinic Experience" title="A space designed for your comfort" />
          <RevealStagger className="mx-auto mt-12 max-w-4xl columns-2 gap-4">
            {clinicSpaceImages.map((image) => (
              <RevealItem
                key={image.src}
                className="mb-3 break-inside-avoid overflow-hidden rounded-md border border-gold/30"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 640px) 320px, 45vw"
                  className="block h-auto w-full"
                />
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
