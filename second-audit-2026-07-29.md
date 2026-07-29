# camsprep.com — Full SEO Audit
**Generated:** July 29, 2026 · **Target:** Live site (https://camsprep.com) · **Business type:** EdTech/SaaS (CAMS exam prep)
**Method:** 10 parallel specialist audits (Technical, Content/E-E-A-T, Schema, Sitemap, Performance/CWV, Visual/Mobile, GEO, SXO, Backlinks, Content Clustering)

---

## SEO Health Score: 66/100

Weighted across the 6 categories with dedicated audits this run (Images was not separately audited — image-weight/alt-text issues are folded into Performance and Schema findings below, so the 5% Images weight is excluded from this calculation rather than guessed at):

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 84/100 | 18.5 |
| Content Quality (E-E-A-T) | 23% | 60/100 | 13.8 |
| On-Page SEO / SXO | 20% | 64/100 | 12.8 |
| Schema / Structured Data | 10% | 64/100 | 6.4 |
| Performance (CWV) | 10% | 42/100 | 4.2 |
| AI Search Readiness (GEO) | 10% | 68/100 | 6.8 |
| **Weighted total (of 95% covered)** | | | **62.5 → 66/100 normalized** |

**Supplementary (not in weighted formula):** Sitemap 90/100 · Visual/Mobile 72/100 · Backlinks: insufficient data (Common Crawl only, no Moz/Bing keys configured)

This is a fresh, independent audit — not a diff against `first-audit.html` (July 29, 2026, earlier same day). The two largely agree directionally, with this run surfacing several issues the first pass missed (notably the orphaned "Auto Draft" schema bug and the true scope of content cannibalization).

**Important caveat on the four items already fixed in this session:** earlier in this session, four homepage fixes (logo LCP/lazy-load conflict, hero `ImageObject` schema, time-commitment stat, chat-widget mobile overlap) were applied and pushed to `camsprep.com/index.html` in this repo. **This audit re-confirms all four issues are still present on the live site** — that file is a local mirror with no deployment path to the actual WordPress installation, so those fixes have not taken effect in production. They still need to be applied directly in WordPress (or handed to whoever manages it).

---

## Critical Findings

### 1. Orphaned duplicate `BlogPosting` schema with a literal "Auto Draft" placeholder [Schema + GEO, cross-confirmed]
Every blog post checked emits **two** `BlogPosting` JSON-LD blocks: the correct RankMath-generated one, plus a second orphaned block using `http://schema.org` (not https), no `author`/`publisher`, and — on at least one post — the literal never-replaced WordPress default title **`"headline": "Auto Draft"`**. The GEO agent independently found this same duplicate block has a stale `articleBody` with different stats/headings than the current article, risking AI systems citing outdated content. Looks like a leftover legacy theme/plugin template partial.
**Fix:** Locate and remove the orphaned schema-emitting template partial (likely an old theme file or disabled-but-still-firing plugin snippet).

### 2. Cross-page exam-fact contradiction persists [Content]
The `/knowledge-hub/` blog landing page states "approximately 200 questions" / "75% passing threshold." At least 8 other pages (homepage, `/cams-exam-guide/`, `/cams-exam-passing-score/`, `/cams-exam-pass-rate/`, `/how-to-pass-cams-exam/`, the FAQ page, etc.) correctly and consistently state 120 questions / 62.5%, and one page explicitly debunks "75%" as a common myth — which the hub page repeats verbatim. Near-identical July 2026 dates on both versions suggest parallel content generation without fact-checking against each other.
**Fix:** Correct `/knowledge-hub/`'s figures to 120/62.5%; audit any other pages generated in the same batch.

### 3. LCP failing on every page template [Performance]
Homepage 7.2s, Course/Bundle pages 11.8s, Blog posts 5.9s (target ≤2.5s). Course/bundle pages are worst: 3.9MB of unoptimized images (one 761KB image needs only 43KB at display size) plus a TTFB of 1.2–1.3s, strongly suggesting Tutor LMS pages are bypassing the LiteSpeed/QUIC.cloud edge cache that the homepage and blog benefit from.
**Fix:** Convert course/bundle images to WebP/AVIF at display size; investigate why Tutor LMS templates aren't cached (likely a `no-cache, no-store, private` header on cart/session-aware pages that's too broad).

### 4. Severe, wider-than-previously-known content cannibalization [Content Cluster]
- **4-way collision** on "what is CAMS certification" (`what-is-cams-certification`, `everything-you-need-to-know-about-cams-certification`, `beginners-guide-to-cams-certification`, `cams-certification-explained-why-it-matters-for-your-aml-career`) — none of the four actually ranks for the query; classic suppression cannibalization.
- Duplicate pair on "how to pass CAMS exam" (`how-to-pass-cams-exam` vs. `-fast`).
- A fee/ROI trio co-ranking on "CAMS exam fee cost."
- An orphaned legacy eligibility page not even in the current sitemap, still co-ranking.
**Fix:** Consolidate the "what is CAMS certification" 4-way and the "how to pass" pair first (301-redirect losers into one canonical each, fold in any unique content) — reduces 32 posts to ~27 clean URLs across 5 tightly-interlinked clusters (What Is / How to Pass / Scores-Pass Rates-Eligibility / Cost & ROI / Career-Renewal-Comparison).

### 5. `/cams-mock-tests/` page-type mismatch [SXO + Schema, cross-confirmed]
Ranks for "CAMS mock test" but is a thin (531-word), `Article`-schema sales page with no embedded quiz — just "Buy Now" CTAs. The site's own free interactive test exists at a separate URL (`/courses/free-test/`) that isn't surfaced here. Schema audit separately confirms it's mistyped as `Article` instead of `Course`, missing `Offer`/price data.
**Fix:** Surface the free test directly on this URL (or make it the primary above-the-fold element), and switch its schema to `Course`+`Offer`.

---

## High-Priority Findings

| Finding | Category | Detail |
|---|---|---|
| Course-bundle pages have zero product schema | Schema | `/course-bundle/*` pages carry only `BreadcrumbList` despite being priced products |
| CLS 0.243 on course/bundle pages | Performance | Unsized Tutor LMS thumbnail `<img>` + web font swaps (target ≤0.1) |
| Zero YouTube/LinkedIn presence | GEO | Strongest documented AI-citation correlator (~0.74) missing; no real LinkedIn company page |
| Mobile "Buy Now" CTA buried ~80% down course page | Visual | Major conversion risk on the site's key commercial template |
| Tablet header "Login" button clipped/overflowing | Visual | Homepage and course page, 768px breakpoint |
| Homepage hero `ImageObject` schema broken | Schema | Relative URL + placeholder 200×200 dims — *fixed locally, not live* |
| Logo LCP/lazy-load conflict | Technical | `fetchpriority="high"` fighting a JS lazy-load placeholder-swap — *fixed locally, not live* |
| Thin content on decision-critical pages | Content | `/free-tests/` ~50 words, `/cams-mock-tests/` ~90 words, `/pricing/` ~300 words |

---

## Medium-Priority Findings

- **llms.txt is a raw, uncurated dump** (GEO) — includes duplicate login/certificate pages, template pages, and placeholder test quizzes with gibberish titles. Affects LLM-crawler efficiency only, not Google rankings (llms.txt is unofficial and Google-ignored).
- **Author bio page (`/writer/rezaul/`) is noindexed** (GEO) despite holding real CAMS/ICA/CCI credentials and being schema-linked — blocks an authority signal from being crawlable.
- **Chat widget overlaps content on mobile/tablet** (Visual) — obscures hero trust badges and course-page intro text; also overlaps a course thumbnail on tablet homepage. *Fixed locally, not live.*
- **`ImageObject` width/height emitted as quoted strings site-wide**, and course pages lack `hasCourseInstance` (Schema).
- **IndexNow not implemented** (Technical) — no key file, despite frequent blog updates and Rank Math already installed.
- **No clickjacking protection** (Technical) — missing `X-Frame-Options`/CSP `frame-ancestors`, notable given paid checkout flows. *Requires server/CDN config, not a code fix.*
- **Case-variant URL not redirected**: `/Knowledge-Hub/` returns 200 instead of 301 (canonical tag mitigates but doesn't fully resolve).
- **Inconsistent lazy-loading**: only 9/21 sampled images use lazy loading; no native `loading="lazy"` used anywhere, all-JS strategy adds a render dependency.
- **Render-blocking CSS**: a 242KB Elementor combined-CSS bundle is 97.9% unused per page; blocking Google Fonts costs up to 1s.
- **Domain-weight inconsistency**: three different exam-domain weighting schemes appear across sampled pages — secondary evidence of the same uncoordinated-content-generation problem as Finding #2.
- **Trust gap**: only 8 reviews on the flagship Masterclass course; some testimonials use placeholder-style names/empty avatars.
- **course-category-sitemap.xml** lists 7 URLs with Tutor LMS query-string filters whose canonical tags self-reference the query-param version rather than the clean path (self-consistent, but non-standard).

---

## Low-Priority / Info

- Generator meta tag falsely claims "Drupal 11" (site runs WordPress) — likely deliberate CMS-fingerprint masking per earlier audit; still unconfirmed, left for owner decision.
- `/cams-mock-tests/` page title still says "2025" despite a July 2026 `dateModified`.
- 4 thin, auto-generated `/course-tag/*` taxonomy pages in the sitemap — well below any quality-gate threshold.
- Inconsistent `FAQPage` schema application — present on the dedicated FAQ pillar, missing from in-article FAQ blocks elsewhere. Per current guidance, FAQPage has no Google SERP benefit as of May 2026 — Info priority only, do not add or remove based on this alone.
- No visible author bylines/credentials on the sampled blog posts (content sample was 18 of ~65 pages — not exhaustive).

## Backlinks: Insufficient Data
Only Tier 0 sources available (Common Crawl + verification crawler, no Moz/Bing/DataForSEO keys). Common Crawl confirms the domain is indexed but below its authority-ranking publication threshold — this is a data-availability gap, not evidence of low authority. 0 of 7 weighted scoring factors have real data. Get a free Bing Webmaster or Moz API key to unlock actual DA/PA and referring-domain figures.

---

## Prioritized Action Plan

**Phase 1 — Do now (no dependencies):**
1. Fix the exam-fact contradiction on `/knowledge-hub/` (120 questions / 62.5%)
2. Find and remove the orphaned "Auto Draft" `BlogPosting` schema block sitewide
3. Deploy the 4 already-built fixes (logo LCP, hero schema, chat widget, homepage timeline stat) from the local mirror to the live WordPress site
4. Un-noindex `/writer/rezaul/`

**Phase 2 — Consolidate & fix (1–2 weeks):**
5. 301-redirect the "what is CAMS certification" 4-way collision and the "how to pass" duplicate pair into single canonicals
6. Convert course/bundle images to WebP/AVIF; investigate Tutor LMS cache exclusion causing 1.2–1.3s TTFB
7. Add `Course`+`Offer` schema to `/course-bundle/*` and switch `/cams-mock-tests/` from `Article` to `Course`
8. Surface the free interactive mock test directly on `/cams-mock-tests/`

**Phase 3 — Optimize (30 days):**
9. Fix mobile course-page CTA placement and tablet header clipping
10. Curate `llms.txt`; add `hasCourseInstance` to cohort pages; fix `ImageObject` string-typed dimensions sitewide
11. Reduce render-blocking CSS/fonts; add native `loading="lazy"` consistently
12. Publish YouTube content + verify LinkedIn company page; add `sameAs` once real

**Phase 4 — Backlog:**
13. Add clickjacking headers at the server/CDN edge
14. Configure Moz/Bing API keys for real backlink scoring
15. Implement IndexNow; fix the `/Knowledge-Hub/` case-variant redirect
16. Confirm intent of the Drupal-11 generator tag

---

*Full per-category evidence is in the scratchpad working files for this run (technical.md, content.md, schema.md, sitemap.md, performance.md, visual.md, geo.md, sxo.md, backlinks.md, cluster.md).*
