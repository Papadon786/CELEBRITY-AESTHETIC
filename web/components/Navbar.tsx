"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "@/lib/constants";
import { categoryLabels, type TreatmentCategory } from "@/lib/treatments";
import { ensureGsap } from "@/lib/gsap";
import { SCROLL_DISTANCE } from "@/lib/heroSequence";

const TREATMENT_CATEGORIES: TreatmentCategory[] = ["skin", "hair", "pmu"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [previousPathname, setPreviousPathname] = useState(pathname);

  // On the homepage the navbar overlays the full-screen hero instead of
  // sitting in normal document flow above it — otherwise its own height
  // would push the hero down, leaving a sliver of it below the fold until
  // the user scrolls. Other pages keep the normal sticky behavior, since
  // their content isn't designed to run edge-to-edge under the nav.
  const isHome = pathname === "/";

  useEffect(() => {
    // Only the homepage has a hero to float transparently over — other
    // pages always show the solid background (handled below, during
    // render, rather than by setting state here), so there's nothing for
    // this effect to observe on them.
    if (!isHome) return;

    // On the homepage, the hero is a full-screen pinned background — the
    // navbar should stay transparent over it from the very first paint,
    // regardless of scroll position within the pin/scrub, and only pick up
    // its solid background once the hero has actually scrolled out of view
    // (i.e. we're over the next section).
    const hero = document.getElementById("hero-pin-target");
    if (!hero) return;

    // A ScrollTrigger toggle (matching Hero.tsx's own pin range exactly)
    // rather than an IntersectionObserver on the same element — Hero's
    // GSAP pin wraps `hero` in a pin-spacer and switches it to
    // `position: fixed` once the pin activates, and that DOM mutation can
    // fire a spurious IntersectionObserver callback that permanently
    // (and wrongly) flips this to "scrolled". A second ScrollTrigger on
    // the same trigger/start/end isn't affected by its own pin-spacer
    // restructuring, so it stays correct for the entire pin duration.
    const { ScrollTrigger } = ensureGsap();
    const scrollTrigger = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: SCROLL_DISTANCE,
      onEnter: () => setScrolled(false),
      onLeave: () => setScrolled(true),
      onEnterBack: () => setScrolled(false),
      onLeaveBack: () => setScrolled(false),
    });

    return () => scrollTrigger.kill();
  }, [isHome]);

  // Non-home pages always show the solid background — derived during
  // render rather than via an effect-set state, since it needs no DOM
  // measurement at all.
  const showSolid = !isHome || scrolled;

  // Close the mobile menu on navigation. Derived during render (React's
  // recommended pattern for adjusting state in response to a changed prop)
  // rather than in an effect, to avoid a synchronous setState-in-effect
  // cascade.
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  // While floating transparent over the hero, the navbar sits on top of a
  // darkened (black-overlaid) photo — burgundy-on-dark reads poorly there,
  // so it borrows the hero's light text treatment until scrolled past it.
  const onDarkHero = isHome && !showSolid;

  return (
    <header
      className={`${isHome ? "fixed inset-x-0 top-0" : "sticky top-0"} z-50 border-b transition-all duration-300 ${
        showSolid
          ? "border-gold/30 bg-ivory/95 shadow-[0_1px_20px_rgba(23,23,23,0.06)] backdrop-blur"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-8xl items-center justify-between px-5 py-2.5 sm:px-8"
      >
        <Logo variant={onDarkHero ? "light" : "dark"} />

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            const linkClassName = `relative pb-1 font-grotesk text-[13px] uppercase tracking-widest2 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:transition-transform after:duration-200 ${
              onDarkHero
                ? `after:bg-gold-light ${
                    active
                      ? "text-gold-light after:scale-x-100"
                      : "text-ivory/85 after:scale-x-0 hover:text-gold-light hover:after:scale-x-100"
                  }`
                : `after:bg-gold-dark ${
                    active
                      ? "text-gold-dark after:scale-x-100"
                      : "text-charcoal/80 after:scale-x-0 hover:text-gold-dark hover:after:scale-x-100"
                  }`
            }`;

            if (link.href === "/treatments") {
              return (
                <li key={link.href} className="group relative">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center gap-1.5 ${linkClassName}`}
                  >
                    {link.label}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 10 6"
                      className={`h-1.5 w-2.5 transition-transform duration-200 group-hover:rotate-180 ${
                        onDarkHero ? "fill-ivory/85" : "fill-charcoal/80"
                      }`}
                    >
                      <path d="M0 0 L5 6 L10 0 Z" />
                    </svg>
                  </Link>

                  {/* Hover (and keyboard-focus) Mega Menu for Treatments */}
                  <div
                    className="invisible absolute left-1/2 top-full z-50 w-[1000px] max-w-[95vw] -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                  >
                    <div className="overflow-hidden rounded-xl border border-gold/40 bg-ivory shadow-[0_20px_50px_rgba(23,23,23,0.18)] backdrop-blur-md">
                      <div className="grid grid-cols-4 gap-6 p-7">
                        {/* Column 1: Hair Restoration */}
                        <div>
                          <Link
                            href="/treatments?subCategory=hair-restoration"
                            className="group/col block border-b border-gold/30 pb-2 font-display text-sm font-bold uppercase tracking-wider text-charcoal transition-colors hover:text-gold-dark"
                          >
                            Hair Restoration
                            <span className="block text-[11px] font-normal font-grotesk tracking-normal text-gold-dark">
                              GFC · PRP · BIOCELL · HF · EXOSOME · CBL
                            </span>
                          </Link>
                          <ul className="mt-3 space-y-2">
                            <li>
                              <Link href="/treatments/advanced-gfc" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                GFC Growth Factor Concentrate
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/advanced-prp" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Advanced PRP Therapy
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/biocell-hair-therapy" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                BIOCELL Cellular Rejuvenation
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/hf-hair-therapy" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                HF Follicle Stimulation
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/exosomes" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Exosome Scalp Therapy
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/cbl-hair-therapy" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                CBL Cold Bio-Laser
                              </Link>
                            </li>
                          </ul>
                          <Link
                            href="/treatments?category=hair"
                            className="mt-4 inline-flex items-center gap-1 font-grotesk text-[11px] font-semibold uppercase tracking-wider text-gold-dark hover:underline"
                          >
                            All Hair Services →
                          </Link>
                        </div>

                        {/* Column 2: Hair Transplant */}
                        <div>
                          <Link
                            href="/treatments?subCategory=hair-transplant"
                            className="group/col block border-b border-gold/30 pb-2 font-display text-sm font-bold uppercase tracking-wider text-charcoal transition-colors hover:text-gold-dark"
                          >
                            Hair Transplant
                            <span className="block text-[11px] font-normal font-grotesk tracking-normal text-gold-dark">
                              22 Specialized Clinical Techniques
                            </span>
                          </Link>
                          <ul className="mt-3 space-y-2">
                            <li>
                              <Link href="/treatments/celebrity-hair-transplant" className="block text-[13px] font-medium text-charcoal/90 transition-colors hover:text-gold-dark">
                                Celebrity Hair Transplant
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/crown-hair-transplant" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Crown Hair Transplant
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/fue-hair-transplant" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                FUE Micro-Grafting
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/hairline-reconstruction" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Hairline Reconstruction
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/male-hair-transplant" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Male Hair Restoration
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/female-hair-transplant" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Female Hair Transplant
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/beard-hair-transplant" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Beard &amp; Moustache FUE
                              </Link>
                            </li>
                          </ul>
                          <Link
                            href="/treatments?subCategory=hair-transplant"
                            className="mt-3 inline-flex items-center gap-1 font-grotesk text-[11px] font-semibold uppercase tracking-wider text-gold-dark hover:underline"
                          >
                            View All 22 Transplant Options →
                          </Link>
                        </div>

                        {/* Column 3: Skin Care & Clinical Aesthetics (Aesthetics migrated here!) */}
                        <div>
                          <Link
                            href="/treatments?category=skin"
                            className="group/col block border-b border-gold/30 pb-2 font-display text-sm font-bold uppercase tracking-wider text-charcoal transition-colors hover:text-gold-dark"
                          >
                            Skin Care &amp; Aesthetics
                            <span className="block text-[11px] font-normal font-grotesk tracking-normal text-gold-dark">
                              Acne · Pigment · Medi Facials · Botox · Fillers
                            </span>
                          </Link>
                          <ul className="mt-3 space-y-2">
                            <li>
                              <Link href="/treatments/acne-scar-treatment" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Acne &amp; Scar Remodeling (MNRF, CO2)
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/pigmentation-treatment" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Pigmentation &amp; Laser Toning
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/korean-medi-facial" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Korean Glass Skin Medi Facial
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/laser-hair-removal" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                US FDA Laser Hair Removal
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/botox" className="block text-[13px] font-medium text-charcoal/90 transition-colors hover:text-gold-dark">
                                Botox &amp; Wrinkle Softening
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/fillers" className="block text-[13px] font-medium text-charcoal/90 transition-colors hover:text-gold-dark">
                                Dermal Fillers (Lips &amp; Cheeks)
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/hifu-double-chin" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                HIFU Non-Surgical Lift
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/thread-lift" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Collagen Thread Lift
                              </Link>
                            </li>
                          </ul>
                          <Link
                            href="/treatments?category=skin"
                            className="mt-3 inline-flex items-center gap-1 font-grotesk text-[11px] font-semibold uppercase tracking-wider text-gold-dark hover:underline"
                          >
                            Explore All Skin &amp; Aesthetics →
                          </Link>
                        </div>

                        {/* Column 4: PMU */}
                        <div>
                          <Link
                            href="/pmu-services"
                            className="group/col block border-b border-gold/30 pb-2 font-display text-sm font-bold uppercase tracking-wider text-charcoal transition-colors hover:text-gold-dark"
                          >
                            PMU
                            <span className="block text-[11px] font-normal font-grotesk tracking-normal text-gold-dark">
                              Permanent Makeup &amp; Academy
                            </span>
                          </Link>
                          <ul className="mt-3 space-y-2">
                            <li>
                              <Link href="/treatments/eyebrow-microblading" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Eyebrow Microblading &amp; Shading
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/lip-tinting" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Semi-Permanent Lip Blush
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/permanent-eyeliner" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Permanent Eyeliner Definition
                              </Link>
                            </li>
                            <li>
                              <Link href="/treatments/smp-pmu" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Scalp Micropigmentation (SMP)
                              </Link>
                            </li>
                            <li>
                              <Link href="/academy" className="block text-[13px] font-medium text-gold-dark transition-colors hover:underline">
                                🎓 PMU Certified Academy
                              </Link>
                            </li>
                            <li>
                              <Link href="/academy" className="block text-[13px] text-charcoal/80 transition-colors hover:text-gold-dark">
                                Hands-On Masterclass Training
                              </Link>
                            </li>
                          </ul>
                          <Link
                            href="/pmu-services"
                            className="mt-3 inline-flex items-center gap-1 font-grotesk text-[11px] font-semibold uppercase tracking-wider text-gold-dark hover:underline"
                          >
                            PMU Services &amp; Academy →
                          </Link>
                        </div>
                      </div>

                      {/* Bottom banner */}
                      <div className="flex items-center justify-between border-t border-gold/20 bg-charcoal/5 px-7 py-3 text-xs text-charcoal/70">
                        <span className="font-grotesk">
                          👑 Personalized diagnostic consultation with senior clinical specialists.
                        </span>
                        <Link
                          href="/contact"
                          className="font-grotesk font-semibold text-gold-dark transition-colors hover:text-charcoal"
                        >
                          Book Consultation Today →
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClassName}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-charcoal transition-colors hover:bg-gold-light"
          >
            Book Consultation →
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span
            className={`block h-px w-6 transition-transform ${onDarkHero ? "bg-ivory" : "bg-charcoal"} ${
              menuOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 transition-transform ${onDarkHero ? "bg-ivory" : "bg-charcoal"} ${
              menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
