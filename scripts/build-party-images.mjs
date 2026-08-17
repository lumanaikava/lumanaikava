import sharp from "sharp";
import fs from "node:fs";

/**
 * Product images for the LUNA EKLIPTIKA ticket.
 *
 * Drawn to match the printed flyer: black ground, gold #d4af6a, and the
 * event mark — a diamond frame holding a crescent laid over a full moon.
 * Generated rather than exported so the ticket, the site and anything
 * else that needs the mark all come from one definition.
 *
 * Run with: node scripts/build-party-images.mjs
 */

const OUT = "public/images/party";
const GOLD = "#d4af6a";
const BONE = "#f2efe8";

/** Deterministic star positions — a fixed seed, so rebuilds are identical. */
function stars(count, w, h, seed = 7) {
  let s = seed;
  const rand = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  return Array.from({ length: count }, () => {
    const r = 0.6 + rand() * 1.9;
    return `<circle cx="${(rand() * w).toFixed(1)}" cy="${(rand() * h).toFixed(1)}" r="${r.toFixed(2)}" fill="#ffffff" opacity="${(0.12 + rand() * 0.5).toFixed(2)}"/>`;
  }).join("");
}

/**
 * The mark: a diamond frame, a full moon, and a bold crescent laid over
 * it from the left — the way the flyer draws it.
 *
 * The crescent is a disc with a second, offset disc masked out of it.
 * The maria are clipped to the moon's own circle. Both need ids unique
 * to each instance, because a page can hold more than one mark.
 */
function mark(cx, cy, size, stroke, id = "m") {
  const half = size / 2;
  const mr = size * 0.2;            // moon radius
  const cr = size * 0.255;          // crescent outer radius
  const mx = cx + size * 0.085;     // moon sits right of centre
  const bite = size * 0.105;        // how far the cut-out disc is offset

  // Irregular sizes and a heavy blur — as hard-edged discs these read as
  // a golf ball rather than lunar maria.
  const mare = [
    [-0.36, -0.28, 0.34, 0.5],
    [0.14, -0.42, 0.22, 0.42],
    [0.38, 0.12, 0.30, 0.46],
    [-0.14, 0.36, 0.36, 0.38],
    [-0.50, 0.10, 0.16, 0.34],
    [0.02, -0.06, 0.26, 0.30],
    [0.30, 0.46, 0.14, 0.30],
  ]
    .map(
      ([dx, dy, rr, o]) =>
        `<circle cx="${(mx + dx * mr).toFixed(1)}" cy="${(cy + dy * mr).toFixed(1)}" r="${(rr * mr).toFixed(1)}" fill="#8c8e97" opacity="${o}"/>`,
    )
    .join("");

  return `
    <defs>
      <clipPath id="moonclip-${id}"><circle cx="${mx}" cy="${cy}" r="${mr}"/></clipPath>
      <filter id="soften-${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="${(mr * 0.11).toFixed(2)}"/>
      </filter>
      <mask id="crescent-${id}">
        <rect x="0" y="0" width="100%" height="100%" fill="black"/>
        <circle cx="${cx - size * 0.075}" cy="${cy}" r="${cr}" fill="white"/>
        <circle cx="${cx - size * 0.075 + bite}" cy="${cy}" r="${cr * 0.84}" fill="black"/>
      </mask>
    </defs>
    <rect x="${cx - half * 0.72}" y="${cy - half * 0.72}" width="${half * 1.44}" height="${half * 1.44}"
          transform="rotate(45 ${cx} ${cy})" fill="none" stroke="${BONE}" stroke-width="${stroke}"/>
    <circle cx="${mx}" cy="${cy}" r="${mr}" fill="url(#moonface)"/>
    <g clip-path="url(#moonclip-${id})" filter="url(#soften-${id})" opacity="0.55">${mare}</g>
    <circle cx="${cx - size * 0.075}" cy="${cy}" r="${cr}" fill="${BONE}" mask="url(#crescent-${id})"/>`;
}

function defs() {
  return `
    <defs>
      <radialGradient id="sky" cx="50%" cy="34%" r="78%">
        <stop offset="0%" stop-color="#1a1a1d"/>
        <stop offset="55%" stop-color="#0c0c0e"/>
        <stop offset="100%" stop-color="#050505"/>
      </radialGradient>
      <radialGradient id="moonface" cx="38%" cy="34%" r="72%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#e6e4de"/>
        <stop offset="100%" stop-color="#bfbdb6"/>
      </radialGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d4af6a" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#d4af6a" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
}

/** The main square: the mark, the name, the date. Nothing else. */
function ticketCard(S = 1600) {
  const cx = S / 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    ${defs()}
    <rect width="${S}" height="${S}" fill="url(#sky)"/>
    ${stars(150, S, S)}
    <circle cx="${cx}" cy="${S * 0.36}" r="${S * 0.30}" fill="url(#glow)"/>
    <text x="${cx}" y="${S * 0.115}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-size="${S * 0.0225}" letter-spacing="${S * 0.0105}" fill="${GOLD}">LUMANAI PRESENTS</text>
    ${mark(cx, S * 0.375, S * 0.40, S * 0.011, "hero")}
    <text x="${cx}" y="${S * 0.655}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-weight="bold" font-size="${S * 0.098}" letter-spacing="${S * 0.004}" fill="${BONE}">LUNA</text>
    <text x="${cx}" y="${S * 0.762}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-weight="bold" font-size="${S * 0.098}" letter-spacing="${S * 0.004}" fill="${GOLD}">EKLIPTIKA</text>
    <line x1="${S * 0.30}" y1="${S * 0.815}" x2="${S * 0.70}" y2="${S * 0.815}" stroke="${GOLD}" stroke-width="1" opacity="0.45"/>
    <text x="${cx}" y="${S * 0.869}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-size="${S * 0.0235}" letter-spacing="${S * 0.0072}" fill="${BONE}" opacity="0.92">FRIDAY · AUGUST 28 · LAS VEGAS</text>
    <text x="${cx}" y="${S * 0.918}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-size="${S * 0.019}" letter-spacing="${S * 0.0055}" fill="${BONE}" opacity="0.45">A PREMIUM ZERO-PROOF NIGHTLIFE EXPERIENCE</text>
  </svg>`);
}

/** Second angle: the mark alone, big, for galleries and the OG card. */
function markOnly(S = 1600) {
  const cx = S / 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    ${defs()}
    <rect width="${S}" height="${S}" fill="url(#sky)"/>
    ${stars(190, S, S, 23)}
    <circle cx="${cx}" cy="${cx}" r="${S * 0.36}" fill="url(#glow)"/>
    ${mark(cx, cx, S * 0.62, S * 0.0092, "solo")}
  </svg>`);
}

/** What the buyer is actually getting: the run of the night. */
function detailsCard(S = 1600) {
  const cx = S / 2;
  const rows = [
    ["DOORS", "8PM — late"],
    ["GOLDEN HOUR", "7—8PM · Meridian and above"],
    ["DRESS", "All black"],
    ["WHERE", "A private mansion · address on your ticket"],
    ["THE BAR", "Kava + functional mocktails · zero alcohol"],
  ];
  const top = S * 0.335;
  const gap = S * 0.108;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    ${defs()}
    <rect width="${S}" height="${S}" fill="url(#sky)"/>
    ${stars(110, S, S, 41)}
    ${mark(cx, S * 0.155, S * 0.17, S * 0.0055, "small")}
    <text x="${cx}" y="${S * 0.262}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-weight="bold" font-size="${S * 0.042}" letter-spacing="${S * 0.006}" fill="${BONE}">LUNA<tspan fill="${GOLD}" dx="${S * 0.022}">EKLIPTIKA</tspan></text>
    ${rows
      .map(
        ([k, v], i) => `
      <text x="${S * 0.135}" y="${top + i * gap}" font-family="Helvetica, Arial, sans-serif"
            font-size="${S * 0.0185}" letter-spacing="${S * 0.0042}" fill="${GOLD}">${k}</text>
      <text x="${S * 0.135}" y="${top + i * gap + S * 0.042}" font-family="Helvetica, Arial, sans-serif"
            font-size="${S * 0.0295}" fill="${BONE}" opacity="0.9">${v}</text>
      <line x1="${S * 0.135}" y1="${top + i * gap + S * 0.066}" x2="${S * 0.865}" y2="${top + i * gap + S * 0.066}"
            stroke="${BONE}" stroke-width="1" opacity="0.12"/>`,
      )
      .join("")}
    <text x="${cx}" y="${S * 0.935}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-size="${S * 0.0175}" letter-spacing="${S * 0.005}" fill="${BONE}" opacity="0.4">21+ · SPACE IS LIMITED · INVITATION ONLY</text>
  </svg>`);
}

fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  ["luna-ekliptika-ticket.png", ticketCard],
  ["luna-ekliptika-mark.png", markOnly],
  ["luna-ekliptika-details.png", detailsCard],
];

for (const [name, make] of jobs) {
  const buf = await sharp(make()).png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(`${OUT}/${name}`, buf);
  const { width, height } = await sharp(buf).metadata();
  console.log(`${name.padEnd(30)} ${width}x${height}  ${(buf.length / 1024).toFixed(0)}KB`);
}
