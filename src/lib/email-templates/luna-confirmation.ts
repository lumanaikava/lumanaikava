/**
 * LUNA EKLIPTIKA confirmation email — server-side render.
 *
 * Same template the reviewers signed off on, ported from the .mjs
 * generator so it can render at send-time on Vercel. The generator
 * still exists in scripts/ for previewing changes; both files carry
 * identical output.
 *
 * ⚠️ THIS IS THE ONLY PLACE THE ADDRESS AND THE GATE CODE APPEAR.
 * Never render a confirmation for anyone who hasn't paid. The webhook
 * handler is where that trust boundary lives; this file trusts its
 * caller.
 */

const DRESS_LONG =
  "All white — off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional.";
const DRESS_VIP = "Gold and silver accents encouraged.";

const ADDRESS = "8620 Grove Mill Ct";
const CITY = "Las Vegas, NV 89139";
const GATE = "89139";
const CONCIERGE = { name: "Karina", phone: "702-445-4242" };

const BG = "#0b0b0c";
const CARD = "#141216";
const GOLD = "#d4af6a";
const BONE = "#f2efe8";
const BODY = "#c9c3b8";
const MUTE = "#8a8378";
const LINE = "#2a2621";

const HEAD = `'Barlow Semi Condensed',Helvetica,Arial,sans-serif`;
const TEXT = `Barlow,Helvetica,Arial,sans-serif`;

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

export type LunaTierKey = "Obsidian" | "Meridian" | "Perihelion" | "Aphelion";

type TierSpec = {
  key: LunaTierKey;
  accent: string;
  line: string;
  when: string;
  start: string;
  concierge: boolean;
  vip: boolean;
  extra: string[];
};

const TIERS: TierSpec[] = [
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

const SCHEDULE: [string, string, boolean?][] = [
  ["7–8 PM", `Rooftop VIP Reception <span style="color:${GOLD};">(Golden Hour)</span>`, true],
  ["8 PM", "Doors open · pick up your wristband"],
  ["9–10 PM", "Three courses of hors d'oeuvres"],
  ["12 AM", "Midnight moon soundbath"],
  ["2 AM", "Last pour"],
];

function calendarLink(startUtc: string): string {
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

const eyebrow = (label: string, color = GOLD) =>
  `<p style="margin:0 0 14px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${color};">${label}</p>`;

const bullets = (items: string[], color = BODY) =>
  items
    .map(
      (i) =>
        `<p style="margin:0 0 8px 0;font-family:${TEXT};font-size:15px;line-height:1.5;color:${color};">&middot;&nbsp;&nbsp;${i}</p>`,
    )
    .join("");

const rowRule = `<tr><td style="padding:24px 34px;"><div style="height:1px;background-color:${LINE};line-height:0;font-size:0;">&nbsp;</div></td></tr>`;

const scheduleTable = (vip: boolean) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">` +
  SCHEDULE.filter(([, , gated]) => vip || !gated)
    .map(
      ([time, what]) =>
        `<tr><td width="82" valign="top" style="padding:0 0 9px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${MUTE};">${time}</td><td style="padding:0 0 9px 0;font-family:${TEXT};font-size:15px;line-height:1.4;color:${BODY};">${what}</td></tr>`,
    )
    .join("") +
  `</table>`;

/** Normalise a tier string coming from Shopify variant titles. */
export function resolveTier(raw: string): LunaTierKey | null {
  const trimmed = raw.trim().toLowerCase();
  const keys: LunaTierKey[] = ["Obsidian", "Meridian", "Perihelion", "Aphelion"];
  return keys.find((k) => trimmed.startsWith(k.toLowerCase())) ?? null;
}

export type ConfirmationInput = {
  firstName: string;
  tier: LunaTierKey;
  ticketLink: string;
};

export type ConfirmationOutput = {
  subject: string;
  html: string;
  text: string;
};

/** The subject line every tier shares. */
export const CONFIRMATION_SUBJECT =
  "You're in — LUNA EKLIPTIKA, Friday Aug 28";

/** Render one buyer's confirmation. Address and gate code are baked in. */
export function renderConfirmation(
  input: ConfirmationInput,
): ConfirmationOutput {
  const t = TIERS.find((x) => x.key === input.tier);
  if (!t) throw new Error(`Unknown tier: ${input.tier}`);
  const firstName = input.firstName.trim() || "Friend";
  const ticketLink = input.ticketLink;
  const cal = calendarLink(t.start);

  const html = `<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@600;700;800;900&display=swap');
  :root { color-scheme: dark; supported-color-schemes: dark; }
</style>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="background-color:${BG};margin:0;padding:0;">
<tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:32px 14px;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BG}" style="max-width:560px;background-color:${BG};border:1px solid ${LINE};border-radius:16px;">

  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:44px 32px 4px 32px;">
    <p style="margin:0 0 18px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:${GOLD};">You&rsquo;re in</p>
    <h1 style="margin:0;font-family:${HEAD};font-size:36px;line-height:1.02;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:${BONE};">Luna <span style="color:${GOLD};">Ekliptika</span></h1>
    <p style="margin:14px 0 0 0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${GOLD};">A sober nightlife experience like no other</p>
  </td></tr>

  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:26px 32px 0 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${t.accent};border-radius:999px;">
      <tr><td style="padding:8px 24px;font-family:${HEAD};font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${t.accent};">${t.key}</td></tr>
    </table>
  </td></tr>

  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:26px 34px 0 34px;">
    <p style="margin:0 0 14px 0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">${escapeHtml(firstName)} &mdash;</p>
    <p style="margin:0 0 14px 0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">Thank you. Your contribution is in and your spot is held. <strong style="color:${BONE};">The QR code below is your entry</strong> &mdash; nothing is printed and nothing ships.</p>
    <p style="margin:0;font-family:${TEXT};font-size:16px;line-height:1.6;color:${BODY};">${t.line}</p>
  </td></tr>

  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:22px 20px 0 20px;">
    <p style="margin:0;font-family:${HEAD};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${GOLD};white-space:nowrap;">${t.when}</p>
  </td></tr>

  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:26px 24px 0 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${GOLD};border-radius:14px;">
      <tr><td align="center" bgcolor="${CARD}" style="background-color:${CARD};padding:30px 22px;">
        <p style="margin:0 0 20px 0;font-family:${HEAD};font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${BONE};">This is how you get in</p>
        <a href="${escapeAttr(ticketLink)}" style="display:inline-block;background-color:${GOLD};color:${BG};text-decoration:none;font-family:${HEAD};font-size:14px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:15px 36px;border-radius:999px;">Open my ticket</a>
        <p style="margin:16px 0 0 0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${MUTE};">Add to home screen or screenshot</p>
        <p style="margin:12px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:${BODY};">Scan at the door for your personalized wristband.</p>
      </td></tr>
    </table>
  </td></tr>

  ${rowRule}

  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 34px 0 34px;">
    ${eyebrow("What's included")}
    ${bullets(COMMON)}
    <div style="height:1px;background-color:${LINE};margin:14px 0;line-height:0;font-size:0;">&nbsp;</div>
    <p style="margin:0 0 10px 0;font-family:${HEAD};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${t.accent};">With ${t.key}</p>
    ${bullets(t.extra, t.accent)}
  </td></tr>

  ${rowRule}

  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 34px 0 34px;">
    ${eyebrow("The night")}
    ${scheduleTable(t.vip)}
    <p style="margin:10px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:${MUTE};">No sugar in any course. What they are is the surprise.</p>
  </td></tr>

  ${rowRule}

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

  <tr><td bgcolor="${BG}" style="background-color:${BG};padding:2px 24px 0 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${GOLD};border-radius:14px;">
      <tr><td align="center" bgcolor="${CARD}" style="background-color:${CARD};padding:26px 22px;">
        <p style="margin:0 0 8px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${GOLD};">The address</p>
        <p style="margin:0;font-family:${HEAD};font-size:26px;font-weight:700;line-height:1.25;color:${BONE};">${ADDRESS}</p>
        <p style="margin:2px 0 0 0;font-family:${TEXT};font-size:15px;color:${MUTE};">${CITY}</p>
        <div style="height:1px;background-color:${GOLD};opacity:0.35;margin:18px auto 0 auto;width:60%;line-height:0;font-size:0;">&nbsp;</div>
        <p style="margin:16px 0 4px 0;font-family:${HEAD};font-size:11px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${GOLD};">Gate code</p>
        <p style="margin:0;font-family:${HEAD};font-size:28px;font-weight:900;letter-spacing:7px;color:${BONE};">${GATE}</p>
        <p style="margin:16px 0 0 0;"><a href="https://maps.google.com/?q=${encodeURIComponent(`${ADDRESS}, ${CITY}`)}" style="font-family:${HEAD};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${GOLD};text-decoration:none;">Open in maps &rarr;</a></p>
        <p style="margin:14px 0 0 0;font-family:${TEXT};font-size:13px;line-height:1.5;color:${MUTE};">Please keep this between us. It&rsquo;s someone&rsquo;s home.</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:22px 34px 0 34px;">
    <a href="${escapeAttr(cal)}" style="display:inline-block;border:1px solid ${GOLD};color:${GOLD};text-decoration:none;font-family:${HEAD};font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;padding:12px 28px;border-radius:999px;">Add to calendar</a>
  </td></tr>

  ${rowRule}

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
</table>`;

  // Plain-text alternative for anyone whose client blocks HTML (rare,
  // but Gmail's Priority Inbox occasionally previews the text half).
  const text = [
    `You're in — LUNA EKLIPTIKA`,
    `A sober nightlife experience like no other`,
    ``,
    `${firstName} —`,
    ``,
    `Thank you. Your contribution is in and your spot is held. The QR code below is your entry — nothing is printed and nothing ships.`,
    ``,
    t.line,
    ``,
    t.when,
    ``,
    `THIS IS HOW YOU GET IN`,
    ticketLink,
    `Add to home screen or screenshot. Scan at the door for your personalized wristband.`,
    ``,
    `WHAT'S INCLUDED`,
    ...COMMON.map((s) => `· ${s}`),
    ``,
    `With ${t.key}`,
    ...t.extra.map((s) => `· ${s}`),
    ``,
    `THE NIGHT`,
    ...SCHEDULE.filter(([, , gated]) => t.vip || !gated).map(
      ([time, what]) => `${time.padEnd(9)} ${what.replace(/<[^>]+>/g, "")}`,
    ),
    ``,
    `WHAT TO BRING`,
    ...BRING.map((s) => `· ${s}`),
    ``,
    DRESS_LONG + (t.vip ? " " + DRESS_VIP : ""),
    ``,
    `THE ADDRESS`,
    `${ADDRESS}, ${CITY}`,
    `Gate code: ${GATE}`,
    `Please keep this between us. It's someone's home.`,
    ``,
    `See you on the 28th.`,
    `— Ash & Zach`,
    ``,
    `Lumanai · Las Vegas · bula@lumanai.com`,
  ].join("\n");

  return { subject: CONFIRMATION_SUBJECT, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** URLs go into href attributes, which have their own escaping rules. */
function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
