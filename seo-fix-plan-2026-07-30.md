# camsprep.com — SEO Fix Plan
**Generated:** July 30, 2026 · **Based on:** full parallel audit of live `camsprep.com` (technical, content/E-E-A-T, schema, sitemap, performance, visual/mobile, GEO, SXO, content-clustering)
**Current SEO Health Score:** 55/100

---

## Before you read this: the deployment problem

A prior session fixed several of these exact issues — but on `staging.camsprep.com`, which turned out to be a separate, diverged WordPress install with its own database, not a preview of the live site. **None of those fixes reached production.** This plan is written against the real, live `camsprep.com` as it stands today.

Every fix below needs a path onto the actual live site to matter. Until that access/deploy question is resolved, treat this as a spec to execute once you're in, not a staging to-do list.

---

## How to read this

Each fix lists:
- **Problem** — what's wrong and the evidence
- **Fix** — the concrete change
- **SEO impact** — why it moves the needle, specifically
- **Effort** — rough sizing

Ordered by priority tier, then roughly by dependency (fix things earlier items unblock, first).

---

## CRITICAL — do first

### 1. Lock down `staging.camsprep.com` [WE CAN IGNORE]
**Problem:** The staging site returns HTTP 200, has a self-referencing canonical tag, and its meta robots tag explicitly says `index, follow`. `robots.txt` blocks crawling (`Disallow: /`) but that doesn't prevent indexing if a bot discovers the URL any other way (an inbound link, a screenshot, a shared QA ticket). It's a full mirror of the live catalog, discoverable and citable right now.
**Fix:** Add HTTP Basic Auth or an IP allowlist at the server/CDN level (robots.txt is not access control). Add `X-Robots-Tag: noindex, nofollow` sitewide on staging as defense-in-depth. Fix whatever generates the canonical tag so it never self-references on a non-production host.
**SEO impact:** Prevents duplicate-content competition against the real domain and closes a brand-risk hole (a public, unbranded clone of your paid product catalog).
**Effort:** Low — one server config change.

### 2. Course-bundle pages have zero commerce schema [OKAY TO CHECK AND IMPLEMENT]
**Problem:** `/course-bundle/starter-bundle/`, `/course-bundle/ultimate-exam-bundle/`, `/course-bundle/advanced-learner-bundle/` — the three main paid packages — emit only `BreadcrumbList`. No `Course`, `Offer`, or price data. Individual `/courses/*` pages do this correctly and can be used as the template.
**Fix:** Apply the same `Course` + `Offer` (+ `AggregateRating` only if real reviews exist) schema already working on single-course pages to all three bundle pages, with real prices.
**SEO impact:** Unlocks rich-result eligibility (price, availability) on your highest-value commercial pages — directly comparable competitor listings (Udemy, Amazon) already have this, and outrank you partly because of it.
**Effort:** Medium — 3 pages, template already proven elsewhere on the site.

### 3. Orphaned/conflicting duplicate schema on blog posts [OKAY TO CHECK AND IMPLEMENT]
**Problem:** Every blog post checked emits a second, unlinked `BlogPosting` JSON-LD block using insecure `http://schema.org` (not https), no `@id`, duplicating the full article body. On `/rakesh-kumars-cams-success-story/` it has the literal placeholder headline `"Auto Draft"`. On `/how-to-pass-cams-exam/` the two blocks give **conflicting headlines for the same URL**.
**Fix:** Find and remove the second schema emitter — most likely a leftover theme template partial or disabled-but-still-firing plugin snippet, separate from Rank Math's correct `@graph` block.
**SEO impact:** Conflicting/malformed structured data on the same URL risks Google discarding both blocks rather than picking the correct one, and a literal "Auto Draft" headline can surface in Search Console as an error and, worst case, in a rich result.
**Effort:** Low-Medium — needs one investigation pass to find the source, then a single removal.

### 4. `/cams-mock-tests/` — fix the page-type mismatch [OKAY TO CHECK AND IMPLEMENT]
**Problem:** Ranks for "CAMS mock test" but has zero internal link to your own free interactive test (`/courses/free-test/`), despite on-page copy promising "get your readiness measured." Zero commerce schema despite 6 priced SKUs. It's typed `Article`, not `Course`.
**Fix:** Add a prominent "Try the Free Mock Test" module linking to `/courses/free-test/` above or beside the bundle cards. Switch Rank Math's schema type from `Article` to `Course`, and add `Offer` data for the 6 SKUs.
**SEO impact:** Currently two of your own pages compete against each other for the same query instead of reinforcing one another — fixing this consolidates authority instead of splitting it, and matches what searchers actually want (try before buy), which SXO scoring shows is the single weakest part of the page (40/100 for the "first-time researcher" persona).
**Effort:** Medium — one content addition + one schema-type change.

### 5. Consolidate the "what is CAMS certification" 4-way collision [HOLD IT]
**Problem:** `/what-is-cams-certification/`, `/everything-you-need-to-know-about-cams-certification/`, `/beginners-guide-to-cams-certification/`, `/cams-certification-explained-why-it-matters-for-your-aml-career/` all cover the same intent. Verified via live SERP: **none of the four rank at all** for "what is CAMS certification" — classic suppression cannibalization, competitors own the term outright.
**Fix:** Make `/what-is-cams-certification/` canonical. 301-redirect "everything-you-need-to-know," "beginners-guide," and "cams-certification-explained" into it, folding in any unique content first (the "explained" page's career-angle content is worth preserving as a section, not just discarding).
**SEO impact:** Currently zero ranking value from four pages' worth of content and links; consolidating concentrates that signal onto one URL with a real shot at ranking.
**Effort:** Medium — content merge + 3 redirects + internal link cleanup.

### 6. Consolidate the CAMS exam cost/ROI 3-way collision [HOLD IT]
**Problem:** `/cams-exam-fee-breakdown/`, `/cams-exam-fee-and-return-on-investment/`, `/cams-certification-worth-it/` co-rank in the same SERP for "is CAMS certification worth it," splitting rather than compounding authority.
**Fix:** Make `/cams-exam-fee-and-return-on-investment/` canonical (best average SERP position of the three). Fold in the fee-schedule table from `/cams-exam-fee-breakdown/` first, then redirect it in. Re-scope `/cams-certification-worth-it/` to a distinct salary-benchmark angle rather than redirecting it, since it's carrying some unique value.
**SEO impact:** Same cannibalization logic as #5 — three pages splitting one query's worth of ranking potential.
**Effort:** Medium.

### 7. Fix the bundle-page purchase flow (performance + mobile CTA) [OKAY TO CHECK AND IMPLEMENT]
**Problem:** Two compounding problems on the same revenue pages. Performance: `/course-bundle/*` pages return `no-store, private` cache headers — they bypass LiteSpeed caching entirely, giving TTFB of 1.6s+, 46 unminified stylesheets, and 52 blocking scripts (vs. 1 combined stylesheet and 1 blocking script elsewhere on the site). Mobile: on the same pages, the Buy/Enroll CTA and price don't appear until ~4.3 screen-heights down — a mobile visitor scrolls through 4 full screens of marketing copy before seeing a way to buy.
**Fix:** (a) Add explicit LiteSpeed page-cache rules covering `/course-bundle/*` and `/courses/*` product pages — the current exclusion is almost certainly a blanket "dynamic cart/checkout" rule that's over-broad and should only apply to actual `/cart/`/`/checkout/` URLs. (b) Add a sticky mobile "Buy Now" bar, or move price/CTA above the descriptive sections, matching the pattern the mock-tests page already does well.
**SEO impact:** TTFB this poor directly fails the LCP budget before a single pixel of content paints — this is likely your single biggest Core Web Vitals lever, and it's sitting on the pages closest to revenue. The CTA-burial issue is a straight conversion-rate problem layered on top.
**Effort:** Medium — one caching-config change (b) + one Elementor layout change per bundle page.

### 8. Fix the sitewide tablet header [HOLD IT]
**Problem:** At 768px viewport width, the header's Login button is clipped to a single visible letter — genuine content cutoff, not just tight spacing. Confirmed on both the homepage and the mock-tests page (shared header template — very likely sitewide).
**Fix:** Add a tablet-specific breakpoint to the header's flex/grid layout rather than falling through from the desktop layout.
**SEO impact:** Not a rankings factor directly, but this is a broken, unprofessional-looking header on a common device class (iPad portrait, Android tablets) — it's a trust/conversion issue on every single page.
**Effort:** Low-Medium — one CSS breakpoint fix, applies everywhere at once.

---

## HIGH PRIORITY

### 9. Un-noindex `/writer/rezaul/` [OKAY TO CHECK AND IMPLEMENT]
**Problem:** The site's strongest E-E-A-T asset — a page tying content to a named, credentialed author (CAMS, ICA, CCI, former HSBC risk professional, ACAMS "AML Professional of the Month") — is set to `noindex`.
**Fix:** Remove the noindex directive (Rank Math author-archive setting, or convert to a dedicated indexable `/about/rezaul-karim/` bio page).
**SEO impact:** Author-credential association is one of the clearest authority signals both traditional search and AI answer engines use to decide whether to trust and cite content. Actively hiding it undercuts the site's entire authority story.
**Effort:** Low — single settings change.

### 10. Reconcile the pass-rate self-contradiction [HOLD IT]
**Problem:** `/cams-exam-guide/` states first-attempt pass rates as both "60-70%" and "70-85%" **in the same document**. `/what-is-cams-certification/` separately says "~60%." None are sourced. Meanwhile `/how-to-pass-cams-exam-fast/` correctly notes ACAMS doesn't publish official pass rates.
**Fix:** Pick one consistent, honestly-framed position sitewide — either a single sourced range, or the "ACAMS doesn't publish this, here's what we estimate and why" framing used correctly elsewhere. Fix the internal contradiction in the guide page first.
**SEO impact:** A site contradicting itself on a factual claim is exactly the kind of signal the Sept 2025 Quality Rater Guidelines update treats as reduced trustworthiness — for both human readers and AI systems trying to extract a citable fact.
**Effort:** Low — content edit, no dev work.

### 11. Curate llms.txt [HOLD IT]
**Problem:** `/llms.txt` exists (auto-generated by All in One SEO) but is a raw 200+ URL dump — 4x duplicate "Tutor Login" pages, 4x duplicate "Tutor Certificate" pages, template stubs with no real content, and test/placeholder quiz titles (literal gibberish strings). No curated summary of what the business is or its key facts.
**Fix:** Hand-curate to the top 15-20 highest-value URLs (pricing, courses, top Knowledge Hub articles, About/author pages) with a short prose summary block at the top (what CAMS Prep is, who it's for, credentials, differentiators).
**SEO impact:** A curated llms.txt lets AI systems answer questions about CAMS Prep accurately without crawling dozens of junk URLs — the current file actively works against that by burying real content in noise.
**Effort:** Medium — manual curation, no dev work beyond disabling the auto-generator.

### 12. Enrich the author Person schema [OKAY TO CHECK AND IMPLEMENT]
**Problem:** The Person node for the credentialed author has only `name`, `url`, `image` — no `jobTitle`, `description`, `hasCredential`, or `knowsAbout`, despite "CAMS, ICA, CCI" appearing in the page title.
**Fix:** Add a genuine bio paragraph to the author page (credentials, affiliation, years of experience, notable recognition) and enrich the schema with `jobTitle`, `description`, and `hasCredential` (`EducationalOccupationalCredential`).
**SEO impact:** Converts a page-title claim into machine-readable, verifiable credential data — directly supports both traditional E-E-A-T signals and AI-citation trust.
**Effort:** Medium — content writing + schema template update.

### 13. Fix faceted-URL canonicalization in the sitemap [HOLD IT]
**Problem:** `course-category-sitemap.xml` submits 7 URLs with Tutor LMS filter query strings (`?tutor-course-filter-category=`). Worse, the clean parameter-free version of the same page (identical content, verified byte-for-byte) has its canonical tag pointing **to** the parameterized version — backwards from standard practice.
**Fix:** Set canonical on both URL variants to the clean, parameter-free URL. Regenerate the sitemap to emit only clean URLs. Consider disallowing the filter parameter in robots.txt once canonicals are corrected.
**SEO impact:** Currently splitting ranking signal and wasting crawl budget between two URLs that are the same page — Google's own guidance is explicit that faceted/filter URLs should never be canonical targets.
**Effort:** Low-Medium — template/plugin config change.

### 14. Fix the clickjacking gap [HOLD IT]
**Problem:** Neither `X-Frame-Options` nor a CSP `frame-ancestors` directive is set. The existing CSP only has `object-src 'none'`. A site handling course purchases can currently be embedded in a third-party iframe.
**Fix:** Add `Content-Security-Policy: frame-ancestors 'self'` and/or `X-Frame-Options: SAMEORIGIN` at the server/LiteSpeed config level.
**SEO impact:** Security-adjacent rather than a direct ranking factor, but relevant to trust signals and is flagged by technical SEO/security crawlers; low effort for real protection on checkout-adjacent pages.
**Effort:** Low — one header addition.

### 15. Fix the LCP lazy-load/fetchpriority conflict [WE NEED TO DESIGN A NEW HERO SECTION, HOLD IT OFF]
**Problem:** The homepage/blog hero logo image carries `fetchpriority="high"` but LiteSpeed's lazy-load has rewritten its `src` to a placeholder and hidden the real URL in `data-src` — the two settings actively fight each other, delaying the LCP resource until JS executes.
**Fix:** In LiteSpeed Cache's Image Optimization settings, exclude the hero/logo image from lazy-loading (LiteSpeed supports a `skip-lazy`/`data-no-lazy` exclusion). Add a `<link rel="preload">` for the true LCP image.
**SEO impact:** Directly delays your Largest Contentful Paint — likely your single easiest Core Web Vitals win since it's a settings conflict, not a content problem.
**Effort:** Low — plugin settings change.

### 16. Compress and modernize bundle/blog images [HOLD IT]
**Problem:** Four PNGs on a single bundle page total 2.5MB combined (up to 761KB each); a blog hero image is 397KB. None are served as WebP/AVIF.
**Fix:** Convert to WebP/AVIF (typically 70-85% size reduction), serve via `<picture>`/`srcset`. Imagify is already installed — run its bulk optimization.
**SEO impact:** Direct, large reduction in LCP resource-load time on the pages closest to revenue.
**Effort:** Low to trigger (Imagify bulk job), but worth reviewing output quality after.

### 17. Add 9 Google Fonts requests → 1 on bundle pages [SAFE TEST IN STAGING]
**Problem:** The bundle page loads 9 separate Google Fonts stylesheets (vs. 1 everywhere else on the site) — a major contributor to its render-blocking chain.
**Fix:** Self-host and combine into a single subsetted font stylesheet with `font-display: swap`.
**SEO impact:** Removes 8 of 9 render-blocking requests specifically on your highest-friction page type.
**Effort:** Medium.

### 18. Fix mobile chat-widget overlaps [HOLD IT]
**Problem:** The floating chat widget overlaps the hero trust-badge row on mobile homepage, course-thumbnail cards on tablet homepage, and the pricing checklist on both tablet and mobile on the mock-tests page.
**Fix:** Adjust the widget's z-index/positioning to respect content density at these breakpoints — reduce bubble size and reposition on ≤1024px viewports, similar to what was already scoped in a prior fix attempt.
**SEO impact:** Not a direct ranking factor, but repeatedly covers commerce-critical elements (pricing, feature lists) — a real conversion drag that also reads as a layout bug to users.
**Effort:** Low — CSS-only fix, sitewide via a global stylesheet.

### 19. Target "CAMS certification cost" as a head term [HOLD IT]
**Problem:** Zero camsprep.com presence in the top 10 for "CAMS certification cost" despite having directly relevant content — the closest asset (`/cams-exam-fee-breakdown/`) is titled and optimized around the narrower phrase "fee breakdown," not the higher-volume head term.
**Fix:** Once the cost/ROI cluster is consolidated (#6), retitle/re-optimize the canonical page to target "CAMS certification cost" explicitly in title, H1, and intro.
**SEO impact:** Closes a keyword-targeting gap on a core commercial query where competitors (zabeelinstitute, kyclookup, acams.org) currently own all 10 slots.
**Effort:** Low, once #6 is done — content/metadata edit.

### 20. Build a real bundle-comparison matrix [HOLD IT]
**Problem:** The three pricing tiers are presented as repeated "Includes: X, Y, Z" prose per tier rather than a scannable comparison table.
**Fix:** Replace with a feature-comparison matrix (rows = features, columns = tiers).
**SEO impact:** Improves on-page clarity/UX signals for the budget-conscious-buyer persona (currently the second-weakest scored persona) and is generally better-suited to rich-result/table-extraction eligibility than prose.
**Effort:** Low-Medium — Elementor layout change.

### 21. Clean up remaining sitemap thin content [HOLD IT]
**Problem:** 4 auto-generated `course-tag` pages (language filters: Portuguese, Spanish, Arabic, English) are ~90%+ shared boilerplate around a single linked course each — classic thin/doorway pattern.
**Fix:** Either noindex these single-course tag archives and drop from the sitemap, or add 150+ words of genuinely unique context per tag if you want to keep them indexed.
**SEO impact:** Removes low-value pages that dilute overall site quality signals; small direct impact but easy to fix alongside #13.
**Effort:** Low.

---

## MEDIUM PRIORITY

### 22. Fix quoted-string `width`/`height` on ImageObject schema (sitewide)
Every page's logo `ImageObject` reports dimensions as strings (`"2407"`) instead of numbers — technically tolerated by Google's parser but a spec violation worth correcting in the shared schema template. **Effort: Low.**

### 23. Stop applying generic `Article` schema to non-article pages
`/pricing/`, `/cams-mock-tests/` and likely others get Rank Math's default `Article` fallback instead of `WebPage`/`Course`/`CollectionPage`. Worth a sitewide review of Rank Math's per-post-type schema defaults, not just spot-fixing the two found here. **Effort: Medium.**

### 24. Fix the homepage hero `ImageObject`'s relative URL
Currently `@id`/`url` are relative paths with placeholder `200×200` dimensions instead of the real absolute URL and actual image size — likely because the image is set via an Elementor background rather than the WP media library, so Rank Math can't resolve it. **Effort: Low-Medium.**

### 25. Lengthen FAQ answers for AI-citation quality
The 31-item FAQ page has answers averaging 13-34 words — well under the ~150-word range that functions as a self-contained, quotable AI-citation passage. One embedded article FAQ already does this well (50-60 words with specifics) and can be the template. **Effort: Medium — content rewrite only.**

### 26. Implement IndexNow
No key file exists; for a site publishing/updating content regularly, this is a fast, low-effort way to get new/updated URLs into Bing/Yandex faster than waiting on their crawl schedule. **Effort: Low.**

### 27. Stop the sitemap `lastmod` bulk-republish pattern
26 topically unrelated posts share `lastmod` timestamps clustered within a single 43-minute window — a signature of a bulk plugin action (migration, bulk SEO-meta resave) rather than real edits. This pattern risks Google discounting `lastmod` as an unreliable signal going forward. Audit what caused it and avoid repeating the pattern. **Effort: Low-Medium (process fix, not a one-time edit).**

### 28. Add missing `width`/`height` to ~26 homepage images
Direct CLS risk — the browser can't reserve layout space without them. LiteSpeed's "Add Missing Sizes" option may auto-fix this. **Effort: Low.**

### 29. Verify and link real LinkedIn/YouTube profiles — or create them
No LinkedIn or YouTube entities are linked anywhere on the site; only Facebook/Twitter appear in `sameAs`. YouTube presence in particular correlates strongly with AI-citation rates. **Do not fabricate links to profiles that don't exist** — first confirm whether CAMS Prep or the named author actually maintain these, then add `sameAs` if so. **Effort: Low if profiles exist; ongoing content investment if not.**

### 30. Add explicit AI-crawler rules to robots.txt
Currently passive (wildcard `Allow`) rather than deliberate — GPTBot, ClaudeBot, PerplexityBot are implicitly allowed, but so are training-only crawlers (CCBot, anthropic-ai) with no distinction made. Not urgent since nothing is currently blocked, but worth a deliberate policy statement. **Effort: Low.**

### 31. Clean up internal links that chain through a redirect
Homepage links to both `/courses/free-test` and `/courses/free-test/` (the non-slash version 301s). Similarly, `course-tag` pages link to a masterclass URL that itself redirects. Normalize to final destinations. **Effort: Low.**

### 32. Add a quotable exam-fact block to `/knowledge-hub/`
The old wrong-stat error (200 questions/75%) is confirmed gone — good. But the hub page now states *no* exam facts at all, missing a prime opportunity for AI Overviews to pull a quotable summary ("120 questions, 3.5 hours, 62.5% to pass") sourced from and linking to the passing-score article. **Effort: Low.**

### 33. Deepen `/cams-exam-passing-score/`
Borderline-thin at ~1,150-1,200 words vs. other blog posts on the site (2,000-3,400 words). Add worked scaled-scoring examples or a domain-by-domain breakdown. **Effort: Medium.**

### 34. Add outbound citations to primary sources
Claims like "ACAMS doesn't publish an official pass rate" should link to ACAMS's own materials as proof, not just assert it. Strengthens authoritativeness signals generally. **Effort: Low-Medium, ongoing.**

### 35. Fix the eligibility-page index consolidation
`/cams-exam-eligibility-requirements/` already correctly 301s server-side to `/acams-certification-eligibility-requirements-2026/`, but Google hasn't consolidated the index yet — it's still co-ranking under the old URL. Also fold in `/cams-exam-eligibility-40-credit-requirement/`, which duplicates the same content. Request re-indexing via GSC once redirects are confirmed. **Effort: Low.**

### 36. Consolidate the "how to pass" duplicate pair
`/how-to-pass-cams-exam/` and `/how-to-pass-cams-exam-fast/` are near-identical; the `-fast` variant is fully self-suppressed in search (doesn't rank at all). Either sharpen the differentiation (standard vs. accelerated timeline, explicitly) or redirect the weaker one in. Lower severity than #5/#6 but same underlying pattern. **Effort: Medium.**

### 37. Reduce DOM bloat and unused CSS
Homepage is ~1,733 DOM elements and 502KB of HTML — consistent with unpurged Elementor widget markup. Large DOM increases layout-recalculation cost on every interaction (an INP factor). Consider LiteSpeed's "Remove Unused CSS" module. **Effort: Medium.**

---

## LOW / BACKLOG

- Standardize a max-upload-resolution convention for images (a 1800px master is currently used for a small header logo).
- Merge the two duplicative "free test" pages (`/free-tests/` at ~310 characters, and the properly-built `/courses/free-test/`) into one asset.
- Add testimonial/review markup near buy CTAs on `/cams-mock-tests/`.
- Reposition `/cams-exam-guide/` as a trimmed pillar page linking to the 5 consolidated cluster canonicals, rather than re-covering everything inline.
- Spot-check whether "updated" dates on posts reflect real edits or date-stamp-only refreshes.
- Enable object caching (Redis/Memcached) for WordPress/WooCommerce/Tutor LMS queries generally, beyond just fixing the bundle-page cache exclusion.
- Audit GTM for redundant/heavy third-party tags contributing to INP risk.
- Fix the paginated `/courses/` archive's canonical (points to page 1 instead of self-referencing or using rel=next/prev).

---

## Deliberately not recommended

- **Fabricating LinkedIn/YouTube `sameAs` links** — only add if the profiles genuinely exist (see #29).
- **"Fixing" the Drupal 11 generator meta tag** — this appears to be intentional security-through-obscurity (masking that the site runs WordPress) rather than a misconfiguration. Flagged across multiple audit passes now; needs an explicit owner decision, not an automatic "fix."
- **A full staging→live database migration as a shortcut for deployment** — see the earlier discussion: this would overwrite real live-only data (orders, enrollments, payment records, content edited directly on live) and risks breaking domain-tied integrations (Stripe, Elementor licensing). Get proper admin access to live instead.
- **Adding new FAQPage schema anywhere, or removing existing FAQPage schema** — Google retired FAQ rich results for all sites as of May 7, 2026. Existing FAQPage markup is fine to leave (Info priority only); don't add more expecting a SERP benefit, and don't remove what's there.
