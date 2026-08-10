# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is **not** a codebase with a build/test/lint pipeline. It's the working repository for **camsprep.com**, a live production WordPress site. The repo is a planning, documentation, and backup layer that sits *around* the site — it records what was investigated, what was changed on the live site (via wp-admin, WPCode snippets, plugin settings, Elementor, Tutor LMS), why, and with what measured result. There is no local dev server, no `npm install`, no test suite to run. "Development" here means: investigate on the live/staging site, make the change through the WordPress admin tooling, verify it, then document it in this repo.

Per the README, the intended layout is `/docs`, `/theme`, `/css`, `/js`, `/snippets`, `/backups`, `/reports` — but as of now only `/docs`, `README.md`, and `CHANGELOG.md` exist. Don't assume the other directories exist; check before writing into them, and create them only when there's an actual file to put there.

## Workflow

Every change follows this loop (see README "Workflow" and the session-by-session `CHANGELOG.md` entries for real examples):

1. **Identify** — establish the issue with evidence: a PageSpeed/Lighthouse score, a screenshot, a crawl result, a specific broken element. Don't act on a hunch.
2. **Back up** — before touching production, back up the affected files/settings/DB tables. If a full backup fails (e.g. Duplicator hitting a host timeout on file count), fall back to a database-only backup when the change only touches content/settings, and say so explicitly.
3. **Change on staging first** when a staging environment is available; never experiment cold on production.
4. **Verify** — re-run PageSpeed Insights / Lighthouse, check layout across breakpoints, and confirm the specific conversion path or element that motivated the change. Verify against **anonymous/logged-out** rendering when the change affects something hidden for logged-in roles (e.g. prices are hidden for admin via an existing "Sub Admin Sales Hide" snippet) — fetch with `curl` or a fresh incognito session, don't trust the wp-admin preview.
5. **Ship, then re-verify post-cache-purge.** This site has **two independent cache layers** — LiteSpeed's origin/page cache and QUIC.cloud's CDN edge cache. Purging one does not purge the other; wp-admin's "Purge All" does not reliably clear the QUIC.cloud edge (seen with ~17h stale TTL). Confirm via the `x-qc-cache` response header, but don't trust the header alone — a purge-propagation race can return `hit` on genuinely stale content, so verify actual response *content*, not just the cache-status header.
6. **Commit** — push the code/config change and a note on what changed and why, both as a `CHANGELOG.md` entry and (for anything non-trivial) a dated file in `/docs`.

**One concern per change.** Bundled edits make regressions hard to trace back to a cause — this has bitten the project before (e.g. a "reverted, still regressed" case traced back to a stuck LiteSpeed crawler that had nothing to do with the setting under test).

## Hard rules

- **Never handle credentials.** If a third-party dashboard session (QUIC.cloud, hosting panel, etc.) has logged out mid-task, do not enter the account password even if the user offers to share it — ask the user to log in themselves. This has been the actual, followed precedent.
- **Never enable a paid/third-party service unilaterally.** QUIC.cloud Online Services (needed for Critical CSS generation) consumes an account-level quota and is a standing configuration change — it gets flagged to the user as a decision point, not turned on without sign-off.
- **Never take a destructive action on content with real user data attached without explicit confirmation** — e.g. Tutor LMS warns that deleting a quiz permanently deletes any student attempts tied to it. Even an exact-duplicate quiz entry gets confirmed with the user before deletion, not assumed safe to remove.
- **Never change shared/global design tokens (Elementor Kit global colors, fonts, etc.) without checking what else references them.** A past Accent-color fix-to-match-brand-doc broke the footer background because the footer depended on that same token — caught and reverted immediately. Prefer scoped CSS overrides over global token edits unless the token itself is confirmed unused elsewhere.
- **Don't leave a regression live.** If a change is net-negative or its effect is unverified/ambiguous, revert to the last known-good state before ending the session, even if the underlying investigation continues later. Deactivate (don't delete) unsuccessful WPCode snippets so they're available to reuse once their blocking issue is fixed.
- **Secrets** — never commit credentials, API keys, license keys, or database dumps containing user data. Use `.env` locally and keep it gitignored.

## Stack and where changes actually get made

- **CMS:** WordPress, page builder **Elementor**, course/quiz platform **Tutor LMS**.
- **Custom code delivery:** **WPCode** snippet manager (not theme file edits) — PHP snippets (`wp_head` hooks, etc.), CSS snippets, and JS snippets, each scoped ("Run Everywhere" / "Site Wide Header" / "Site Wide Footer" / front-page-gated) and named descriptively (e.g. "A11y: contrast, link underline, touch target fixes", "Fix 429", "SES Configuration Set Routing"). New fixes should follow this pattern rather than editing theme files directly, matching the existing snippets in this install.
- **Performance:** LiteSpeed Cache (page cache, CSS/JS combine & minify, Critical CSS/CCSS, lazy-load, crawler) + QUIC.cloud CDN (edge cache, Critical CSS generation backend). **Imagify** handles WebP delivery via `<picture>`/`<source>` rewriting — this has repeatedly conflicted with LiteSpeed's own lazy-load and with Swiper.js carousels not supporting `<picture>`-wrapped lazy images; check for these specific conflicts before re-enabling WebP delivery site-wide.
- **Backups:** **Duplicator** (full-file export can hit host build/timeout limits on this shared host — a database-only export is the fallback when the change is content/settings-only), stored under `wp-content/backups-dup-lite/` on the live site and/or `/backups` in this repo, named by date and scope (e.g. `2026-08-07-functions-php.bak`).
- **Analytics:** GA4 (`gtag.js`, served from `googletagmanager.com`) — there is **no Google Tag Manager container** on this site; past investigations mistakenly attributed third-party cost to GTM when it was GA4 on the same domain. Don't assume GTM exists.
- **Measurement:** PageSpeed Insights / Lighthouse (mobile + desktop, lab data has real run-to-run variance — don't treat a single run as ground truth), GTmetrix, Core Web Vitals field data (CrUX, lags behind changes).

## Focus areas

- **Performance:** Core Web Vitals (LCP, CLS, INP). Known, previously-diagnosed levers: hero image preload, LiteSpeed CSS Combine (trades one large render-blocking file for many smaller parallel ones), Critical CSS via QUIC.cloud (the main remaining lever to cross the 90+ threshold, gated on the third-party sign-off rule above), render-blocking/unused CSS-JS reduction, oversized course-bundle thumbnail images (flagged, not yet fixed as of the last session).
- **Accessibility:** Lighthouse-scored issues fixed via WPCode CSS/JS snippets, not theme edits — see the a11y snippet above for the pattern (ARIA misuse on non-interactive elements, color contrast, links needing a non-color affordance, touch target sizing, landmark regions on Elementor full-width/canvas templates that lack a semantic `<main>`).
- **SEO:** Schema markup (`Course`, `Organization`, `FAQPage`, `BreadcrumbList`), title/meta/heading hygiene, sitemap and indexation.
- **Design & content:** Course presentation, conversion-oriented layout (CTA placement, trust signals), responsive CSS across breakpoints, and brand consistency against `CAMS_Prep_Complete_Brand_Source_of_Truth.pdf` (correct casing is "CAMS Prep", never "CAMS PREP"; typography spec: Primary Manrope 700, Secondary Manrope 600, Text Inter 400, Accent Inter 600). Changing the Site Title and the `admin` user's display name are effective single-point fixes for site-wide byline/title text — cheaper than page-by-page edits when the string is auto-populated from those fields.
- **Competitive reference:** benchmarked against ACAMS and Udemy for course-content structure and enrollment-driving presentation — learn from the pattern, don't copy it. (`/docs/competitive-analysis.md` is referenced by the README as the place for this but does not exist yet.)

## Conventions

- **Commits:** short, imperative, scoped — `perf: preload hero image on homepage`, `seo: add Course schema to CAMS prep page`.
- **Docs (`/docs`):** one dated Markdown file per topic/session — `YYYY-MM-DD-short-topic.md`, with a suffix like ` (2)`/session number for same-day follow-ups. State the problem, the evidence (scores, measurements, markup snippets), the exact change made (including scope/gating), and the before/after result. Explicitly call out what was tried and reverted, and what's left open for a future session — this repo's docs are read forward by later sessions to avoid repeating dead ends (e.g. WebP/lazy-load conflicts, Accent-color token breakage).
- **`CHANGELOG.md`:** dated entries (newest first) mirroring the `/docs` write-ups, grouped by category (Performance, Accessibility, SEO, Content & brand consistency, Fixed), linking to the corresponding `/docs` file for full detail.
