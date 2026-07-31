# camsprep.com — Fixes Implemented Live (2026-07-31)

This tracks what was actually applied directly to the live production WordPress
site today, in response to the `[OKAY TO CHECK AND IMPLEMENT]` items from
`seo-fix-plan-2026-07-30.md`. All changes were made through WP Admin (Rank
Math, WPCode, LiteSpeed Cache settings, Elementor) — **not** through this git
repo, since this repo only holds a local mirror/analysis copy of the site, not
its deployed source. This file exists so the fixes are tracked somewhere
version-controlled, since the live site itself has no changelog.

Each item was verified live after deployment (LiteSpeed cache purged, fresh
`fetch()`/`curl` checks against production, not cached admin views) before
being marked done here.

---

## 1. Course-bundle pages — commerce schema (fix-plan item #2)
Added `Course` + `Offer` schema (price, currency, availability) via Rank
Math's Schema Generator to the three bundle pages:
- `/course-bundle/starter-bundle/` — $49 (was $58)
- `/course-bundle/ultimate-exam-bundle/` — $99
- `/course-bundle/advanced-learner-bundle/` — $69

**Verified:** valid JSON-LD, `dateModified` timestamps confirm same-day
deployment, correctly cross-referenced via `@id` to `provider`/`publisher`.

**Follow-up needed:** `/cams-mock-tests/` (fixed separately, see #3) is
missing the `provider` block this template includes — see
`seo-fix-plan-2026-07-31.md` item #11.

## 2. Duplicate blog-post schema removal (fix-plan item #3)
Deployed WPCode snippet 10500 ("SEO Fix: Remove duplicate insecure
BlogPosting schema on blog posts"), Active, Run Everywhere — a PHP filter
that strips the orphaned second `BlogPosting` JSON-LD block (insecure
`http://schema.org`, no author/publisher/`@id`) from blog-post output.

**Verified:** confirmed removed on the two blog posts it was tested against.

**Follow-up needed — this fix did not close the underlying bug.** Today's
fresh audit found the *same* orphan pattern still firing live on
`/writer/rezaul/` (the author archive template), pulling in a different
article's content. The WPCode snippet only strips the symptom on the
specific templates it targets; the actual source emitter was never found and
removed. See `seo-fix-plan-2026-07-31.md` item #5 — this needs a proper
investigation pass, not another spot-fix.

## 3. `/cams-mock-tests/` page-type mismatch (fix-plan item #4)
- Switched Rank Math schema type from `Article` to `Course`, added `Offer`
  data ($39 USD, category: Paid) via the Schema Builder.
- Added a "Not sure you're ready? Try the Free CAMS Mock Test →" text link
  (via a duplicated/re-styled Elementor Heading widget, since this page turned
  out to be Elementor-editable at the content-block level) linking to
  `/courses/free-test/`, placed between the page's H2 and the pricing cards.

**Verified:** schema valid via live fetch, link renders with no layout
regression (confirmed via Playwright screenshots at 375px/768px).

**Follow-up needed** — this only partially resolves the original problem.
Today's SXO audit found a 3-way cannibalization cluster
(`/cams-mock-tests/`, `/courses/free-test/`, and a previously-unflagged
`/free-tests/` archive page) all competing for the same "free CAMS mock
test" intent, and the free quiz is still 2 clicks deep behind a
course-details template. See `seo-fix-plan-2026-07-31.md` item #6.

## 4. `/writer/rezaul/` author page — un-noindex (fix-plan item #9)
Changed the author's Rank Math Robots Meta from No Index to Index.

**Verified:** live meta tag now reads `index, follow`.

## 5. Author Person schema enrichment (fix-plan item #12)
Deployed WPCode snippet 10502 ("SEO Fix v2: Enrich author Person schema"),
Active, Run Everywhere — adds `jobTitle` ("Founder and Lead Trainer"), a real
bio `description`, and `hasCredential` (three `EducationalOccupationalCredential`
entries: CAMS, ICA, CCI) to the author's Person schema node.

**Verified:** confirmed live via two independent fetches, `jobTitle`/
`description`/`hasCredential` all present and populated correctly.

**Note:** this enrichment is emitted as a separate top-level JSON-LD script
rather than merged into Rank Math's main `@graph`, relying on matching `@id`
strings across script blocks. Likely fine for Google's parser in practice,
but worth validating directly in Rich Results Test and consolidating for
robustness — flagged as Info-level in `seo-fix-plan-2026-07-31.md`.

(Snippet 10501, an earlier non-functional attempt at this same fix, was left
deactivated rather than deleted, for debugging reference.)

## 6. Bundle-page purchase flow — cache + mobile CTA (fix-plan item #7)

**6a. LiteSpeed cache exclusion narrowed.** The "Do Not Cache URIs" list
previously blanket-excluded `/course-bundle/` and `/courses/` entirely
(plus redundantly listing all 4 individual bundle slugs on top of that
blanket rule). Removed both the blanket rules and the 4 specific bundle-slug
lines, leaving only the genuinely dynamic/personalized paths excluded
(`/dashboard/`, `/quizzes/`, `/w-login`, `/student-registration/`, one
one-off legacy URL). Verified before making the change that the actual
purchase action (`?post_type=course-bundle&p=...&course_id=...` on the
homepage) is query-string-driven and therefore already bypasses LiteSpeed's
cache by default — narrowing the exclude list does not affect checkout.

**Verified:** all 4 bundle pages now show `x-qc-cache: hit` on repeat guest
requests (the 4th, `cams-prep-masterclass`, was already a pre-existing 404
under this slug, unrelated to this change — its bundle now lives at a
different URL).

**Follow-up needed** — today's fresh performance audit (Lighthouse,
throttled mobile) still measured severe LCP on the course-bundle page
(14.1s) and found no `x-litespeed-cache-control` header at the WP-plugin
cache layer, only the `x-qc-cache` edge-CDN layer. These are two different
cache layers; edge caching is confirmed working, but see
`seo-fix-plan-2026-07-31.md` item #3 for the separate, larger LCP problem
(lazy-load defeating image discovery) that's the more likely dominant cause
regardless of cache-layer nuance.

**6b. Mobile sticky "Buy Now" bar.** The course-bundle pages turned out to be
native Tutor LMS templates, not Elementor-editable in the main content area
(`Edit with Elementor` only exposes Header/Footer/Site Settings on this
post type) — so the "move CTA above the fold" fix from the original plan
couldn't be done as an Elementor layout change. Built instead as a new
WPCode PHP snippet ("Mobile Sticky Buy Bar for Course Bundles", Active, Run
Everywhere, `wp_footer` hook gated on `is_singular('course-bundle')`): a
fixed-bottom bar (mobile only, `max-width: 768px`) that mirrors the real
price/old-price/Buy Now link from the page's own DOM at runtime, rather than
hardcoding values.

**Verified:** confirmed correct price/link population against live guest
markup; visually confirmed via a temporary local DOM override (not saved
anywhere) showing correct layout — price left, Buy Now button right, no
overflow.

**Follow-up needed — real regression found by today's audit.** Playwright
screenshots at 375px/768px confirm the bar's `z-index: 999999` sits on top
of the site's floating chat widget in the shared bottom-right corner (the
chat launcher's typical `bottom:~20px; right:~20px` position falls inside
the bar's 0–68px band). See `seo-fix-plan-2026-07-31.md` — this needs an
offset fix (nudge the chat widget up when `body.cams-has-sticky-buybar` is
present, or inset the bar's right edge).

---

## Net effect

6 of 8 `[OKAY TO CHECK AND IMPLEMENT]` items from the 2026-07-30 plan were
addressed. All 6 moved the needle, but a same-day follow-up audit (11
parallel streams) found that 3 of the 6 (duplicate schema, mock-tests
page-type, bundle purchase flow) only partially closed the original gap, and
the mobile-CTA fix introduced one new regression. See
`seo-fix-plan-2026-07-31.md` for the full current-state findings and
priority order on what's left.
