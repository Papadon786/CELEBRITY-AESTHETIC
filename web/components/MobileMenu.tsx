"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { useEffect, useState } from "react";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

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

  const [treatmentsExpanded, setTreatmentsExpanded] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 top-[72px] sm:top-[80px] bottom-0 z-40 flex flex-col overflow-y-auto bg-ivory px-6 py-6 lg:hidden"
        >
          <ul className="flex flex-1 flex-col gap-1">
            {NAV_LINKS.map((link) => {
              if (link.href === "/treatments") {
                return (
                  <li key={link.href} className="border-b border-charcoal/10 pb-2">
                    <div className="flex items-center justify-between py-3">
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="font-grotesk text-lg font-medium uppercase tracking-wide text-charcoal"
                      >
                        {link.label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setTreatmentsExpanded((v: boolean) => !v)}
                        aria-label={treatmentsExpanded ? "Collapse treatments menu" : "Expand treatments menu"}
                        className="flex h-9 w-9 items-center justify-center rounded border border-gold/40 text-charcoal"
                      >
                        <span className={`text-base transition-transform ${treatmentsExpanded ? "rotate-180" : ""}`}>
                          ↓
                        </span>
                      </button>
                    </div>

                    {treatmentsExpanded && (
                      <div className="mb-2 space-y-3 rounded-lg border border-gold/30 bg-sage/30 p-4 font-grotesk text-sm">
                        <div>
                          <Link
                            href="/treatments?subCategory=hair-restoration"
                            onClick={onClose}
                            className="block font-bold uppercase tracking-wider text-charcoal hover:text-gold-dark"
                          >
                            Hair Restoration
                          </Link>
                          <p className="text-[12px] text-charcoal/70">
                            GFC · PRP · BIOCELL · HF · Exosomes · CBL
                          </p>
                        </div>
                        <div>
                          <Link
                            href="/treatments?subCategory=hair-transplant"
                            onClick={onClose}
                            className="block font-bold uppercase tracking-wider text-charcoal hover:text-gold-dark"
                          >
                            Hair Transplant (22 Specialities)
                          </Link>
                          <p className="text-[12px] text-charcoal/70">
                            Celebrity, FUE, Crown, Hairline, Beard, etc.
                          </p>
                        </div>
                        <div>
                          <Link
                            href="/treatments?category=skin"
                            onClick={onClose}
                            className="block font-bold uppercase tracking-wider text-charcoal hover:text-gold-dark"
                          >
                            Skin Care &amp; Aesthetics
                          </Link>
                          <p className="text-[12px] text-charcoal/70">
                            Acne, Pigmentation, Medi Facials, Botox, Fillers, HIFU
                          </p>
                        </div>
                        <div>
                          <Link
                            href="/pmu-services"
                            onClick={onClose}
                            className="block font-bold uppercase tracking-wider text-charcoal hover:text-gold-dark"
                          >
                            PMU
                          </Link>
                          <p className="text-[12px] text-charcoal/70">
                            Microblading, Lip Blush, SMP &amp; Certified Academy
                          </p>
                        </div>
                        <div className="pt-2">
                          <Link
                            href="/treatments"
                            onClick={onClose}
                            className="inline-block font-semibold uppercase tracking-wider text-gold-dark"
                          >
                            View All 57 Treatments Catalog →
                          </Link>
                        </div>
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <li key={link.href} className="border-b border-charcoal/10">
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="block py-3.5 font-grotesk text-lg font-medium uppercase tracking-wide text-charcoal"
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/contact"
            onClick={onClose}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-gold px-6 py-4 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-charcoal"
          >
            Book Consultation →
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
