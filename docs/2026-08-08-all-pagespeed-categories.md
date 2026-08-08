# Getting all PageSpeed categories green

**Date:** 2026-08-08
**Scope:** Site-wide (not homepage-only) — Accessibility and Performance fixes following up on [`2026-08-07-hero-image-preload.md`](2026-08-07-hero-image-preload.md).

## Starting point (after the hero preload fix)

| Category | Mobile | Desktop |
|---|---|---|
| Performance | 52–61 | 79–80 |
| Accessibility | 85 | 85 |
| Best Practices | 96 | 96 |
| SEO | 100 | 100 |

Best Practices and SEO were already green (90+). Accessibility and Performance were not.

## Accessibility (85 → 97)

Lighthouse flagged 5 scored issues, all confirmed by inspecting real (logged-out) markup — a local static HTTP server (`python -m http.server`) was used to serve a curl'd anonymous snapshot of the homepage so computed styles could be checked without touching the live login session:

1. **Prohibited ARIA attribute** — Elementor's testimonial-carousel "Read More" toggle renders `<div class="elementor-testimonial__icon ..." aria-label="Read More"></div>`, a bare `<div>` (implicit role `generic`) can't carry `aria-label`. Fixed by stripping the attribute via JS (the adjacent visible "Read More" text already provides the accessible name).
2. **Low-contrast text** — `.list-item-price del` (the struck-through original price on course cards) was `#757c8e` on white, ~4.17:1 contrast (needs 4.5:1 for 15px text). Darkened to `#565d6b` (~5.4:1) via CSS, plus the underlying `--tutor-color-muted` custom property.
3. **Links rely on color alone** — inline links inside text-editor/content widgets (e.g. the footer "CAMS Prep" copyright link) had no underline and insufficient contrast vs. surrounding text. Added `text-decoration: underline` scoped to `.elementor-widget-text-editor a` and `.elementor-widget-theme-post-content a` (not nav/buttons/cards).
4. **Touch targets too small** — Swiper carousel pagination dots were 6×6px with 6px margin (well under the 24×24px minimum). Enlarged the tappable area to 24×24px via `padding` + `background-clip: content-box`, keeping the visible dot the same size/color.
5. **No `<main>` landmark** — Elementor "full-width" template pages (home, about, pricing) render `<header class="elementor">` + `<div class="elementor">` + `<footer class="elementor">` directly under `<body>`, with no semantic wrapper. Blog posts already have a real `<main id="cams-post-main">` from the post template, so this only affects Elementor-canvas pages. Fixed with JS that adds `role="main"` to the content `<div>` immediately after the header, but only when no `<main>`/`[role="main"]` already exists (safe no-op on post pages).

Implementation: two WPCode snippets, both site-wide —
- **CSS** ("A11y: contrast, link underline, touch target fixes", Site Wide Header)
- **JS** ("A11y: main landmark + remove invalid aria-label", Site Wide Footer, runs on `DOMContentLoaded` and `load`)

Verified live post-deploy: `role="main"` present, 0 remaining `aria-label` on testimonial icons, 24×24px bullet hit area, underlined text-editor links, darkened price contrast (confirmed via anonymous `curl` fetch since prices are hidden for the logged-in admin role by an existing "Sub Admin Sales Hide" snippet).

## Performance (mobile 52–61 → 61, desktop 79–80 → 79)

Lighthouse's #1 opportunity was **render-blocking requests**: LiteSpeed Cache's "CSS Combine" setting was bundling the entire site's CSS into a single ~415 KiB file that blocked first paint for an estimated 7.9s on simulated Slow 4G. Turned **CSS Combine off** (kept CSS Minify on; JS Combine was already off, JS was already deferred). This is a one-click, fully reversible LiteSpeed Cache setting — no code, no third-party service.

Effect: render-blocking savings estimate dropped from ~3.7s to ~2.9s, "reduce unused CSS" dropped from 254–387 KiB to 162 KiB, mobile lab LCP improved from 18.5s (pre-hero-fix baseline) to 6.9s, TBT stayed low (10–50ms).

**Verified no regression:** full page scroll-through post-change — hero, course cards, testimonials, FAQ, footer all rendered correctly with 70 individual (non-combined) stylesheet requests.

### What's left for a fully green Performance score

Not yet at 90+ on either mobile (61) or desktop (79). Per Lighthouse, the remaining cost is spread across:
- Render-blocking requests (~2.9s savings) — ~19 individual CSS files still block first paint, just no longer as one giant blob
- Unused CSS/JS (162 KiB / 202 KiB)
- Two oversized course-bundle thumbnail images (flagged separately, not touched — see prior doc)

The next lever is **Critical CSS** (LiteSpeed Cache's CCSS/UCSS feature): it inlines only the above-the-fold CSS per page and defers the rest, which is exactly what's needed here. **This requires enabling QUIC.cloud Online Services** — a third-party cloud integration (LiteSpeed's own SaaS, generates and serves the critical CSS) that consumes a quota and is a standing account-level configuration change, not a simple settings toggle. Not enabled without explicit sign-off — flagged to the user as a decision point rather than turned on unilaterally.

## Result

| Category | Mobile | Desktop |
|---|---|---|
| Performance | 61 | 79 |
| Accessibility | **97** ✅ | **97** ✅ |
| Best Practices | 96 ✅ | 96 ✅ |
| SEO | 100 ✅ | 100 ✅ |

3 of 4 categories green. Performance improved substantially (mobile lab LCP: 18.5s → 6.9s from the two changes combined) but needs Critical CSS (QUIC.cloud) to cross the 90 threshold — pending user decision.
