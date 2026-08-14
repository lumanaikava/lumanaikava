import sharp from "sharp";
import fs from "node:fs";

/**
 * Generates the favicon, the Apple touch icon and the link-preview card
 * from the one real brand asset — public/lumanai-wordmark.svg.
 *
 * Run with: node scripts/build-brand-images.mjs
 *
 * Kept in the repo rather than done once by hand because these are
 * derived files. If the wordmark ever changes, regenerating beats
 * remembering how the old ones were cropped.
 */

const OUT = "src/app";
const NAVY = "#05102a";
const GOLD = "#ede2b4";

/** The wordmark is white-on-transparent; trim its generous SVG margins. */
async function wordmark(width) {
  return sharp("public/lumanai-wordmark.svg", { density: 120 })
    .resize({ width })
    .trim()
    .png()
    .toBuffer();
}

/**
 * The L, lifted from the wordmark itself.
 *
 * A seven-letter wordmark is a grey smudge at 32px, so the tab icon is
 * the monogram — but the REAL letterform, sliced out of the logo, not a
 * font's idea of an L. The leftmost 10% of the trimmed wordmark is the
 * L and nothing else.
 */
async function monogram() {
  const full = await wordmark(2400);
  const { height } = await sharp(full).metadata();
  return sharp(full)
    .extract({ left: 0, top: 0, width: 240, height })
    .trim()
    .png()
    .toBuffer();
}

/** Concentric rings — the ripple that runs through the rest of the site. */
function ripples(size, cx, cy, opacity = 1) {
  const r = size / 2;
  return [0.28, 0.46, 0.66, 0.88]
    .map(
      (f, i) =>
        `<circle cx="${cx}" cy="${cy}" r="${r * f}" fill="none" stroke="${GOLD}" stroke-width="${
          size * 0.006
        }" opacity="${(0.3 - i * 0.06) * opacity}"/>`,
    )
    .join("");
}

async function icon(size, radius) {
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#0a1838"/>
           <stop offset="100%" stop-color="${NAVY}"/>
         </linearGradient>
       </defs>
       <rect width="${size}" height="${size}" rx="${radius}" fill="url(#g)"/>
       ${ripples(size, size / 2, size / 2)}
     </svg>`,
  );

  // Big. At 16px a polite, well-spaced monogram is a grey mark; the
  // glyph has to nearly fill the tile to survive being a favicon.
  const glyphH = Math.round(size * 0.62);
  const L = await sharp(await monogram())
    .resize({ height: glyphH })
    .png()
    .toBuffer();
  const { width: lw } = await sharp(L).metadata();

  return sharp(bg)
    .composite([
      {
        input: L,
        left: Math.round((size - lw) / 2),
        top: Math.round(size * 0.19),
      },
    ])
    .png()
    .toBuffer();
}

/**
 * The card iMessage, Slack and every social preview will render.
 *
 * Wordmark plus one line. Anything more is unreadable at the size these
 * actually appear, and a busy preview reads as a spam link.
 */
async function openGraph() {
  const W = 1200;
  const H = 630;
  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
       <defs>
         <radialGradient id="glow" cx="50%" cy="38%" r="62%">
           <stop offset="0%" stop-color="#1b2a5e"/>
           <stop offset="55%" stop-color="#0a1838"/>
           <stop offset="100%" stop-color="${NAVY}"/>
         </radialGradient>
       </defs>
       <rect width="${W}" height="${H}" fill="url(#glow)"/>
       ${ripples(980, W / 2, H * 0.42, 0.85)}
       <text x="${W / 2}" y="${H * 0.75}" text-anchor="middle"
             font-family="Helvetica, Arial, sans-serif" font-size="26"
             letter-spacing="7" fill="${GOLD}" opacity="0.92">
         ALL THE BUZZ — WITHOUT THE BOOZE
       </text>
       <text x="${W / 2}" y="${H * 0.87}" text-anchor="middle"
             font-family="Helvetica, Arial, sans-serif" font-size="19"
             letter-spacing="5" fill="#ffffff" opacity="0.45">
         CRAFT KAVA + FUNCTIONAL MOCKTAIL BAR · LAS VEGAS
       </text>
     </svg>`,
  );

  const mark = await sharp(await wordmark(2400))
    .resize({ width: 640 })
    .png()
    .toBuffer();
  const { height: mh } = await sharp(mark).metadata();

  return sharp(bg)
    .composite([{ input: mark, left: (W - 640) / 2, top: Math.round(H * 0.42 - mh / 2) }])
    .png()
    .toBuffer();
}

/**
 * A real multi-size .ico, so a bare request for /favicon.ico — which
 * crawlers, feed readers and older browsers still make by path — gets an
 * icon instead of a 404.
 *
 * Modern .ico files may hold PNG payloads directly, so this is a 6-byte
 * header, one 16-byte directory entry per size, then the PNGs.
 */
async function favicon() {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map((s) => sharp(square).resize(s).png({ compressionLevel: 9 }).toBuffer()),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(sizes.length, 4);

  let offset = 6 + 16 * sizes.length;
  const entries = sizes.map((s, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(s === 256 ? 0 : s, 0); // width
    e.writeUInt8(s === 256 ? 0 : s, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(pngs[i].length, 8);
    e.writeUInt32LE(offset, 12);
    offset += pngs[i].length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...pngs]);
}

// Built once and reused: the .ico needs the same tile as the PNG icon.
const square = await icon(512, 96);

const jobs = [
  ["icon.png", async () => square],
  ["apple-icon.png", () => icon(180, 0)], // iOS applies its own mask
  ["favicon.ico", favicon],
  ["opengraph-image.png", openGraph],
  ["twitter-image.png", openGraph],
];

for (const [name, make] of jobs) {
  const buf = await make();
  fs.writeFileSync(`${OUT}/${name}`, buf);
  let dims = "multi-size";
  if (!name.endsWith(".ico")) {
    const m = await sharp(buf).metadata();
    dims = `${m.width}x${m.height}`;
  }
  console.log(`${name.padEnd(22)} ${dims.padEnd(12)} ${(buf.length / 1024).toFixed(0)}KB`);
}
