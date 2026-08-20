import sharp from "sharp";
import fs from "node:fs";

/**
 * The email header: roots texture, the logo, and the wordmark, baked
 * into ONE image.
 *
 * Gmail's support for CSS background images is unreliable and it strips
 * the `background` shorthand outright when it contains a url(). An
 * <img> is the only way to guarantee both the roots and the logo
 * actually reach a guest's screen — so the piece that matters most
 * stops depending on the client's mood.
 *
 * Everything else in the email uses bgcolor, which no client strips.
 */

const W = 1120; // 560pt at 2x
const H = 560;
const GOLD = "#d4af6a";
const BONE = "#f2efe8";

const roots = await sharp("public/images/roots-texture.webp")
  .resize(W, W, { fit: "cover" })
  .extract({ left: 0, top: Math.round((W - H) / 2), width: W, height: H })
  .tint({ r: 150, g: 120, b: 70 })
  .linear(0.42, 6)
  .toBuffer();

// A vignette so the type at the centre stays legible over the pattern.
const veil = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs>
       <radialGradient id="v" cx="50%" cy="46%" r="62%">
         <stop offset="0%" stop-color="#050505" stop-opacity="0.82"/>
         <stop offset="60%" stop-color="#050505" stop-opacity="0.55"/>
         <stop offset="100%" stop-color="#050505" stop-opacity="0.30"/>
       </radialGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#v)"/>
   </svg>`,
);

const logoPx = Math.round(H * 0.34);
const logo = await sharp("assets/luna-ekliptika_logo_transparent.png")
  .resize(logoPx, logoPx, { fit: "inside" })
  .png()
  .toBuffer();

const type = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <text x="${W / 2}" y="${H * 0.635}" text-anchor="middle"
           font-family="Helvetica, Arial, sans-serif" font-size="${H * 0.043}"
           letter-spacing="${H * 0.021}" fill="${GOLD}">YOU'RE IN</text>
     <text x="${W / 2}" y="${H * 0.80}" text-anchor="middle"
           font-family="Helvetica, Arial, sans-serif" font-weight="bold"
           font-size="${H * 0.115}" letter-spacing="${H * 0.004}" fill="${BONE}">LUNA<tspan fill="${GOLD}" dx="${H * 0.03}">EKLIPTIKA</tspan></text>
     <text x="${W / 2}" y="${H * 0.885}" text-anchor="middle"
           font-family="Helvetica, Arial, sans-serif" font-size="${H * 0.031}"
           letter-spacing="${H * 0.013}" fill="${BONE}" opacity="0.5">A PREMIUM ZERO-PROOF NIGHTLIFE EXPERIENCE</text>
   </svg>`,
);

const out = await sharp(roots)
  .composite([
    { input: veil },
    { input: logo, left: Math.round((W - logoPx) / 2), top: Math.round(H * 0.10) },
    { input: type },
  ])
  .jpeg({ quality: 84, chromaSubsampling: "4:4:4" })
  .toBuffer();

fs.mkdirSync("public/images/party", { recursive: true });
fs.writeFileSync("public/images/party/email-header.jpg", out);
const m = await sharp(out).metadata();
console.log(`email-header.jpg  ${m.width}x${m.height}  ${(out.length / 1024).toFixed(0)}KB`);
