"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Word-by-word reveal for a short headline — each word rises and fades in
 * with a small stagger as the text scrolls into view, once only. Reserved
 * for headings/short phrases (per the pattern this follows); never wrap a
 * paragraph in this, the stagger reads as a gimmick at that length.
 *
 * Accessible: the visible words are aria-hidden and the real sentence is
 * exposed once via aria-label, so screen readers hear it normally instead
 * of word-by-word. prefers-reduced-motion is handled globally (see
 * app/globals.css), which collapses the stagger/transition to instant.
 */
export default function WordReveal({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      aria-label={text}
      className={className}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={word} aria-hidden="true" className="inline-block">
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}
