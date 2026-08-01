# CamsPrep

Working repository for the ongoing improvement of **[camsprep.com](https://camsprep.com)** — a WordPress site selling CAMS certification study bundles and mock tests.

> **This is not the source code of the site.** camsprep.com is a hosted WordPress install, edited through WP Admin (Rank Math, WPCode, LiteSpeed Cache, Tutor LMS). This repo holds a *snapshot* of the rendered front end plus the audit, planning, and handoff documents that drive changes made in the live admin. Nothing here builds or deploys.

---

## What's in here

| Path | What it is |
| --- | --- |
| `camsprep.com/` | Static mirror of the live site's rendered HTML/CSS/JS — the reference copy used for auditing markup, schema, and meta tags without hitting production. |
| `_DataURI/`, `fonts.googleapis.com/`, `fonts.gstatic.com/`, `unpkg.com/`, `chimpstatic.com/`, `form-assets.mailchimp.com/`, `www.google-analytics.com/`, `www.googletagmanager.com/`, `eventcollector.mcf-prod.a.intuit.com/` | Third-party assets captured alongside the mirror (fonts, Lenis smooth-scroll, Mailchimp, GA/GTM). Artifacts of the capture, not maintained code. |
| `CAMS_Prep_Complete_Brand_Source_of_Truth.pdf` | Canonical brand reference — naming, pricing, positioning, approved copy. Every content or schema change should be cross-checked against this before shipping. |
| `HANDOFF-2026-07-31.md` | **Start here.** Current state of the SEO fix pass: what's verified live, what's still pending, what's explicitly blocked, plus operational gotchas. |
| `fixes-implemented-2026-07-31.md` | Log of changes already applied to the live site, with notes on which turned out to be partial. |
| `seo-fix-plan-*.md` | Dated audit findings and fix plans referenced by the handoff (content architecture, canonical/redirect mapping, priority tiers). |
| `LICENSE` | LGPL-2.1. |

## Working on this

1. **Read `HANDOFF-2026-07-31.md` first.** It supersedes the older plan docs where they disagree, and it flags items previously reported as done that turned out not to be.
2. **Confirm you're logged into WP Admin** before touching anything. The site runs Hide My WP, which hides the login URL and silently redirects unauthenticated `/wp-admin/` requests to the homepage instead of showing a login form — so a "working" session can be silently logged out.
3. **Cross-check against the brand PDF** for anything user-facing: prices, product names, author bylines, durations.
4. **Snapshot before, verify after, revert on corruption.** Changes go into WP Admin; verification happens against the live URL.
5. **Verify from outside the admin UI.** Confirm a change actually shipped with an unauthenticated fetch of the live page, e.g.:

   ```js
   fetch(url, { cache: 'no-store', credentials: 'omit' }).then(r => r.text())
   ```

   Admin "saved" toasts and in-page state are not proof.

## Gotchas worth knowing up front

- **Cache purging:** LiteSpeed's "Purge All" does not reliably reach the QUIC.cloud edge. Use *Purge By → URL* with specific URLs, then confirm `x-qc-cache: miss` on a fresh request.
- **WPCode saves can silently fail.** Hard-reload the snippet edit page and re-read the code before trusting a save.
- **Rank Math's Schema Builder "Advanced Editor" (raw JSON) can hang the page.** For fields it doesn't expose, prefer a WPCode output-buffer snippet that rewrites the rendered JSON-LD.
- **Theme File Editor is disabled and there's no FTP/file-manager access.** Anything needing a real template edit is blocked; output filtering is the available workaround.

## Guardrails

- **Never fabricate structured data.** No `AggregateRating` without real reviews, no `sameAs` for accounts that don't exist, no invented `priceValidUntil`. If a value can't be verified, ask rather than ship.
- **Ambiguous facts need a human answer**, not a best guess — conflicting durations, promo vs. permanent pricing, and which author byline should appear on public pages.
- **URL consolidation and 301 redirects require explicit sign-off.** Present the full mapping before executing; these are the hardest changes to undo.

## Housekeeping notes

- The mirror captures third-party integration identifiers (Mailchimp list/user paths, analytics endpoints) and the handoff docs contain internal references — snippet IDs, post IDs, a local Windows path, and a real person's name. Worth a look before this stays public, or consider making the repo private.
- LGPL-2.1 is an unusual fit for a site mirror plus operational docs. If the licence choice wasn't deliberate, it's worth revisiting.
