import fs from "node:fs";
import path from "node:path";
import { createHmac } from "node:crypto";

/**
 * Hand-delivery sheet for LUNA EKLIPTIKA.
 *
 * Resend's deliverability is still warming up and the party is
 * tomorrow, so this generates ONE self-contained HTML page with every
 * buyer's personalised confirmation ready to copy into a personal
 * Gmail — which has a decade of sender reputation and will land in the
 * inbox.
 *
 * Per buyer: a Copy button for the rich HTML (paste straight into
 * Gmail's compose window and formatting survives), a Copy button for
 * plain text, their unique signed ticket link, and a mailto: that
 * opens a pre-addressed draft.
 *
 * Run:  node scripts/build-handoff-sheet.mjs
 * Out:  ../Lumanai Business/LUNA — Hand Delivery.html
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
if (!SECRET || SECRET.length < 16) {
  console.error("TICKET_SECRET missing in .env.local");
  process.exit(1);
}

/** Every paid LUNA ticket order, newest first. Pulled 2026-08-27. */
const BUYERS = [
  { order: "#2598", first: "Tim", full: "Tim Patel", email: "drtimpatel@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2597", first: "Zach", full: "Zach Derr", email: "zachderr@yahoo.com", tier: "Obsidian", seats: 1 },
  { order: "#2596", first: "Jasmine", full: "Jasmine Kurys", email: "", tier: "Obsidian", seats: 2 },
  { order: "#2595", first: "Ashkan", full: "Ashkan Maher", email: "", tier: "Obsidian", seats: 1 },
  { order: "#2594", first: "Chastity", full: "Chastity Raper", email: "thesingingbruha@gmail.com", tier: "Obsidian", seats: 2 },
  { order: "#2592", first: "Kulana", full: "Kulana Tom", email: "kheadlights@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2591", first: "Laureen", full: "Laureen Boutonnet", email: "laureenfrancais@yahoo.fr", tier: "Obsidian", seats: 1 },
  { order: "#2590", first: "Mike", full: "Mike Baro", email: "miketbaro@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2589", first: "Nick", full: "Nick Rainey", email: "iamnickbeam@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2588", first: "Arthur", full: "Arthur Suzuki", email: "arthurs@projectyourpassion.com", tier: "Obsidian", seats: 1 },
  { order: "#2587", first: "Nicole", full: "Nicole Sligar", email: "nicoleshoestring@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2586", first: "Happy", full: "Happy Om", email: "HappyOmAnanda@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2585", first: "Anja", full: "Anja Wenzel", email: "anja9881@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2584", first: "Ariana", full: "Ariana Zuniga", email: "", tier: "Obsidian", seats: 2 },
  { order: "#2583", first: "Reese", full: "Reese Ville", email: "", tier: "Obsidian", seats: 2 },
  { order: "#2582", first: "Nadia", full: "Nadia Basaidi", email: "", tier: "Obsidian", seats: 1 },
  { order: "#2581", first: "Sarag", full: "Sarag Fernandez", email: "sefangel@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2579", first: "Etienne", full: "Etienne Asher", email: "ash@lumanai.com", tier: "Obsidian", seats: 1 },
  { order: "#2578", first: "Karina", full: "Karina Estrada", email: "", tier: "Obsidian", seats: 1 },
  { order: "#2577", first: "Cory", full: "Cory McCormack", email: "liquidzen528@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2576", first: "Angelica", full: "Angelica Hathaway", email: "hathawayangelica8@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2574", first: "Olivia", full: "Olivia Patton", email: "oliviacampbellpatton@gmail.com", tier: "Obsidian", seats: 1 },
  { order: "#2572", first: "Olivia", full: "Olivia Pillow", email: "olivia.pillow@icloud.com", tier: "Obsidian", seats: 1 },
  { order: "#2571", first: "Cathy", full: "Cathy Vongnaraj", email: "cathyv@huntingtonandellis.com", tier: "Meridian", seats: 1 },
  { order: "#2570", first: "Jordan", full: "Jordan Handel", email: "", tier: "Obsidian", seats: 1 },
  { order: "#2569", first: "Laura", full: "Laura Wand", email: "law3c14@gmail.com", tier: "Perihelion", seats: 1 },
  { order: "#2568", first: "Michael", full: "Michael Alvarez", email: "Ceo@perfitnesspt.com", tier: "Meridian", seats: 1 },
  { order: "#2565", first: "Brandy", full: "Brandy Graff", email: "", tier: "Obsidian", seats: 1 },
  { order: "#2564", first: "Zach", full: "Zach Grzymala", email: "zachgriz5@gmail.com", tier: "Obsidian", seats: 1 },
];

function mintTicket({ order, full, tier, seats }) {
  const payload = Buffer.from(
    JSON.stringify({ order, name: full, tier, seats }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${ORIGIN}/ticket/${payload}.${sig}`;
}

/** Load a tier template and fill in the two placeholders. */
function emailHtmlFor(tier, first, link) {
  const p = path.join("..", "Lumanai Business", `Confirmation — ${tier}.html`);
  let html = fs.readFileSync(p, "utf8");
  html = html.replace(/^<!--[\s\S]*?-->\n*/, "");
  html = html.replace(/{{FIRST_NAME}}/g, first);
  html = html.replace(/{{TICKET_LINK}}/g, link);
  return html;
}

/** Plain-text version — for anyone who'd rather paste unstyled. */
function emailTextFor(b, link) {
  const vip = b.tier !== "Obsidian";
  return `${b.first} —

Thank you. Your contribution to our crowd-funded launch is in and your spot is held. The QR code below is your entry — nothing is printed and nothing ships.

Friday Night · Aug 28${vip ? " · Golden Hour 7PM" : ""} · Doors 8PM

YOUR TICKET — this is how you get in
${link}
Add to home screen or screenshot. Scan at the door for your personalized wristband.

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

See you on the 28th.
— Ash & Zach`;
}

const SUBJECT = "You're in — LUNA EKLIPTIKA, Friday Aug 28";

const withEmail = BUYERS.filter((b) => b.email);
const without = BUYERS.filter((b) => !b.email);

const cards = BUYERS.map((b, i) => {
  const link = mintTicket(b);
  const html = emailHtmlFor(b.tier, b.first, link);
  const text = emailTextFor(b, link);
  const tierColor =
    b.tier === "Meridian"
      ? "#d4af6a"
      : b.tier === "Perihelion"
        ? "#f0e6d2"
        : b.tier === "Aphelion"
          ? "#9ec5ea"
          : "#8f96a8";
  const mailto = b.email
    ? `mailto:${encodeURIComponent(b.email)}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(text)}`
    : "";

  return `
<div class="card${b.email ? "" : " noemail"}" id="c${i}">
  <div class="head">
    <div class="who">
      <span class="n">${b.full}</span>
      <span class="tier" style="color:${tierColor};border-color:${tierColor}">${b.tier}</span>
      ${b.seats > 1 ? `<span class="seats">admits ${b.seats}</span>` : ""}
      <span class="ord">${b.order}</span>
    </div>
    <div class="mail">${b.email || "⚠ NO EMAIL ON ORDER — text or DM them the ticket link"}</div>
  </div>
  <div class="acts">
    ${b.email ? `<a class="btn primary" href="${mailto}">✉ Open in mail app</a>` : ""}
    <button class="btn" onclick="copyRich(${i})">📋 Copy rich email</button>
    <button class="btn" onclick="copyText(${i})">📋 Copy plain text</button>
    <button class="btn" onclick="copyLink(${i})">🎟 Copy ticket link only</button>
    ${b.email ? `<button class="btn" onclick="copyAddr(${i})">Copy address</button>` : ""}
    <a class="btn ghost" href="${link}" target="_blank" rel="noopener">Preview ticket ↗</a>
  </div>
  <textarea class="src rich" id="r${i}">${html.replace(/</g, "&lt;")}</textarea>
  <textarea class="src txt" id="t${i}">${text.replace(/</g, "&lt;")}</textarea>
  <input class="src" id="l${i}" value="${link}" readonly />
  <input class="src" id="a${i}" value="${b.email}" readonly />
</div>`;
}).join("");

const page = `<!doctype html>
<meta charset="utf-8">
<title>LUNA EKLIPTIKA — Hand Delivery</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin:0; padding:24px 16px 80px; background:#0b0b0c; color:#c9c3b8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height:1.5;
  }
  .wrap { max-width: 860px; margin: 0 auto; }
  h1 { font-size:28px; margin:0 0 6px; color:#f2efe8; letter-spacing:-.01em; }
  h1 span { color:#d4af6a; }
  .sub { margin:0 0 20px; font-size:14px; color:#8a8378; }
  .how {
    background:#141216; border:1px solid #2a2621; border-radius:12px;
    padding:16px 18px; margin:0 0 22px; font-size:14px;
  }
  .how b { color:#d4af6a; }
  .how ol { margin:8px 0 0; padding-left:20px; }
  .how li { margin:4px 0; }
  .stat { display:flex; gap:18px; flex-wrap:wrap; margin:0 0 22px; }
  .stat div { font-size:13px; color:#8a8378; }
  .stat b { display:block; font-size:24px; color:#d4af6a; line-height:1.1; }
  .card {
    background:#141216; border:1px solid #2a2621; border-radius:12px;
    padding:14px 16px; margin:0 0 10px;
  }
  .card.noemail { border-color:#7a4a2a; background:#1a1310; }
  .head { display:flex; flex-wrap:wrap; gap:6px 12px; align-items:baseline; justify-content:space-between; }
  .who { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .n { font-size:16px; font-weight:600; color:#f2efe8; }
  .tier {
    font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase;
    border:1px solid; border-radius:99px; padding:2px 9px;
  }
  .seats { font-size:11px; color:#d4af6a; }
  .ord { font-size:11px; color:#5c574f; font-family:ui-monospace,monospace; }
  .mail { font-size:13px; color:#8a8378; font-family:ui-monospace,monospace; }
  .noemail .mail { color:#e0a878; }
  .acts { display:flex; flex-wrap:wrap; gap:6px; margin-top:11px; }
  .btn {
    font:inherit; font-size:12px; font-weight:600;
    background:#0b0b0c; color:#c9c3b8; border:1px solid #2a2621;
    border-radius:99px; padding:6px 13px; cursor:pointer; text-decoration:none;
    display:inline-block; transition:.15s;
  }
  .btn:hover { border-color:#d4af6a; color:#d4af6a; }
  .btn.primary { background:#d4af6a; color:#0b0b0c; border-color:#d4af6a; }
  .btn.primary:hover { background:#f2efe8; border-color:#f2efe8; color:#0b0b0c; }
  .btn.ghost { color:#5c574f; }
  .btn.ok { background:#2f7d5a !important; border-color:#2f7d5a !important; color:#fff !important; }
  .src { position:absolute; left:-9999px; width:1px; height:1px; opacity:0; }
  .toast {
    position:fixed; left:50%; bottom:24px; transform:translateX(-50%);
    background:#d4af6a; color:#0b0b0c; font-weight:700; font-size:14px;
    padding:11px 22px; border-radius:99px; opacity:0; pointer-events:none;
    transition:.2s; z-index:99;
  }
  .toast.show { opacity:1; }
  .sec { margin:28px 0 12px; font-size:12px; font-weight:700; letter-spacing:.16em;
         text-transform:uppercase; color:#d4af6a; }
</style>
<div class="wrap">
  <h1>LUNA <span>EKLIPTIKA</span> — Hand Delivery</h1>
  <p class="sub">Every paid ticket, with a personalised confirmation ready to send from your own inbox. Generated ${new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.</p>

  <div class="stat">
    <div><b>${BUYERS.length}</b>total orders</div>
    <div><b>${withEmail.length}</b>have an email</div>
    <div><b>${without.length}</b>need a text or DM</div>
    <div><b>${BUYERS.reduce((s, b) => s + b.seats, 0)}</b>total seats</div>
  </div>

  <div class="how">
    <b>Fastest path — rich email:</b>
    <ol>
      <li>Click <b>Copy rich email</b> on a card.</li>
      <li>In Gmail, hit Compose, paste their address, paste the subject <i>"${SUBJECT}"</i>, click into the body and <b>paste</b>. The full styled email lands intact.</li>
      <li>Send. Their unique ticket link is already baked in.</li>
    </ol>
    <b>Even faster — mail app:</b> <b>Open in mail app</b> pre-fills the address, subject and the plain-text version in one click.
  </div>

  ${cards}
</div>
<div class="toast" id="toast">Copied</div>
<script>
  function flash(msg, btn) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, 1400);
    if (btn) {
      var o = btn.textContent;
      btn.textContent = '✓ Copied'; btn.classList.add('ok');
      setTimeout(function(){ btn.textContent = o; btn.classList.remove('ok'); }, 1400);
    }
  }
  function copyPlain(id, msg, btn) {
    var el = document.getElementById(id);
    el.select(); el.setSelectionRange(0, 999999);
    document.execCommand('copy');
    flash(msg, btn);
  }
  function copyText(i){ copyPlain('t'+i, 'Plain text copied', event.target); }
  function copyLink(i){ copyPlain('l'+i, 'Ticket link copied', event.target); }
  function copyAddr(i){ copyPlain('a'+i, 'Email address copied', event.target); }
  function copyRich(i) {
    var html = document.getElementById('r'+i).value;
    var btn = event.target;
    var blob = new Blob([html], { type: 'text/html' });
    var plain = new Blob([document.getElementById('t'+i).value], { type: 'text/plain' });
    if (navigator.clipboard && window.ClipboardItem) {
      navigator.clipboard.write([new ClipboardItem({ 'text/html': blob, 'text/plain': plain })])
        .then(function(){ flash('Rich email copied — paste into Gmail', btn); })
        .catch(function(){ fallbackRich(html, btn); });
    } else { fallbackRich(html, btn); }
  }
  function fallbackRich(html, btn) {
    var d = document.createElement('div');
    d.contentEditable = true;
    d.style.cssText = 'position:fixed;left:-9999px;top:0;';
    d.innerHTML = html;
    document.body.appendChild(d);
    var r = document.createRange(); r.selectNodeContents(d);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    document.execCommand('copy');
    s.removeAllRanges(); document.body.removeChild(d);
    flash('Rich email copied — paste into Gmail', btn);
  }
</script>`;

const out = path.join("..", "Lumanai Business", "LUNA — Hand Delivery.html");
fs.writeFileSync(out, page, "utf8");
console.log(`${out}`);
console.log(
  `  ${BUYERS.length} orders · ${withEmail.length} with email · ${without.length} without · ${BUYERS.reduce((s, b) => s + b.seats, 0)} seats`,
);
console.log("");
console.log("  No email on order (text/DM these):");
for (const b of without) console.log(`    ${b.order}  ${b.full}  (${b.tier}, admits ${b.seats})`);
