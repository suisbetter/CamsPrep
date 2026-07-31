# camsprep.com — SEO Fix Plan (2026-07-31)
**Generated:** July 31, 2026 · **Based on:** full parallel audit of live `camsprep.com` (technical, content/E-E-A-T, schema, sitemap, performance, visual/mobile, GEO, SXO, e-commerce, backlinks, content-clustering — 11 streams)
**Current SEO Health Score:** 57/100

---

## Context: this is the follow-up audit after the 2026-07-30 fix pass

Six items from `seo-fix-plan-2026-07-30.md` marked `[OKAY TO CHECK AND IMPLEMENT]` were implemented live on WP Admin earlier today (bundle-page commerce schema, duplicate blog schema removal, `/cams-mock-tests/` page-type fix, author noindex removal + Person schema enrichment, bundle-page LiteSpeed cache fix, mobile sticky Buy Now bar). See `fixes-implemented-2026-07-31.md` for what actually shipped and how it was verified.

This document covers what today's fresh 11-agent audit found afterward — a mix of things that turn out to still be broken (the "fix" only closed part of the gap), a regression introduced by today's own work, and net-new findings the July 30 audit didn't surface.

## How to read this

Each fix lists:
- **Problem** — what's wrong and the evidence
- **Fix** — the concrete change
- **SEO impact** — why it moves the needle, specifically
- **Effort** — rough sizing

Ordered by priority tier, then roughly by dependency.

---

## CRITICAL — do first

### 1. `/cams-mock-tests/` has only 99 words of real body copy
**Problem:** The site's primary commercial page — extracted body text (boilerplate-stripped) is a bullet list of SKU names plus a newsletter opt-in. No explanation of test format, sample questions, scoring methodology, or how the mock tests map to real CAMS exam domains. Service/landing pages need a 600–800 word floor per the quality-gate thresholds this site is otherwise held to; this page delivers ~12% of that.
**Fix:** Add real explanatory content above or beside the pricing cards — what the tests cover, how scoring works, a sample question, why 10 full-length tests specifically.
**SEO impact:** This page ranks for the highest-intent commercial query on the site ("CAMS mock test") and currently gives Google almost nothing to index beyond pricing widgets.
**Effort:** Medium — one substantial content pass.

### 2. Cannibalization is worse than the 2026-07-30 audit knew — 5-way and 4-way collisions, not 3/4-way
**Problem:** Live SERP re-check confirms a **5-way** collision on "what is CAMS certification" (the four from the prior audit, plus a previously-unflagged `/acams-certification/`) — **none of the five rank in the top 8**. A **4-way** collision on "how to pass CAMS exam" (three from the prior audit plus `/aml-certification-exam/`) — two of the four actively co-rank, splitting authority; the other two rank nowhere.
**Fix:** Same consolidation called for in the 2026-07-30 plan (items #5/#6), now with corrected scope. Full hub-and-spoke architecture with 301 mapping is in the content-cluster stream's output — see `## Content architecture` below.
**SEO impact:** Zero ranking value currently being extracted from 9 pages' worth of content and links across these two collisions combined.
**Effort:** Medium-High — content merge + redirects + internal link cleanup across 9 URLs.

### 3. LCP image lazy-load defeat, confirmed independently on both the homepage and course-bundle pages
**Problem:** LiteSpeed's lazy-load optimization rewrites the hero/thumbnail `<img src>` into a placeholder GIF, with the real image URL only in `data-src` — invisible to the browser's preload scanner, so `fetchpriority="high"` on the placeholder is a no-op. Two independent audit streams (technical + performance) confirmed this on different pages. Homepage LCP 5.3s, course-bundle-page LCP 14.1s under Lighthouse mobile/throttled conditions — both severely "poor" (>4.0s threshold).
**Fix:** Add the LCP-candidate images (header logo, hero image, first course-card/bundle thumbnail) to LiteSpeed's lazy-load exclusion list. One homepage image already does this correctly (`class="skip-lazy" data-no-lazy="1"`) — apply the same pattern consistently.
**SEO impact:** This is the single largest lever on Core Web Vitals found in this audit — it affects the LCP metric directly and is currently failing on the site's two highest-traffic page types.
**Effort:** Low — one LiteSpeed Cache settings change (Media → Image Lazy Load → Exclude), verify via Lighthouse re-run.

### 4. Factual self-contradiction published in a blog post
**Problem:** `/beginners-guide-to-cams-certification/` body text correctly states CAMS certification pricing ($2,095 private sector / $1,595 public sector), but its own FAQ block on the same page says "$1,595 for public sector, $2,095 for public sector" — the same category attributed to both figures.
**Fix:** Correct the FAQ answer to match the body text.
**SEO impact:** This is exactly the kind of factual-inconsistency marker Google's Sept 2025 Quality Rater Guidelines update flags as a low-quality/unedited-content signal — small fix, real trust risk left as-is.
**Effort:** Low — one sentence edit.

---

## HIGH PRIORITY

### 5. Orphaned duplicate `BlogPosting` schema is still live — the July 30 fix only closed the symptom, not the source
**Problem:** The WPCode snippet deployed today (10500) removes the orphan block from the specific blog-post URLs it was built against. But the schema audit confirmed, live, on `/writer/rezaul/`: a third JSON-LD block using `http://schema.org` (insecure), containing an unrelated article's full body text, no `author`/`publisher`/`@id`, not linked into the main graph — the exact same defect pattern, just firing on a different template.
**Fix:** Find the actual source emitter (theme template partial or plugin snippet) rather than patching individual page types as the bug surfaces on them. Check the author-archive template specifically, since that's where it's now confirmed active.
**SEO impact:** Conflicting/malformed structured data risks Google discarding valid blocks alongside the broken one.
**Effort:** Medium — requires finding the actual source, not just another symptom-level fix.

### 6. Today's `/cams-mock-tests/` fix only partially resolves the page-type mismatch
**Problem:** The free-test link was added and renders correctly, but SXO analysis found a **3-way cannibalization cluster**: `/cams-mock-tests/`, `/courses/free-test/`, and a previously-unflagged `/free-tests/` archive page all compete for "free CAMS mock test" intent — live SERP shows two camsprep.com URLs back-to-back for this query. The free quiz itself is also 2 clicks deep behind a course-details template (`/courses/free-test/` → "Start Learning" → separate quiz URL), unlike competitors who present it as a direct one-click tool.
**Fix:** Decide whether these three URLs should be one page or clearly differentiated with non-overlapping titles/H1s. Upgrade the free-test link from a plain text link to a real CTA button. Reduce the click path to the quiz.
**SEO impact:** Currently 3 of your own URLs split "free mock test" intent instead of consolidating it on one authoritative page.
**Effort:** Medium — URL/content consolidation decision + one UX change.

### 7. Duplicate/mismatched H1 tags — confirmed sitewide pattern, not isolated
**Problem:** Independently confirmed by both the technical and content-quality streams: at least one blog post renders two `<h1>` elements, with the second containing a *different* post's title entirely — consistent with a copy-pasted Gutenberg block that wasn't downgraded to H2 during content production.
**Fix:** Audit all 33 posts for stray `<h1>` blocks inside body content; downgrade to `<h2>`. Given the "scaled publishing" pattern (see Medium section), this is likely present on more than the one sampled post.
**SEO impact:** Confuses heading hierarchy and topical-relevance signal, worse when the stray H1's text doesn't match the page's own topic.
**Effort:** Low per-post, Medium for a full-site sweep.

### 8. Truncated meta/schema descriptions on 2 of 3 bundle pages
**Problem:** Ultimate Exam Bundle and Advanced Learner Bundle both have their `description` (used in both `<meta name="description">` and the Course schema `description` field) hard-truncated mid-word at ~156 characters, no ellipsis. Same trim function feeds both fields, so the bug hits the search snippet and the schema simultaneously.
**Fix:** Fix the trim function to break on a word/sentence boundary and append "…", or replace with a manually-written ≤155-char summary per bundle.
**SEO impact:** Broken search snippets and incomplete Course rich-result descriptions on 2 of the 3 highest-value commercial pages.
**Effort:** Low.

### 9. llms.txt is an uncurated, partially broken auto-export
**Problem:** Auto-generated by All in One SEO. Contains 3 dead links (including two literal placeholder test slugs left in production: `courses/sample-course/quizzes/gfdhgfhfdghdfgh/`), one stale redirect, and heavy noise (4 duplicate login pages, 4 duplicate certificate pages, a raw dump of ~50 country-calling-code labels) that crowds out the ~20 genuinely citable Knowledge Hub articles.
**Fix:** Replace with a hand-curated static file: a 2-3 sentence brand summary, links to the real Knowledge Hub articles and the 3 course-bundle/course pages only, nothing else.
**SEO impact:** This is the file AI answer engines use to understand what's worth citing on the site — right now it actively points them at 404s and irrelevant admin pages.
**Effort:** Medium.

### 10. ~400KB blocking CSS + 464KB uncompressed icon font on every page
**Problem:** LiteSpeed's CSS-combine feature bundles far more CSS than each page needs into one ~400KB blocking file (Elementor + ElementorKit + Tutor LMS styles loaded together regardless of what a given page uses), costing ~2s of render-blocking time. Separately, ElementorKit's icon font (464KB, uncompressed/unsubset) is the single largest asset on the homepage — larger than the combined CSS file.
**Fix:** Enable LiteSpeed's Critical CSS / async CSS loading. Subset the icon font to only the glyphs actually used, or migrate to inline SVG.
**SEO impact:** These are the two heaviest render-blocking assets found sitewide, directly delaying first paint on every single page.
**Effort:** Medium (CSS — needs visual QA after enabling), Medium (font subsetting).

---

## MEDIUM PRIORITY

### 11. Missing `provider` on `/cams-mock-tests/` Course schema
**Problem:** Present on all 3 sibling bundle pages fixed today, absent on mock-tests — an incomplete rollout of the same fix, deployed a few hours later than the bundle pages.
**Fix:** Add the same `provider: {name: "CAMS Prep", sameAs: "https://camsprep.com/"}` block already used on the bundle pages.
**Effort:** Low.

### 12. Homepage hero `ImageObject` schema still broken in production
**Problem:** Relative URL for both `@id` and `url`, placeholder `200×200` dimensions that don't match the actual image. Flagged in the 2026-07-30 audit as "fixed locally, not deployed" — confirmed today still live and broken on production.
**Fix:** Deploy the already-built fix (or rebuild directly in Rank Math/WPCode against the live site rather than the local mirror).
**Effort:** Low — the fix itself was already designed, just never deployed.

### 13. $58→$49 Starter Bundle discount is invisible to schema
**Problem:** The strikethrough "$58 → $49" pricing is prominent in the UI (buy box and sticky mobile bar) but `Offer.price` in JSON-LD only carries `"49"` — no `priceSpecification` or `priceValidUntil` capturing the original price.
**Fix:** Add `priceSpecification` with both values, or `priceValidUntil` if it's a time-limited promo.
**Effort:** Low.

### 14. "0.00 (0)" star badges on cross-sell widget cards
**Problem:** The "Explore More Bundles" cross-sell widget renders a visible zero-star badge for unreviewed bundles (Ultimate, Advanced) — reads worse than no badge at all.
**Fix:** Conditionally suppress the star/count display when `ratingCount === 0`.
**Effort:** Low.

### 15. "6 Months" vs "120 days" — factual discrepancy in mock-tests copy
**Problem:** `/cams-mock-tests/` pricing card advertises "$39 / 6 Months," but the actual product page (`/courses/10-full-length-mock-tests/`) states "Enrollment validity: 120 days" (~4 months) — the two don't match.
**Fix:** Reconcile which figure is correct and update the other. This is a factual-accuracy question for the content owner, not something resolvable from the page alone.
**Effort:** Low (once the correct figure is confirmed).

### 16. Parameterized taxonomy URLs in the sitemap
**Problem:** All 7 entries in `course-category-sitemap.xml` use query strings (e.g. `?tutor-course-filter-category=15`) and duplicate the same ~15 courses already listed cleanly in `courses-sitemap.xml`. Non-standard sitemap URLs are commonly deprioritized by Google's crawler.
**Fix:** Exclude this taxonomy from the sitemap (Rank Math setting), or fix the canonical to a clean URL.
**Effort:** Low.

### 17. Bulk `lastmod` clustering suggests automated/bulk resaves
**Problem:** 13 unrelated blog posts + 5 unrelated pages were all touched within minutes of each other on two separate days (2026-07-24 and 2026-07-30), rather than showing genuine per-page editorial timestamps.
**Fix:** Avoid bulk-resave plugin actions that touch `lastmod` sitewide; reserve `lastmod` updates for genuine content changes.
**SEO impact:** Systemic bulk-touch patterns can cause Google to discount a site's `lastmod` signal entirely, reducing its usefulness for crawl prioritization.
**Effort:** Low (process change, not a one-time fix).

### 18. CSP header provides minimal real protection
**Problem:** Only `object-src 'none'` is set — no `default-src`, `script-src`, or `frame-ancestors` directives.
**Fix:** Build out a fuller CSP, ideally rolled out in Report-Only mode first given the number of third-party plugin scripts (Mailchimp, GTM, Lenis, etc.).
**Effort:** Medium — needs careful staged rollout to avoid breaking third-party embeds.

### 19. LinkedIn and YouTube not linked in footer or schema `sameAs`
**Problem:** A real, active LinkedIn company page exists (10,088 followers, verified live) but isn't linked anywhere on the site — not in the footer, not in `Organization.sameAs` (which only has Facebook + Twitter). No YouTube channel exists at all. YouTube mention correlation with AI-answer citation is the strongest brand signal checked in this audit (~0.74).
**Fix:** Add the LinkedIn URL to footer links and `Organization.sameAs` immediately (free, zero-risk). Consider building a YouTube presence as a separate content initiative.
**Effort:** Low (LinkedIn), Medium-High (YouTube channel build-out — a content decision, not a technical one).

### 20. FAQ schema answers are too short to be cited at length by AI answer engines
**Problem:** The 30-FAQ post has valid `FAQPage` schema with 31 genuine question-form Q&As (good structure), but answers average 17 words — 0 of 31 fall in the 134–167 word band that gets quoted at length rather than just used as a snippet.
**Fix:** Expand the 10-15 highest-value answers (certification recognition, eligibility, cost/ROI, pass rate) to ~140-160 words each, keeping the concise version as a lead sentence.
**Effort:** Medium.

### 21. Redundant web fonts + non-preconnected Google Fonts request
**Problem:** Course-bundle pages load 5 extra font families (Inter, Urbanist, Lato, Poppins, Sora) beyond the theme's own Rajdhani/Roboto — almost certainly Tutor LMS shipping its own type system alongside the theme's. Separately, `fonts.googleapis.com` isn't preconnected (only `fonts.gstatic.com` is), costing ~357ms of avoidable LCP delay.
**Fix:** Add `<link rel=preconnect href="https://fonts.googleapis.com">`. Audit and remove unused Tutor LMS font-family imports on course/bundle templates.
**Effort:** Low (preconnect), Medium (font audit).

### 22. Mailchimp popup script cached only 60 seconds
**Problem:** `form-assets.mailchimp.com/snippet/...` (136-137KB) is re-downloaded on nearly every session due to a 60-second cache lifetime.
**Fix:** Self-host the snippet with a sane cache lifetime if feasible, or accept the tradeoff if the popup provider controls this.
**Effort:** Low-Medium.

---

## LOW PRIORITY

- Author page (`/writer/rezaul/`) has zero visible bio text despite credential-heavy branding — schema has jobTitle/credentials but no on-page "about the author" copy, no `sameAs` to a personal LinkedIn profile
- Scaled-publishing pattern: 71% of the 34-post blog was touched in the final 8 days before this audit, concentrated on a single author byline — worth an editorial-pace review, not itself a violation
- ~26 homepage images (bank-logo carousel) missing explicit width/height — latent CLS risk, currently masked by fixed-height containers
- No `AggregateRating` on bundle-page Course schema — correctly not fabricated, just genuinely absent since these are newer products
- Backlink profile is Tier 0 only (Common Crawl, no referring-domain/DA data) — a free Moz API key (2,500 rows/month) would unlock real analysis next audit
- Fake `<meta name="generator" content="Drupal 11">` tag on an actual WordPress site — still unconfirmed whether this is intentional obfuscation or a leftover misconfiguration
- No visible "last updated" date near article bylines — schema has `dateModified`, users don't see it rendered
- No IndexNow integration confirmed enabled despite frequent content publishing (Rank Math has a one-toggle IndexNow integration built in)
- HSTS `max-age` is ~6 months, not the 1-year+preload minimum common best-practice guides recommend

---

## Content architecture (for items #2 and the July 30 plan's #5/#6)

Full hub-and-spoke plan from the content-cluster stream, resolving all 5 confirmed collisions:

- **Pillar** — `/what-is-cams-certification/` ("What Is CAMS Certification?"), absorbs 4 duplicates (`/everything-you-need-to-know-about-cams-certification/`, `/beginners-guide-to-cams-certification/`, `/cams-certification-explained-why-it-matters-for-your-aml-career/`, `/acams-certification/`)
- **Cluster 0 — Exam Prep & Pass Strategy**: canonical `/how-to-pass-cams-exam/` absorbs `/cams-exam-guide/`, `/how-to-pass-cams-exam-fast/`, `/aml-certification-exam/`
- **Cluster 1 — Exam Metrics & Eligibility**: canonical eligibility page absorbs the legacy duplicate eligibility URL (note: a third legacy eligibility URL already 301s correctly — partial prior fix, needs the remaining pair merged)
- **Cluster 2 — Cost, ROI & Value**: canonical fee/ROI page absorbs the fee-breakdown duplicate; re-scope "worth-it" to a distinct salary-benchmark angle rather than merging it
- **Cluster 3 — Career, Renewal & Advocacy**: kept as 3 distinct posts (reasons-to-pursue, highlight-on-resume, renewal) — no cannibalization found
- **Cluster 4 — Exam Difficulty & Trends**: kept as 2 distinct posts (why-challenging, getting-harder) — overlap too low to merge

10 live URLs would 301-redirect into 5 canonicals. Excluded from this architecture: 4 branded success-story posts (E-E-A-T trust content, not keyword targets) and 4 posts targeting a compliance-manager persona rather than an exam-candidate persona (a separate, unbuilt content pillar). `/knowledge-hub/` sits upstream of every cluster and still carries a previously-flagged factual error (200 questions/75% passing score) — fix that first since it's linked from everywhere.

---

## SEO Health Score breakdown

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Content Quality | 23% | 52 | 12.0 |
| Technical SEO | 22% | 78 | 17.2 |
| On-Page SEO | 20% | 50 | 10.0 |
| Performance (CWV) | 10% | 35 | 3.5 |
| Schema | 10% | 70 | 7.0 |
| AI Search Readiness | 10% | 55 | 5.5 |
| Images | 5% | 45 | 2.3 |
| **Total** | | | **57/100** |
