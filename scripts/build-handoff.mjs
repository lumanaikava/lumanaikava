import fs from "node:fs";
import path from "node:path";
import { createHmac } from "node:crypto";
import sharp from "sharp";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

/**
 * Everything Zach needs to hand-deliver tickets himself.
 *
 * Produces, into ../Lumanai Business/:
 *   LUNA — Guest List.html      every buyer, contacts, tier, ticket link,
 *                               each with a one-click copy button
 *   LUNA — Email <Tier>.txt     generic copy-paste body, opens "Hi,"
 *   LUNA — Ticket <Tier>.png    a shareable card per tier
 *
 * Run: node scripts/build-handoff.mjs
 */

const OUT = path.join("..", "Lumanai Business");
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const SECRET = env.TICKET_SECRET;
const ORIGIN = env.SITE_ORIGIN || "https://www.lumanai.com";

/** Straight from Shopify, 2026-08-28. Phone falls back to billing. */
const BUYERS = [
  ["#2603","Tarion Young","tarionyoung@gmail.com","330-257-0701","Obsidian",1],
  ["#2602","Melissa Staples","mstaples729@gmail.com","201-727-3938","Obsidian",1],
  ["#2601","Mahsa Jarrahi","mahsa@beautyrecon.ai","818-636-6369","Obsidian",1],
  ["#2600","Jaymi Westra","jaymiwestra@gmail.com","310-497-2391","Obsidian",1],
  ["#2599","Angelia Sherry","angelia.sherry@gmail.com","702-863-3310","Meridian",2],
  ["#2598","Tim Patel","drtimpatel@gmail.com","704-458-1192","Obsidian",1],
  ["#2597","Zach Derr","zachderr@yahoo.com","713-906-1894","Obsidian",1],
  ["#2596","Jasmine Kurys","","702-462-3064","Obsidian",2],
  ["#2595","Ashkan Maher","","818-571-8482","Obsidian",1],
  ["#2594","Chastity Raper","thesingingbruha@gmail.com","702-321-6282","Obsidian",2],
  ["#2592","Kulana Tom","kheadlights@gmail.com","808-640-4657","Obsidian",1],
  ["#2591","Laureen Boutonnet","laureenfrancais@yahoo.fr","702-688-0065","Obsidian",1],
  ["#2590","Mike Baro","miketbaro@gmail.com","412-498-8171","Obsidian",1],
  ["#2589","Nick Rainey","iamnickbeam@gmail.com","216-256-2625","Obsidian",1],
  ["#2588","Arthur Suzuki","arthurs@projectyourpassion.com","702-812-0811","Obsidian",1],
  ["#2587","Nicole Sligar","nicoleshoestring@gmail.com","702-460-2112","Obsidian",1],
  ["#2586","Happy Om","HappyOmAnanda@gmail.com","530-588-0581","Obsidian",1],
  ["#2585","Anja Wenzel","anja9881@gmail.com","702-205-9021","Obsidian",1],
  ["#2584","Ariana Zuniga","","702-927-9422","Obsidian",2],
  ["#2583","Reese Ville","","262-422-7602","Obsidian",2],
  ["#2582","Nadia Basaidi","","702-720-8504","Obsidian",1],
  ["#2581","Sarag Fernandez","sefangel@gmail.com","832-492-5014","Obsidian",1],
  ["#2579","Etienne Asher","ash@lumanai.com","310-614-2848","Obsidian",1],
  ["#2578","Karina Estrada","","702-445-4242","Obsidian",1],
  ["#2577","Cory McCormack","liquidzen528@gmail.com","702-622-3393","Obsidian",1],
  ["#2576","Angelica Hathaway","hathawayangelica8@gmail.com","702-756-9437","Obsidian",1],
  ["#2574","Olivia Patton","oliviacampbellpatton@gmail.com","484-535-0081","Obsidian",1],
  ["#2572","Olivia Pillow","olivia.pillow@icloud.com","503-969-7338","Obsidian",1],
  ["#2571","Cathy Vongnaraj","cathyv@huntingtonandellis.com","702-299-5717","Meridian",1],
  ["#2570","Jordan Handel","","760-685-0379","Obsidian",1],
  ["#2569","Laura Wand","law3c14@gmail.com","812-459-5320","Perihelion",1],
  ["#2568","Michael Alvarez","Ceo@perfitnesspt.com","725-500-8158","Meridian",1],
  ["#2565","Brandy Graff","","401-626-6245","Obsidian",1],
  ["#2564","Zach Grzymala","zachgriz5@gmail.com","443-619-0824","Obsidian",1],
].map(([order, name, email, phone, tier, seats]) => ({ order, name, email, phone, tier, seats }));

/** Already contacted — email last night, or SMS. */
const ALREADY = new Set([
  "#2598","#2597","#2594","#2592","#2591","#2590","#2589","#2588","#2587",
  "#2586","#2585","#2581","#2579","#2577","#2576","#2574","#2572","#2571",
  "#2569","#2568","#2564",
  "#2596","#2595","#2584","#2583","#2582","#2578","#2570","#2565",
]);

const ACCENT = { Obsidian:"#8f96a8", Meridian:"#d4af6a", Perihelion:"#f0e6d2", Aphelion:"#9ec5ea" };
const EXTRA = {
  Obsidian: ["One kava naktail from the exclusive menu","Discounted drinks available for purchase"],
  Meridian: ["RUSH ceremonial kava pouch to take home ($60 value)","Every cocktail on the exclusive menu, open bar all night","Ash's signature kanna cocktail — built for this night only","VIP Reception, 7–8PM","Exclusive VIP rooftop"],
  Perihelion: ["RUSH ceremonial kava pouch to take home ($60 value)","Every cocktail on the exclusive menu, open bar all night","Ash's signature kanna cocktail — built for this night only","VIP Reception, 7–8PM","Exclusive VIP rooftop","3 month Aphelion Club membership","1 month Sweat Equity pass","Reshape Body Bar pass","More perks and a curated set of gifts, revealed on arrival"],
  Aphelion: ["RUSH ceremonial kava pouch to take home ($60 value)","Every cocktail on the exclusive menu, open bar all night","Ash's signature kanna cocktail — built for this night only","VIP Reception, 7–8PM","Exclusive VIP rooftop","1 year Aphelion Club membership","3 month Sweat Equity pass","Reshape Body Bar pass","1 week MyHealthMatrix pass with wellness age test","More perks and a curated set of gifts, revealed on arrival"],
};

const ticketLink = (b) => {
  const p = Buffer.from(JSON.stringify({ order:b.order, name:b.name, tier:b.tier, seats:b.seats }), "utf8").toString("base64url");
  return `${ORIGIN}/ticket/${p}.${createHmac("sha256", SECRET).update(p).digest("base64url")}`;
};

/* ── 1. Copy-paste email bodies, one per tier ──────────────── */

const SIG = `Zach Grzymala
Bartender | Marketing | Design
443-619-0824
zach.grzymala@gmail.com
www.lumanai.com

LUMANAI`;

function emailBody(tier) {
  const vip = tier !== "Obsidian";
  return `Hi,

Thank you. Your contribution to our crowd-funded launch is in and your spot is held. The QR code at the link below is your entry — nothing is printed and nothing ships.

Friday Night · Aug 28${vip ? " · Golden Hour 7PM" : ""} · Doors 8PM

YOUR TICKET
>>> PASTE THEIR TICKET LINK HERE <<<

Open it on your phone, add it to your home screen, and screenshot it — the driveway has no signal. Scan it at the door for your personalized wristband.

WHAT'S INCLUDED
· Unlimited Traditional Kava shots for everyone, all night
· An exclusively crafted menu of low- or no-sugar naktails (kava) and functional mocktails
· Complimentary anti-inflammatory hors d'oeuvres all night

With ${tier}
${EXTRA[tier].map((x) => "· " + x).join("\n")}
${tier === "Perihelion" || tier === "Aphelion" ? `
YOUR CONCIERGE
Karina — 702-445-4242. Reach out any time before or during the event.
` : ""}
THE NIGHT
${vip ? "7–8 PM    Rooftop VIP Reception (Golden Hour)\n" : ""}8 PM      Doors open · pick up your wristband
9–10 PM   Three courses of hors d'oeuvres
12 AM     Midnight moon soundbath
2 AM      Last pour

No sugar in any course. What they are is the surprise.

WHAT TO BRING
· Swimsuit
· Yoga mat
· Empty stomach

All white — off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional.${vip ? " Gold and silver accents encouraged." : ""}

THE ADDRESS
8620 Grove Mill Ct, Las Vegas, NV 89139
Gate code: 89139
Please keep this between us. It's someone's home.

Anything at all — dietary, timing, a plus one — just reply. See you tonight.

${SIG}`;
}

/* ── 2. Tier cards ─────────────────────────────────────────── */

const F = "node_modules/@fontsource";
GlobalFonts.registerFromPath(path.join(F,"barlow-semi-condensed/files/barlow-semi-condensed-latin-900-normal.woff2"),"BSC Black");
GlobalFonts.registerFromPath(path.join(F,"barlow-semi-condensed/files/barlow-semi-condensed-latin-600-normal.woff2"),"BSC Semi");
GlobalFonts.registerFromPath(path.join(F,"barlow/files/barlow-latin-400-normal.woff2"),"Barlow");

const W = 1080, H = 1350;
const GOLD = "#d4af6a", BONE = "#f2efe8", MUTE = "rgba(242,239,232,.5)";

const rootsBase = await sharp("public/images/roots-texture.webp")
  .resize(W, H, { fit: "cover" }).tint({ r:150, g:120, b:70 }).linear(0.28, 4).toBuffer();

const veil = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0%" stop-color="#050505" stop-opacity=".78"/>
       <stop offset="45%" stop-color="#050505" stop-opacity=".9"/>
       <stop offset="100%" stop-color="#050505" stop-opacity=".84"/>
     </linearGradient></defs><rect width="${W}" height="${H}" fill="url(#v)"/></svg>`);

async function tierCard(tier) {
  const a = ACCENT[tier];
  const vip = tier !== "Obsidian";
  const c = createCanvas(W, H);
  const x = c.getContext("2d");

  const text = (t, px, y, { font="Barlow", size=30, color=BONE, ls=0, center=false }={}) => {
    x.save(); x.font = `${size}px "${font}"`; x.fillStyle = color; x.textBaseline = "alphabetic";
    if (!ls) { x.textAlign = center ? "center" : "left"; x.fillText(t, center ? W/2 : px, y); x.restore(); return; }
    const ch = [...t], w = ch.map(q => x.measureText(q).width);
    const tot = w.reduce((s,q)=>s+q,0) + ls*(ch.length-1);
    let cx = center ? (W-tot)/2 : px; x.textAlign = "left";
    ch.forEach((q,i)=>{ x.fillText(q,cx,y); cx += w[i]+ls; });
    x.restore();
  };

  // Header
  text("YOU'RE IN", 0, 150, { font:"BSC Semi", size:30, color:GOLD, ls:14, center:true });
  x.font = `104px "BSC Black"`;
  const wL = x.measureText("LUNA").width, wE = x.measureText("EKLIPTIKA").width, gap = 26;
  let sx = (W - (wL+gap+wE)) / 2;
  x.textAlign = "left"; x.fillStyle = BONE; x.fillText("LUNA", sx, 262);
  x.fillStyle = GOLD; x.fillText("EKLIPTIKA", sx+wL+gap, 262);

  // Tier chip
  x.save();
  x.strokeStyle = a; x.lineWidth = 3;
  x.font = `34px "BSC Semi"`;
  const tw = x.measureText(tier.toUpperCase()).width + 24*2 + tier.length*7;
  const chipX = (W - tw)/2;
  x.beginPath(); x.roundRect(chipX, 300, tw, 66, 33); x.stroke();
  x.restore();
  text(tier.toUpperCase(), 0, 345, { font:"BSC Semi", size:34, color:a, ls:7, center:true });

  text("Friday Night · Aug 28" + (vip ? " · Golden Hour 7PM" : "") + " · Doors 8PM", 0, 420,
    { font:"BSC Semi", size:25, color:GOLD, ls:2, center:true });

  let y = 505;
  const rule = () => { x.strokeStyle="rgba(212,175,106,.22)"; x.lineWidth=2;
    x.beginPath(); x.moveTo(90,y); x.lineTo(W-90,y); x.stroke(); y += 46; };
  const head = (t, col=GOLD) => { text(t, 90, y, { font:"BSC Semi", size:23, color:col, ls:5 }); y += 42; };
  const item = (t, col=BONE, size=28) => {
    // Wrap long lines at the card width.
    x.font = `${size}px "Barlow"`;
    const words = t.split(" "); let line = "· ";
    for (const w of words) {
      if (x.measureText(line + w).width > W - 190 && line !== "· ") {
        text(line, 90, y, { size, color: col }); y += size + 10; line = "   " + w + " ";
      } else line += w + " ";
    }
    text(line.trimEnd(), 90, y, { size, color: col }); y += size + 14;
  };

  head("WHAT'S INCLUDED");
  item("Unlimited Traditional Kava shots, all night");
  item("Exclusive menu of low- or no-sugar naktails & mocktails");
  item("Anti-inflammatory hors d'oeuvres all night");
  y += 8; rule();
  head(`WITH ${tier.toUpperCase()}`, a);
  for (const e of EXTRA[tier]) item(e, a, 27);
  y += 8; rule();

  head("THE ADDRESS");
  text("8620 Grove Mill Ct", 90, y, { font:"BSC Black", size:48 }); y += 52;
  text("Las Vegas, NV 89139", 90, y, { size:28, color:MUTE }); y += 56;
  text("GATE CODE", 90, y, { font:"BSC Semi", size:23, color:GOLD, ls:5 }); y += 46;
  text("89139", 90, y, { font:"BSC Black", size:52 }); y += 60;

  text("ALL WHITE · LINENS PREFERRED · BRING A SWIMSUIT + YOGA MAT", 0, H - 62,
    { font:"BSC Semi", size:21, color:GOLD, ls:2, center:true });

  const out = await sharp(rootsBase)
    .composite([{ input: veil }, { input: c.toBuffer("image/png") }])
    .png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(path.join(OUT, `LUNA — Ticket ${tier}.png`), out);
  return out.length;
}

/* ── 3. The guest list page ────────────────────────────────── */

function guestListHtml() {
  const rows = BUYERS.map((b) => {
    const link = ticketLink(b);
    const sent = ALREADY.has(b.order);
    const a = ACCENT[b.tier];
    return `<tr class="${sent ? "sent" : "new"}">
      <td class="ord">${b.order}${sent ? "" : ` <span class="badge">NEW</span>`}</td>
      <td class="nm">${b.name}${b.seats > 1 ? ` <span class="seats">×${b.seats}</span>` : ""}</td>
      <td><span class="tier" style="color:${a};border-color:${a}">${b.tier}</span></td>
      <td class="ct">${b.email ? `<a href="mailto:${b.email}">${b.email}</a><button data-c="${b.email}">copy</button>` : `<span class="none">no email</span>`}</td>
      <td class="ct"><a href="tel:${b.phone.replace(/\D/g,"")}">${b.phone}</a><button data-c="${b.phone}">copy</button></td>
      <td><button class="lk" data-c="${link}">copy ticket link</button></td>
    </tr>`;
  }).join("");

  const withEmail = BUYERS.filter(b=>b.email).length;
  const heads = BUYERS.reduce((s,b)=>s+b.seats,0);

  return `<!doctype html><meta charset="utf-8"><title>LUNA EKLIPTIKA — Guest List</title>
<style>
:root{color-scheme:dark}
body{margin:0;background:#0b0b0c;color:#c9c3b8;font:15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;padding:24px}
h1{font-size:26px;letter-spacing:2px;text-transform:uppercase;color:#f2efe8;margin:0 0 4px}
.sub{color:#8a8378;font-size:14px;margin:0 0 20px}
.stats{display:flex;gap:26px;flex-wrap:wrap;padding:14px 18px;border:1px solid #2a2621;border-radius:12px;margin-bottom:20px}
.stats b{color:#d4af6a;font-size:24px;display:block;line-height:1.1}
.stats span{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8378}
table{width:100%;border-collapse:collapse;font-size:14px}
th{text-align:left;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8378;padding:8px 10px;border-bottom:1px solid #2a2621}
td{padding:9px 10px;border-bottom:1px solid #1a1817;vertical-align:middle}
tr.new{background:rgba(212,175,106,.07)}
tr:hover{background:rgba(212,175,106,.05)}
.ord{color:#8a8378;font-variant-numeric:tabular-nums;white-space:nowrap}
.badge{background:#d4af6a;color:#0b0b0c;font-size:9px;font-weight:800;letter-spacing:1px;padding:2px 5px;border-radius:3px}
.nm{color:#f2efe8;font-weight:600;white-space:nowrap}
.seats{color:#d4af6a;font-size:12px}
.tier{border:1px solid;border-radius:99px;padding:2px 10px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}
.ct a{color:#c9c3b8;text-decoration:none}.ct a:hover{color:#d4af6a}
.none{color:#5c574f;font-style:italic}
button{background:transparent;border:1px solid #2a2621;color:#8a8378;font-size:10px;letter-spacing:1px;text-transform:uppercase;padding:3px 7px;border-radius:99px;margin-left:8px;cursor:pointer}
button:hover{border-color:#d4af6a;color:#d4af6a}
button.ok{background:#d4af6a;color:#0b0b0c;border-color:#d4af6a}
.lk{border-color:#d4af6a55;color:#d4af6a;margin:0}
</style>
<h1>Luna Ekliptika — Guest List</h1>
<p class="sub">Everyone who bought a ticket. Gold rows haven't been contacted yet.</p>
<div class="stats">
  <div><b>${BUYERS.length}</b><span>Orders</span></div>
  <div><b>${heads}</b><span>Headcount</span></div>
  <div><b>${withEmail}</b><span>With email</span></div>
  <div><b>${BUYERS.length - ALREADY.size}</b><span>Not contacted</span></div>
</div>
<table>
<tr><th>Order</th><th>Name</th><th>Tier</th><th>Email</th><th>Phone</th><th>Ticket</th></tr>
${rows}
</table>
<script>
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  navigator.clipboard.writeText(b.dataset.c);
  const t = b.textContent; b.textContent = 'copied'; b.classList.add('ok');
  setTimeout(() => { b.textContent = t; b.classList.remove('ok'); }, 1200);
});
</script>`;
}

/* ── Run ───────────────────────────────────────────────────── */

fs.mkdirSync(OUT, { recursive: true });

for (const tier of ["Obsidian","Meridian","Perihelion","Aphelion"]) {
  fs.writeFileSync(path.join(OUT, `LUNA — Email ${tier}.txt`), emailBody(tier), "utf8");
  const kb = await tierCard(tier);
  console.log(`LUNA — Email ${tier}.txt   +   LUNA — Ticket ${tier}.png  (${(kb/1024).toFixed(0)}KB)`);
}

fs.writeFileSync(path.join(OUT, "LUNA — Guest List.html"), guestListHtml(), "utf8");
console.log(`\nLUNA — Guest List.html   ${BUYERS.length} orders · ${BUYERS.reduce((s,b)=>s+b.seats,0)} heads · ${BUYERS.length - ALREADY.size} not yet contacted`);
