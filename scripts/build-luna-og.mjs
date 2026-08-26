import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

/**
 * Open Graph / iMessage preview for the LUNA EKLIPTIKA party page.
 *
 * 1200 × 630 is the safe centreline every platform respects — iMessage,
 * Instagram DMs, Twitter, WhatsApp, Slack, LinkedIn. Anything wider or
 * taller gets recropped by someone.
 *
 * Type renders through @napi-rs/canvas with the real brand faces —
 * Barlow Semi Condensed for the wordmark and eyebrow, Barlow for the
 * tagline. Loaded from @fontsource/*, which is the same source the
 * site's runtime pulls from, so this preview reads as the brand.
 */

const W = 1200;
const H = 630;
const GOLD = "#d4af6a";
const BONE = "#f2efe8";
const MUTE = "rgba(242,239,232,0.65)";

// Register the brand fonts. @napi-rs/canvas accepts woff2 directly,
// which is the format @fontsource ships. Same weights the site uses.
const FONT_DIR = "node_modules/@fontsource";
GlobalFonts.registerFromPath(
  path.join(FONT_DIR, "barlow-semi-condensed/files/barlow-semi-condensed-latin-900-normal.woff2"),
  "Barlow Semi Condensed Black",
);
GlobalFonts.registerFromPath(
  path.join(FONT_DIR, "barlow-semi-condensed/files/barlow-semi-condensed-latin-600-normal.woff2"),
  "Barlow Semi Condensed SemiBold",
);
GlobalFonts.registerFromPath(
  path.join(FONT_DIR, "barlow/files/barlow-latin-400-normal.woff2"),
  "Barlow Regular",
);

// ── 1. Background: roots retinted warm, then vignetted so type reads
const roots = await sharp("public/images/roots-texture.webp")
  .resize(W, W, { fit: "cover" })
  .extract({ left: 0, top: Math.round((W - H) / 2), width: W, height: H })
  .tint({ r: 150, g: 120, b: 70 })
  .linear(0.36, 6)
  .toBuffer();

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

// ── 2. Type layer via canvas so the real Barlow shape is baked in
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

/** Draw one horizontally-centred line. */
function line(
  text,
  y,
  { font, size, color, letterSpacing = 0, opacity = 1 },
) {
  ctx.save();
  ctx.font = `${size}px "${font}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;

  if (letterSpacing === 0) {
    ctx.fillText(text, W / 2, y);
    ctx.restore();
    return;
  }

  // Manual tracking — measure each glyph and advance by letterSpacing.
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total =
    widths.reduce((s, w) => s + w, 0) + letterSpacing * (chars.length - 1);
  let x = (W - total) / 2;
  chars.forEach((c, i) => {
    ctx.textAlign = "left";
    ctx.fillText(c, x, y);
    x += widths[i] + letterSpacing;
  });
  ctx.restore();
}

// Eyebrow
line("YOU'RE INVITED", H * 0.555, {
  font: "Barlow Semi Condensed SemiBold",
  size: H * 0.04,
  color: GOLD,
  letterSpacing: H * 0.017,
});

// Wordmark — measured in two segments so LUNA (bone) and EKLIPTIKA (gold)
// share the same baseline and a fixed gap between them.
{
  const y = H * 0.72;
  const size = H * 0.15;
  const gap = H * 0.05;
  ctx.font = `${size}px "Barlow Semi Condensed Black"`;
  const wLuna = ctx.measureText("LUNA").width;
  const wEklip = ctx.measureText("EKLIPTIKA").width;
  const total = wLuna + gap + wEklip;
  const startX = (W - total) / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BONE;
  ctx.fillText("LUNA", startX, y);
  ctx.fillStyle = GOLD;
  ctx.fillText("EKLIPTIKA", startX + wLuna + gap, y);
}

// Tagline
line("A premium nightlife experience like no other", H * 0.82, {
  font: "Barlow Regular",
  size: H * 0.033,
  color: MUTE,
});

// Date + city, gold, tighter
line("FRIDAY, AUGUST 28 · LAS VEGAS", H * 0.91, {
  font: "Barlow Semi Condensed SemiBold",
  size: H * 0.036,
  color: GOLD,
  letterSpacing: H * 0.008,
});

const type = canvas.toBuffer("image/png");

// ── 3. The eclipse mark, sized for the top third
const logoPx = Math.round(H * 0.28);
const logo = await sharp("assets/luna-ekliptika_logo_transparent.png")
  .resize(logoPx, logoPx, { fit: "inside" })
  .png()
  .toBuffer();

// ── 4. Composite
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
