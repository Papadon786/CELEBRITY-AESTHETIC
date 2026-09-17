import Image from "next/image";

/**
 * Real-photo counterpart to <PlaceholderPanel />, sharing the same framing
 * (aspect ratio, thin border, rounded corners) so photo and placeholder
 * slots line up wherever a section is mid-migration from one to the other.
 */
export default function PhotoPanel({
  src,
  alt,
  aspect = "aspect-[4/5]",
  className = "",
  bare = false,
  sizes = "(min-width: 1024px) 40vw, 90vw",
  priority = false,
  objectPosition = "center",
}: {
  src: string;
  alt: string;
  aspect?: string;
  className?: string;
  /** Drop the panel's own border/radius — for when a parent card already frames it. */
  bare?: boolean;
  sizes?: string;
  priority?: boolean;
  /** CSS object-position for the crop — e.g. "top" to favor a face/head
   * over whatever sits below it when the aspect box crops a taller
   * source photo. */
  objectPosition?: string;
}) {
  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden bg-ivory-300 ${
        bare ? "" : "rounded-md border border-gold/30"
      } ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition }}
      />
    </div>
  );
}
