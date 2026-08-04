<div align="center">

# CamsPrep

**The working repo behind [camsprep.com](https://camsprep.com)** — CAMS certification study bundles and mock tests.

*Audit mirror · brand source of truth · the changelog the live site doesn't have*

</div>

---

> [!IMPORTANT]
> **There's nothing here to run.** camsprep.com is a hosted WordPress install, and every change gets made by hand in WP Admin — Rank Math, WPCode, LiteSpeed, Elementor, Tutor LMS. This repo doesn't build and it doesn't deploy.

So what is it for? Three things.

There's a **static mirror** of the site's rendered front end, which is what you audit against when you want to inspect markup or schema without poking production. There's the **brand PDF**, the final word on names, prices and voice. And there are the **working docs**, which exist because the live site keeps no history of its own — if we don't write down what changed, nobody knows.

> [!NOTE]
> **Start with `HANDOFF-2026-07-31.md`.** It's the most current picture of where things stand, and where it disagrees with the older plan docs, trust the handoff. It also walks back a few items earlier notes claimed were finished and weren't.

---

## What's in here

```
CamsPrep/
├── camsprep.com/                              # the mirror — rendered HTML/CSS/JS
├── fonts.googleapis.com/  fonts.gstatic.com/  # captured alongside it, unmaintained
├── unpkg.com/  chimpstatic.com/  _DataURI/
├── www.google-analytics.com/  www.googletagmanager.com/
├── form-assets.mailchimp.com/  eventcollector.mcf-prod.a.intuit.com/
│
├── CAMS_Prep_Complete_Brand_Source_of_Truth.pdf
├── HANDOFF-2026-07-31.md                      # ← read this first
├── fixes-implemented-2026-07-31.md
└── seo-fix-plan-*.md
```

| File | Why you'd open it |
| :--- | :--- |
| **`HANDOFF-2026-07-31.md`** | The resume point. What's actually live, what's pending and in what order, what got skipped on purpose, and the gotchas worth knowing before you repeat somebody's afternoon. |
| **`fixes-implemented-2026-07-31.md`** | What shipped, and how each item was verified. |
| **`seo-fix-plan-*.md`** | The underlying audit findings and the canonical/redirect mapping. |
| **`CAMS_Prep_..._Source_of_Truth.pdf`** | Anything a customer will see gets checked against this first. |

The domain-named folders came along for the ride when the mirror was captured — Google Fonts, Lenis, Mailchimp, the analytics endpoints. Nobody maintains those. They're just what the page pulled in.

---

## How to work on it

**1. Log into WP Admin, and confirm it took.**
The site runs Hide My WP, which hides the login URL and quietly bounces unauthenticated `/wp-admin/` requests to the homepage instead of showing a login form. You can spend a while thinking you're logged in when you aren't.

**2. Check it against the brand PDF.** Then snapshot, then change.

**3. Verify from outside the admin.**

```js
fetch(url, { cache: 'no-store', credentials: 'omit' }).then(r => r.text())
```

> [!WARNING]
> A "saved" toast is not proof. Several fixes in the log were marked done on the strength of one and turned out never to have gone live. **If you didn't see it in a fresh guest response, it didn't happen.**

**4. Write it up and commit right away.** Files have gone missing from the working directory mid-session before.

---

## Things that will bite you

**LiteSpeed's "Purge All" doesn't reliably reach the QUIC.cloud edge.**
Use `Purge By → URL` and check for `x-qc-cache: miss`. There are two separate cache layers, the plugin and the CDN — proving one is clear tells you nothing about the other.

**WPCode's save button fails silently sometimes.**
Hard-reload the edit page and re-read the code before you believe it.

**Rank Math's raw-JSON Schema Builder can hang the page outright.**
For fields the normal UI won't give you, use a WPCode output-buffer snippet that rewrites the rendered JSON-LD instead.

**Theme File Editor is switched off and there's no FTP.**
Anything needing a genuine template edit is blocked. Some of what's in place is a content-level filter rather than a fix at the source — worth remembering before you call something closed.

**Plan docs have vanished from disk before.**
Pull them back out of git history. Don't assume the content is gone.

---

## A few hard lines

🚫 **Don't invent structured data.** No `AggregateRating` without real reviews, no `sameAs` pointing at accounts that don't exist, no made-up `priceValidUntil`. If a value can't be verified, it doesn't ship.

❓ **When the facts conflict, ask.** Two different course durations, a discount that might or might not be a real promotion, whose name belongs on the author byline — don't pick the plausible one.

🛑 **URL consolidation and 301s need sign-off.** Show the full mapping first. Those are the changes you can't quietly undo.

🔒 **An inaccessible login is where work stops.** It's not a puzzle to solve.

---

## Licence, or the lack of one

There isn't one, on purpose. **All rights reserved.** This is proprietary brand material and internal notes, not something offered for reuse. The third-party files caught up in the mirror stay under whatever licences they already had.

> [!CAUTION]
> The mirror and the docs carry integration IDs, post and snippet IDs, a local filesystem path, and a real person's name. If this repo is public, that's worth a decision rather than a default.
