"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "./Logo";
import { NAV_LINKS, PHONE_DISPLAY, buildWhatsAppLink } from "@/lib/constants";

// Extended links for mobile menu so users have full access to the clinic's core sections
const MOBILE_NAV_LINKS = [
  ...NAV_LINKS,
  { label: "Results", href: "/results" },
  { label: "Academy", href: "/academy" },
];

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [treatmentsExpanded, setTreatmentsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col overflow-y-auto bg-charcoal/98 backdrop-blur-2xl px-5 py-4 lg:hidden"
        >
          {/* Header Row: Brand Identity + Luxury Close Button */}
          <div className="flex items-center justify-between border-b border-gold/25 pb-3 pt-1">
            <div onClick={onClose}>
              <Logo variant="light" size="default" />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-ivory transition-all hover:bg-gold/20 active:scale-95"
            >
              <span className="text-xl font-light leading-none">✕</span>
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="mt-3 flex flex-1 flex-col divide-y divide-ivory/10">
            {MOBILE_NAV_LINKS.map((link) => {
              if (link.href === "/treatments") {
                return (
                  <li key={link.href} className="py-1">
                    <div className="flex items-center justify-between py-2.5">
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="font-grotesk text-lg font-medium uppercase tracking-wide text-ivory transition-colors hover:text-gold-light"
                      >
                        {link.label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setTreatmentsExpanded((v) => !v)}
                        aria-label={treatmentsExpanded ? "Collapse treatments menu" : "Expand treatments menu"}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gold/40 bg-gold/10 text-ivory transition-all"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 10 6"
                          className={`h-2 w-3 fill-gold transition-transform duration-200 ${
                            treatmentsExpanded ? "rotate-180" : ""
                          }`}
                        >
                          <path d="M0 0 L5 6 L10 0 Z" />
                        </svg>
                      </button>
                    </div>

                    {treatmentsExpanded && (
                      <div className="my-2 flex flex-col divide-y divide-gold/20 rounded-xl border border-gold/30 bg-charcoal-light/90 font-grotesk text-sm shadow-inner">
                        <Link
                          href="/treatments?category=hair"
                          onClick={onClose}
                          className="flex items-center justify-between px-4 py-3 font-semibold uppercase tracking-wider text-ivory transition-colors hover:text-gold-light"
                        >
                          <span>Hair Care</span>
                          <span className="text-xs text-gold">→</span>
                        </Link>
                        <Link
                          href="/treatments?category=skin"
                          onClick={onClose}
                          className="flex items-center justify-between px-4 py-3 font-semibold uppercase tracking-wider text-ivory transition-colors hover:text-gold-light"
                        >
                          <span>Skin Care &amp; Injectables</span>
                          <span className="text-xs text-gold">→</span>
                        </Link>
                        <Link
                          href="/pmu-services"
                          onClick={onClose}
                          className="flex items-center justify-between px-4 py-3 font-semibold uppercase tracking-wider text-ivory transition-colors hover:text-gold-light"
                        >
                          <span>PMU Services</span>
                          <span className="text-xs text-gold">→</span>
                        </Link>
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block py-3 font-grotesk text-lg font-medium uppercase tracking-wide text-ivory transition-colors hover:text-gold-light"
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Quick Actions & Booking CTA */}
          <div className="mt-6 flex flex-col gap-2.5 border-t border-gold/25 pt-4">
            <Link
              href="/contact"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 font-grotesk text-xs font-bold uppercase tracking-widest2 text-charcoal shadow-[0_4px_16px_rgba(175,203,216,0.3)] transition-transform active:scale-[0.98]"
            >
              Book Consultation →
            </Link>
            <div className="grid grid-cols-2 gap-2 text-center font-grotesk text-xs uppercase tracking-wider">
              <a
                href={`tel:+${PHONE_DISPLAY}`}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gold/30 bg-charcoal-light py-2.5 text-ivory transition-colors hover:border-gold hover:text-gold-light"
              >
                <span>📞</span> Call Clinic
              </a>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gold/30 bg-charcoal-light py-2.5 text-ivory transition-colors hover:border-gold hover:text-gold-light"
              >
                <span>💬</span> WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
