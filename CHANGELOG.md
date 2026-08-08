# Changelog

## 2026-08-07
### Fixed
- **About page** — centered the "About CAMS PREP" text block in the About section. The section's outer Elementor container had a stray `Width: 89%` override with no auto-centering margin, so it hugged the left edge instead of spanning the section (left/right gaps were ~253px/410px). Reset to `Width: 100%` and published to production. Live at [camsprep.com/about](https://camsprep.com/about).
