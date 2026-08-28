import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

/**
 * A single info card to text or DM alongside someone's ticket link.
 *
 * 1080×1350 (4:5) — the tallest ratio Instagram and iMessage both show
 * without cropping, so nothing important gets cut off in a thread
 * preview.
 *
 * Carries the address and gate code, so it goes ONLY to people who
 * have paid. It is not a public flyer.
 */

const W = 1080, H = 1350;
const GOLD = "#d4af6a", BONE = "#f2efe8", MUTE = "rgba(242,239,232,.55)";

const F = "node_modules/@fontsource";
GlobalFonts.registerFromPath(path.join(F, "barlow-semi-condensed/files/barlow-semi-condensed-latin-900-normal.woff2"), "BSC Black");
GlobalFonts.registerFromPath(path.join(F, "barlow-semi-condensed/files/barlow-semi-condensed-latin-600-normal.woff2"), "BSC Semi");
GlobalFonts.registerFromPath(path.join(F, "barlow/files/barlow-latin-400-normal.woff2"), "Barlow");

const roots = await sharp("public/images/roots-texture.webp")
  .resize(W, H, { fit: "cover" })
  .tint({ r: 150, g: 120, b: 70 })
  .linear(0.3, 5)
  .toBuffer();

const veil = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stop-color="#050505" stop-opacity=".72"/>
       <stop offset="42%" stop-color="#050505" stop-opacity=".88"/>
       <stop offset="100%" stop-color="#050505" stop-opacity=".8"/>
     </linearGradient></defs>
     <rect width="${W}" height="${H}" fill="url(#v)"/>
   </svg>`);

const c = createCanvas(W, H);
const x = c.getContext("2d");

function line(t, y, { font, size, color, ls = 0, align = "center" }) {
  x.save();
  x.font = `${size}px "${font}"`;
  x.fillStyle = color;
  x.textBaseline = "alphabetic";
  if (!ls) { x.textAlign = align; x.fillText(t, align === "center" ? W / 2 : 90, y); x.restore(); return; }
  const ch = [...t], w = ch.map(q => x.measureText(q).width);
  const total = w.reduce((s, q) => s + q, 0) + ls * (ch.length - 1);
  let px = align === "center" ? (W - total) / 2 : 90;
  x.textAlign = "left";
  ch.forEach((q, i) => { x.fillText(q, px, y); px += w[i] + ls; });
  x.restore();
}

/** A left-aligned label/value pair. */
function pair(label, value, y, big = false) {
  line(label, y, { font: "BSC Semi", size: 26, color: GOLD, ls: 6, align: "left" });
  line(value, y + (big ? 58 : 46), { font: big ? "BSC Black" : "Barlow", size: big ? 56 : 34, color: BONE, align: "left" });
}

line("YOU'RE IN", 250, { font: "BSC Semi", size: 34, color: GOLD, ls: 16 });

x.font = `132px "BSC Black"`;
const wL = x.measureText("LUNA").width, wE = x.measureText("EKLIPTIKA").width;
x.textAlign = "center";
x.fillStyle = BONE; x.fillText("LUNA", W / 2, 400);
x.fillStyle = GOLD; x.fillText("EKLIPTIKA", W / 2, 530);

line("A PREMIUM NIGHTLIFE EXPERIENCE", 585, { font: "BSC Semi", size: 24, color: MUTE, ls: 6 });

x.strokeStyle = "rgba(212,175,106,.3)"; x.lineWidth = 2;
x.beginPath(); x.moveTo(120, 650); x.lineTo(W - 120, 650); x.stroke();

pair("WHEN", "Friday, Aug 28 · Doors 8PM", 720);
pair("WHERE", "8620 Grove Mill Ct", 850, true);
line("Las Vegas, NV 89139", 962, { font: "Barlow", size: 30, color: MUTE, align: "left" });
pair("GATE CODE", "89139", 1030, true);
pair("DRESS", "All white · linens preferred", 1170);

x.beginPath(); x.moveTo(120, 1258); x.lineTo(W - 120, 1258); x.stroke();
line("BRING A SWIMSUIT · YOGA MAT · EMPTY STOMACH", 1305, { font: "BSC Semi", size: 22, color: GOLD, ls: 4 });

const out = await sharp(roots)
  .composite([{ input: veil }, { input: c.toBuffer("image/png") }])
  .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
  .toBuffer();

fs.writeFileSync("../Lumanai Business/LUNA — Text Card.jpg", out);
const m = await sharp(out).metadata();
console.log(`LUNA — Text Card.jpg  ${m.width}x${m.height}  ${(out.length / 1024).toFixed(0)}KB`);
