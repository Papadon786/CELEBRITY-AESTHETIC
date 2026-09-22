"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const [previousPathname, setPreviousPathname] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);

  const isHome = pathname === "/";

  // Robust window scroll listener that works across mobile touch, Lenis, and desktop.
  // The navbar fills solid the instant the "Our Pillars" section reaches it —
  // not a percentage of the hero's animation, which left it transparent long
  // after the hero had visually ended.
  useEffect(() => {
    const pillarsEl = document.getElementById("our-pillars");

    const handleScroll = () => {
      if (!pillarsEl) {
        setScrolled(window.scrollY > 20);
        return;
      }
      const pillarsTop = pillarsEl.getBoundingClientRect().top + window.scrollY;
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      setScrolled(window.scrollY >= pillarsTop - headerHeight);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Non-home pages always show solid background; home shows solid once scrolled
  const showSolid = !isHome || scrolled;

  // Close mobile menu on page navigation
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  // The navbar's filled state now matches TrustBar's burgundy, both when
  // solid (mobile always; desktop once scrolled past the hero) and when
  // transparent over the hero's dark video/canvas — so nav text/logo stay
  // light-on-dark in every state, never the old dark-on-ivory pairing.

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-[border-color,box-shadow] duration-300 ${
        showSolid
          ? "border-b border-gold/30 bg-charcoal/95 shadow-[0_1px_20px_rgba(23,23,23,0.06)] backdrop-blur"
          : "border-b border-gold/30 bg-charcoal/95 shadow-[0_1px_20px_rgba(23,23,23,0.06)] backdrop-blur lg:border-transparent lg:bg-transparent lg:shadow-none lg:backdrop-blur-none"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-8xl items-center justify-between px-4 py-2 sm:px-8 sm:py-2.5"
      >
        <Logo variant="light" />

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            const linkClassName = `relative pb-1 font-grotesk text-[13px] uppercase tracking-widest2 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:transition-transform after:duration-200 after:bg-gold-light ${
              active
                ? "text-gold-light after:scale-x-100"
                : "text-ivory/85 after:scale-x-0 hover:text-gold-light hover:after:scale-x-100"
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
                      className="h-1.5 w-2.5 fill-ivory/85 transition-transform duration-200 group-hover:rotate-180"
                    >
                      <path d="M0 0 L5 6 L10 0 Z" />
                    </svg>
                  </Link>

                  {/* Treatments Dropdown on Desktop */}
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

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ivory px-6 py-3 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-charcoal transition-colors hover:bg-ivory-100"
          >
            Book Consultation →
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 p-2 transition-all hover:bg-gold/20 active:scale-95 lg:hidden"
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-ivory transition-all duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-ivory transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-ivory transition-all duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
