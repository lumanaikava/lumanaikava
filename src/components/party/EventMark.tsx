import Image from "next/image";

/**
 * The LUNA EKLIPTIKA logo — the real artwork, not a redraw.
 *
 * public/images/party/luna-ekliptika-logo.png is Ash's file: white
 * diamond and crescent over a photographed moon, on transparency. It
 * only reads on a dark ground, which is exactly where it's used.
 *
 * An earlier version of this component drew the mark in SVG because the
 * file wasn't on disk yet. It isn't a substitute — the photographic moon
 * is the point — so that version is gone.
 */
export default function EventMark({
  className = "",
  sizes = "160px",
  priority = false,
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/images/party/luna-ekliptika-logo.png"
        alt="Luna Ekliptika"
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain"
      />
    </div>
  );
}
