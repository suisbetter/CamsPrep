<div align="center">

# CamsPrep

**The working repo behind [camsprep.com](https://camsprep.com)** — CAMS certification study bundles and mock tests.

*Brand source of truth · the changelog the live site doesn't have*

</div>

---

> [!IMPORTANT]
> **There's nothing here to run.** camsprep.com is a hosted WordPress install, and every change gets made by hand in WP Admin — Rank Math, WPCode, LiteSpeed, Elementor, WP Ghost, Tutor LMS. This repo doesn't build and it doesn't deploy.

So what is it for? Two things now.

There's the **brand PDF**, the final word on names, prices and voice. And there's the **handoff doc**, which exists because the live site keeps no history of its own — if we don't write down what changed, nobody knows. An earlier version of this repo also carried a static mirror of the rendered front end; it's gone now, so every claim about the live site has to be checked against the live site, not a local copy.

> [!NOTE]
> **Start with `HANDOFF-2026-08-04.md`.** It replaces every earlier handoff and fix-log in this repo's history. If an older commit's docs disagree with it, trust the handoff — a full 11-stream audit found that roughly half of what those older docs claimed was "done" had never actually reached production.

---

## What's in here

```
CamsPrep/
├── CAMS_Prep_Complete_Brand_Source_of_Truth.pdf
├── HANDOFF-2026-08-04.md   # ← read this first
└── README.md
```

| File | Why you'd open it |
| :--- | :--- |
| **`HANDOFF-2026-08-04.md`** | The resume point. The full audit findings, the four confirmed root causes for why fixes silently don't ship, what's actually live and verified, and what's next. |
| **`CAMS_Prep_..._Source_of_Truth.pdf`** | Anything a customer will see gets checked against this first. |

---

## How to work on it

**1. Log into WP Admin, and confirm it took.**
The site runs WP Ghost, which hides the login URL and quietly bounces unauthenticated `/wp-admin/` requests to the homepage instead of showing a login form. You can spend a while thinking you're logged in when you aren't.

**2. Check it against the brand PDF.** Then snapshot, then change.

**3. Verify from outside the admin, every single time.**

```js
fetch(url, { cache: 'no-store', credentials: 'omit' }).then(r => r.text())
```

> [!WARNING]
> A "saved" toast is not proof. A full audit found that roughly **half** of the fixes logged as done in this project's history had never actually reached production — the save looked clean in wp-admin and the live response never moved. **If you didn't see it in a fresh guest response, it didn't happen.** See `HANDOFF-2026-08-04.md` for the four confirmed reasons this keeps happening.

**4. Write it up and commit right away.** Files have gone missing from the working directory mid-session before.

---

## Things that will bite you

**WPCode's save button fails silently sometimes.**
A snippet can save, show the new code in the editor, and never change the live response — confirmed via `curl`, bypassing the browser entirely. Hard-reload the edit page and re-read the code before you believe it; if it still won't stick, it needs to go in an actual file, which needs FTP access this project doesn't currently have.

**LiteSpeed's "Purge All" doesn't reliably reach the QUIC.cloud edge.**
Use `Purge By → URL` and check for `x-qc-cache: miss`. There are two separate cache layers, the plugin and the CDN — proving one is clear tells you nothing about the other. Default cache TTL is now 1 day, not 7 — still purge and verify, don't just wait it out.

**`robots.txt` and `llms.txt` are both blocked by physical files already on disk.**
Rank Math has working editors for both, but a real file at the server root wins over its dynamic generation every time, and Rank Math only warns about this for `robots.txt` — the `llms.txt` panel will let you configure and save a change that silently never ships, with no warning at all. Confirmed directly: the setting persisted, the live file didn't move a byte. Needs the physical files deleted via FTP/file manager, or a hosting support ticket — not fixable from wp-admin.

**Elementor stores content in two places, and they can disagree.**
`post_content` (what WordPress's native revisions track) and `_elementor_data` (what Elementor actually renders from) can desync after a scripted edit. Restoring a native revision only fixes the first one — the page can look reverted and then silently un-revert the next time anyone opens it in Elementor. There's no resync tool in this Elementor install. If a page is in this state, it needs database access or a human retyping the content live in the editor — not another automated pass.

**Rank Math's raw-JSON Schema Builder can hang the page outright.**
For fields the normal UI won't give you, use a WPCode output-buffer snippet that rewrites the rendered JSON-LD instead (once you've confirmed WPCode is actually taking effect — see above).

**Theme File Editor is switched off and there's no FTP.**
This is the root blocker behind most of the above. Anything needing a genuine file-level fix — a template edit, an `mu-plugins` drop-in, deleting the `robots.txt`/`llms.txt` leftovers — is stuck until someone grants file-system access or opens a hosting support ticket.

---

## A few hard lines

🚫 **Don't invent structured data.** No `AggregateRating` without real reviews, no `sameAs` pointing at accounts that don't exist, no made-up `priceValidUntil`. If a value can't be verified, it doesn't ship.

❓ **When the facts conflict, ask.** Two different course durations, a discount that might or might not be a real promotion, whose name belongs on the author byline — don't pick the plausible one. (The site currently disagrees with *itself* on the CAMS passing score, across two live pages — see the handoff.)

🛑 **URL consolidation and 301s need sign-off.** Show the full mapping first. Those are the changes you can't quietly undo. The one batch that's shipped so far went through this process; anything further gets the same treatment.

🔒 **An inaccessible login is where work stops.** It's not a puzzle to solve.

---

## Licence, or the lack of one

There isn't one, on purpose. **All rights reserved.** This is proprietary brand material and internal notes, not something offered for reuse.

> [!CAUTION]
> The handoff doc carries plugin/snippet IDs, WordPress post IDs, and a real person's name. If this repo is public, that's worth a decision rather than a default.
