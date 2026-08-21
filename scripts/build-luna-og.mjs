import sharp from "sharp";
import fs from "node:fs";

/**
 * Open Graph / iMessage preview for the LUNA EKLIPTIKA party page.
 *
 * 1200 × 630 is the safe centreline every platform respects — iMessage,
 * Instagram DMs, Twitter, WhatsApp, Slack, LinkedIn. Anything wider or
 * taller gets recropped by someone.
 *
 * The point of a per-page OG is to tell the recipient at a glance that
 * this link is a PARTY invite, not the generic Lumanai homepage. The
 * roots + wordmark + gold accent + tagline do that in one look.
 */

const W = 1200;
const H = 630;
const GOLD = "#d4af6a";
const BONE = "#f2efe8";

// The roots texture, retinted to sit as a background layer.
const roots = await sharp("public/images/roots-texture.webp")
  .resize(W, W, { fit: "cover" })
  .extract({ left: 0, top: Math.round((W - H) / 2), width: W, height: H })
  .tint({ r: 150, g: 120, b: 70 })
  .linear(0.36, 6)
  .toBuffer();

// Radial vignette darkens the centre so the type reads bright over it.
const veil = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs>
       <radialGradient id="v" cx="50%" cy="50%" r="65%">
         <stop offset="0%" stop-color="#050505" stop-opacity="0.86"/>
         <stop offset="55%" stop-color="#050505" stop-opacity="0.65"/>
         <stop offset="100%" stop-color="#050505" stop-opacity="0.35"/>
       </radialGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#v)"/>
   </svg>`,
);

// Ash's eclipse mark, sized for the top third.
const logoPx = Math.round(H * 0.28);
const logo = await sharp("assets/luna-ekliptika_logo_transparent.png")
  .resize(logoPx, logoPx, { fit: "inside" })
  .png()
  .toBuffer();

// The wordmark + eyebrow + tagline. Helvetica-ish since we don't
// have Barlow available for image compositing — the site renders in
// Barlow separately, and a preview thumbnail can't wait for a
// Google Fonts fetch.
const type = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <text x="${W / 2}" y="${H * 0.55}" text-anchor="middle"
           font-family="Helvetica, Arial, sans-serif" font-size="${H * 0.038}"
           letter-spacing="${H * 0.02}" fill="${GOLD}">YOU'RE INVITED</text>

     <text x="${W / 2}" y="${H * 0.72}" text-anchor="middle"
           font-family="Helvetica, Arial, sans-serif" font-weight="bold"
           font-size="${H * 0.13}" letter-spacing="${H * 0.006}" fill="${BONE}">LUNA<tspan fill="${GOLD}" dx="${H * 0.035}">EKLIPTIKA</tspan></text>

     <text x="${W / 2}" y="${H * 0.83}" text-anchor="middle"
           font-family="Helvetica, Arial, sans-serif" font-size="${H * 0.028}"
           letter-spacing="${H * 0.012}" fill="${BONE}" opacity="0.65">A SOBER NIGHTLIFE EXPERIENCE LIKE NO OTHER</text>

     <text x="${W / 2}" y="${H * 0.92}" text-anchor="middle"
           font-family="Helvetica, Arial, sans-serif" font-weight="bold"
           font-size="${H * 0.036}" letter-spacing="${H * 0.008}" fill="${GOLD}">FRIDAY, AUGUST 28 · LAS VEGAS</text>
   </svg>`,
);

const out = await sharp(roots)
  .composite([
    { input: veil },
    { input: logo, left: Math.round((W - logoPx) / 2), top: Math.round(H * 0.08) },
    { input: type },
  ])
  .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
  .toBuffer();

fs.mkdirSync("public/images/party", { recursive: true });
fs.writeFileSync("public/images/party/luna-og.jpg", out);
const m = await sharp(out).metadata();
console.log(`luna-og.jpg  ${m.width}x${m.height}  ${(out.length / 1024).toFixed(0)}KB`);
