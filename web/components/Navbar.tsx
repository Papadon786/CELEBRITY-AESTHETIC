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

                  {/* Hover (and keyboard-focus) dropdown for Treatments —
                      a simple stacked list of the 3 top-level categories. */}
                  <div
                    className="invisible absolute left-0 top-full z-50 w-56 translate-y-2 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
                  >
                    <div className="overflow-hidden rounded-xl border border-gold/40 bg-ivory shadow-[0_20px_50px_rgba(23,23,23,0.18)] backdrop-blur-md">
                      <ul className="flex flex-col divide-y divide-gold/20">
                        <li>
                          <Link
                            href="/treatments?category=hair"
                            className="block px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-charcoal transition-colors hover:text-gold-dark"
                          >
                            Hair Care
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/treatments?category=skin"
                            className="block px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-charcoal transition-colors hover:text-gold-dark"
                          >
                            Skin Care
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/pmu-services"
                            className="block px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-charcoal transition-colors hover:text-gold-dark"
                          >
                            PMU
                          </Link>
                        </li>
                      </ul>
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
            className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 transition-colors ${
              onDarkHero
                ? "bg-ivory text-charcoal hover:bg-ivory-100"
                : "bg-gold text-charcoal hover:bg-gold-light"
            }`}
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
