import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PhotoPanel from "@/components/ui/PhotoPanel";
import { ButtonLink } from "@/components/ui/Button";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import DirectionalCard from "@/components/ui/DirectionalCard";
import WordReveal from "@/components/ui/WordReveal";
import WhatsAppButton from "@/components/WhatsAppButton";
import FAQAccordion from "@/components/FAQAccordion";
import {
  categoryLabels,
  getTreatmentBySlug,
  treatments,
} from "@/lib/treatments";
import { getTreatmentImage } from "@/lib/images";

export function generateStaticParams() {
  return treatments.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const treatment = getTreatmentBySlug(slug);
  if (!treatment) return { title: "Treatment Not Found" };
  return {
    title: treatment.name,
    description: treatment.description,
    alternates: { canonical: `/treatments/${treatment.slug}` },
    openGraph: {
      title: treatment.name,
      description: treatment.description,
    },
  };
}

export default async function TreatmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const treatment = getTreatmentBySlug(slug);
  if (!treatment) notFound();

  const whatsappMessage = `Hello Crown Celebrity Aesthetic, I would like to know more about ${treatment.name}.`;

  return (
    <article className="py-16 sm:py-24">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/treatments"
            className="font-grotesk text-[13px] uppercase tracking-widest2 text-charcoal/60 hover:text-gold-dark"
          >
            ← All Treatments
          </Link>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <DirectionalCard direction="left">
            <PhotoPanel
              src={getTreatmentImage(treatment).src}
              alt={getTreatmentImage(treatment).alt}
              aspect="aspect-[4/5]"
              sizes="(min-width: 1024px) 45vw, 90vw"
              priority
            />
          </DirectionalCard>

          <DirectionalCard direction="right">
            <p className="font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-gold-dark">
              {categoryLabels[treatment.category]}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-charcoal sm:text-4xl">
              <WordReveal text={treatment.name} />
            </h1>
            <p className="mt-5 max-w-xl font-grotesk text-[17px] leading-relaxed text-charcoal/75">
              {treatment.description}
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink
                href={`/contact?treatment=${encodeURIComponent(treatment.name)}`}
                variant="primary"
              >
                Book A Consultation →
              </ButtonLink>
              <WhatsAppButton message={whatsappMessage} />
            </div>
            <p className="mt-4 font-grotesk text-[13px] font-semibold uppercase tracking-wide text-gold-dark">
              No Cost EMI available on all services
            </p>
          </DirectionalCard>
        </div>

        <RevealStagger className="mt-16 grid gap-10 border-t border-gold/20 pt-14 sm:grid-cols-2">
          <RevealItem>
            <DetailBlock title="What Is It?" text={treatment.detail.whatIsIt} />
          </RevealItem>
          <RevealItem>
            <DetailBlock
              title="Who May Consider It?"
              text={treatment.detail.whoMayConsider}
            />
          </RevealItem>
          <RevealItem>
            <DetailBlock
              title="What To Expect"
              text={treatment.detail.whatToExpect}
            />
          </RevealItem>
          <RevealItem>
            <DetailBlock
              title="The Treatment Journey"
              text={treatment.detail.journey}
            />
          </RevealItem>
          <RevealItem>
            <DetailBlock title="Aftercare" text={treatment.detail.aftercare} />
          </RevealItem>
          {treatment.detail.additionalServices && (
            <RevealItem>
              <DetailBlock
                title="Additional Services"
                text={treatment.detail.additionalServices}
              />
            </RevealItem>
          )}
          {treatment.detail.pricing && (
            <RevealItem>
              <DetailBlock title="Pricing" text={treatment.detail.pricing} />
            </RevealItem>
          )}
        </RevealStagger>
      </div>

      <FAQAccordion items={treatment.detail.faq} showDisclaimer />
    </article>
  );
}

function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold uppercase text-charcoal">
        {title}
      </h2>
      <p className="mt-3 font-grotesk text-base leading-relaxed text-charcoal/70">
        {text}
      </p>
    </div>
  );
}
