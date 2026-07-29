# first-audit.html — Findings Not Implemented in index.html

This document tracks the SEO audit findings from `first-audit.html` that were
**not** applied to `camsprep.com/index.html`, and why. Four homepage-scoped
findings *were* implemented (logo LCP/lazy-load conflict, hero `ImageObject`
schema, time-pressed persona stat, chat widget mobile/tablet overlap) — see
commit `40d74e2`. Everything below was left alone.

## Why anything was left out at all

`camsprep.com/index.html` is a **local mirror of the live homepage only**
(scraped/saved for offline SEO analysis — see git commit "Add camsprep.com
website mirror"). It is not the site's deployed source (no WordPress admin,
theme files, plugin config, or server access are available here). Two
categories of findings are therefore out of reach from this repo:

1. Fixes that require **server/CDN-level configuration** rather than HTML.
2. Fixes that live on **pages other than the homepage** — this mirror only
   contains `index.html`, not `/cams-study-lounge/`, `/cams-exam-guide/`,
   `/course-bundle/*`, blog articles, etc.

A third category is findings that are **ambiguous or unsafe to auto-fix**
without owner confirmation.

---

## 1. Requires server/CDN configuration (not fixable in HTML)

| Finding | Severity | Why it can't be done here |
|---|---|---|
| No clickjacking protection (missing `X-Frame-Options` / CSP `frame-ancestors`) | Critical | These must be real HTTP response headers. A `<meta http-equiv>` tag cannot set `X-Frame-Options` at all, and browsers explicitly ignore `frame-ancestors` when delivered via `<meta>` — faking it in HTML would look fixed but do nothing. Needs a change at the CDN/server edge (e.g. LiteSpeed/QUIC.cloud config or `.htaccess`). |
| CSP too permissive (`object-src 'none'` only) | Medium | Same as above — real CSP needs to be sent as an HTTP header, ideally rolled out in Report-Only mode first given the number of third-party plugin scripts. |
| Faceted course-category URLs indexable (`?tutor-course-filter-category=`) | High | Requires either a canonicalization rule in the Tutor LMS/theme templates or a `robots.txt` disallow rule — not something expressed in a single page's HTML. |
| IndexNow protocol not implemented | Medium | Needs a key file at `/indexnow.txt` (or `/.well-known/indexnow.txt`) and a plugin/server integration to ping Bing/Yandex on publish. No such mechanism exists in a static mirror. |
| Redundant `sitemap.xml` → `sitemap_index.xml` redirect | Low | Sitemap generation/serving is handled by the SEO plugin server-side. |

## 2. Requires access to owner accounts / real-world assets

| Finding | Severity | Why it can't be done here |
|---|---|---|
| No YouTube or LinkedIn presence; Organization schema missing `sameAs` for them | High | The audit's own finding is that these profiles **don't exist yet**. Adding `sameAs` entries pointing at YouTube/LinkedIn URLs would mean fabricating links to accounts that aren't real — that's actively wrong to do. This requires camsprep.com's owner to create the profiles first, then `sameAs` can be added. (Note: the schema already has `sameAs` entries for Facebook and Twitter, so the "zero sameAs" framing in the audit's Findings section is slightly stale — worth a quick recheck.) |
| Configure a Moz API key for backlink scoring | Info | Requires a real account/API key; not a code change. |
| Re-run PageSpeed Insights once API quota resets | Low | Requires waiting on a rate limit reset and re-running the tool; not a code change. |

## 3. Ambiguous — left for owner confirmation

| Finding | Severity | Why it was left alone |
|---|---|---|
| Generator meta tag falsely claims "Drupal 11" while the site runs WordPress | Low | The audit itself notes this "appears to be a deliberate CMS-fingerprint mask, confirmed independently by three separate audit passes" and its own recommendation is "confirm this is intentional; if not, correct." Masking the real CMS is a legitimate (if minor) security-through-obscurity tactic that reduces automated WordPress-vulnerability scanning. Overwriting it without knowing whether that was deliberate risked undoing an intentional decision, so I left it — flagging it here for you to confirm one way or the other. |

## 4. On pages not present in this mirror

Only the homepage (`index.html`) was saved locally. All of the following live
on other URLs and can't be edited until those pages are pulled into the repo
(or the fixes are made directly on the live WordPress site):

| Finding | Severity | Page(s) affected |
|---|---|---|
| Cross-page factual contradiction on CAMS exam facts (120 vs 200 questions, 62.5% vs 75% passing) | Critical | Flagship knowledge-hub article + others (homepage already has the correct figures) |
| Courses hub has no title, H1, or meta description | Critical | `/cams-study-lounge/` |
| Course/bundle pages critically bloated (6.7MB) and uncached (TTFB 1.25s) | Critical | `/course-bundle/*` and other Tutor LMS product pages |
| Malformed JSON-LD (likely FAQPage) | High | `/cams-exam-passing-score/` |
| Three-way keyword cannibalization on "how to pass CAMS exam" | High | `/cams-exam-guide/`, `/how-to-pass-cams-exam/`, `/how-to-pass-cams-exam-fast/` |
| Duplicate "what is CAMS certification" content | High | `/what-is-cams-certification/`, `/everything-you-need-to-know-about-cams-certification/` |
| Masterclass page losing rankings to blog/homepage (internal-link imbalance) | High | `/courses/cams-prep-masterclass/` + linking pages |
| Mock Tests page-type mismatch (sales page ranks instead of the free interactive tool) | High | `/cams-mock-tests/` |
| Commercial pages mistyped as Article schema instead of Course/Offer | High | `/course-bundle/*`, `/cams-mock-tests/`, `/pricing/`, `/cams-flashcards/` |
| Thin content (560 / 1,360 words vs. 1,500 minimum) | Medium | `/cams-exam-passing-score/`, `/what-is-cams-certification/` |
| Inconsistent source-citation discipline | Medium | Various blog posts |
| llms.txt is an uncurated raw dump | Medium | `/llms.txt` (separate file, not part of any page's HTML) |
| Render-blocking CSS on course pages (Tutor LMS + ElementsKit stylesheets) | High | Course/bundle page templates |
| Heavy sitewide main-thread JS (Lenis, jQuery) | High | Sitewide, but only reproducible/testable on non-homepage page types too |
| CLS on course thumbnails (missing width/height) | Medium | Tutor LMS thumbnail template |
| Missing H1 on `/courses/` | Medium | `/courses/` |
| Dead link `/mock-tests/` (404) | Low | Should redirect to `/cams-mock-tests/` |
| BreadcrumbList `position` values are strings, not integers | Low | Sitewide breadcrumb template — not present on the homepage itself, so unverifiable from this mirror |
| Missing `hasCourseInstance` on dated cohort pages | Low | e.g. `masterclass-feb-2026` |
| Experience signals confined to author bio, not in article bodies | Low | Various blog posts |
| Some FAQ answers shorter than AI-citation sweet spot (40-100 words vs. 134-167 optimum) | Low | Various cornerstone pages |
| Clustered lastmod timestamps suggest bulk republish | Low | Sitemap-level, not a page fix |

---

## Recommended next step

To close out the Critical/High items in section 4, the most effective path is
either (a) granting repo/server access to the actual WordPress site so these
pages can be pulled in and edited directly, or (b) handing this document +
`first-audit.html` to whoever manages camsprep.com's WordPress instance.
