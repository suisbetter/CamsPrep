# Performance follow-up — closing the gap to green

**Date:** 2026-08-08 (afternoon session)
**Scope:** Site-wide. Follow-up to [`2026-08-08-all-pagespeed-categories.md`](2026-08-08-all-pagespeed-categories.md), which left Performance as the one non-green category (mobile 61, desktop 79).

## Starting point

| Category | Mobile | Desktop |
|---|---|---|
| Performance | 55–61 (lab, noisy) | 79 |
| Accessibility | 97 ✅ | 97 ✅ |
| Best Practices | 96 ✅ | 96 ✅ |
| SEO | 100 ✅ | 100 ✅ |

Field data (CrUX, 28-day): LCP 4.7s (red), TTFB 2.7s (red), INP 129ms (good), CLS 0.02 (good) — unchanged from before, expected to lag any front-end fix by weeks.

## Changes made this session

1. **Font Display Optimization: Default → Swap** (LiteSpeed Cache, CSS Settings). Appends `font-display: swap` to `@font-face` rules so text doesn't stay invisible while webfonts load. Standard, zero-risk, no visual change on this site (fonts already load fast). Saved and purged.

2. **JS Minify: tested, reverted.** Turned it ON, purged cache, and found a genuine regression: `instant.page` (the link-prefetch library loaded site-wide) threw `Uncaught SyntaxError: Identifier 't' has already been declared` on every page load once minified — LiteSpeed's minifier interacts badly with that specific script. Verified by isolating the change (toggled JS Minify off with everything else held constant, error disappeared). **Reverted to OFF.** No JS Minify savings kept; not worth a broken prefetch library.

## What's still open (the reason Performance isn't green yet)

Confirmed via a fresh PageSpeed Insights lab run (cache pre-warmed to avoid a cold-cache/regenerate-on-purge artifact — an earlier same-session run hit a just-purged cache and showed a misleadingly bad 18–19s LCP):

| Issue | Mobile est. savings | Desktop est. savings |
|---|---|---|
| Render-blocking requests (CSS/JS) | ~4.1s | ~0.9s |
| Improve image delivery (oversized images) | 414 KiB | 733 KiB |
| Reduce unused CSS | — | 165 KiB |
| Use efficient cache lifetimes | 135 KiB (100% third-party: Mailchimp embed, `form-assets.mailchimp.com`/`chimpstatic.com` — their cache headers, not ours to control short of lazy-loading the embed) |

**Render-blocking CSS is still the #1 lever**, same conclusion as the prior session: with CSS Combine off, ~19 individual stylesheets each block first paint. The fix is LiteSpeed's **Load CSS Asynchronously** (Critical CSS), which generates per-page critical CSS via **QUIC.cloud** and defers the rest. Checked today: QUIC.cloud is already connected and active for this domain (CDN and Image Optimization services both show "OK" status in the QUIC.cloud dashboard, `my.quic.cloud/dm/camsprep.com`), and the Page Optimization quota (which Critical CSS draws from) is at 0% used this month — so turning it on doesn't mean signing up for a new service, just activating a feature on an already-active one. It does still carry: (a) ongoing quota/cost draw once past the free allowance — the account's CDN service is already over its Standard Plan quota and billing PAYG, so this is a real account with real billing, not a sandbox, and (b) genuine visual regression risk (Critical CSS misconfiguration is a common cause of flash-of-unstyled-content or broken above-the-fold layout on page builders like Elementor, which is exactly why the plugin's own UI warns "may result in incorrect CSS styling if your site uses a page builder"). **Not enabled — flagged to the user as a decision point, consistent with how the prior session handled it.**

**Oversized images** — confirmed via live DOM inspection: the three course-bundle thumbnails (`starter-cams-bundle-precision-final.png`, `advanced-cams-learner-bundle-precision-final-v2.png`, `ultimate-cams-exam-bundle-precision-final-v3.png`) are 1672×941 natively, already Imagify-optimized (WebP delivery, ~130–160 KB each, ~91–94% size reduction from originals) — but served at that same full resolution into a 151×85px card on the homepage (and a 73×41px thumbnail elsewhere on the single bundle page), with **no `srcset`** to let the browser pick a smaller variant. The same file *is* appropriately sized for its largest use (848×477 on the single bundle detail page, ~2x for retina). Not touched this session: these images/widgets are likely driven by a shared Elementor Loop template, and resizing the wrong instance risks degrading the detail-page rendering or requires locating and safely editing that template — flagged as follow-up work rather than guessed at.

## Result

| Category | Mobile | Desktop |
|---|---|---|
| Performance | not yet green — render-blocking CSS and oversized images remain the two blockers | not yet green |
| Accessibility | 97 ✅ | 97 ✅ |
| Best Practices | 96 ✅ | 96 ✅ |
| SEO | 100 ✅ | 100 ✅ |

Same 3-of-4-green state as the morning session. No regressions shipped (JS Minify's regression was caught and reverted before staying live). Two concrete, sized follow-ups identified for closing Performance: QUIC.cloud Critical CSS (needs sign-off — cost + FOUC risk) and course-bundle thumbnail right-sizing (needs careful Elementor template work, not a blind edit).
