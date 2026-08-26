import fs from "node:fs";
import path from "node:path";

/**
 * The four tier confirmation emails.
 *
 * Rebuilt after two rounds of image trouble. The rules that came out of
 * that:
 *
 *   1. THE WORDMARK IS TEXT, NEVER AN IMAGE. If images fail to load
 *      the branding still arrives — it renders in Gmail, iOS Mail,
 *      Outlook and everywhere else at once.
 *   2. NO CSS BACKGROUND IMAGES. Gmail strips the whole `background`
 *      declaration when it contains a url(), taking the colour with it,
 *      and a mistake there is invisible until someone reports a white
 *      email. If the roots can only come back as an <img>, that would
 *      be a separate deliberate row, not a wrap.
 *   3. EVERY SURFACE CARRIES A bgcolor ATTRIBUTE. The email must be
 *      correct with images switched off, which is how a lot of people
 *      read mail by default.
 *   4. THE OUTER WRAP IS A TABLE, NOT A DIV. iOS Mail auto-inverts
 *      dark emails when the outer chrome doesn't declare a background
 *      colour at the table level.
 *   5. THE PALETTE IS OFF-BLACK, NOT PURE #000. Pure black triggers
 *      more mobile clients' auto-invert heuristics than #0b0b0c does.
 *
 * Run:  node scripts/build-confirmation-emails.mjs
 * Out:  ../Lumanai Business/Confirmation — <Tier>.html
 */

const OUT = path.join("..", "Lumanai Business");

/* ── The things most likely to change ───────────────────────── */

const DRESS_LONG =
  "All white — off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional.";
const DRESS_VIP = "Gold and silver accents encouraged.";

const ADDRESS = "8620 Grove Mill Ct";
const CITY = "Las Vegas, NV 89139";
const GATE = "89139";
const CONCIERGE = { name: "Karina", phone: "702-445-4242" };

const BG = "#0b0b0c";        // page ground, off-black
const CARD = "#141216";      // panels
const GOLD = "#d4af6a";
const BONE = "#f2efe8";
const BODY = "#c9c3b8";
const MUTE = "#8a8378";
const LINE = "#2a2621";

const HEAD = `'Barlow Semi Condensed',Helvetica,Arial,sans-serif`;
const TEXT = `Barlow,Helvetica,Arial,sans-serif`;

/** Aug 28 2026, Las Vegas (PDT = UTC−7). */
function calendarLink(startUtc) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: "LUNA EKLIPTIKA — Lumanai",
    dates: `${startUtc}/20260829T080000Z`,
    details:
      "Your contribution is confirmed. Dress: " +
      DRESS_LONG +
      " Bring a swimsuit, a yoga mat and an empty stomach.",
    location: `${ADDRESS}, ${CITY}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

/* ── Per tier ───────────────────────────────────────────────── */

const RUSH = "RUSH instant ceremonial kava pouch to take home ($60 value)";
const SHOTS = "Unlimited Traditional Kava shots for everyone, all night";
const MENU =
  "An exclusively crafted menu of low- or no-sugar naktails (kava) and functional mocktails";
const HORS = "Complimentary anti-inflammatory hors d'oeuvres all night";
const OPEN_BAR = "Every cocktail on the exclusive menu, open bar all night";
const KANNA = "Ash's signature kanna cocktail — built for this night only";
const VIP = "VIP Reception, 7–8PM";
const ROOFTOP = "Exclusive VIP rooftop";
const GIFTS = "More perks and a curated set of gifts, revealed on arrival";

const COMMON = [SHOTS, MENU, HORS];

const TIERS = [
  {
    key: "Obsidian",
    accent: "#8f96a8",
    line: "We built this night to be worth showing up for. Glad you'll be there.",
    when: `Friday Night · Aug 28 · Doors 8PM`,
    start: "20260829T030000Z",
    concierge: false,
    vip: false,
    extra: [
      "One kava naktail from the exclusive menu",
      "Discounted drinks available for purchase",
    ],
  },
  {
    key: "Meridian",
    accent: GOLD,
    line: "The reception opens at seven — come early, the room's better before it fills.",
    when: `Friday Night · Aug 28 · Golden Hour 7PM · Doors 8PM`,
    start: "20260829T020000Z",
    concierge: false,
    vip: true,
    extra: [RUSH, OPEN_BAR, KANNA, VIP, ROOFTOP],
  },
  {
    key: "Perihelion",
    accent: "#f0e6d2",
    line: "It really means the world to us. Thank you for helping create the future of social drinking with us.",
    when: `Friday Night · Aug 28 · Golden Hour 7PM · Doors 8PM`,
    start: "20260829T020000Z",
    concierge: true,
    vip: true,
    extra: [
      RUSH,
      OPEN_BAR,
      KANNA,
      VIP,
      ROOFTOP,
      "3 month Aphelion Club membership",
      "1 month Sweat Equity pass",
      "Reshape Body Bar pass",
      GIFTS,
    ],
  },
  {
    key: "Aphelion",
    accent: "#9ec5ea",
    line: "It really means the world to us. Thank you for helping create the future of social drinking with us.",
    when: `Friday Night · Aug 28 · Golden Hour 7PM · Doors 8PM`,
    start: "20260829T020000Z",
    concierge: true,
    vip: true,
    extra: [
      RUSH,
      OPEN_BAR,
      KANNA,
      VIP,
      ROOFTOP,
      "1 year Aphelion Club membership",
      "3 month Sweat Equity pass",
      "Reshape Body Bar pass",
      "1 week MyHealthMatrix pass with wellness age test",
      GIFTS,
    ],
  },
];

const BRING = ["Swimsuit", "Yoga mat", "Empty stomach"];

const SCHEDULE = [
  ["7–8 PM", `Rooftop VIP Reception <span style="color:${GOLD};">(Golden Hour)</span>`, true],
  ["8 PM", "Doors open · pick up your wristband"],
  ["9–10 PM", "Three courses of hors d'oeuvres"],
  ["12 AM", "Midnight moon soundbath"],
  ["2 AM", "Last pour"],
];

/* ── Small pieces ───────────────────────────────────────────── */

const eyebrow = (label, color = GOLD) =>
  `<p style="margin:0 0 14px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${color};">${label}</p>`;

const bullets = (items, color = BODY) =>
  items
    .map(
      (i) =>
        `<p style="margin:0 0 8px 0;font-family:${TEXT};font-size:15px;line-height:1.5;color:${color};">&middot;&nbsp;&nbsp;${i}</p>`,
    )
    .join("");

const rowRule = `<tr><td style="padding:24px 34px;"><div style="height:1px;background-color:${LINE};line-height:0;font-size:0;">&nbsp;</div></td></tr>`;

const scheduleTable = (vip) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
  SCHEDULE.filter(([, , gated]) => vip || !gated)
    .map(
      ([time, what]) =>
        `<tr><td width="82" valign="top" style="padding:0 0 9px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${MUTE};">${time}</td><td style="padding:0 0 9px 0;font-family:${TEXT};font-size:15px;line-height:1.4;color:${BODY};">${what}</td></tr>`,
    )
    .join("") +
  `</table>`;

/* ── The template ───────────────────────────────────────────── */

function build(t) {
  const cal = calendarLink(t.start);
  return `<!-- ============================================================
     LUNA EKLIPTIKA — confirmation · ${t.key.toUpperCase()}
     ============================================================

     Sent AFTER a ${t.key} contribution clears.

     1. Replace  {{FIRST_NAME}}
     2. Replace  {{TICKET_LINK}}  with the guest's ticket URL from
        scripts/mint-tickets.mjs. Each one is unique to them.

     Subject: You're in — LUNA EKLIPTIKA, Friday Aug 28

     ⚠️ THIS IS THE ONLY PLACE THE ADDRESS AND GATE CODE APPEAR.
     Never send it to anyone who hasn't paid.

     GENERATED — edit scripts/build-confirmation-emails.mjs and re-run,
     don't edit this file. All four tiers share one template.
     ============================================================ -->

<!-- Colour-scheme hints stop iOS Mail and Outlook.com auto-inverting
     the dark palette back to white. They're safe in Gmail too — it
     just ignores what it doesn't understand. -->
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@600;700;800;900&display=swap');
  :root { color-scheme: dark; supported-color-schemes: dark; }
</style>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background-color:${BG};margin:0;padding:0;">
<tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:32px 14px;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="max-width:560px;background-color:${BG};border:1px solid ${LINE};border-radius:16px;">

  <!-- WORDMARK. Text, not an image — always renders. -->
  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:44px 32px 4px 32px;">
    <p style="margin:0 0 18px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:${GOLD};">You&rsquo;re in</p>
    <h1 style="margin:0;font-family:${HEAD};font-size:36px;line-height:1.02;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:${BONE};">
      Luna <span style="color:${GOLD};">Ekliptika</span>
    </h1>
    <p style="margin:14px 0 0 0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${GOLD};">
      A premium nightlife experience like no other
    </p>
  </td></tr>

  <!-- Tier chip -->
  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:26px 32px 0 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${t.accent};border-radius:999px;">
      <tr><td style="padding:8px 24px;font-family:${HEAD};font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${t.accent};">${t.key}</td></tr>
    </table>
  </td></tr>

  <!-- Greeting -->
  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:26px 34px 0 34px;">
    <p style="margin:0 0 14px 0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">{{FIRST_NAME}} &mdash;</p>
    <p style="margin:0 0 14px 0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">Thank you. <strong style="color:${GOLD};">Your contribution to our crowd-funded launch is in</strong> and your spot is held. <strong style="color:${BONE};">The QR code below is your entry</strong> &mdash; nothing is printed and nothing ships.</p>
    <p style="margin:0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">${t.line}</p>
  </td></tr>

  <!-- When -->
  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:22px 20px 0 20px;">
    <p style="margin:0;font-family:${HEAD};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${GOLD};white-space:nowrap;">${t.when}</p>
  </td></tr>

  <!-- Ticket panel -->
  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:26px 24px 0 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${GOLD};border-radius:14px;">
      <tr><td align="center" bgcolor="${CARD}" style="background-color:${CARD};padding:30px 22px;">
        <p style="margin:0 0 20px 0;font-family:${HEAD};font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${BONE};">This is how you get in</p>
        <a href="{{TICKET_LINK}}" style="display:inline-block;background-color:${GOLD};color:${BG};text-decoration:none;font-family:${HEAD};font-size:14px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:15px 36px;border-radius:999px;">Open my ticket</a>
        <p style="margin:16px 0 0 0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${MUTE};">Add to home screen or screenshot</p>
        <p style="margin:12px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:${BODY};">Scan at the door for your personalized wristband.</p>
      </td></tr>
    </table>
  </td></tr>

  ${rowRule}

  <!-- What's included -->
  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 34px 0 34px;">
    ${eyebrow("What's included")}
    ${bullets(COMMON)}
    <div style="height:1px;background-color:${LINE};margin:14px 0;line-height:0;font-size:0;">&nbsp;</div>
    <p style="margin:0 0 10px 0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${t.accent};">With ${t.key}</p>
    ${bullets(t.extra, t.accent)}
  </td></tr>

  ${rowRule}

  <!-- The night -->
  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 34px 0 34px;">
    ${eyebrow("The night")}
    ${scheduleTable(t.vip)}
    <p style="margin:10px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:${MUTE};">No sugar in any course. What they are is the surprise.</p>
  </td></tr>

  ${rowRule}

  <!-- What to bring -->
  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 34px 0 34px;">
    ${eyebrow("What to bring")}
    ${bullets(BRING)}
    <p style="margin:12px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:${MUTE};">${DRESS_LONG}${t.vip ? ` <span style="color:${GOLD};">${DRESS_VIP}</span>` : ""}</p>
  </td></tr>
${
  t.concierge
    ? `
  ${rowRule}
  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 24px 0 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${LINE};border-radius:12px;">
      <tr><td bgcolor="${CARD}" style="background-color:${CARD};padding:20px 22px;">
        ${eyebrow("Your concierge")}
        <p style="margin:0 0 8px 0;font-family:${TEXT};font-size:15px;line-height:1.55;color:${BODY};">Your personal concierge is <strong style="color:${BONE};">${CONCIERGE.name}</strong>. Reach out any time before or during the event.</p>
        <a href="tel:+1${CONCIERGE.phone.replace(/\D/g, "")}" style="font-family:${HEAD};font-size:18px;font-weight:700;letter-spacing:2px;color:${GOLD};text-decoration:none;">${CONCIERGE.phone}</a>
      </td></tr>
    </table>
  </td></tr>`
    : ""
}

  ${rowRule}

  <!-- Address panel -->
  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 24px 0 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${GOLD};border-radius:14px;">
      <tr><td align="center" bgcolor="${CARD}" style="background-color:${CARD};padding:26px 22px;">
        <p style="margin:0 0 8px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${GOLD};">The address</p>
        <p style="margin:0;font-family:${HEAD};font-size:26px;font-weight:700;line-height:1.25;color:${BONE};">${ADDRESS}</p>
        <p style="margin:2px 0 0 0;font-family:${TEXT};font-size:15px;color:${MUTE};">${CITY}</p>
        <div style="height:1px;background-color:${GOLD};opacity:0.35;margin:18px auto 0 auto;width:60%;line-height:0;font-size:0;">&nbsp;</div>
        <p style="margin:16px 0 4px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${GOLD};">Gate code</p>
        <p style="margin:0;font-family:${HEAD};font-size:28px;font-weight:900;letter-spacing:7px;color:${BONE};">${GATE}</p>
        <p style="margin:16px 0 0 0;">
          <a href="https://maps.google.com/?q=${encodeURIComponent(`${ADDRESS}, ${CITY}`)}" style="font-family:${HEAD};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${GOLD};text-decoration:none;">Open in maps &rarr;</a>
        </p>
        <p style="margin:14px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:${MUTE};">Please keep this between us. It&rsquo;s someone&rsquo;s home.</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:22px 34px 0 34px;">
    <a href="${cal}" style="display:inline-block;border:1px solid ${GOLD};color:${GOLD};text-decoration:none;font-family:${HEAD};font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:12px 28px;border-radius:999px;">Add to calendar</a>
  </td></tr>

  ${rowRule}

  <!-- Sign-off -->
  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 34px 0 34px;">
    <p style="margin:0;font-family:${TEXT};font-size:15px;line-height:1.6;color:${BODY};">Anything at all &mdash; dietary, timing, a plus one, cold feet &mdash; just reply. It reaches us directly.</p>
    <p style="margin:16px 0 0 0;font-family:${TEXT};font-size:15px;line-height:1.6;color:${BODY};">See you on the 28th.<br />&mdash; Ash &amp; Zach</p>
    <p style="margin:20px 0 0 0;font-family:${TEXT};font-size:11px;line-height:1.5;color:#5c574f;">Your QR code is your entry. By attending, you agree to the terms accepted at checkout.</p>
  </td></tr>

  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:30px 34px 34px 34px;">
    <p style="margin:0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#4d4941;">Lumanai &middot; Las Vegas</p>
    <p style="margin:8px 0 0 0;font-family:${TEXT};font-size:12px;color:#4d4941;"><a href="mailto:bula@lumanai.com" style="color:#6f6a61;text-decoration:none;">bula@lumanai.com</a></p>
  </td></tr>

</table>

</td></tr>
</table>
`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const t of TIERS) {
  const html = build(t);
  const file = path.join(OUT, `Confirmation — ${t.key}.html`);
  fs.writeFileSync(file, html, "utf8");
  console.log(
    `${`Confirmation — ${t.key}.html`.padEnd(34)} ${COMMON.length + t.extra.length} perks  ${(html.length / 1024).toFixed(1)}KB`,
  );
}
