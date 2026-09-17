import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-7 py-3.5 font-grotesk text-[13px] font-semibold uppercase tracking-widest2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const variants = {
  primary: "bg-gold text-charcoal hover:bg-gold-light",
  sage: "bg-sage text-charcoal hover:bg-sage-dark hover:text-ivory",
  secondary:
    "bg-transparent text-charcoal border border-charcoal/70 hover:border-gold hover:text-gold-dark",
  goldOutline:
    "bg-transparent text-charcoal border border-gold hover:bg-gold/10",
  ivoryOnDark:
    "bg-ivory text-charcoal hover:bg-ivory-100 border border-transparent",
  outlineLight:
    "bg-transparent text-ivory border border-ivory/70 hover:border-gold-light hover:text-gold-light",
};

type Variant = keyof typeof variants;

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
