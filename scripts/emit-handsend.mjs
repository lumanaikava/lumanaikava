import fs from "node:fs";
import { createHmac } from "node:crypto";

/**
 * Emit ready-to-send LUNA EKLIPTIKA confirmations.
 *
 * Used two ways:
 *   node scripts/emit-handsend.mjs           → JSONL, one per buyer
 *   node scripts/emit-handsend.mjs --generic → four blank tier templates
 *
 * The generic mode writes copy-and-paste files with {{FIRST_NAME}} and
 * {{TICKET_LINK}} left in, so anyone on the crew can send one by hand
 * without needing this repo.
 */

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const SECRET = env.TICKET_SECRET;
const ORIGIN = env.SITE_ORIGIN || "https://www.lumanai.com";

const BUYERS = [
  { order: "#2598", first: "Tim", full: "Tim Patel", email: "drtimpatel@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2597", first: "Zach", full: "Zach Derr", email: "zachderr@yahoo.com", tier: "Obsidian", seats: 1 },
  { order: "#2594", first: "Chastity", full: "Chastity Raper", email: "thesingingbruha@gmail.com", tier: "Obsidian", seats: 2 },
  { order: "#2592", first: "Kulana", full: "Kulana Tom", email: "kheadlights@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2591", first: "Laureen", full: "Laureen Boutonnet", email: "laureenfrancais@yahoo.fr", tier: "Obsidian", seats: 1 },
  { order: "#2590", first: "Mike", full: "Mike Baro", email: "miketbaro@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2589", first: "Nick", full: "Nick Rainey", email: "iamnickbeam@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2588", first: "Arthur", full: "Arthur Suzuki", email: "arthurs@projectyourpassion.com", tier: "Obsidian", seats: 1 },
  { order: "#2587", first: "Nicole", full: "Nicole Sligar", email: "nicoleshoestring@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2586", first: "Happy", full: "Happy Om", email: "HappyOmAnanda@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2585", first: "Anja", full: "Anja Wenzel", email: "anja9881@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2581", first: "Sarag", full: "Sarag Fernandez", email: "sefangel@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2579", first: "Etienne", full: "Etienne Asher", email: "ash@lumanai.com", tier: "Obsidian", seats: 1 },
  { order: "#2577", first: "Cory", full: "Cory McCormack", email: "liquidzen528@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2576", first: "Angelica", full: "Angelica Hathaway", email: "hathawayangelica8@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2574", first: "Olivia", full: "Olivia Patton", email: "oliviacampbellpatton@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2572", first: "Olivia", full: "Olivia Pillow", email: "olivia.pillow@icloud.com", tier: "Obsidian", seats: 1 },
  { order: "#2571", first: "Cathy", full: "Cathy Vongnaraj", email: "cathyv@huntingtonandellis.com", tier: "Meridian", seats: 1 },
  { order: "#2569", first: "Laura", full: "Laura Wand", email: "law3c14@gmail.com", tier: "Perihelion", seats: 1 },
  { order: "#2568", first: "Michael", full: "Michael Alvarez", email: "Ceo@perfitnesspt.com", tier: "Meridian", seats: 1 },
];

const ACCENT = {
  Obsidian: "#8f96a8",
  Meridian: "#d4af6a",
  Perihelion: "#f0e6d2",
  Aphelion: "#9ec5ea",
};

const EXTRA = {
  Obsidian: [
    "One kava naktail from the exclusive menu",
    "Discounted drinks available for purchase",
  ],
  Meridian: [
    "RUSH ceremonial kava pouch to take home ($60 value)",
    "Every cocktail on the exclusive menu, open bar all night",
    "Ash's signature kanna cocktail — built for this night only",
    "VIP Reception, 7–8PM",
    "Exclusive VIP rooftop",
  ],
  Perihelion: [
    "RUSH ceremonial kava pouch to take home ($60 value)",
    "Every cocktail on the exclusive menu, open bar all night",
    "Ash's signature kanna cocktail — built for this night only",
    "VIP Reception, 7–8PM",
    "Exclusive VIP rooftop",
    "3 month Aphelion Club membership",
    "1 month Sweat Equity pass",
    "Reshape Body Bar pass",
    "More perks and a curated set of gifts, revealed on arrival",
  ],
  Aphelion: [
    "RUSH ceremonial kava pouch to take home ($60 value)",
    "Every cocktail on the exclusive menu, open bar all night",
    "Ash's signature kanna cocktail — built for this night only",
    "VIP Reception, 7–8PM",
    "Exclusive VIP rooftop",
    "1 year Aphelion Club membership",
    "3 month Sweat Equity pass",
    "Reshape Body Bar pass",
    "1 week MyHealthMatrix pass with wellness age test",
    "More perks and a curated set of gifts, revealed on arrival",
  ],
};

function ticket(b) {
  const p = Buffer.from(
    JSON.stringify({ order: b.order, name: b.full, tier: b.tier, seats: b.seats }),
    "utf8",
  ).toString("base64url");
  return `${ORIGIN}/ticket/${p}.${createHmac("sha256", SECRET).update(p).digest("base64url")}`;
}

const G = "#d4af6a", BONE = "#f2efe8", BODY = "#c9c3b8", MUTE = "#8a8378";
const BG = "#0b0b0c", CARD = "#141216", LINE = "#2a2621";
const H = "'Barlow Semi Condensed',Helvetica,Arial,sans-serif";
const T = "Barlow,Helvetica,Arial,sans-serif";

/**
 * Zach's sign-off block. Rendered as real text so it survives every
 * client — an image signature would be stripped exactly where the
 * confirmation matters most.
 */
const SIGNATURE = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0">
<tr><td style="padding:0 0 3px;font-family:${H};font-size:16px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BONE}">Zach Grzymala</td></tr>
<tr><td style="padding:0 0 10px;font-family:${T};font-size:14px;color:${G}">Bartender &nbsp;|&nbsp; Marketing &nbsp;|&nbsp; Design</td></tr>
<tr><td style="padding:0;font-family:${T};font-size:13px;line-height:1.75;color:${MUTE}">
<a href="tel:+14436190824" style="color:${MUTE};text-decoration:none">443-619-0824</a><br />
<a href="mailto:zach.grzymala@gmail.com" style="color:${MUTE};text-decoration:none">zach.grzymala@gmail.com</a><br />
<a href="https://www.lumanai.com" style="color:${G};text-decoration:none">www.lumanai.com</a>
</td></tr>
<tr><td style="padding:12px 0 0;font-family:${H};font-size:19px;font-weight:900;letter-spacing:3px;color:${BONE}">LUMANAI<span style="font-size:9px;vertical-align:super;color:${G}">&trade;</span></td></tr>
</table>`;

const SIGNATURE_TEXT = `Zach Grzymala
Bartender | Marketing | Design
443-619-0824
zach.grzymala@gmail.com
www.lumanai.com

LUMANAI`;

function render(b) {
  const link = b.__genericLink ?? ticket(b);
  const name = b.__genericName ?? b.first;
  const a = ACCENT[b.tier];
  const vip = b.tier !== "Obsidian";
  const li = (s, c = BODY) =>
    `<p style="margin:0 0 7px;font-family:${T};font-size:15px;line-height:1.5;color:${c}">&middot;&nbsp;&nbsp;${s}</p>`;
  const row = (t, w) =>
    `<tr><td width="76" valign="top" style="padding:0 0 8px;font-family:${H};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${MUTE}">${t}</td><td style="padding:0 0 8px;font-family:${T};font-size:15px;line-height:1.4;color:${BODY}">${w}</td></tr>`;
  const eyebrow = (s, c = G) =>
    `<p style="margin:0 0 12px;font-family:${H};font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${c}">${s}</p>`;
  const rule = `<tr><td style="padding:22px 32px"><div style="height:1px;background-color:${LINE};font-size:0;line-height:0">&nbsp;</div></td></tr>`;

  return `<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background-color:${BG};margin:0;padding:0">
<tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="max-width:560px;background-color:${BG};border:1px solid ${LINE};border-radius:16px">

<tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:40px 32px 4px">
<p style="margin:0 0 16px;font-family:${H};font-size:11px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:${G}">You&rsquo;re in</p>
<h1 style="margin:0;font-family:${H};font-size:36px;line-height:1.02;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:${BONE}">Luna <span style="color:${G}">Ekliptika</span></h1>
<p style="margin:12px 0 0;font-family:${H};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${G}">A premium nightlife experience</p>
</td></tr>

<tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:22px 32px 0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${a};border-radius:999px"><tr><td style="padding:8px 24px;font-family:${H};font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${a}">${b.tier}</td></tr></table>
</td></tr>

<tr><td bgcolor="${BG}" style="background-color:${BG};padding:24px 32px 0">
<p style="margin:0 0 12px;font-family:${T};font-size:16px;line-height:1.6;color:${BODY}">${name} &mdash;</p>
<p style="margin:0 0 12px;font-family:${T};font-size:16px;line-height:1.6;color:${BODY}">Thank you. <strong style="color:${G}">Your contribution to our crowd-funded launch is in</strong> and your spot is held. <strong style="color:${BONE}">The QR code below is your entry</strong> &mdash; nothing is printed and nothing ships.</p>
</td></tr>

<tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:18px 18px 0">
<p style="margin:0;font-family:${H};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${G}">Friday Night &middot; Aug 28${vip ? " &middot; Golden Hour 7PM" : ""} &middot; Doors 8PM</p>
</td></tr>

<tr><td bgcolor="${BG}" style="background-color:${BG};padding:22px 22px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${G};border-radius:14px">
<tr><td align="center" bgcolor="${CARD}" style="background-color:${CARD};padding:28px 20px">
<p style="margin:0 0 18px;font-family:${H};font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${BONE}">This is how you get in</p>
<a href="${link}" style="display:inline-block;background-color:${G};color:${BG};text-decoration:none;font-family:${H};font-size:14px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:15px 34px;border-radius:999px">Open my ticket</a>
<p style="margin:14px 0 0;font-family:${H};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${MUTE}">Add to home screen or screenshot</p>
<p style="margin:10px 0 0;font-family:${T};font-size:13px;line-height:1.5;color:${BODY}">Scan at the door for your personalized wristband.</p>
</td></tr></table></td></tr>

${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 32px">
${eyebrow("What's included")}
${li("Unlimited Traditional Kava shots for everyone, all night")}
${li("An exclusively crafted menu of low- or no-sugar naktails (kava) and functional mocktails")}
${li("Complimentary anti-inflammatory hors d'oeuvres all night")}
<div style="height:1px;background-color:${LINE};margin:12px 0;font-size:0;line-height:0">&nbsp;</div>
<p style="margin:0 0 9px;font-family:${H};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${a}">With ${b.tier}</p>
${EXTRA[b.tier].map((x) => li(x, a)).join("")}
</td></tr>

${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 32px">
${eyebrow("The night")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${vip ? row("7–8 PM", `Rooftop VIP Reception <span style="color:${G}">(Golden Hour)</span>`) : ""}
${row("8 PM", "Doors open &middot; pick up your wristband")}
${row("9–10 PM", "Three courses of hors d'oeuvres")}
${row("12 AM", "Midnight moon soundbath")}
${row("2 AM", "Last pour")}
</table>
<p style="margin:8px 0 0;font-family:${T};font-size:13px;line-height:1.5;color:${MUTE}">No sugar in any course. What they are is the surprise.</p>
</td></tr>

${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 32px">
${eyebrow("What to bring")}
${li("Swimsuit")}${li("Yoga mat")}${li("Empty stomach")}
<p style="margin:10px 0 0;font-family:${T};font-size:13px;line-height:1.5;color:${MUTE}">All white &mdash; off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional.${vip ? ` <span style="color:${G}">Gold and silver accents encouraged.</span>` : ""}</p>
</td></tr>

${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 22px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${G};border-radius:14px">
<tr><td align="center" bgcolor="${CARD}" style="background-color:${CARD};padding:24px 20px">
<p style="margin:0 0 6px;font-family:${H};font-size:11px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${G}">The address</p>
<p style="margin:0;font-family:${H};font-size:26px;font-weight:700;line-height:1.25;color:${BONE}">8620 Grove Mill Ct</p>
<p style="margin:2px 0 0;font-family:${T};font-size:15px;color:${MUTE}">Las Vegas, NV 89139</p>
<div style="height:1px;background-color:${G};opacity:.35;margin:16px auto 0;width:60%;font-size:0;line-height:0">&nbsp;</div>
<p style="margin:14px 0 4px;font-family:${H};font-size:11px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${G}">Gate code</p>
<p style="margin:0;font-family:${H};font-size:28px;font-weight:900;letter-spacing:7px;color:${BONE}">89139</p>
<p style="margin:14px 0 0"><a href="https://maps.google.com/?q=8620+Grove+Mill+Ct,+Las+Vegas,+NV+89139" style="font-family:${H};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${G};text-decoration:none">Open in maps &rarr;</a></p>
<p style="margin:12px 0 0;font-family:${T};font-size:13px;line-height:1.5;color:${MUTE}">Please keep this between us. It&rsquo;s someone&rsquo;s home.</p>
</td></tr></table></td></tr>

${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 32px 34px">
<p style="margin:0 0 16px;font-family:${T};font-size:15px;line-height:1.6;color:${BODY}">Anything at all &mdash; dietary, timing, a plus one &mdash; just reply. See you on the 28th.</p>
${SIGNATURE}
</td></tr>

</table></td></tr></table>`;
}

function plain(b) {
  const link = b.__genericLink ?? ticket(b);
  const name = b.__genericName ?? b.first;
  const vip = b.tier !== "Obsidian";
  return `${name} —

Thank you. Your contribution to our crowd-funded launch is in and your spot is held. The QR code below is your entry — nothing is printed and nothing ships.

Friday Night · Aug 28${vip ? " · Golden Hour 7PM" : ""} · Doors 8PM

THIS IS HOW YOU GET IN
${link}
Add to home screen or screenshot. Scan at the door for your personalized wristband.

WHAT'S INCLUDED
· Unlimited Traditional Kava shots for everyone, all night
· An exclusively crafted menu of low- or no-sugar naktails (kava) and functional mocktails
· Complimentary anti-inflammatory hors d'oeuvres all night

With ${b.tier}
${EXTRA[b.tier].map((x) => "· " + x).join("\n")}

THE NIGHT
${vip ? "7–8 PM    Rooftop VIP Reception (Golden Hour)\n" : ""}8 PM      Doors open · pick up your wristband
9–10 PM   Three courses of hors d'oeuvres
12 AM     Midnight moon soundbath
2 AM      Last pour

WHAT TO BRING
· Swimsuit
· Yoga mat
· Empty stomach

All white — off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional.${vip ? " Gold and silver accents encouraged." : ""}

THE ADDRESS
8620 Grove Mill Ct, Las Vegas, NV 89139
Gate code: 89139
Please keep this between us. It's someone's home.

Anything at all — dietary, timing, a plus one — just reply. See you on the 28th.

${SIGNATURE_TEXT}`;
}

/* ── Generic tier templates for future hand-sends ──────────── */
if (process.argv.includes("--generic")) {
  const OUT = "../Lumanai Business";
  for (const tier of ["Obsidian", "Meridian", "Perihelion", "Aphelion"]) {
    const stub = {
      tier,
      __genericName: "{{FIRST_NAME}}",
      __genericLink: "{{TICKET_LINK}}",
    };
    const header = `<!-- ============================================================
     LUNA EKLIPTIKA — ${tier.toUpperCase()} confirmation · BLANK TEMPLATE
     ============================================================

     TWO things to replace before sending:
       {{FIRST_NAME}}   the guest's first name
       {{TICKET_LINK}}  their unique ticket URL

     Ticket links come from the guest list, the Hand Delivery sheet,
     or by asking Claude. Each one is signed and carries that guest's
     name and tier — never reuse one person's link for someone else.

     Subject: You're in — LUNA EKLIPTIKA, Friday Aug 28

     ⚠️ THE ADDRESS AND GATE CODE ARE IN THIS EMAIL. Only send it to
     someone who has actually paid.

     TO SEND: open this file in a browser, select all (Ctrl+A), copy,
     then paste into Gmail's compose window. The formatting survives.
     ============================================================ -->

`;
    fs.writeFileSync(
      `${OUT}/Template — ${tier}.html`,
      header + render(stub),
      "utf8",
    );
    fs.writeFileSync(`${OUT}/Template — ${tier}.txt`, plain(stub), "utf8");
    console.log(`Template — ${tier}.html + .txt`);
  }
  process.exit(0);
}

for (const b of BUYERS) {
  process.stdout.write(
    JSON.stringify({
      order: b.order,
      name: b.full,
      first: b.first,
      email: b.email,
      tier: b.tier,
      html: render(b),
      text: plain(b),
    }) + "\n",
  );
}
