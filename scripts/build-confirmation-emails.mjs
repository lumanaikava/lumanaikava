import fs from "node:fs";
import path from "node:path";

/**
 * The four tier confirmation emails.
 *
 * Generated rather than hand-written because they share nine tenths of
 * their content. Four copies of the address block is four places to fix
 * a typo in, and the one that gets missed is the one with the gate code
 * in it.
 *
 * Run:  node scripts/build-confirmation-emails.mjs
 * Out:  ../Lumanai Business/Confirmation — <Tier>.html
 */

const OUT = path.join("..", "Lumanai Business");

/* ── The things most likely to change ───────────────────────── */

// Official, confirmed by Zach 2026-08-19. "All white" is the headline;
// the rest is the permitted range. Gold and silver accents are a VIP-
// only line — it goes in Meridian and above ONLY, so it stays a mark of
// the tier rather than a dress note everyone has read.
const DRESS = "All white";
const DRESS_LONG =
  "All white — off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional.";
const DRESS_VIP = "Gold and silver accents encouraged.";

const ADDRESS = "8620 Grove Mill Ct";
const CITY = "Las Vegas, NV 89139";
const GATE = "89139";
const CONCIERGE = { name: "Karina", phone: "702-445-4242" };

const GOLD = "#d4af6a";
const BONE = "#f2efe8";
const BODY = "#ddd8cf";
const MUTE = "#a9a296";
const LINE = "#2a2621";
// Served from the vercel.app host, not www.lumanai.com: identical
// files on the identical server, but that hostname resolves on every
// network — including Aristocrat's, where www.lumanai.com currently
// doesn't. Nobody ever sees an image URL in an email.
const ROOTS = "https://lumanaikava.vercel.app/images/party/roots-email.jpg";
// Roots + logo + wordmark baked into one image. Gmail strips CSS
// background images and the `background` shorthand, so the only way to
// guarantee the branding arrives is to make it an <img>.
const HEADER = "https://lumanaikava.vercel.app/images/party/email-header.jpg";

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
const SHOTS = "Unlimited traditional kava shots";
const HORS = "Complimentary anti-inflammatory hors d'oeuvres all night";
const OPEN_BAR = "Every cocktail on the exclusive menu, open bar all night";
const KANNA = "Ash's signature kanna cocktail — built for this night only";
const VIP = "VIP Reception, 7–8PM";
const ROOFTOP = "Exclusive VIP rooftop";
const GIFTS = "More perks and a curated set of gifts, revealed on arrival";

/** True of every ticket — printed plain, before anything tier-specific. */
const COMMON = [SHOTS, HORS];

/**
 * What this tier adds on top, printed in the tier's own colour.
 *
 * Ordered so the RUSH pouch leads wherever it exists — it's the only
 * item a guest physically carries home, so it earns the top line.
 */
const TIERS = [
  {
    key: "Obsidian",
    accent: "#8f96a8",
    line: "We built this night to be worth showing up for. Glad you'll be there.",
    when: `Fri, Aug 28 · Doors 8PM`,
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
    when: `Fri, Aug 28 · Golden Hour 7PM · Doors 8PM`,
    start: "20260829T020000Z",
    concierge: false,
    vip: true,
    extra: [RUSH, OPEN_BAR, KANNA, VIP, ROOFTOP],
  },
  {
    key: "Perihelion",
    accent: "#f0e6d2",
    line: "It really means the world to us. Thank you for helping create the future of social drinking with us.",
    when: `Fri, Aug 28 · Golden Hour 7PM · Doors 8PM`,
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
    when: `Fri, Aug 28 · Golden Hour 7PM · Doors 8PM`,
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

/**
 * The shape of the night, times only.
 *
 * No dish names on purpose — the guest has already paid, so this is
 * about anticipation rather than persuasion, and "second course" lands
 * better than a menu they'll read twice and then forget.
 */
const SCHEDULE = [
  ["7–8 PM", "Rooftop VIP Reception <span style=\"color:#d4af6a;\">(Golden Hour)</span>", true],
  ["8 PM", "Doors open"],
  ["8:30 PM", "Opening remarks from Ash"],
  ["9–10 PM", "Three courses of hors d'oeuvres"],
  ["11 PM", "Founder's ceremonial speech"],
  ["12 AM", "Midnight moon soundbath"],
  ["1 AM", "Last pour"],
];

const schedule = (vip) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
  SCHEDULE.filter(([, , gated]) => vip || !gated)
    .map(
      ([time, what]) =>
        `<tr>` +
        `<td width="76" style="padding:0 0 8px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#8a8378;vertical-align:top;">${time}</td>` +
        `<td style="padding:0 0 8px 0;font-family:${TEXT};font-size:15px;line-height:1.45;color:${BODY};">${what}</td>` +
        `</tr>`,
    )
    .join("") +
  `</table>`;

/* ── Pieces ─────────────────────────────────────────────────── */

const eyebrow = (t, color = GOLD) =>
  `<p style="margin:0 0 14px 0;font-family:${HEAD};font-size:12px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${color};">${t}</p>`;

const bullets = (items, color = BODY) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
  items
    .map(
      (i, n) =>
        `<tr><td style="padding:0 0 ${n === items.length - 1 ? 0 : 9}px 0;font-family:${TEXT};font-size:15px;line-height:1.5;color:${color};"><span style="color:${color};opacity:0.7;">&middot;</span>&nbsp;&nbsp;${i}</td></tr>`,
    )
    .join("") +
  `</table>`;

const rule = `<tr><td style="padding:28px 34px 0 34px;"><div style="height:1px;background-color:${LINE};font-size:0;line-height:0;"></div></td></tr>`;

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

<style>
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@600;700;800;900&display=swap');
</style>

<div style="margin:0;padding:0;background-color:#050505;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#050505"
       background="${ROOTS}"
       style="background-color:#050505;background-image:url('${ROOTS}');background-repeat:repeat;background-position:center top;">
<tr><td align="center" style="padding:36px 16px;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0b0c" style="max-width:560px;background-color:#0b0b0c;border:1px solid ${LINE};border-radius:18px;">

  <tr><td style="padding:0;font-size:0;line-height:0;">
    <img src="${HEADER}" width="560" alt="Luna Ekliptika — you're in"
         style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:18px 18px 0 0;" />
  </td></tr>

  <tr><td align="center" style="padding:26px 32px 0 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${t.accent}77;border-radius:999px;">
      <tr><td style="padding:9px 26px;font-family:${HEAD};font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${t.accent};">${t.key}</td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:28px 34px 0 34px;">
    <p style="margin:0 0 16px 0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">{{FIRST_NAME}} &mdash;</p>
    <p style="margin:0 0 16px 0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">
      Thank you. Your contribution is in and your spot is held.
      <strong style="color:${BONE};">The QR code below is your
      entry</strong> &mdash; nothing is printed and nothing ships.
    </p>
    <p style="margin:0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">${t.line}</p>
  </td></tr>

  <tr><td align="center" style="padding:22px 34px 0 34px;">
    <p style="margin:0;font-family:${HEAD};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${GOLD};white-space:nowrap;">${t.when}</p>
  </td></tr>

  <!-- Ticket -->
  <tr><td style="padding:26px 34px 0 34px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           bgcolor="#141210" background="${ROOTS}"
           style="background-color:#141210;background-image:url('${ROOTS}');background-repeat:repeat;background-position:center center;border:1px solid ${GOLD}66;border-radius:14px;">
      <tr><td align="center" style="padding:30px 22px;">
        <p style="margin:0 0 20px 0;font-family:${HEAD};font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${BONE};">
          This is how you get in
        </p>
        <a href="{{TICKET_LINK}}"
           style="display:inline-block;background-color:${GOLD};background-image:linear-gradient(100deg,#b8914e 0%,#e9cf92 28%,#fff6dc 46%,#e9cf92 64%,#b8914e 100%);color:#050505;text-decoration:none;font-family:${HEAD};font-size:15px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:17px 40px;border-radius:999px;box-shadow:0 8px 26px -10px rgba(212,175,106,0.75);">
          Open my ticket
        </a>
        <p style="margin:18px 0 0 0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">
          Add it to your home screen or screenshot
        </p>
      </td></tr>
    </table>
  </td></tr>

${rule}

  <!-- What's included -->
  <tr><td style="padding:26px 34px 0 34px;">
    ${eyebrow("What's included")}
    ${bullets(COMMON)}
    <div style="height:1px;background-color:${LINE};margin:14px 0;font-size:0;line-height:0;"></div>
    <p style="margin:0 0 10px 0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${t.accent};">With ${t.key}</p>
    ${bullets(t.extra, t.accent)}
  </td></tr>

  <!-- The night -->
  <tr><td style="padding:26px 34px 0 34px;">
    ${eyebrow("The night")}
    ${schedule(t.vip)}
    <p style="margin:10px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:#8a8378;">No sugar in any course. What they are is the surprise.</p>
  </td></tr>

  <!-- What to bring -->
  <tr><td style="padding:26px 34px 0 34px;">
    ${eyebrow("What to bring")}
    ${bullets(BRING)}
    <p style="margin:12px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:#8a8378;">${DRESS_LONG}${t.vip ? ` <span style="color:${GOLD};">${DRESS_VIP}</span>` : ""}</p>
  </td></tr>
${
  t.concierge
    ? `
  <!-- Concierge -->
  <tr><td style="padding:26px 34px 0 34px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#111013" style="border:1px solid ${LINE};border-radius:12px;background-color:#111013;">
      <tr><td style="padding:20px 22px;">
        ${eyebrow("Your concierge")}
        <p style="margin:0 0 8px 0;font-family:${TEXT};font-size:15px;line-height:1.55;color:${BODY};">
          Your personal concierge is <strong style="color:${BONE};">${CONCIERGE.name}</strong>. Please don&rsquo;t hesitate to contact her before or during the event if you need anything kava or event-related.
        </p>
        <a href="tel:+1${CONCIERGE.phone.replace(/\D/g, "")}" style="font-family:${HEAD};font-size:18px;font-weight:700;letter-spacing:2px;color:${GOLD};text-decoration:none;">${CONCIERGE.phone}</a>
      </td></tr>
    </table>
  </td></tr>`
    : ""
}

  <!-- The address -->
  <tr><td style="padding:18px 34px 0 34px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           bgcolor="#141210" background="${ROOTS}"
           style="background-color:#141210;background-image:url('${ROOTS}');background-repeat:repeat;background-position:center center;border:1px solid ${GOLD}66;border-radius:14px;">
      <tr><td align="center" style="padding:26px 22px;">
        <p style="margin:0 0 8px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${GOLD};">The address</p>
        <p style="margin:0;font-family:${HEAD};font-size:26px;font-weight:700;line-height:1.25;color:${BONE};">${ADDRESS}</p>
        <p style="margin:2px 0 0 0;font-family:${TEXT};font-size:15px;color:${MUTE};">${CITY}</p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:18px auto 0 auto;border-top:1px solid ${GOLD}44;">
          <tr><td align="center" style="padding:16px 22px 0 22px;">
            <p style="margin:0 0 4px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${GOLD};">Gate code</p>
            <p style="margin:0;font-family:${HEAD};font-size:30px;font-weight:900;letter-spacing:7px;color:${BONE};">${GATE}</p>
          </td></tr>
        </table>

        <p style="margin:16px 0 0 0;">
          <a href="https://maps.google.com/?q=${encodeURIComponent(`${ADDRESS}, ${CITY}`)}" style="font-family:${HEAD};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${GOLD};text-decoration:none;">Open in maps &rarr;</a>
        </p>
        <p style="margin:14px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:#8a8378;">Please keep this between us. It&rsquo;s someone&rsquo;s home.</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding:26px 34px 0 34px;">
    <a href="${cal}" style="display:inline-block;border:1px solid ${GOLD}66;color:${GOLD};text-decoration:none;font-family:${HEAD};font-size:12px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:13px 30px;border-radius:999px;">Add to calendar</a>
  </td></tr>

${rule}

  <tr><td style="padding:22px 34px 0 34px;">
    <p style="margin:0;font-family:${TEXT};font-size:15px;line-height:1.6;color:${BODY};">
      Anything at all &mdash; dietary, timing, a plus one, cold feet
      &mdash; just reply to this email. It reaches us directly.
    </p>
    <p style="margin:16px 0 0 0;font-family:${TEXT};font-size:15px;line-height:1.6;color:${BODY};">
      See you on the 28th.<br />&mdash; Ash &amp; Zach
    </p>
    <p style="margin:18px 0 0 0;font-family:${TEXT};font-size:12px;line-height:1.5;color:#6f6a61;">
      Your QR code is your entry. By attending, you agree to the terms
      accepted at checkout.
    </p>
  </td></tr>

  <tr><td align="center" style="padding:30px 34px 34px 34px;">
    <p style="margin:0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#4d4941;">Lumanai &middot; Las Vegas</p>
    <p style="margin:8px 0 0 0;font-family:${TEXT};font-size:12px;color:#4d4941;">
      <a href="mailto:bula@lumanai.com" style="color:#6f6a61;text-decoration:none;">bula@lumanai.com</a>
    </p>
  </td></tr>

</table>

</td></tr>
</table>
</div>
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
