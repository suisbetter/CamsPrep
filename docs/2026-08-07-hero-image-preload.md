# Hero image optimization — PageSpeed audit

**Date:** 2026-08-07
**Page:** Homepage (`camsprep.com`), hero section (Elementor Custom HTML widget "CAMS PREP Responsive Hero v3", post ID 42)

## Evidence

PageSpeed Insights (mobile, [pagespeed.web.dev](https://pagespeed.web.dev)):

- Performance: **46** (red)
- LCP: 18.5s lab / 4.7s field (red) — LCP element is the hero photo
- TTFB: 2.7s field (red)
- Lighthouse "LCP breakdown" for the hero `<img>`: TTFB 130ms, resource load delay 250ms, resource load duration 350ms, **element render delay 1,790ms**

Existing hero markup (already in place before this change):

```html
<picture class="cp-hero__media">
  <source media="(max-width:767px)" srcset="/wp-content/uploads/2026/07/camsprep-hero-photo-v2-mobile.webp" fetchpriority="high">
  <img fetchpriority="high" src="/wp-content/uploads/2026/07/camsprep-hero-photo-wide-mirror.webp"
       alt="Team of AML compliance professionals in front of a global city skyline"
       width="2401" height="947" loading="eager" importance="high" decoding="auto"
       class="skip-lazy" data-no-lazy="1" draggable="false">
</picture>
```

Desktop hero file: `camsprep-hero-photo-wide-mirror.webp`, 2401×947, **152 KB** (measured via Resource Timing API).

## Assessment

The hero image was already in good shape: WebP format, dedicated mobile source via `<picture>`, `fetchpriority="high"`, `loading="eager"`, excluded from lazy-load (LiteSpeed's Viewport Images/VPI feature already treats it as above-the-fold). Confirmed by Lighthouse's own "Improve image delivery" audit (414 KiB estimated savings) — it does **not** flag the hero image at all. It flags two unrelated course-bundle thumbnails on the homepage (`ultimate-cams-exam-bundle...png.webp`, `advanced-cams-learner-bundle...png.webp`) that are serving 1672×936 for a 641×360 display box — a separate fix, out of scope for this change.

The one legitimate gap: **no `<link rel="preload">`** for the hero image. `document.querySelectorAll('link[rel="preload"]')` returned empty on the live page.

The bigger blocker to a fully green Performance score is **not** the image: Lighthouse's #1 opportunity is "Render-blocking requests" (est. 3,690ms savings) and "Minimize main-thread work" (3.7s) — CSS/JS blocking paint, which is why "element render delay" (1,790ms) dominates the LCP breakdown even though the image itself loads in ~600ms. That's a separate, larger effort (CSS/JS delivery) not addressed here.

## Change made

Added a `wp_head` preload hint for the hero image, scoped to the front page only, matching the existing `<picture>` breakpoint (mobile source below 768px, desktop source at/above):

```php
add_action( 'wp_head', function () {
    if ( ! is_front_page() ) {
        return;
    }
    ?>
    <link rel="preload" as="image" fetchpriority="high"
          media="(max-width: 767px)"
          href="https://camsprep.com/wp-content/uploads/2026/07/camsprep-hero-photo-v2-mobile.webp">
    <link rel="preload" as="image" fetchpriority="high"
          media="(min-width: 768px)"
          href="https://camsprep.com/wp-content/uploads/2026/07/camsprep-hero-photo-wide-mirror.webp">
    <?php
}, 1 );
```

Implemented as a WPCode PHP snippet ("Run Everywhere", front-page-gated internally — consistent with the existing snippets in this install, e.g. "Fix 429", "SES Configuration Set Routing").

## Result

PageSpeed Insights re-run immediately after deploy + LiteSpeed front-page cache purge (lab data, single run — expect some run-to-run variance):

| Metric (mobile, Slow 4G lab) | Before | After |
|---|---|---|
| Performance score | 46 | 59 |
| LCP (lab) | 18.5 s | 7.4 s |
| Total Blocking Time | 420 ms | 10 ms |
| LCP element render delay | 1,790 ms | 300 ms |

| Metric (desktop lab) | After |
|---|---|
| Performance score | 80 |
| Accessibility | 85 |
| Best Practices | 96 |
| SEO | 100 |

Field data (CrUX 28-day rolling average) will take time to reflect the change — it wasn't expected to move immediately.

**Not yet green:** Mobile Performance (59) and Desktop Performance (80) are both improved but not at 90+. The dominant remaining cost, per Lighthouse, is render-blocking CSS/JS ("Render-blocking requests," ~2.7s savings) and unused CSS/JS (Elementor + page builder overhead) — not the hero image. That's a separate, larger effort (critical CSS / defer non-essential JS) outside the scope of this change.

**Untouched, flagged for later:** the "Improve image delivery" audit (414 KiB) points at two course-bundle thumbnail images (`ultimate-cams-exam-bundle...webp`, `advanced-cams-learner-bundle...webp`) serving 1672×936 into a 641×360 box — not the hero. Worth a follow-up pass.
