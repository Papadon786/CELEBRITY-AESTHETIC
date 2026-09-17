/**
 * Elegant placeholder visual block used everywhere a real photograph will
 * eventually go. Swap real photography in by replacing the `image` field on
 * the relevant treatment / section data and rendering a real <Image> there
 * instead of this component — the aspect ratio classes are chosen to match
 * where each instance is used so the swap is a drop-in.
 */
export default function PlaceholderPanel({
  label,
  aspect = "aspect-[4/5]",
  className = "",
  icon = "leaf",
  bare = false,
}: {
  label: string;
  aspect?: string;
  className?: string;
  icon?: "leaf" | "drop" | "spark" | "ring" | "face";
  /** Drop the panel's own border/radius — for when a parent card already frames it. */
  bare?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} — placeholder image, real photography to be added`}
      className={`relative ${aspect} w-full overflow-hidden bg-gradient-to-br from-ivory-300 via-sage/50 to-gold/20 ${
        bare ? "" : "rounded-md border border-gold/30"
      } ${className}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <PlaceholderIcon icon={icon} />
        <span className="font-grotesk text-[11px] uppercase tracking-widest2 text-charcoal/50">
          {label}
        </span>
      </div>
    </div>
  );
}

function PlaceholderIcon({ icon }: { icon: string }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none" as const,
    stroke: "#AFCBD8",
    strokeWidth: 1,
  };
  switch (icon) {
    case "drop":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M14 4C14 4 21 13 21 18a7 7 0 1 1-14 0C7 13 14 4 14 4Z" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common} aria-hidden="true">
          <path d="M14 3v6M14 19v6M3 14h6M19 14h6M6 6l4 4M18 18l4 4M22 6l-4 4M10 18l-4 4" />
        </svg>
      );
    case "ring":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="14" cy="14" r="9" />
        </svg>
      );
    case "face":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="14" cy="12" r="7" />
          <path d="M6 26c1.5-5 4.5-7 8-7s6.5 2 8 7" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <path d="M14 25V13M14 13C14 7 9 4 4 4c0 8 4 11 10 11ZM14 13c0-6 5-9 10-9 0 8-4 11-10 11" />
        </svg>
      );
  }
}
