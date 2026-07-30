# camsprep.com — SEO Fix Plan
**Generated:** July 30, 2026 · Based on a full audit of live `camsprep.com` · **Health Score:** 55/100

**Before anything else:** a prior session fixed several items below on `staging.camsprep.com` — but that turned out to be a separate WordPress install, not a preview of live. None of those fixes reached production. This plan applies to the real, live site.

---

## Critical — do first

| # | Fix | Why it matters | Effort |
|---|---|---|---|
| 1 | Lock down `staging.camsprep.com` (Basic Auth or IP allowlist + `X-Robots-Tag: noindex`) | It's publicly indexable right now — a full duplicate of your catalog | Low |
| 2 | Add `Course`+`Offer` schema to the 3 bundle pages | Zero price/product schema on your main paid products; competitors have it | Medium |
| 3 | Remove the duplicate/orphaned `BlogPosting` schema on blog posts | One post has a literal "Auto Draft" headline; another has conflicting headlines for one URL | Low-Med |
| 4 | Link `/cams-mock-tests/` to the free test + switch schema to `Course` | Two of your own pages are competing instead of reinforcing each other | Medium |
| 5 | Consolidate the 4-way "what is CAMS certification" pages into one canonical | Confirmed via live search: none of the four rank at all | Medium |
| 6 | Consolidate the 3-way cost/ROI pages into one canonical | Same cannibalization pattern, confirmed in live SERPs | Medium |
| 7 | Fix bundle-page caching (currently bypassed) + move mobile Buy CTA above the fold | TTFB 1.6s+ and a 4-screen scroll before the CTA — both hit revenue pages directly | Medium |
| 8 | Fix the tablet header (Login button is clipped, sitewide) | Broken, unprofessional on every page at 768px | Low-Med |

## High priority

| # | Fix | Why it matters | Effort |
|---|---|---|---|
| 9 | Un-noindex `/writer/rezaul/` | Hides your strongest credentialed-author signal | Low |
| 10 | Fix the pass-rate contradiction (60-70% vs. 70-85% on the same page) | Self-contradicting facts hurt trust signals | Low |
| 11 | Curate `llms.txt` (currently a raw 200+ URL junk dump) | Buries real content from AI answer engines | Medium |
| 12 | Enrich author Person schema (add credentials, bio) | Converts a claim into verifiable structured data | Medium |
| 13 | Fix backwards canonical on faceted/filter URLs | Splitting ranking signal between duplicate URLs | Low-Med |
| 14 | Add clickjacking headers (`X-Frame-Options`/CSP) | Missing on a site handling purchases | Low |
| 15 | Fix lazy-load vs. `fetchpriority="high"` conflict on the LCP image | Actively delays your Largest Contentful Paint | Low |
| 16 | Compress/convert bundle & blog images to WebP/AVIF | 2.5MB of PNGs on one page alone | Low |
| 17 | Cut 9 Google Fonts requests to 1 on bundle pages | Major render-blocking contributor | Medium |
| 18 | Fix chat-widget overlap on mobile/tablet | Covers pricing/trust elements on commerce pages | Low |
| 19 | Retarget cost content at "CAMS certification cost" (head term) | Zero visibility for a query you have content for | Low |
| 20 | Replace bundle-tier prose with a comparison matrix | Weak clarity score for price-comparing buyers | Low-Med |
| 21 | Drop or expand the 4 thin `course-tag` pages | Doorway-page pattern in the sitemap | Low |

## Medium priority

- Fix quoted-string `width`/`height` on schema images (sitewide)
- Stop defaulting non-article pages to `Article` schema
- Fix homepage hero `ImageObject`'s relative URL/placeholder dimensions
- Lengthen FAQ answers (13-34 words → ~150) for AI-citation quality
- Implement IndexNow
- Stop the sitemap `lastmod` bulk-republish pattern (looks synthetic to Google)
- Add missing `width`/`height` to ~26 homepage images (CLS risk)
- Verify/link real LinkedIn & YouTube profiles — **only if they actually exist**
- Add explicit AI-crawler rules to robots.txt
- Clean up internal links that chain through redirects
- Add a quotable exam-fact block to `/knowledge-hub/` (now correct but says nothing)
- Deepen `/cams-exam-passing-score/` (thin at ~1,150 words)
- Add outbound citations to primary sources (e.g., ACAMS)
- Request re-indexing for the eligibility page (redirect is live, index hasn't caught up)
- Consolidate the "how to pass CAMS exam" duplicate pair
- Reduce homepage DOM bloat / unused CSS (~1,733 elements)

## Low / backlog

Standardize image upload resolution · merge the two duplicate "free test" pages · add testimonials near buy CTAs · trim `/cams-exam-guide/` into a pillar page linking out · spot-check "updated" dates are real · enable object caching · audit GTM tag weight · fix `/courses/` pagination canonical.

## Don't do

- **Fabricate LinkedIn/YouTube links** — only add if the profiles are real.
- **"Fix" the Drupal 11 generator tag** — likely intentional obscurity; needs an owner decision, not an auto-fix.
- **Migrate staging's database onto live as a deploy shortcut** — would overwrite real orders, enrollments, and payment records, and can break Stripe/Elementor integrations. Get proper live access instead.
- **Add or remove FAQPage schema for SEO reasons** — Google retired FAQ rich results for all sites (May 2026). Leave existing markup as-is.
