import fs from "node:fs";
import path from "node:path";
import { createHmac } from "node:crypto";

/**
 * Send every LUNA EKLIPTIKA confirmation via Resend.
 *
 * WHY RESEND AND NOT GMAIL: on 2026-08-27 we sent 21 confirmations
 * through lumanai.events@gmail.com and Google hard-rejected every one
 * with SMTP 5.7.1 "Message rejected" — its outbound abuse filter treats
 * a burst of near-identical mail from a consumer account as spam. Not
 * one arrived. A probe through Resend the next morning landed in the
 * Gmail INBOX (and was even flagged Important), so the domain's
 * SPF/DKIM/DMARC are doing their job. Resend is the only path that
 * actually delivers at this volume.
 *
 *   node scripts/send-all-confirmations.mjs         dry run
 *   node scripts/send-all-confirmations.mjs --send  really send
 *
 * Idempotency key is the order name, so re-running never double-sends
 * to the same buyer within Resend's dedupe window.
 */

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
);
const SECRET = env.TICKET_SECRET;
const ORIGIN = env.SITE_ORIGIN || "https://www.lumanai.com";
const KEY = env.RESEND_API_KEY;
const FROM = env.RESEND_FROM_ADDRESS || "Lumanai <bula@lumanai.com>";

/** Every buyer with an email. Phone-only buyers were texted separately. */
const BUYERS = [
  ["#2603","Tarion","Tarion Young","tarionyoung@gmail.com","Obsidian",1],
  ["#2602","Melissa","Melissa Staples","mstaples729@gmail.com","Obsidian",1],
  ["#2601","Mahsa","Mahsa Jarrahi","mahsa@beautyrecon.ai","Obsidian",1],
  ["#2600","Jaymi","Jaymi Westra","jaymiwestra@gmail.com","Obsidian",1],
  ["#2599","Angelia","Angelia Sherry","angelia.sherry@gmail.com","Meridian",2],
  ["#2598","Tim","Tim Patel","drtimpatel@gmail.com","Obsidian",1],
  ["#2597","Zach","Zach Derr","zachderr@yahoo.com","Obsidian",1],
  ["#2594","Chastity","Chastity Raper","thesingingbruha@gmail.com","Obsidian",2],
  ["#2592","Kulana","Kulana Tom","kheadlights@gmail.com","Obsidian",1],
  ["#2591","Laureen","Laureen Boutonnet","laureenfrancais@yahoo.fr","Obsidian",1],
  ["#2590","Mike","Mike Baro","miketbaro@gmail.com","Obsidian",1],
  ["#2589","Nick","Nick Rainey","iamnickbeam@gmail.com","Obsidian",1],
  ["#2588","Arthur","Arthur Suzuki","arthurs@projectyourpassion.com","Obsidian",1],
  ["#2587","Nicole","Nicole Sligar","nicoleshoestring@gmail.com","Obsidian",1],
  ["#2586","Happy","Happy Om","HappyOmAnanda@gmail.com","Obsidian",1],
  ["#2585","Anja","Anja Wenzel","anja9881@gmail.com","Obsidian",1],
  ["#2581","Sarag","Sarag Fernandez","sefangel@gmail.com","Obsidian",1],
  ["#2579","Etienne","Etienne Asher","ash@lumanai.com","Obsidian",1],
  ["#2577","Cory","Cory McCormack","liquidzen528@gmail.com","Obsidian",1],
  ["#2576","Angelica","Angelica Hathaway","hathawayangelica8@gmail.com","Obsidian",1],
  ["#2574","Olivia","Olivia Patton","oliviacampbellpatton@gmail.com","Obsidian",1],
  ["#2572","Olivia","Olivia Pillow","olivia.pillow@icloud.com","Obsidian",1],
  ["#2571","Cathy","Cathy Vongnaraj","cathyv@huntingtonandellis.com","Meridian",1],
  ["#2569","Laura","Laura Wand","law3c14@gmail.com","Perihelion",1],
  ["#2568","Michael","Michael Alvarez","Ceo@perfitnesspt.com","Meridian",1],
  ["#2564","Zach","Zach Grzymala","zachgriz5@gmail.com","Obsidian",1],
].map(([order, first, full, email, tier, seats]) => ({ order, first, full, email, tier, seats }));

const ACCENT = { Obsidian:"#8f96a8", Meridian:"#d4af6a", Perihelion:"#f0e6d2", Aphelion:"#9ec5ea" };
const EXTRA = {
  Obsidian:["One kava naktail from the exclusive menu","Discounted drinks available for purchase"],
  Meridian:["RUSH ceremonial kava pouch to take home ($60 value)","Every cocktail on the exclusive menu, open bar all night","Ash's signature kanna cocktail — built for this night only","VIP Reception, 7–8PM","Exclusive VIP rooftop"],
  Perihelion:["RUSH ceremonial kava pouch to take home ($60 value)","Every cocktail on the exclusive menu, open bar all night","Ash's signature kanna cocktail — built for this night only","VIP Reception, 7–8PM","Exclusive VIP rooftop","3 month Aphelion Club membership","1 month Sweat Equity pass","Reshape Body Bar pass","More perks and a curated set of gifts, revealed on arrival"],
  Aphelion:["RUSH ceremonial kava pouch to take home ($60 value)","Every cocktail on the exclusive menu, open bar all night","Ash's signature kanna cocktail — built for this night only","VIP Reception, 7–8PM","Exclusive VIP rooftop","1 year Aphelion Club membership","3 month Sweat Equity pass","Reshape Body Bar pass","1 week MyHealthMatrix pass with wellness age test","More perks and a curated set of gifts, revealed on arrival"],
};

const G="#d4af6a", BONE="#f2efe8", BODY="#c9c3b8", MUTE="#8a8378";
const BG="#0b0b0c", CARD="#141216", LINE="#2a2621";
const H="'Barlow Semi Condensed',Helvetica,Arial,sans-serif";
const T="Barlow,Helvetica,Arial,sans-serif";

const link = (b) => {
  const p = Buffer.from(JSON.stringify({order:b.order,name:b.full,tier:b.tier,seats:b.seats}),"utf8").toString("base64url");
  return `${ORIGIN}/ticket/${p}.${createHmac("sha256",SECRET).update(p).digest("base64url")}`;
};

const SIG_HTML = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0">
<tr><td style="padding:0 0 3px;font-family:${H};font-size:16px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${BONE}">Zach Grzymala</td></tr>
<tr><td style="padding:0 0 10px;font-family:${T};font-size:14px;color:${G}">Bartender &nbsp;|&nbsp; Marketing &nbsp;|&nbsp; Design</td></tr>
<tr><td style="padding:0;font-family:${T};font-size:13px;line-height:1.75;color:${MUTE}">
<a href="tel:+14436190824" style="color:${MUTE};text-decoration:none">443-619-0824</a><br />
<a href="mailto:zach.grzymala@gmail.com" style="color:${MUTE};text-decoration:none">zach.grzymala@gmail.com</a><br />
<a href="https://www.lumanai.com" style="color:${G};text-decoration:none">www.lumanai.com</a></td></tr>
<tr><td style="padding:12px 0 0;font-family:${H};font-size:19px;font-weight:900;letter-spacing:3px;color:${BONE}">LUMANAI<span style="font-size:9px;vertical-align:super;color:${G}">&trade;</span></td></tr>
</table>`;

const SIG_TEXT = `Zach Grzymala
Bartender | Marketing | Design
443-619-0824
zach.grzymala@gmail.com
www.lumanai.com

LUMANAI`;

function html(b) {
  const L = link(b), a = ACCENT[b.tier], vip = b.tier !== "Obsidian";
  const li = (s,c=BODY) => `<p style="margin:0 0 7px;font-family:${T};font-size:15px;line-height:1.5;color:${c}">&middot;&nbsp;&nbsp;${s}</p>`;
  const row = (t,w) => `<tr><td width="76" valign="top" style="padding:0 0 8px;font-family:${H};font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${MUTE}">${t}</td><td style="padding:0 0 8px;font-family:${T};font-size:15px;line-height:1.4;color:${BODY}">${w}</td></tr>`;
  const eb = (s,c=G) => `<p style="margin:0 0 12px;font-family:${H};font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${c}">${s}</p>`;
  const rule = `<tr><td style="padding:22px 32px"><div style="height:1px;background-color:${LINE};font-size:0;line-height:0">&nbsp;</div></td></tr>`;
  const concierge = (b.tier==="Perihelion"||b.tier==="Aphelion") ? `${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 22px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${LINE};border-radius:12px">
<tr><td bgcolor="${CARD}" style="background-color:${CARD};padding:20px 22px">
${eb("Your concierge")}
<p style="margin:0 0 8px;font-family:${T};font-size:15px;line-height:1.55;color:${BODY}">Your personal concierge is <strong style="color:${BONE}">Karina</strong>. Reach out any time before or during the event.</p>
<a href="tel:+17024454242" style="font-family:${H};font-size:18px;font-weight:700;letter-spacing:2px;color:${G};text-decoration:none">702-445-4242</a>
</td></tr></table></td></tr>` : "";

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
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${a};border-radius:999px"><tr><td style="padding:8px 24px;font-family:${H};font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${a}">${b.tier}${b.seats>1?` &middot; admits ${b.seats}`:""}</td></tr></table>
</td></tr>
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:24px 32px 0">
<p style="margin:0 0 12px;font-family:${T};font-size:16px;line-height:1.6;color:${BODY}">${b.first} &mdash;</p>
<p style="margin:0 0 12px;font-family:${T};font-size:16px;line-height:1.6;color:${BODY}">Thank you. <strong style="color:${G}">Your contribution to our crowd-funded launch is in</strong> and your spot is held. <strong style="color:${BONE}">The QR code below is your entry</strong> &mdash; nothing is printed and nothing ships.</p>
</td></tr>
<tr><td align="center" bgcolor="${BG}" style="background-color:${BG};padding:18px 18px 0">
<p style="margin:0;font-family:${H};font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${G}">Friday Night &middot; Aug 28${vip?" &middot; Golden Hour 7PM":""} &middot; Doors 8PM</p>
</td></tr>
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:22px 22px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${CARD}" style="background-color:${CARD};border:1px solid ${G};border-radius:14px">
<tr><td align="center" bgcolor="${CARD}" style="background-color:${CARD};padding:28px 20px">
<p style="margin:0 0 18px;font-family:${H};font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${BONE}">This is how you get in</p>
<a href="${L}" style="display:inline-block;background-color:${G};color:${BG};text-decoration:none;font-family:${H};font-size:14px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:15px 34px;border-radius:999px">Open my ticket</a>
<p style="margin:14px 0 0;font-family:${H};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${MUTE}">Add to home screen or screenshot</p>
<p style="margin:10px 0 0;font-family:${T};font-size:13px;line-height:1.5;color:${BODY}">Scan at the door for your personalized wristband.</p>
</td></tr></table></td></tr>
${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 32px">
${eb("What's included")}
${li("Unlimited Traditional Kava shots for everyone, all night")}
${li("An exclusively crafted menu of low- or no-sugar naktails (kava) and functional mocktails")}
${li("Complimentary anti-inflammatory hors d'oeuvres all night")}
<div style="height:1px;background-color:${LINE};margin:12px 0;font-size:0;line-height:0">&nbsp;</div>
<p style="margin:0 0 9px;font-family:${H};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${a}">With ${b.tier}</p>
${EXTRA[b.tier].map(x=>li(x,a)).join("")}
</td></tr>
${concierge}
${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 32px">
${eb("The night")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${vip?row("7–8 PM",`Rooftop VIP Reception <span style="color:${G}">(Golden Hour)</span>`):""}
${row("8 PM","Doors open &middot; pick up your wristband")}
${row("9–10 PM","Three courses of hors d'oeuvres")}
${row("12 AM","Midnight moon soundbath")}
${row("2 AM","Last pour")}
</table>
<p style="margin:8px 0 0;font-family:${T};font-size:13px;line-height:1.5;color:${MUTE}">No sugar in any course. What they are is the surprise.</p>
</td></tr>
${rule}
<tr><td bgcolor="${BG}" style="background-color:${BG};padding:0 32px">
${eb("What to bring")}
${li("Swimsuit")}${li("Yoga mat")}${li("Empty stomach")}
<p style="margin:10px 0 0;font-family:${T};font-size:13px;line-height:1.5;color:${MUTE}">All white &mdash; off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional.${vip?` <span style="color:${G}">Gold and silver accents encouraged.</span>`:""}</p>
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
<p style="margin:0 0 18px;font-family:${T};font-size:15px;line-height:1.6;color:${BODY}">Anything at all &mdash; dietary, timing, a plus one &mdash; just reply. See you tonight.</p>
${SIG_HTML}
</td></tr>
</table></td></tr></table>`;
}

function text(b) {
  const vip = b.tier !== "Obsidian";
  return `${b.first} —

Thank you. Your contribution to our crowd-funded launch is in and your spot is held. The QR code below is your entry — nothing is printed and nothing ships.

Friday Night · Aug 28${vip?" · Golden Hour 7PM":""} · Doors 8PM

THIS IS HOW YOU GET IN
${link(b)}
Add to home screen or screenshot. Scan at the door for your personalized wristband.

WHAT'S INCLUDED
· Unlimited Traditional Kava shots for everyone, all night
· An exclusively crafted menu of low- or no-sugar naktails (kava) and functional mocktails
· Complimentary anti-inflammatory hors d'oeuvres all night

With ${b.tier}
${EXTRA[b.tier].map(x=>"· "+x).join("\n")}
${(b.tier==="Perihelion"||b.tier==="Aphelion")?`
YOUR CONCIERGE
Karina — 702-445-4242
`:""}
THE NIGHT
${vip?"7–8 PM    Rooftop VIP Reception (Golden Hour)\n":""}8 PM      Doors open · pick up your wristband
9–10 PM   Three courses of hors d'oeuvres
12 AM     Midnight moon soundbath
2 AM      Last pour

WHAT TO BRING
· Swimsuit
· Yoga mat
· Empty stomach

All white — off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional.${vip?" Gold and silver accents encouraged.":""}

THE ADDRESS
8620 Grove Mill Ct, Las Vegas, NV 89139
Gate code: 89139
Please keep this between us. It's someone's home.

Anything at all — dietary, timing, a plus one — just reply. See you tonight.

${SIG_TEXT}`;
}

const send = process.argv.includes("--send");
if (!send) {
  console.log(`DRY RUN — ${BUYERS.length} would send via Resend. Pass --send.\n`);
  BUYERS.forEach(b => console.log(`  ${b.order.padEnd(7)}${b.tier.padEnd(12)}${b.email}`));
  process.exit(0);
}

let ok = 0, fail = 0;
for (const b of BUYERS) {
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `luna-final-${b.order}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: [b.email],
        reply_to: "bula@lumanai.com",
        subject: "You're in — LUNA EKLIPTIKA, tonight",
        html: html(b),
        text: text(b),
        headers: {
          "List-Unsubscribe": "<mailto:unsubscribe@lumanai.com>, <https://www.lumanai.com/api/unsubscribe>",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    const d = await r.json();
    if (!r.ok || !d.id) { console.log(`  FAIL ${b.order} ${b.email}: ${(d.message||JSON.stringify(d)).slice(0,90)}`); fail++; }
    else { console.log(`  OK   ${b.order.padEnd(7)}${b.tier.padEnd(12)}${b.email.padEnd(32)}${d.id}`); ok++; }
  } catch (e) {
    console.log(`  ERR  ${b.order} ${b.email}: ${e.message}`); fail++;
  }
  // Resend allows 2/sec; stay comfortably under.
  await new Promise(r => setTimeout(r, 600));
}
console.log(`\n${ok} sent, ${fail} failed.`);
