import Image from "next/image";

/**
 * A drink photo that sloshes and throws accent-colored droplets on hover.
 * Pure CSS — the animation lives in globals.css (.splash-drink rules) and
 * respects prefers-reduced-motion.
 */

// Droplet burst pattern: position around the glass rim + fling vector.
const drops = [
  { left: "18%", top: "18%", size: 9, sx: "-26px", sy: "-42px", delay: "0ms" },
  { left: "72%", top: "12%", size: 7, sx: "22px", sy: "-50px", delay: "60ms" },
  { left: "44%", top: "8%", size: 11, sx: "-6px", sy: "-58px", delay: "30ms" },
  { left: "84%", top: "30%", size: 6, sx: "30px", sy: "-30px", delay: "110ms" },
  { left: "8%", top: "34%", size: 7, sx: "-30px", sy: "-26px", delay: "90ms" },
  { left: "60%", top: "22%", size: 5, sx: "14px", sy: "-46px", delay: "140ms" },
];

export default function SplashDrink({
  src,
  alt,
  accent = "#185c7c",
  className = "",
}: {
  src: string;
  alt: string;
  accent?: string;
  className?: string;
}) {
  return (
    <span className={`splash-drink relative inline-block ${className}`}>
      {drops.map((d, i) => (
        <span
          key={i}
          className="splash-drop"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            backgroundColor: accent,
            animationDelay: d.delay,
            ["--sx" as string]: d.sx,
            ["--sy" as string]: d.sy,
          }}
          aria-hidden
        />
      ))}
      <Image
        src={src}
        alt={alt}
        width={280}
        height={340}
        className="splash-glass mx-auto h-44 w-auto object-contain sm:h-52"
      />
    </span>
  );
}
