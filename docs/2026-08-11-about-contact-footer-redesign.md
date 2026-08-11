# About Us, Contact Us, and site-wide footer: professional visual redesign

**Date:** 2026-08-10 to 2026-08-11
**Scope:** `/about/` (post 3996), `/contact/`-equivalent page (post 4959, "Contact Us"), and the "Main Footer" Elementor theme-builder template (post 26, applies site-wide). All three are live.

## Problem

All three areas were functional but visually unpolished:

- **About Us** was a single Elementor Text Editor widget containing the entire page as one long, undifferentiated block of paragraphs — no visual hierarchy, no stat callouts, no imagery beyond the hero, the founder section had no photo despite one already existing on the page (in the separate "Meet the Team" section further down).
- **Contact Us** had the same wall-of-text problem: three separate inquiry types (general support, partnerships, speaking/media) were plain stacked paragraphs, and two "Learn more →" / "View profile →" call-outs were bolded text with no actual link.
- **Footer** (shared across every page): icon-list links were cramped (5px between items) with no hover feedback; the ElevenLabs Grants recognition badge (an `<img>` in a raw HTML widget) sat directly on the dark-blue background with no framing, oversized at 250px, looking like a broken/unstyled element rather than a badge; the bottom copyright bar had ~0px vertical padding.

## Change

All edits were made directly in the Elementor editor (Code/HTML view for the two Text Editor widgets, native widget Style controls + one small custom-CSS/HTML tweak for the footer) — no new pages or plugins, no changes to page/section order. Design system used throughout: brand blue `#033E8A`, light blue-tint panels (`#F5F9FE` / border `#E1EBF7`), consistent card/pill radii, small inline SVG line-icons (Feather-style, MIT-license-pattern paths), and a `<style>` block scoped per-widget for hover states (translate/shadow on card hover, color/background transitions on links and buttons).

**About Us** (`backups/2026-08-10-about-page-text-widget.html` holds the pre-edit HTML):
- 4-card stat bar (2,000+ professionals, 20,000+ community, 800+ flashcards, founded 2021), each with an icon badge
- Founder section: added Rezaul Karim's photo (reused from the team section) beside his bio, plus CAMS/ICA/CCI credential pill badges
- Mission statement restyled as a pull-quote
- The two bullet lists (resources included / what we help with) converted to a checkmark-icon list
- Alternating tinted panels with a top accent border break the page into scannable sections, each with a small uppercase "eyebrow" label
- ACAMS disclaimer restyled as a muted note box with an info icon
- Closing "Contact CAMS Prep" block restyled as a blue CTA card with an email button

**Contact Us** (`backups/2026-08-11-contact-page-text-widget.html` holds the pre-edit HTML):
- The three inquiry types (General & Learner Support, Partnerships, Speaking/Media) became a 3-column card row, each with an icon badge, eyebrow label, and a dedicated `mailto:` button with a pre-filled subject line
- Speaking/Media card gained Rezaul's photo/name/role and a **working** link to his profile page (previously unlinked bold text)
- "About CAMS PREP" summary condensed into a tinted panel with a **working** "Learn more →" link to `/about/` (previously unlinked bold text)
- "Important Note" disclaimer restyled to match the About page's muted-box treatment
- The Calendly booking embed and the icon-based "More Ways to Reach Us" contact list (separate widgets, not touched) are unchanged in position

**Footer** (Elementor Theme Builder → "Main Footer", template ID 26):
- Icon List widgets (Quick Links / Resources / Bundles columns): space-between increased 5px → 14px; link color set to translucent white at rest, brightening to full white on hover with a transition (native widget Style controls, copied across all three columns via Elementor's Paste Style)
- Added a 1px translucent-white right border on the logo column as a divider from the link columns
- ElevenLabs Grants badge (raw HTML widget): wrapped in a bordered, translucent card (`rgba(255,255,255,0.06)` background, hover-brightens) and resized 250px → 180px so it reads as a badge rather than an oversized, unframed logo mark
- Bottom copyright bar: added 16px vertical padding (was ~0px)

## Verification

Checked in the Elementor editor at desktop and mobile breakpoints before publishing each item — stat/inquiry cards reflow to full-width single column on mobile, founder photo stacks above the bio text, footer columns stack centered with full-width buttons. All three were published live by the site owner following review.

## Not changed

- Section order/layout on About and Contact (per explicit instruction — "Meet the Team" on About, and the Calendly + icon-contact-list sections on Contact, are untouched)
- Copy/wording — only presentation changed, except turning two previously-unlinked "→" call-outs into real links and adding subject lines to the new Contact page mailto buttons
- The "Meet Our Team" section still shows only 2 of 4 members' photos loading correctly on some page loads (Rakib Khan's and Daniel Kwayil's images render fine in the Elementor editor but were seen missing on the live front-end in an earlier session) — this predates this work and is unrelated to it; likely a LiteSpeed lazy-load interaction (see prior sessions' lazy-load notes in this changelog). Worth a follow-up if it recurs.
