/**
 * LUNA EKLIPTIKA "You're invited" email — server-side render.
 *
 * The same file that was signed off by the reviewers, ported into TS so
 * the guest-list's Send invite button can render it at click-time. Only
 * personalisation is {{FIRST_NAME}}; the password, discount code, and
 * every other detail is baked into the copy so a distracted crew member
 * can't accidentally leave a placeholder in.
 *
 * ⚠️ The address and gate code are NOT in this email. Those live only
 * in the confirmation that fires after a real ticket purchase.
 */

export const INVITATION_SUBJECT =
  "You're invited — LUNA EKLIPTIKA, Aug 28";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderInvitation(input: { firstName: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const firstName = escapeHtml(input.firstName.trim() || "Friend");

  const html = `<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Semi+Condensed:wght@600;700;800;900&display=swap');
  :root { color-scheme: dark; supported-color-schemes: dark; }
</style>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0b0c" style="background-color:#0b0b0c;margin:0;padding:0;">
<tr><td align="center" bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:32px 14px;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0b0c" style="max-width:560px;background-color:#0b0b0c;border:1px solid #2a2621;border-radius:16px;">

  <tr><td align="center" bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:46px 32px 4px 32px;">
    <p style="margin:0 0 20px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:#d4af6a;">You&rsquo;re invited</p>
    <p style="margin:0 0 12px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#8a8378;">Lumanai presents</p>
    <h1 style="margin:0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:44px;line-height:0.98;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#f2efe8;">Luna<br /><span style="color:#d4af6a;">Ekliptika</span></h1>
    <p style="margin:16px 0 0 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#d4af6a;">A premium nightlife experience</p>
  </td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:32px 34px 0 34px;">
    <p style="margin:0 0 16px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#c9c3b8;">${firstName} &mdash;</p>
    <p style="margin:0 0 16px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#c9c3b8;">On the 28th we&rsquo;re throwing our first party. Not a market, not a booth &mdash; a full night at a private residence, built entirely around kava.</p>
    <p style="margin:0 0 16px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#c9c3b8;">It&rsquo;s also the night Lumanai stops being a thing we do on weekends. RUSH launches. The site goes live. And the people who were around before any of it existed get the first pour.</p>
    <p style="margin:0 0 16px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#c9c3b8;">That&rsquo;s you. So this is a real invitation, not a flyer.</p>
    <p style="margin:0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#c9c3b8;"><strong style="color:#d4af6a;">This is a crowd-fundraiser.</strong> Every ticket is a contribution to Lumanai&rsquo;s launch, and every tier is a different way to help. You choose your part.</p>
  </td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:28px 34px;"><div style="height:1px;background-color:#2a2621;line-height:0;font-size:0;">&nbsp;</div></td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:2px 34px 0 34px;">
    <p style="margin:0 0 16px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#d4af6a;">The offerings</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:0 0 16px 0;">
        <p style="margin:0 0 4px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">The bar</p>
        <p style="margin:0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#c9c3b8;">Unlimited Traditional Kava shots for everyone, all night. An exclusively crafted menu of low- or no-sugar naktails (kava) and functional mocktails. Meridian and above get the full cocktail list plus Ash&rsquo;s signature kanna pour, built for this night only.</p>
      </td></tr>
      <tr><td style="padding:0 0 16px 0;">
        <p style="margin:0 0 4px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">The table</p>
        <p style="margin:0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#c9c3b8;">Three courses of anti-inflammatory hors d&rsquo;oeuvres between nine and ten, no sugar in any of them. What they are is the surprise.</p>
      </td></tr>
      <tr><td style="padding:0 0 16px 0;">
        <p style="margin:0 0 4px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">Activations</p>
        <p style="margin:0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#c9c3b8;">Poolside cold plunges, a midnight moon soundbath, and more.</p>
      </td></tr>
      <tr><td style="padding:0;">
        <p style="margin:0 0 4px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">The lineup</p>
        <p style="margin:0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#c9c3b8;">DJ lineup drops later this week.</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:28px 34px;"><div style="height:1px;background-color:#2a2621;line-height:0;font-size:0;">&nbsp;</div></td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:2px 24px 0 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#141216" style="background-color:#141216;border:1px solid #2a2621;border-radius:12px;">
      <tr><td bgcolor="#141216" style="background-color:#141216;padding:22px 22px 6px 22px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="82" valign="top" style="padding:0 0 14px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">When</td>
            <td style="padding:0 0 14px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#f2efe8;">Friday Night &middot; Aug 28 &middot; 7PM&ndash;2AM<br /><span style="color:#a9a296;font-size:14px;">Doors 8PM. <span style="color:#d4af6a;">Golden Hour 7&ndash;8PM</span> for Meridian and above.</span></td>
          </tr>
          <tr>
            <td width="82" valign="top" style="padding:0 0 14px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">Where</td>
            <td style="padding:0 0 14px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#f2efe8;">A private residence in Las Vegas<br /><span style="color:#a9a296;font-size:14px;">The address goes out by email once your spot is secured. Not before, and not publicly.</span></td>
          </tr>
          <tr>
            <td width="82" valign="top" style="padding:0 0 14px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">Dress</td>
            <td style="padding:0 0 14px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#f2efe8;">All white<br /><span style="color:#a9a296;font-size:14px;">Off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional. <span style="color:#d4af6a;">Gold and silver accents encouraged for VIPs.</span></span></td>
          </tr>
          <tr>
            <td width="82" valign="top" style="padding:0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#8a8378;">Entry</td>
            <td style="padding:0 0 14px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#f2efe8;">A personalized wristband<br /><span style="color:#a9a296;font-size:14px;">Prepared with your name, waiting at the door.</span></td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:28px 34px;"><div style="height:1px;background-color:#2a2621;line-height:0;font-size:0;">&nbsp;</div></td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:2px 34px 0 34px;">
    <p style="margin:0 0 20px 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#c9c3b8;">The room holds fifty and the page isn&rsquo;t listed anywhere &mdash; no search, no socials, no link from the site. It asks for a word before it opens.</p>
  </td></tr>

  <tr><td align="center" bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:0 34px 0 34px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" bgcolor="#141216" style="background-color:#141216;border:1px solid #2a2621;border-radius:12px;">
      <tr><td align="center" bgcolor="#141216" style="background-color:#141216;padding:18px 40px;">
        <p style="margin:0 0 6px 0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#8a8378;">The word</p>
        <p style="margin:0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:32px;font-weight:900;letter-spacing:8px;color:#d4af6a;">FUTURE</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:26px 34px 0 34px;">
    <a href="https://www.lumanai.com/luna" style="display:inline-block;background-color:#d4af6a;color:#0b0b0c;text-decoration:none;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;letter-spacing:3px;text-transform:uppercase;padding:16px 38px;border-radius:999px;">Secure your spot</a>
    <p style="margin:16px 0 0 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#a9a296;">Four tiers, fifty seats. The page walks you through them.</p>
  </td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:28px 34px;"><div style="height:1px;background-color:#2a2621;line-height:0;font-size:0;">&nbsp;</div></td></tr>

  <tr><td bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:2px 34px 0 34px;">
    <p style="margin:0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#c9c3b8;">Please don&rsquo;t forward this &mdash; if someone should be there, tell me and I&rsquo;ll send them their own. Fifty is fifty.</p>
    <p style="margin:16px 0 0 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#c9c3b8;">&mdash; Ash &amp; Zach</p>
  </td></tr>

  <tr><td align="center" bgcolor="#0b0b0c" style="background-color:#0b0b0c;padding:30px 34px 34px 34px;">
    <p style="margin:0;font-family:'Barlow Semi Condensed',Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#4d4941;">Lumanai &middot; Las Vegas</p>
    <p style="margin:8px 0 0 0;font-family:Barlow,Helvetica,Arial,sans-serif;font-size:12px;color:#4d4941;"><a href="mailto:bula@lumanai.com" style="color:#6f6a61;text-decoration:none;">bula@lumanai.com</a></p>
  </td></tr>

</table>

</td></tr>
</table>`;

  const text = [
    `You're invited`,
    `Lumanai presents`,
    ``,
    `LUNA EKLIPTIKA`,
    `A premium nightlife experience`,
    ``,
    `${input.firstName.trim() || "Friend"} —`,
    ``,
    `On the 28th we're throwing our first party. Not a market, not a booth — a full night at a private residence, built entirely around kava.`,
    ``,
    `It's also the night Lumanai stops being a thing we do on weekends. RUSH launches. The site goes live. And the people who were around before any of it existed get the first pour.`,
    ``,
    `That's you. So this is a real invitation, not a flyer.`,
    ``,
    `THIS IS A CROWD-FUNDRAISER. Every ticket is a contribution to Lumanai's launch, and every tier is a different way to help. You choose your part.`,
    ``,
    `THE OFFERINGS`,
    `The bar — Unlimited Traditional Kava shots for everyone, all night. An exclusively crafted menu of low- or no-sugar naktails and functional mocktails. Meridian and above get the full cocktail list plus Ash's signature kanna pour.`,
    `The table — Three courses of anti-inflammatory hors d'oeuvres between nine and ten, no sugar in any of them.`,
    `Activations — Poolside cold plunges, a midnight moon soundbath, and more.`,
    `The lineup — DJ lineup drops later this week.`,
    ``,
    `THE DETAILS`,
    `When: Friday Night · Aug 28 · 7PM–2AM. Doors 8PM. Golden Hour 7–8PM for Meridian and above.`,
    `Where: A private residence in Las Vegas. Address goes out by email once your spot is secured.`,
    `Dress: All white. Off-whites, beiges and kava colors welcome. Linens preferred, swimsuits optional. Gold and silver accents encouraged for VIPs.`,
    `Entry: A personalized wristband, prepared with your name, at the door.`,
    ``,
    `THE DOOR`,
    `The room holds fifty and the page isn't listed anywhere. It asks for a word before it opens.`,
    `The word is FUTURE`,
    ``,
    `Secure your spot: https://www.lumanai.com/luna`,
    `Four tiers, fifty seats. The page walks you through them.`,
    ``,
    `Please don't forward this — if someone should be there, tell me and I'll send them their own. Fifty is fifty.`,
    ``,
    `— Ash & Zach`,
    ``,
    `Lumanai · Las Vegas · bula@lumanai.com`,
  ].join("\n");

  return { subject: INVITATION_SUBJECT, html, text };
}
