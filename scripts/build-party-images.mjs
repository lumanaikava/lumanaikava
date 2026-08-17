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

const LOGO = "assets/luna-ekliptika_logo_transparent.png";

/**
 * Ash's logo, sized and placed. It is white-on-transparent, so it only
 * works over the dark ground these cards already have.
 *
 * Composited by sharp rather than referenced from the SVG, because
 * librsvg won't load a local file from an <image href>.
 */
async function logoLayer(px, left, top) {
  return {
    input: await sharp(LOGO).resize(px, px, { fit: "inside" }).png().toBuffer(),
    left: Math.round(left),
    top: Math.round(top),
  };
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

/** The main square: the logo, the name, the date. Nothing else. */
async function ticketCard(S = 1600) {
  const cx = S / 2;
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    ${defs()}
    <rect width="${S}" height="${S}" fill="url(#sky)"/>
    ${stars(150, S, S)}
    <circle cx="${cx}" cy="${S * 0.36}" r="${S * 0.30}" fill="url(#glow)"/>
    <text x="${cx}" y="${S * 0.115}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
          font-size="${S * 0.0225}" letter-spacing="${S * 0.0105}" fill="${GOLD}">LUMANAI PRESENTS</text>
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
  const px = S * 0.46;
  return sharp(bg).composite([await logoLayer(px, (S - px) / 2, S * 0.375 - px / 2)]).png().toBuffer();
}

/** Second angle: the logo alone, big, for galleries. */
async function markOnly(S = 1600) {
  const cx = S / 2;
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    ${defs()}
    <rect width="${S}" height="${S}" fill="url(#sky)"/>
    ${stars(190, S, S, 23)}
    <circle cx="${cx}" cy="${cx}" r="${S * 0.36}" fill="url(#glow)"/>
  </svg>`);
  const px = S * 0.7;
  return sharp(bg).composite([await logoLayer(px, (S - px) / 2, (S - px) / 2)]).png().toBuffer();
}

/** What the buyer is actually getting: the run of the night. */
async function detailsCard(S = 1600) {
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
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    ${defs()}
    <rect width="${S}" height="${S}" fill="url(#sky)"/>
    ${stars(110, S, S, 41)}
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
  const px = S * 0.185;
  return sharp(bg).composite([await logoLayer(px, (S - px) / 2, S * 0.155 - px / 2)]).png().toBuffer();
}

fs.mkdirSync(OUT, { recursive: true });

const jobs = [
  ["luna-ekliptika-ticket.png", ticketCard],
  ["luna-ekliptika-mark.png", markOnly],
  ["luna-ekliptika-details.png", detailsCard],
];

for (const [name, make] of jobs) {
  const buf = await make();
  fs.writeFileSync(`${OUT}/${name}`, buf);
  const { width, height } = await sharp(buf).metadata();
  console.log(`${name.padEnd(30)} ${width}x${height}  ${(buf.length / 1024).toFixed(0)}KB`);
}
