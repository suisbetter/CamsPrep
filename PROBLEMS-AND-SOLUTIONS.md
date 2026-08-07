# Problems & Solutions — camsprep.com SEO Fix Project

A companion reference to `HANDOFF-2026-08-04.md`. That file is a
chronological session log; this file reorganizes the same information by
**problem → solution**, so a specific issue can be looked up without reading
the full narrative history. Status reflects the most recent verification
recorded in the handoff doc as of the Twenty-First follow-up (2026-08-07).

Legend: ✅ Resolved & verified live · 🟡 Partially resolved / needs re-check ·
⚠️ Open, needs human judgment or access this session doesn't have · 🔍 Open,
needs investigation

* Note: I approve all the changes in the document
  
---

## 1. Root causes (explain most of the "why" behind everything below)

### 1.1 WPCode snippets sometimes silently fail to propagate 🟡
**Problem:** A PHP snippet saves in wp-admin, the editor shows the new code,
but the live HTTP response never changes — even after cache purges.
**Solution:** After every save, toggle the snippet off → save → on → save
again to force re-registration, then verify with a cold fetch. If that fails,
the fix needs to live in an `mu-plugins` file instead (loads from disk every
request, nothing to fail to register) — blocked because Theme File Editor is
disabled and no FTP/SFTP access exists. **Needs:** file-system access.

### 1.2 Aggressive multi-layer caching hides whether a fix reached origin ✅
**Problem:** LiteSpeed page cache (7-day TTL) behind QUIC.cloud's CDN edge
made it impossible to tell if a change was live or just cached.
**Solution:** Dropped Default Public Cache TTL and Front Page TTL from 7 days
to 1 day. Use "Purge By URL" (targeted), never "Purge All" — only the
targeted purge reliably reaches the QUIC.cloud edge. Always confirm with
`fetch(url, {cache:'no-store', credentials:'omit'})`, never the admin UI's
"purged" toast.

### 1.3 Elementor stores content in two places that can desync ⚠️
**Problem:** `post_content` (WordPress-native, what revisions track) and
`_elementor_data` (Elementor's actual rendering source) can drift apart.
Restoring a native revision only fixes the former, so a "successful" revert
silently un-reverts the next time anyone opens the post in Elementor.
**Solution:** No in-admin resync tool exists. Only fixes: direct DB access
(`wp post meta update` / phpMyAdmin) or a human manually re-authoring the
content with real clicks/typing in Elementor's visual canvas. **Never**
JS-inject values into the Code-view textarea or `Ctrl+A` inside it — this is
what caused the desync on post 8129 in the first place.

### 1.4 Physical files on disk block Rank Math's virtual editors ✅
**Problem:** Stale physical `robots.txt` and `llms.txt` files on the server
silently overrode Rank Math's dynamic generators — any policy typed into
Rank Math's panels was discarded with no live effect.
**Solution:** User enabled the WP File Manager plugin, giving read/write
access to `public_html`; both stale files were deleted, unblocking Rank
Math's dynamic output. Confirmed live for both files.

---

## 2. Critical severity (12 findings)

| # | Problem | Solution | Status |
|---|---|---|---|
| 1 | FAQ post 8129 has zero `<h1>` tags (Elementor desync, root cause 1.3) | **RESOLVED 2026-08-07.** The corrupted draft blocking this turned out not to need DB access: Elementor's own `History → Revisions` tab (separate from WordPress's native revisions and from Elementor's own undo-history "Actions" tab) had a checkmarked, clean "Current Version" entry. Applied that revision to discard the corrupted autosave, then inserted the missing `<h1>` the same safe way as post 3977. Verified live. | ✅ |
| 2 | Schema `width`/`height` were quoted strings, `BreadcrumbList.position` a string not Integer, sitewide | WPCode 10698 casts these to integers via the proven `template_redirect`+`ob_start`+`preg_replace_callback` pattern. Root gotcha found: PHP snippets hooking early actions need Location = "Run Everywhere", not the "Site Wide Header" default. | ✅ |
| 3 | Untyped orphan JSON-LD block on `/writer/rezaul/` (duplicate author data in a second, `@type`-less script tag) | Rewrote WPCode 10502 to merge the data directly into Rank Math's existing typed `Person` node instead of emitting a second script. Gotcha: the page's real `@id` uses `/author/rezaul/`, not the cosmetic `/writer/rezaul/` URL — a WP Ghost rewrite happens *after* the snippet runs. | ✅ |
| 4 | `llms.txt` was a stale file from a no-longer-installed plugin (AIOSEO) | Deleted via root cause 1.4's fix; Rank Math's dynamic version now serves. | ✅ |
| 5 | `robots.txt` had no explicit AI-crawler policy | Same fix as #4 — physical file deleted via WP File Manager, then a correct static file was created directly (Allow rules for GPTBot, ClaudeBot, PerplexityBot, etc., plus sitemap line) since Rank Math's own panel still reports "not writable" even with no file present. | ✅ |
| 6 | Knowledge Hub had no quotable exam-fact block | Added via WPCode 10704 (output-injection, not an Elementor edit). Two new gotchas found: `is_page()` can return false on a page that visibly is that page (this page's grid is injected by custom template code) — matched `$_SERVER['REQUEST_URI']` instead; and `ob_start()` callbacks see pre-minification HTML, so anchor regexes need to be whitespace-tolerant, not copied from a `curl`'d minified response. | ✅ |
| 7 | Homepage LCP 7.35s / bundle-page LCP ~11.8s (poor); 180KB+ inline CSS; jQuery core missing `defer`; 464KB unconverted icon font | Elementor CSS Print Method switched to "External File" (removed a 142KB inline block); jQuery core removed from LiteSpeed's defer-exclusion list. Both confirmed live. Icon-font conversion and Critical-CSS async loading still need tooling this session doesn't have. **A Lighthouse re-run on 2026-08-05 shows scores still poor (30-40/100) — unclear if this is a real regression or lab-run variance; needs field data (PSI/CrUX) to disambiguate.** | 🟡 |
| 8 | Tablet header: Login button clips to just "L" visible at 768-1024px | Root cause: a flex-space allocation bug — only the button's container had `flex-shrink:1`, absorbing all shortfall. WPCode 10706 caps the logo container's max-width so it shrinks first, freeing space for the button. A v1 attempt regressed the bug (button became invisible, not just clipped) before v2 was verified correct at every tested width via `getBoundingClientRect()`. | ✅ |
| 9 | The "free" mock test is gated behind mandatory registration, contradicting the "Try the Free CAMS Mock Test" CTA | User decided to keep the registration requirement but fix the overpromising copy: CTA now reads "...— sign up to start →". | ✅ (by design decision, not a bug fix) |
| 10 | `/acams-exam-difficulty/` 404s but still ranks in Google | Added a 301 redirect to `/is-the-cams-exam-getting-harder-in-2025/` via Rank Math Redirections. | ✅ |
| 11 | Author bio on `/writer/rezaul/` existed only in schema, never visible on the page | Added WPCode 10707: an "About the Author" block reusing the exact bio text already verified in the page's own `Person` JSON-LD — no new facts invented. | ✅ |
| 12 | Site contradicted itself on the CAMS passing score (FAQ page's hedged "scaled score of 75" vs. two other pages' flat "75/120 = 62.5%", the latter live inside indexable `FAQPage` schema) | Rewrote body copy and JSON-LD on both offending pages to match the FAQ page's hedged framing. Found and fixed a new root cause along the way: TinyMCE leaves a stray `<span data-mce-type="bookmark">` in saved content on Visual→Code→Visual switches, which broke one page's JSON-LD — fixed by editing in Code view only, verifying with `JSON.parse` after publish rather than trusting the visual preview. | ✅ |

---

## 3. High severity (13 findings)

| # | Problem | Solution | Status |
|---|---|---|---|
| 1 | `FAQPage` JSON-LD held stale short answers (2-34 words) even where visible text was expanded to 140-171 words | WPCode 10700 replaces `acceptedAnswer.text` for the 10 affected questions, matched by question text (not array index) so it can't silently drift. | ✅ |
| 2 | `Course.provider` was a disconnected inline stub, creating two competing Organization representations per page (name even differed: "CAMS Prep" vs "CAMS PREP") | WPCode 10701 replaces any inline stub with a proper `@id` reference to the canonical Organization node, sitewide. | ✅ (see High #2's own refinement below) |
| — | *Refinement found later:* the `@id` reference above doesn't resolve on 3 individual course-page templates — no Organization node exists in their own page dataset | New WPCode 10768 inlines the `Place`/`Organization`/`WebSite` graph on `/courses/*` pages specifically (mirroring what bundle pages already do), copied verbatim from the homepage's own output. | ✅ (verified live 2026-08-05) |
| 3 | Bundle discount schema missing `priceSpecification` (list vs. sale price) on all 3 bundles | WPCode 10702 adds `UnitPriceSpecification` entries for List/Sale price using real figures read off each bundle's pricing widget. `priceValidUntil` deliberately **not** added — no real expiration date exists anywhere on the pages to cite. | ✅ |
| 4 | Chat widget ("Ask Amayra") overlaps content/CTAs on mobile and tablet across templates | WPCode 10708 (CSS) hides the tooltip and shrinks the launcher bubble below 1024px. One page (bundle pages) needed a second approach — reserved paragraph padding — because a separate snippet (mobile sticky buy bar) repositions the bubble higher there. Re-verified line-by-line with `Range.getClientRects()`: 0 overlaps. | ✅ |
| 5 | New 3-way keyword cannibalization on "why is the CAMS exam hard/getting harder" (4-5 URLs co-ranking) | Identified the core pair (`/is-the-cams-exam-getting-harder-in-2025/` vs `/why-cams-exam-questions-are-challenging/`), got user sign-off on the mapping, folded the non-redundant content into the target (WPCode 10850) and 301-redirected the losing page. | ✅ (2026-08-07) |
| 6 | Near-duplicate pass-rate vs. passing-score pages, co-ranking, compounded by the Critical #12 contradiction | Contradiction itself fixed (see Critical #12); the underlying near-duplicate/cannibalization issue is separate and still open. | ⚠️ Open |
| 7 | Possible orphaned content from the 5-way "what is CAMS" redirect merge (two absorbed pages' angles may not be covered by the canonical) | Flagged as a real risk, not confirmed — Wayback Machine was rate-limited during verification. Needs a direct pull of pre-redirect CMS revisions to check. | 🔍 Open |
| 8 | Consolidated `/how-to-pass-cams-exam/` pillar duplicates 2 of its own spoke posts, no links from pillar to spokes | WPCode 10848 injects a "Related:" link to each spoke (`/common-cams-exam-mistakes/`, `/cams-exam-day-experience/`) directly after the matching `<h2>` via output-buffer regex — never touches Elementor content. Gotcha: first version matched on TOC-script-injected `id` attributes absent from the raw server HTML; fixed by matching heading text instead. | ✅ (2026-08-07) |
| 9 | 9 redirected URLs + `/free-tests/` still listed in the XML sitemap despite live 301s | Applied Rank Math's Robots Meta → No Index to all 10 URLs (no direct "exclude from sitemap" toggle exists in this install); Rank Math's sitemap generator respects No Index. Confirmed all 10 gone from the sitemap. | ✅ |
| 10 | 180KB of over-inlined CSS in `<head>` | Same fix as Critical #7 (Elementor External File CSS). | 🟡 (see Critical #7 status) |
| 11 | Render-blocking jQuery core script (only one of 85 scripts lacking `defer`) | Same fix as Critical #7 (removed from LiteSpeed's defer-exclusion list). | ✅ |
| 12 | Single-review (`ratingCount: 1`) AggregateRating on the free-test page reads as manipulated for a $2,000+ decision | User chose to remove it. WPCode 10849 strips the `aggregateRating` field from the page's JSON-LD; the underlying review was schema-only to begin with, so no visible content changed. | ✅ (2026-08-07) |
| 13 | Mock-test validity shown as "6 Months" (pricing card) vs. "180 days" (product page) | Investigated: not actually a conflict — TutorLMS's native 180-day enrollment setting *is* "6 Months," just displayed in different units on different templates. User confirmed 6 Months as the target duration. | ✅ (non-issue, confirmed consistent) |

---

## 4. Medium severity (13 findings)

| # | Problem | Solution | Status |
|---|---|---|---|
| 1 | `llms.txt` header falsely implied an AIOSEO plugin conflict | Checked directly — AIOSEO is not installed; the file was just a stale leftover, not an active conflict. No action needed beyond deleting the file (Critical #4). | ✅ |
| 2 | `http://www.camsprep.com/` takes a 2-hop redirect instead of 1 | Root cause is server/CDN-layer routing (protocol-only redirect before WordPress loads), outside WP-admin's reach. **Needs:** a Hostinger support ticket or `.htaccess`-level fix. | ⚠️ Open, needs infra access |
| 3 | A bulk lastmod-republish pattern touches `post_modified` across unrelated posts/pages/courses in tight windows | Root-cause hypothesis found (2026-08-07): a custom "RankMath REST API Access" plugin exists specifically "for Claude Blog Publisher" — an automated content-publishing pipeline with a forward-scheduled content calendar. REST-API queries confirmed clusters of 3-8 thematically-related but otherwise untouched posts sharing one exact modified-minute, on days with no matching creation/publish event, consistent with a periodic internal-linking/maintenance pass. Not confirmed — no file access to read the plugin's source. | 🟡 Hypothesis found, needs confirmation |
| 4 | Success-story pages typed as `BlogPosting` instead of `Review` | Harmless as-is; only worth restructuring if pursuing bundle `aggregateRating` later. | ⚠️ Deferred, not urgent |
| 5 | Possible duplicate bundle URLs (alias vs. canonical bundle slugs) | Checked directly: the alias URLs are 301 redirects to the canonical bundle pages, not separate indexable duplicates. | ✅ (confirmed non-issue) |
| 6 | `/pricing/` had no `Offer`/price schema despite 4 paid tiers | WPCode 10703 adds an `OfferCatalog` node with 5 real `Offer` entries (prices and URLs read directly off the live page, not invented). | ✅ |
| 7 | Two inconsistent Course/Offer schema templates coexist (individual course page vs. bundle/hub template) | `Offer.url`/`Course.url` gap closed via WPCode 10847 (2026-08-07) — fills in `url` from `get_permalink()` only where empty, verified live on all 3 bundles with no effect on the already-correct course-page template. `aggregateRating` gap remains unaddressed (bundles have 0 real reviews, so none invented per this repo's hard line). | 🟡 Partially resolved |
| 8 | 436KB of available image savings per Lighthouse despite an Imagify bulk-optimization pass | Checked Imagify's dashboard directly (2026-08-07): 503 images / 559 media files, 100% optimized, 72% average reduction, only 1 minor WebP-conversion warning. Finding no longer matches current state — likely closed by routine auto-optimization on newly-uploaded images. | ✅ (appears resolved, not by any session in this file) |
| 9 | Preconnect hint targeted the wrong font domain (`fonts.gstatic.com` had it, `fonts.googleapis.com` — the actual first-hop domain — only had a weaker prefetch hint) | Added both domains to LiteSpeed's DNS Preconnect field. | ✅ |
| 10 | Broken apostrophe encoding (`�`) on 2 Knowledge Hub post titles | Checked directly (raw HTML + browser rendering) — not reproducible; either already fixed or a transient audit artifact. No action taken. | ✅ (non-issue) |
| 11 | Unsubstantiated, conflicting experience-claim numbers ("2,000+ candidates" vs. "1,500+ professionals") | User confirmed 2,000+ is correct. Updated the sitewide subscriber-popup snippet (WPCode 9145) to match. | ✅ (2026-08-07) |
| 12 | Bundle pages are content-thin (492-638 words), all commerce lists, no quotable prose | Acceptable for the page type per this file's own assessment; caps AI-citation potential but not treated as a bug. | ⚠️ Low priority, by design |
| 13 | Residual horizontal overflow 768-949px beyond the header-clipping range | Same root cause as Critical #8 (tablet header flex bug). | 🟡 (see Critical #8 status) |

---

## 5. Low severity (9 findings — bundled, none individually resolved or urgent)

Organization `@type` inconsistent across templates · `Offer` missing
recommended `url` property · `hasCourseInstance` minimal (no
schedule/instructor) · URL slug typo "speacialist" · `sitemap.xml` vs
`sitemap_index.xml` minor indirection referenced in `llms.txt` · bundle hero
images are PNG not WebP · newsletter's ~250-country dropdown renders as
extractable boilerplate text sitewide · minor chat-icon corner overlap on
homepage hero (no text obscured) · backlinks Tier 0 data too thin to score
(needs a free Moz API key). **Status:** ⚠️ all open, none blocking.

---

## 6. Findings discovered during the independent 2026-08-05 re-audit (not in the original 47)

| Problem | Solution | Status |
|---|---|---|
| The paid bundle pages have zero organic visibility for "CAMS mock tests" / "CAMS exam bundle" — the site's own informational/other-product pages outrank its own product pages | Recommended: add a package-comparison block linking to the 3 bundles from `/cams-mock-tests/` and `/cams-test-preparation/`, plus `Offer`/`AggregateRating` schema on the bundle pages once real reviews exist. Comparison block shipped (see next row); schema not yet added (no real reviews to cite). | 🟡 Partial |
| `/cams-test-preparation/` doesn't exist as a real page (used as an anchor target in the kickoff prompt) | Substituted the two real existing hub pages (`/topic-wise-cams-tests/`, `/cams-mock-tests/`) for the comparison block instead of inventing a page. Flagged as a scoping question for the user rather than guessing silently. | ✅ (worked around) |
| `/courses/masterclass/` 404s but still surfaces in search, separate from Critical #10's redirect | Added a 301 to `/courses/cams-prep-masterclass/`. | ✅ |
| Missing-`<h1>` bug is broader than post 8129 — 2 more posts found with zero `<h1>` | Re-swept all 26 post-sitemap URLs (2026-08-07): scope has **narrowed to 2 posts** (8129, `/cams-exam-pass-rate/`) — `/cams-exam-passing-score/` now renders its title `<h1>` correctly, an apparent external fix not attributable to any session in this file. Root cause (Elementor desync) unfixed on the remaining 2 — same "no automated attempts" rule applies. | 🔍 Open, scope narrowed to 2 posts |
| `author-sitemap.xml` excluded Rezaul Karim's author page entirely (the one every post's `BlogPosting.author` actually points to) | Root cause: Rank Math's sitemap settings excluded the "Tutor Instructor" role, which Rezaul's account also carries. Unchecked that exclusion; also removed 2 dormant/credential-less accounts from the sitemap instead of fabricating bios for them. | ✅ |
| Bundle `Offer.availability` used a bare `"InStock"` string instead of the full schema.org IRI; `Offer.price` mixed string/numeric types | Extended WPCode 10702 to rewrite `availability` as a full IRI and cast `price` numerically. | ✅ |
| Masterclass course schema lacked `hasCourseInstance` (bundles already had it) | New WPCode 10766 adds a minimal `CourseInstance` node, gated to that one post. | ✅ |
| A literal `$NN` price (e.g. `$58`) silently stripped to empty text when injected via a new WPCode snippet | Root cause: `preg_replace()` interprets `$` + digits in its replacement string as a backreference. Fixed by rewriting the snippet to use `preg_replace_callback()` instead, whose return value isn't subject to that parsing — reverted an earlier `&#36;` HTML-entity workaround since it was no longer needed. **Generalizable: any future snippet building a dynamic replacement string must use `preg_replace_callback` or escape literal `$`.** | ✅ |
| The Rank Math redirect table went completely empty **a third time** (2026-08-07), silently reverting the previously-verified 12-redirect batch again — and WP Ghost's own Events Log / Security Threats Log toggles were found reset to off in the same window, despite being turned on 2 days earlier | Recreated all 12 redirects again (2026-08-07), re-enabled both WP Ghost log toggles. New lead: a stray, unrelated redirect (`w-login/`→`/dashboard/`) was found in Trash with a timestamp of 1:02-1:07am the same day — the first concrete timestamp this investigation has had. Two plugins present in the prior session (Duplicator, WP File Manager) are now gone entirely, re-blocking file-level access. Root cause still not confirmed — needs Hostinger server logs or the user's direct input on what runs around 1am. | 🔍 Open — root cause still unconfirmed, reverted 3 times now, re-created and re-verified live each time |
| Desktop hero image renders as a gray placeholder box on `/courses/cams-prep-masterclass/` | Not reproduced in a warm, authenticated session; **was** reproduced on a cold headless load at tablet width. Looks like a lazyload/cold-load timing issue rather than a desktop-specific bug as first framed. | 🔍 Open, needs a dedicated cold-load investigation |
| `/cams-test-preparation/` is hard-linked (still 404s) from a shared sidebar/footer widget on ~14+ other posts — distinct from the hub-page fix above | Re-checked 2026-08-07: zero occurrences remain on any originally-flagged post. Not fixed by any session documented in this file — appears resolved externally. | ✅ (resolved, not attributed) |
| SXO analysis: `/pricing/` targets the wrong page type for "CAMS prep cost" (Google rewards total-cost-of-certification content, which the site's own blog post already provides, uncross-linked) | Not fixed — recommended a framing section on `/pricing/` plus a two-way cross-link with the existing blog post. | ⚠️ Open |
| SXO analysis: `/cams-flashcards/` is a static $29 page where searchers expect a free interactive tool; also the thinnest page on the site (527 words), no `Course`/`Offer` schema | Not fixed. | ⚠️ Open |
| Zero visible testimonials/star ratings/review counts on any of the 6 money pages, despite genuine success stories existing unlinked on the blog | Not fixed. | ⚠️ Open |
| No true pillar page exists for "what is CAMS certification"; compliance-insights category fully disconnected from the exam-prep funnel; no comparison content vs. competing certifications | Not fixed — needs a deliberate content-architecture decision from the user. | ⚠️ Open, needs user decision |
| No video/multi-modal content anywhere sitewide (correlates most strongly with AI-citation likelihood per this project's GEO methodology) | Not fixed. | ⚠️ Open |
| Course and pricing pages produced `NO_FCP` (no First Contentful Paint at all) in repeated Lighthouse runs — the two most commercially critical pages | New data, not previously captured; worth a manual DevTools check given these are checkout-adjacent pages. | 🔍 Open |

---

## 7. Operational workarounds worth reusing (not "problems" per se, but recurring traps)

- **Never trust a "saved"/"purged"/"updated" confirmation as proof a change is live.** Always verify with a cache-busted fetch of the actual production URL.
- **After any WPCode save**, hard-reload the edit page and read the persisted code back via the CodeMirror instance's `getValue()`.
- **After any LiteSpeed purge**, use "Purge By URL," not "Purge All," and confirm via the `x-qc-cache` response header.
- **Never JS-inject values or `Ctrl+A`** inside Elementor's Code-view textarea — real keystrokes into the visual canvas are safer but still risky at selection boundaries.
- **New PHP snippets that hook early actions** (`template_redirect`, `init`, `wp`) need WPCode's Location set to "Run Everywhere" — the "Site Wide Header" default fires too late.
- **Any snippet building a dynamic `preg_replace()` replacement string** must use `preg_replace_callback()` or escape literal `$` to avoid silent backreference stripping.
- **`resize_window` does not reliably change the real viewport** — use a real Playwright viewport sweep for responsive testing instead.
- **`is_page('slug')` can return false on a page that visibly is that page** if the page's content is injected by custom template code rather than rendered through the normal `the_content` pipeline — match `$_SERVER['REQUEST_URI']` instead when that's suspected.
- **Never anchor an injection regex on a literal string copied from a `curl`'d response** — LiteSpeed's minifier runs in an outer buffer, so WPCode's own `ob_start()` callback still sees unminified, whitespace-formatted HTML.
