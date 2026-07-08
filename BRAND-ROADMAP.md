# LUMANAI — Deep Scan & Brand Roadmap

_Compiled 2026-07-08 from a full-site audit + founder interview + competitive
teardown (BERO, BARE Zero Proof, Ghost Town Brewing, MPACT, Guinness 0)._

## Brand DNA (from the founder interview)

- **Pitch:** functional wellness drink — but the site should *feel* like the
  best night out, with cult-mystery energy.
- **Moat:** functional stacking — kava + adaptogens + nootropics built with
  real mixology. Nobody else does this.
- **Voice:** mystic bartender × confident insider.
- **Channels:** Instagram first, word-of-mouth/referral second.
- **Vision:** THE Vegas kava experience — flagship destination.
- **The word:** "Naktail" is a category-defining asset. Own it.
- **Guardrail:** Pacific Islander culture handled with reverence, never kitsch.
- **Education:** teach through ingredients (the stack IS the story).

## What the inspiration sites teach

| Site | Steal this |
| --- | --- |
| BERO | Membership club w/ tiers (→ Coconut Club), IG feed integration, bundle builder, celebrity/collab premium signals |
| BARE | Mission stat as social proof ("70% of people wish…"), press logos, at-home recipes section |
| Ghost Town | Personality-driven section naming (our islands already do this), humor in utility moments, WCAG commitment, "Book the Crypt"-style themed contact paths |
| MPACT | Dual-path nav (consumer vs. business), store locator, responsible-messaging footer |
| Guinness 0 | Category reassurance ("everything you love, none of the alcohol") + giant product hero |

## Page-by-page audit

- **Home** — strong single-viewport hero. Missing: Naktail definition moment,
  effect labels on drinks, IG presence, email capture.
- **Menu** — Canva-identical ✓. Missing: functional-stack story per drink.
- **Events** — builder is a killer feature. Missing: trust signals (press,
  testimonials with photos), FAQ for bookers.
- **Find Us** — solid. Later: map embed.
- **Shop** — RUSH featured ✓. Missing: bundle offers, subscription teaser.
- **Ingredients** — the moat page. Should be elevated: per-drink stack
  mapping, effect language (soft, non-medical).
- **Rewards** — static. Needs the referral loop story + email capture to
  become the word-of-mouth engine.
- **Sitewide** — no analytics, no email list, no press strip, no IG embed.

## Roadmap

### NOW (shipped or shipping immediately)
1. **"What's a Naktail?"** dictionary-entry moment on Home — owns the word.
2. **Effect + stack chips on every drink** (menu + home) — makes the
   functional-stacking moat visible. Soft language only (Social · Calm ·
   Focus), never medical claims.
3. **Email capture wired to GoHighLevel** (footer + rewards) — builds the
   list from day one; GHL nurtures it.
4. **"Uncharted" seventh island** on the home horizon — fogged, mysterious,
   "The Lounge — coming to Las Vegas." Waitlist email capture. Cult-mystery
   energy + destination vision tease.
5. Analytics hook (env-gated, e.g. Plausible/GA4 — add the ID when ready).

### NEXT (needs assets from Zach/Ash)
- **Partner logos** (Etho, Discoflow, Sweat Equity) → footer strip upgrade.
- **Press mentions/logos** when available → trust strip on Events.
- **Real testimonials** w/ names + photos (screenshots from IG DMs work).
- **Professional team headshots** → swap into Meet Your Bartenders.
- **3D product model** → see spec below.
- **IG feed embed** (needs Meta app token — or a curated static grid now).

### LATER (bigger builds)
- **Ghost Town-style 3D scroll hero** once the model arrives: product
  rotates/floats as you scroll, ingredients orbiting in.
- **Club Lumanai** — real rewards backend (Shopify customer accounts or
  GHL memberships), tiers, referral codes.
- **The Lounge page** — when the location is real, the Uncharted island
  clears its fog and becomes the flagship destination page.
- **Naktail recipes hub** — at-home recipes using RUSH (BARE-style),
  strong SEO play that also sells product.
- **"What is kava" authority hub** — long-form SEO content, schema markup.

## 3D model spec (give this to the artist)

- Format: **GLB (glTF 2.0 binary)** — one file, embedded textures
- Budget: **< 5 MB**, ~50–150k triangles max
- Textures: PBR (base color, metallic-roughness, normal), **2048×2048**
- Origin centered at product base, **Y-up**, real-world scale in meters
- Also request the source file (.blend / .c4d) for future edits
- Label art applied as texture — ask for layered source so we can swap
  flavors later

## Hard guardrails (never violate)

- No medical claims — effects language stays soft ("calm," "social lift"),
  never "treats/cures/anxiety/insomnia."
- Pacific Islander culture = reverence. Credit Fiji/Vanuatu sourcing, keep
  the SPIO donation visible, no tiki-kitsch costume language.
- Never anti-alcohol preachy. We're the upgrade, not the sermon.
