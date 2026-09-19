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
                      <div className="mb-2 flex flex-col divide-y divide-gold/30 rounded-lg border border-gold/30 bg-sage/30 font-grotesk text-sm">
                        <Link
                          href="/treatments?category=hair"
                          onClick={onClose}
                          className="block px-4 py-3 font-bold uppercase tracking-wider text-charcoal hover:text-gold-dark"
                        >
                          Hair Care
                        </Link>
                        <Link
                          href="/treatments?category=skin"
                          onClick={onClose}
                          className="block px-4 py-3 font-bold uppercase tracking-wider text-charcoal hover:text-gold-dark"
                        >
                          Skin Care
                        </Link>
                        <Link
                          href="/pmu-services"
                          onClick={onClose}
                          className="block px-4 py-3 font-bold uppercase tracking-wider text-charcoal hover:text-gold-dark"
                        >
                          PMU
                        </Link>
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
