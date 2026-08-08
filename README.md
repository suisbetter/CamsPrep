# CamsPrep

Working repository for **[camsprep.com](https://camsprep.com)** — a WordPress site offering CAMS certification prep.

This repo isn't the site itself. It's where changes are planned, documented, reviewed, and backed up **before** anything goes live. Everything here should be reproducible: if a fix is applied to the live site, the reasoning and the code behind it live in this repo.

---

## Contents

| Path | Purpose |
|------|---------|
| `/docs` | Audits, design reviews, competitor analysis, decision notes |
| `/theme` | Child theme files — templates, `functions.php`, custom PHP |
| `/css` | Custom and override stylesheets |
| `/js` | Custom scripts |
| `/snippets` | Standalone code snippets (Code Snippets plugin, `functions.php` additions) |
| `/backups` | Pre-change exports — theme files, plugin configs, DB dumps |
| `/reports` | PageSpeed Insights, GTmetrix, and crawl exports over time |

> Adjust this table to match the actual folder layout as it grows.

---

## Stack

- **CMS:** WordPress
- **Environment:** Production + staging
- **Caching / performance:** LiteSpeed Cache, QUIC.cloud CDN
- **Measurement:** PageSpeed Insights, Core Web Vitals

Record theme, page builder, plugin list, and hosting details in `/docs/stack.md` so the environment can be rebuilt or handed off.

---

## Workflow

1. **Identify** — log the issue or opportunity in `/docs` with the evidence behind it (score, screenshot, crawl result, user path).
2. **Back up** — export the affected files, settings, or database tables to `/backups` before touching anything.
3. **Build on staging** — implement in the staging environment, never directly on production.
4. **Verify** — re-test performance, layout across breakpoints, and any affected conversion path.
5. **Ship** — apply to production, then confirm the fix held after cache purge.
6. **Commit** — push the final code and a short note on what changed and why.

Rule of thumb: one concern per change. Bundled edits make regressions hard to trace.

---

## Focus areas

### Performance
- Hero image optimization (format, dimensions, preload)
- Lazy loading behavior — correct on below-fold assets, disabled on LCP elements
- LiteSpeed Cache configuration and QUIC.cloud settings
- Reducing render-blocking CSS and JS
- Core Web Vitals: LCP, CLS, INP

### SEO
- Site structure and internal linking
- Schema markup — `Course`, `Organization`, `FAQPage`, `BreadcrumbList`
- Title tags, meta descriptions, heading hierarchy
- Sitemap and indexation hygiene

### Design & structure
- Navigation clarity and depth
- Course presentation — how offerings are listed, described, and priced
- Conversion-oriented layout: CTA placement, trust signals, friction points
- Responsive CSS across mobile, tablet, and desktop

### Competitive reference
Structure and presentation benchmarked against ACAMS and Udemy — see `/docs/competitive-analysis.md`. The goal is to learn from how established platforms organize course content and drive enrollment, not to copy them.

---

## Conventions

- **Commits:** short, imperative, scoped — `perf: preload hero image on homepage`, `seo: add Course schema to CAMS prep page`
- **Docs:** dated Markdown files, one topic each. State the problem, the evidence, the change, and the result.
- **Backups:** name by date and scope — `2026-08-07-functions-php.bak`
- **Secrets:** never commit credentials, API keys, license keys, or database dumps containing user data. Use `.env` locally and keep it gitignored.

---

## Before publishing

- [ ] Backup exists in `/backups`
- [ ] Tested on staging
- [ ] Mobile, tablet, and desktop checked
- [ ] PageSpeed re-run and recorded in `/reports`
- [ ] Cache purged and change confirmed live
- [ ] Change documented and committed

---

## Notes

Fill in `/docs/stack.md` with the exact theme, plugin versions, and hosting configuration. Future-you (or anyone handed this repo) will need it before making any change safely.
