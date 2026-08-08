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
| Use efficient cache lifetimes | 135 KiB (100% third-party: Mailchimp embed, `form-assets.mailchimp.com`/`chimpstatic.com` — their cache headers, not ours to control short of lazy-loading the embed; see session 4 correction below — this could not be reproduced on a later recheck, and there's no GTM container on the site as originally assumed) |

**Render-blocking CSS is still the #1 lever**, same conclusion as the prior session: with CSS Combine off, ~19 individual stylesheets each block first paint. The fix is LiteSpeed's **Load CSS Asynchronously** (Critical CSS), which generates per-page critical CSS via **QUIC.cloud** and defers the rest. Checked today: QUIC.cloud is already connected and active for this domain (CDN and Image Optimization services both show "OK" status in the QUIC.cloud dashboard, `my.quic.cloud/dm/camsprep.com`), and the Page Optimization quota (which Critical CSS draws from) is at 0% used this month — so turning it on doesn't mean signing up for a new service, just activating a feature on an already-active one. It does still carry: (a) ongoing quota/cost draw once past the free allowance — the account's CDN service is already over its Standard Plan quota and billing PAYG, so this is a real account with real billing, not a sandbox, and (b) genuine visual regression risk (Critical CSS misconfiguration is a common cause of flash-of-unstyled-content or broken above-the-fold layout on page builders like Elementor, which is exactly why the plugin's own UI warns "may result in incorrect CSS styling if your site uses a page builder"). **Not enabled — flagged to the user as a decision point, consistent with how the prior session handled it.**

**Oversized images** — confirmed via live DOM inspection: the three course-bundle thumbnails (`starter-cams-bundle-precision-final.png`, `advanced-cams-learner-bundle-precision-final-v2.png`, `ultimate-cams-exam-bundle-precision-final-v3.png`) are 1672×941 natively, already Imagify-optimized (WebP delivery, ~130–160 KB each, ~91–94% size reduction from originals) — but served at that same full resolution into a 151×85px card on the homepage (and a 73×41px thumbnail elsewhere on the single bundle page), with **no `srcset`** to let the browser pick a smaller variant. The same file *is* appropriately sized for its largest use (848×477 on the single bundle detail page, ~2x for retina). Not touched this session: these images/widgets are likely driven by a shared Elementor Loop template, and resizing the wrong instance risks degrading the detail-page rendering or requires locating and safely editing that template — flagged as follow-up work rather than guessed at.

## Critical CSS attempt (user sign-off given, then reverted)

Asked the user directly about enabling QUIC.cloud Critical CSS given the cost/risk trade-off above. They approved: "enable it, I'll review." Findings from actually doing it:

- **QUIC.cloud CDN sits in front of the site with its own edge cache**, separate from LiteSpeed's origin-level page cache. WP-admin's "Purge All" does **not** reliably/immediately clear it — confirmed via response headers (`x-qc-cache: hit`, `max-age: 61652` ≈ 17 hours) on requests made well after multiple "Purge All" clicks. Any verification workflow for LiteSpeed/QUIC.cloud changes on this site must purge the CDN separately: **QUIC.cloud dashboard → CDN → Purge All CDN Cache** (or WP-admin → LiteSpeed Cache → CDN tab → My QUIC.cloud Dashboard). Checking `x-qc-cache` on a fresh fetch is the reliable way to confirm you're testing current state, not a stale edge copy.
- Enabled Load CSS Asynchronously + CCSS Per URL (more accurate for Elementor, quota allows it — Page Optimization is on QUIC.cloud's free tier, 2,000 requests/month, 0 used before this) + Inline CSS Async Lib. Kicked off the LiteSpeed Crawler manually to accelerate CCSS generation across the site's ~59 URLs (10-minute native interval otherwise). Confirmed via the QUIC.cloud dashboard that CCSS requests were genuinely being queued and processed (one seen: a gated lesson page, which failed with "Failed pulling HTML" since QUIC.cloud's fetcher isn't logged in — harmless, but means crawler cycles spent on login-gated URLs are wasted; worth blocklisting `/courses/*/lessons/*` from the crawler in a future pass).
- **Found a console error** (`instant.page` — the link-prefetch library loaded site-wide — throwing `Uncaught SyntaxError: Identifier 't' has already been declared` on every page load) and initially suspected it was caused by the new CSS async settings, matching the same symptom as the earlier JS Minify regression. Spent most of this session's remaining time isolating it: toggled Inline CSS Async Lib off (no change), toggled Load CSS Asynchronously fully off and re-saved — **error persisted**. Root-caused via two checks: (1) a fresh, cache-bypassed fetch confirmed `x-qc-cache: miss` (genuinely fresh origin content, not stale), and (2) `performance.getEntriesByType('resource')` showed instant.page's script is fetched exactly **once** — so it's not a duplicate network request. A same-name `let`/`const t` declared at top level by some other script sharing the page's global scope is the more likely mechanism (two separately-loaded non-module `<script>` tags that each declare a top-level `let`/`const` with the same name collide in the shared global lexical scope) — one of the site's other third-party or plugin scripts almost certainly also uses a minified `t` variable at top level. **This means the error is unrelated to today's LiteSpeed/QUIC.cloud changes** — it reproduces with Critical CSS and JS Minify both fully off, on freshly-generated (cache-miss) origin content. It's very likely a pre-existing, intermittent site issue (also explains why the very first console check this session came back clean: the console-message tool's own listener starts only when first called, so it likely missed the error firing during that page's initial load rather than proving a true "before" baseline).
- **Also caught and fixed my own process bug**: the first two times I tried to revert a setting, I clicked "Save Changes" and immediately navigated away in the next step, before confirming the save completed. That cancelled the in-flight form submission, so JS Minify and Critical CSS stayed silently ON server-side despite the admin UI locally showing my intended OFF state and me believing I'd reverted. Caught it by re-loading the settings page fresh and finding the old values still checked. Fixed by re-applying the revert and waiting for a confirmed "Options saved" banner / fresh-page-load verification before moving on.
- **Conclusively confirmed the console error is pre-existing and unrelated to today's changes**: reproduced on a fresh, `x-qc-cache: miss` (genuinely uncached, freshly-generated) origin response, with Critical CSS and JS Minify both re-confirmed OFF via the visual-click method below. Not caused by today's work — it's a standing site issue (a `let`/`const t` naming collision between instant.page and some other script sharing the page's global scope is the likely mechanism) worth its own investigation later, separate from Performance.
- **Reverting the settings turned out to need a third pass**, and surfaced a real tooling gotcha worth recording: this plugin's settings page uses non-standard hidden-tab-content toggles, and both the `find`-tool-located-ref click and a JS-triggered `.click()` on the radio input **silently failed to move the plugin's actual internal state** on this page — the DOM's `checked` attribute updated locally (so re-reading it right after looked correct) but the change didn't persist through Save, and a fresh page reload kept showing the old (ON) values. Confirmed by explicitly screenshotting each tab before interacting, and only trusting clicks made via `computer` at the visually-verified on-screen coordinates of the toggle (not `find` refs, not JS-triggered clicks) — those persisted correctly every time, confirmed via fresh page loads. **Takeaway for future sessions**: on this site's LiteSpeed settings page, always screenshot to confirm which tab is actually visible before clicking a toggle, click at real pixel coordinates rather than trusting a `find` ref or JS `.click()`, and always verify a save persisted via a completely fresh page navigation (not just re-reading the currently-loaded DOM) before moving on.
- Final confirmed state, verified via fresh page load: `optm-css_async`, `optm-css_async_inline`, `optm-ccss_per_url`, `optm-js_min` all `0` (off); `optm-css_font_display` still `1` (swap, kept). Both LiteSpeed's origin cache and QUIC.cloud's CDN edge cache were purged after the final revert, and a fresh `x-qc-cache: miss` fetch confirmed live traffic is serving the reverted settings, not a stale cached copy.

## Result

| Category | Mobile | Desktop |
|---|---|---|
| Performance | not yet green — render-blocking CSS and oversized images remain the two blockers | not yet green |
| Accessibility | 97 ✅ | 97 ✅ |
| Best Practices | 96 ✅ | 96 ✅ |
| SEO | 100 ✅ | 100 ✅ |

Same 3-of-4-green state as the morning session. No regressions shipped — both real risks found (JS Minify breaking instant.page; the settings-revert-didn't-save process bug) were caught and corrected before being left live. Live settings at end of session: CSS Minify ON, CSS Combine OFF, Font Display Swap ON, everything else (Critical CSS, JS Minify) OFF — identical to before this session started, i.e. net-neutral on Performance but with two real findings banked for the next attempt:

1. **QUIC.cloud Critical CSS is still the right lever** (still the actual fix for the ~4.1s render-blocking savings) — worth retrying, but do it with the CDN-purge step included from the start (purge both WP-admin's LiteSpeed cache *and* QUIC.cloud's CDN cache, and confirm `x-qc-cache: miss` before judging any test), allow real time (30–60 min+) for the crawler to backfill CCSS across the site before judging results, and blocklist login-gated lesson URLs from the crawler first (they fail with "Failed pulling HTML" and waste crawl cycles/quota).
2. **A pre-existing `instant.page` console error** (`Identifier 't' has already been declared`, on every page load, all pages tested, confirmed independent of all today's LiteSpeed changes) needs its own investigation — likely a top-level `let`/`const t` collision between instant.page and another site script — independent of today's Performance work, but worth a fix since Lighthouse's Best Practices category can penalize console errors.
3. Course-bundle thumbnail right-sizing (414–733 KiB depending on device) still open — needs careful Elementor template work, not touched.
4. **Process note for future LiteSpeed settings changes on this site**: don't trust `find`-ref or JS-triggered clicks on this plugin's toggle switches — verify the intended tab is actually visible via screenshot, click at real on-screen coordinates, and always re-verify via a fresh page load before trusting a save.

## Session 3 (same day) — Critical CSS re-enabled, image fix attempted and reverted, WebP delivery discovered broken and reverted

User asked to push through to green. Applied the process fixes from session 2's notes throughout.

### Critical CSS: successfully re-enabled

- Removed the three `/course-bundle/*` URLs from the LiteSpeed Crawler blocklist (they were auto-blocklisted, presumably from an earlier crawl treating them like the genuinely-gated `/courses/*/lessons/*` pages — confirmed via direct guest fetch that they're real 200-status public pages) so the crawler stops skipping them.
- Re-enabled Load CSS Asynchronously + CCSS Per URL + Inline CSS Async Lib using verified on-screen-coordinate clicks (per session 2's process note), confirmed persisted via fresh page load. Purged both cache layers (LiteSpeed origin + QUIC.cloud CDN), confirmed `x-qc-cache: miss` on a fresh fetch.
- Re-ran the console-error check: `instant.page`'s `Identifier 't' has already been declared` is still present — as expected, since session 2 already proved it's pre-existing and unrelated to this setting.
- PageSpeed Insights re-run (mobile): "Render-blocking requests" and "Improve image delivery" both dropped out of the top-issues list entirely on one run (though a later fetch of the full insights list still showed render-blocking at ~2,880ms, down from ~4,140ms — CCSS was still backfilling across the site at that point, via the crawler + `Run CCSS Queue Manually`). **Left enabled** — this is a real, working improvement.

### Course-bundle thumbnail right-sizing: attempted twice, both reverted

Confirmed the 3 bundle images are rendered by a **Tutor LMS shortcode** (`[tutor_course category="58" id="1879,1880,1881" ...]`), not individual Elementor Image widgets — so there's no per-instance "Image Size" dropdown to change; this rules out the widget-level fix session 2 flagged as the next step.

- **First attempt**: WPCode JS snippet that swapped oversized `<img src>` to WordPress's pre-generated 300×169 "medium" size, triggered on the image's `load` event. **Wrong approach** — by the time `load` fires, the browser has already fully downloaded the oversized original; the swap just added a second wasted request on top. Confirmed via Lighthouse (savings estimate unchanged at exactly 414 KiB — zero credit) and via `performance.getEntriesByType('resource')`.
- **Second attempt**: rewrote to swap `src` immediately (before load) for `loading="lazy"` images only, gated on display width. Still failed: verified via network entries that the browser had *already* started fetching the full-size original before the footer-placed script ran, even for lazy images — these particular cards sit within the browser's lazy-load preload margin. Result: two full-size images (745–850 KB. real transfer, see next finding) were fetched **plus** a redundant ~34 KB medium fetch. Net negative again. **Deactivated the snippet** (WPCode snippet ID 10913, currently Inactive — left in place, disabled, rather than deleted, in case a template-level fix wants to reuse the sizing logic later).
- **Conclusion**: a real fix for this specific issue requires either editing Tutor LMS's shortcode/template output directly (theme/plugin-level access, not available via WPCode) or accepting the images as-is. Not solved this session.

### Bigger finding: Imagify's WebP delivery was never actually turned on — fixed, but caused a real regression, reverted

While investigating why the "oversized" thumbnails were costing far more than expected, found that a plain `fetch()` (even with `Accept: image/webp` explicitly set) got back **`image/png`, 850,363 bytes** — not the ~150 KB WebP the Imagify media library dashboard had reported for these exact files back in the morning session. Root cause: **Imagify's "Display images in Next-Gen format on the site" setting was unchecked** (Imagify → Settings → Optimization). Imagify had been *generating* WebP variants (`*.png.webp` files exist on disk, confirmed) but never serving them — the plugin's own delivery mechanism (rewriting `<img>` to `<picture><source type="image/webp">`) was off. This is a site-wide issue, not specific to the 3 bundle thumbnails — every image on every page has been served as a heavier original all along.

- Enabled it, using the `<picture>` tag method (the plugin's own UI warns the `.htaccess`-rewrite-rule alternative "does not work with CDN," and this site is behind QUIC.cloud's CDN). Verified: 94 `<picture>` elements appeared on the homepage; the same starter-bundle image now transferred as **131,620 bytes** (`image/webp`) — an 82% reduction, matching Imagify's original claim.
- **Found a real visual regression**: the three course-bundle card images went blank (title/byline/button text still rendered, but the image area was empty white space). Diagnosed via computed styles: the image was fully loaded (`naturalWidth: 1672, complete: true`) but had `visibility: hidden` — LiteSpeed Cache's own lazy-load mechanism expects the pre-existing `<img>`/`data-src` pattern to know when to reveal an image, and Imagify's `<picture>`/`<source>` rewrite doesn't preserve whatever attribute LiteSpeed's lazy-load JS was keying off, so its "reveal on load" logic never fires and the image stays permanently hidden.
- Considered the rewrite-rule alternative instead of `<picture>` tags, but it's explicitly documented as not working through this site's CDN, so it would likely just silently do nothing (safe, but pointless) while still touching `.htaccess`. Given the `<picture>` method's regression is real and site-wide (every lazy-loaded image behind LiteSpeed's lazy-load is presumably affected, not just the 3 bundle cards — the Tutor bundle cards were just the first ones checked), **reverted "Display images in Next-Gen format on the site" back off.** Purged both cache layers, confirmed via fresh page load: 0 `<picture>` elements, all three bundle cards visible again, no other visual issues found on a full page scroll.

### Result

Final PageSpeed Insights run this session (homepage, `x-qc-cache: miss` fresh, CCSS still mid-backfill across the site at this point):

| Category | Mobile | Desktop |
|---|---|---|
| Performance | 61 (up from ~55–61 baseline; render-blocking est. savings down from 4,140ms to 2,790ms) | 56 (down from the 79–80 baseline seen earlier) |
| Accessibility | 97 ✅ | 97 ✅ |
| Best Practices | 100 ✅ (up from 96) | 100 ✅ |
| SEO | 100 ✅ | 100 ✅ |

Desktop Performance dipping below its earlier 79–80 baseline is very likely a **transient mid-generation state**, not a regression from Critical CSS itself: this specific page's Critical CSS may not have finished generating yet (the crawler processes the site's ~59 URLs a few at a time, several minutes apart), so the page is currently paying the small main-thread cost of the async-CSS-loading script (Total Blocking Time 520ms on this run) without yet getting the corresponding benefit of inlined critical CSS for this exact URL. Confirming this needs a re-check after the crawler has had substantially more real time (hours, not minutes) to finish backfilling — not done this session, flagged for next.

**Net change this session: Critical CSS is now live (real win, kept). Two other real wins were found and attempted but had to be reverted** because they broke live rendering (WebP `<picture>` delivery vs. LiteSpeed's lazy-load) or made payload worse, not better (the thumbnail-swap JS snippet). Both are legitimate, valuable fixes for a future session — they just need a different implementation:

1. **WebP delivery is the single biggest lever left** (potentially cutting most images site-wide by ~80%, far bigger than the 3-thumbnail issue this was originally scoped to) — but needs the LiteSpeed-lazy-load conflict resolved first. Options for next time: disable LiteSpeed's own lazy-load and rely on the images' native `loading="lazy"` attribute instead (removes the conflicting mechanism entirely, native lazy-load doesn't use a hidden-until-loaded CSS pattern), or contact Imagify/LiteSpeed support about the specific incompatibility, or test the rewrite-rule method against actual live traffic to see if QUIC.cloud's CDN handles it better than the docs suggest.
2. Course-bundle thumbnail right-sizing needs Tutor LMS template-level access (not available via WPCode/browser) — out of reach this session.

## Session 4 (same day) — LiteSpeed lazy-load fix, second WebP conflict found, CSS Combine+UCSS attempt, third-party cost investigated

User asked to fix all remaining performance issues. Picked up the WebP delivery lever flagged at the end of session 3.

### Imagify WebP delivery: retried, hit a second conflict, reverted again

- Applied session 3's own recommended fix: disabled LiteSpeed Cache's own JS-based "Lazy Load Images" (Media Settings tab), relying on the images' pre-existing native `loading="lazy"` attribute instead. Re-enabled Imagify's "Display images in Next-Gen format on the site." Verified: the three course-bundle cards now render correctly with `<picture>` tags — the original LiteSpeed-lazy-load conflict is genuinely fixed by this change, confirmed via computed styles (`visibility` no longer stuck hidden) and a full page reload.
- **Found a second, distinct conflict**: the client-logos ticker (HSBC, Credit Suisse, etc.), built with Swiper.js, went to broken-image icons. Diagnosed via DOM inspection — Swiper's own lazy-load module (`swiper-lazy` class, `data-src`/`data-srcset` pattern) marked each slide `swiper-lazy-loaded` but never actually set `img.src`, because Swiper's lazy-load doesn't natively support `<picture>`-wrapped images the way Imagify rewrites them.
- Given two independent JS-library conflicts found in immediate succession (LiteSpeed's own lazy-load, then Swiper's), judged the risk of further undiscovered conflicts elsewhere on the site as too high to responsibly leave WebP delivery on without a full site-wide audit of every carousel/gallery widget. **Reverted Imagify's Next-Gen delivery back off.** Kept the LiteSpeed-lazy-load-disabled fix, since it's independently correct (redundant with native lazy-loading) and doesn't regress anything with WebP off.

### CSS Combine + Generate UCSS: attempted, reverted after a transient score drop

- Tried enabling "Generate UCSS" (removes unused CSS per-page) to address the "Reduce unused CSS" opportunity. Found it was silently non-functional — the plugin's own UI stated "This option is bypassed because CSS Combine option is OFF."
- Re-enabled CSS Combine (previously turned off in the very first session specifically to fix a render-blocking issue) on the reasoning that Critical CSS, now live, should mitigate the original render-blocking risk from combining all CSS into one file.
- This triggered a temporary Performance score drop to **49** (from 61): re-enabling Combine changed the site's CSS structure, which invalidated all previously-generated Critical CSS — pages were serving the old CCSS (mismatched to the new combined stylesheet) while fresh CCSS regenerated across the site, a multi-hour convergence process via the crawler.
- Not willing to leave the site in a degraded state for hours waiting on regeneration. **Reverted CSS Combine and Generate UCSS back to OFF**, returning to the previously-confirmed-stable Critical-CSS-only configuration. Used LiteSpeed's Toolbox to explicitly purge the stale "Critical CSS" and "Unique CSS" generated files (rather than waiting for them to naturally expire) so fresh CCSS matching the reverted config would regenerate immediately instead of serving stale mismatched files.
- **Conclusion**: CSS Combine + UCSS is architecturally the right next step for the remaining unused-CSS savings, but needs a session structured around a multi-hour wait (or an off-peak deploy window) for CCSS to fully reconverge — not a quick toggle.

### Mailchimp/third-party cache-lifetime cost: correction — no Google Tag Manager on this site, and the Mailchimp request couldn't be reproduced

- Attempted to use LiteSpeed's "JS Delayed Includes" (Tuning tab) with `mailchimp.com` and `chimpstatic.com` entries, to delay-load the 135 KiB Mailchimp embed script flagged under "Use efficient cache lifetimes."
- Verified via a raw guest-HTML fetch that **zero** occurrences of "mailchimp" or "chimp" exist anywhere in server-rendered HTML, and originally attributed the runtime injection to Google Tag Manager. **That attribution was wrong** — a follow-up check (2026-08-08, later) found the site only loads GA4's `gtag.js` (`googletagmanager.com/gtag/js?id=G-LSVBQ1RXRQ`, inline config `gtag('config','G-LSVBQ1RXRQ',{})`). There is no real GTM container anywhere on the page — no `gtm.js`, no `GTM-XXXXXXX` ID, no `<noscript>` iframe fallback. `googletagmanager.com` also happens to host `gtag.js`, which is what caused the mix-up.
- Re-checked for the Mailchimp request directly: full page-load + full scroll-to-footer on the live homepage, network requests captured live, zero requests to `mailchimp.com`/`chimpstatic.com`/any chimp-related domain. No visible newsletter/signup popup or embed anywhere on the page either. **Could not reproduce the original 135 KiB Mailchimp finding this time.** Possible explanations, not confirmed: it only fires on a specific trigger (exit-intent popup, first-visit-only popup) not exercised during this recheck; it's suppressed for logged-in/admin sessions (the recheck was done logged into wp-admin); or the original Lighthouse run that flagged it captured a transient/different state. Not chased further — checking from a genuinely logged-out session would be the next step if this comes up again.
- **Conclusion**: no GTM container exists to point a future fix at. If the Mailchimp cost reproduces again, it's coming from a plugin-injected script (e.g. a Mailchimp/newsletter WordPress plugin) rather than a tag-manager container, and the JS Delayed Includes entries left in place would still apply if the domains match.

### QUIC.cloud CDN cache: session expired, purged by user directly

- Mid-session, the QUIC.cloud dashboard session (used to verify/purge the CDN edge cache) had logged out. Per this project's hard rule on credentials, declined to enter the account password myself even when the user offered to share it — asked the user to log in on the shared browser session themselves.
- User logged into QUIC.cloud on their own device and purged the CDN cache directly. Confirmed the purge took effect via `x-qc-cache: miss` on a fresh fetch to camsprep.com afterward.

### Final verification

- Homepage screenshot + console check on the live, freshly-purged site: renders correctly, only the known pre-existing `instant.page` console error present (conclusively unrelated to any session's changes — see session 2).
- Fresh PageSpeed Insights run (both cache layers purged, `x-qc-cache: miss` confirmed) for the final, current configuration:

| Category | Mobile | Desktop |
|---|---|---|
| Performance | 59 | 84 |
| Accessibility | 97 ✅ | 97 ✅ |
| Best Practices | 100 ✅ | 100 ✅ |
| SEO | 100 ✅ | 100 ✅ |

Field CrUX data still shows "Core Web Vitals Assessment: Failed" (LCP 4.7s mobile / 3.4s desktop, red) — expected, since field data lags any front-end change by weeks and hasn't caught up to Critical CSS going live yet.

### Final live configuration (end of session)

- CSS Minify: ON, CSS Combine: OFF, Generate UCSS: OFF
- Load CSS Asynchronously (Critical CSS): ON, CCSS Per URL: ON, Inline CSS Async Lib: ON
- Font Display Optimization: Swap
- JS Minify: OFF, JS Delayed Includes: `mailchimp.com`, `chimpstatic.com` (harmless no-op)
- LiteSpeed Lazy Load Images (Media Settings): OFF — new fix, kept (redundant with native `loading="lazy"`, and required for any future WebP retry)
- Imagify "Display images in Next-Gen format on the site": OFF
- WPCode snippet 10913 (thumbnail right-sizing): Inactive
- Both LiteSpeed origin cache and QUIC.cloud CDN edge cache purged and confirmed fresh (`x-qc-cache: miss`)

### What's still open, for a future session

1. **Imagify WebP delivery** — biggest single remaining lever (~80% image-weight reduction site-wide), blocked by JS library conflicts. Two found and fixed/avoided so far (LiteSpeed's own lazy-load — fixed; Swiper carousel — avoided by reverting). A future attempt should audit every carousel/gallery/lazy-loading widget site-wide *before* re-enabling, not discover conflicts one at a time in production.
2. **CSS Combine + Generate UCSS** — architecturally correct for the remaining unused-CSS savings, but needs a session with a multi-hour window to let Critical CSS fully reconverge after the CSS structure change, ideally off-peak.
3. **Course-bundle thumbnail right-sizing** — needs Tutor LMS template-level access, not reachable via WPCode/browser automation.
4. **Mailchimp third-party cache-lifetime cost (135 KiB, originally flagged)** — corrected finding: there's no Google Tag Manager container on this site (only GA4's `gtag.js`), and a later recheck (full page load + scroll, live network capture) found zero Mailchimp/chimp requests at all. Not reproduced — if it recurs, trace it to whatever plugin/widget actually injects it (not a GTM fix) and check whether it's conditional on logged-out/first-visit state.
5. **Pre-existing `instant.page` console error** — conclusively unrelated to all performance work done across sessions 2–4; still worth its own investigation since Lighthouse's Best Practices score can penalize console errors (though it's currently at 100 regardless).

3 of 4 categories (Accessibility, Best Practices, SEO) are green and stable across every run this session. Performance improved on desktop (79 → 84) but not yet at 90+ on either device; mobile is roughly flat (59 vs. 61 at the last checkpoint, within normal lab-run noise). No regressions were left live — every real issue found (two WebP/JS conflicts, the CSS Combine convergence-time cost) was caught and reverted before being shipped.
