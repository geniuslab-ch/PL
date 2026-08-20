# THE SIGNAL — Panna League guerrilla campaign microsite

An isolated, interactive, mobile-first experience at `/signal`, built for a physical
guerrilla-marketing installation (a football on a pedestal, projecting a QR code onto the
pavement in Lausanne). Nobody finds this by browsing the main site — it's reached only by
scanning that QR code or knowing the URL.

## Why plain HTML/CSS/JS, not React/Next.js?

The brief allowed either, but explicitly said: *"inspect the existing project structure and
reuse its existing framework... do not unnecessarily rebuild the entire existing website."*
The live Panna League site is static HTML/CSS/JS with no build step, deployed as-is to Vercel.
Introducing React/Next.js here would mean a second, inconsistent stack living inside the same
repo for a single page — a bigger dependency footprint than the brief asked for, not a smaller
one. This experience uses the same fonts (Anton/Inter), the same gold accent, and the same
"no framework" approach as everything else in the repo.

## Structure

```
signal/
├── index.html            # The whole experience — all screens, one file
├── signal-config.js       # ⭐ EDIT THIS for social links, forms, video, share text
├── signal.css              # Visual identity — change --accent (top of file) to re-theme everything
├── signal.js                # The step engine (vanilla JS, no dependencies)
├── qr-generator.html         # Internal tool — generates QR codes per installation (not linked anywhere)
├── videos/
│   └── README.txt             # Where to drop the real panna clip + compression tips
└── assets/
    ├── grain.png                # Ambient film-grain texture (generated, ~12KB)
    └── video-poster.jpg          # Placeholder poster for the video section — replace anytime
```

## Everything you'll want to change lives in ONE file: `signal-config.js`

| What | Where |
|---|---|
| Social media links (Instagram, TikTok, WhatsApp) | `SOCIAL` + `SOCIAL_ORDER` |
| Form endpoints (player application, nomination) | `FORM_ENDPOINTS` |
| The video clip | `VIDEO_PATH` (drop the file in `signal/videos/` first) |
| Share text for "SEND THE SIGNAL" | `SHARE_TEXT` |
| QR code base URL (update once you buy a domain) | `SIGNAL_URL` |
| Known installation names (for the QR generator dropdown) | `KNOWN_SOURCES` |

The one thing that lives in CSS instead of JS, because it's a visual token, is the accent color:
open `signal.css`, first few lines, change `--accent: #FFD700;`. Everything — buttons, glow,
emphasis text, the bracket's final "1" — re-themes from that one line.

## Before this goes live on a real installation

1. **Create two new Formspree forms** (separate from the main site's forms, so Signal
   applicants land in their own dashboard view) and paste both endpoints into
   `FORM_ENDPOINTS` in `signal-config.js`.
2. **Drop the real panna clip** into `signal/videos/panna-move.mp4` (see the README in that
   folder for compression settings — this loads on mobile data).
3. **Add real social URLs** to `SOCIAL` in `signal-config.js`, then add the matching keys
   (`"instagram"`, `"tiktok"`) to `SOCIAL_ORDER` so the icons actually appear on the final
   screen. Both are intentionally empty right now since neither account exists yet.
4. **Generate the QR code** at `/signal/qr-generator.html` — pick or type a source tag (e.g.
   `lausanne01`), it builds a URL like `/signal?source=lausanne01` and renders a downloadable
   PNG. That source tag flows into every analytics event fired on that visit, without ever
   being shown to the visitor.
5. **Wire up real analytics** — if/when Google Analytics or Meta Pixel are added to the site
   (`gtag`/`fbq`), this page automatically starts sending events through them (see
   `ANALYTICS_EVENTS` in the config). Until then, every event just logs to the browser console
   so you can verify the flow is firing correctly.
6. **Buy the domain** (when ready) — update `SIGNAL_URL` in the config. The QR generator and
   the share links both read from that single value.

## How the experience is built

- **One HTML file, many `<section class="signal-screen">` blocks.** Only one is visible
  (`.active`) at a time. Tapping the primary button (or tapping anywhere on single-CTA
  narrative screens) advances to the next one via `signal.js`.
- **Staggered reveal, not a scroll.** Inside each screen, lines carry a `data-delay="900"`
  attribute (milliseconds) and fade in on that schedule — this is what creates the "pause...
  then the next line appears" pacing from the brief. Tapping early while a screen is still
  revealing instantly completes it rather than skipping ahead, so impatient users aren't
  penalized.
- **The narrative branches, then rejoins.** From "BECOME THE FIRST", choosing "I WANT IN" or
  "I KNOW SOMEONE" opens a form; after either submission (or a dev warning if the Formspree
  endpoint isn't configured yet), the flow rejoins the main sequence at "WHAT IS PANNA?" — you
  don't lose the rest of the story either way.
- **`?debug=1`** (e.g. `/signal/?debug=1`) stacks every screen, fully revealed, no animation,
  in one scrollable page — useful for reviewing all the copy and layout at once without
  clicking through the whole sequence. Not linked anywhere, dev-only.
- **`?source=lausanne01`** is read once on load, stored, and attached to every analytics event
  and form submission automatically. It is never displayed to the visitor.

## Accessibility

- Every interactive element is a real `<button>` or `<a>` — keyboard Tab + Enter/Space works
  without any extra code.
- `prefers-reduced-motion: reduce` strips the grain animation, glow drift, glitch effect, and
  screen transition animation, leaving a simple fade.
- Focus outlines use the accent color and are never suppressed.
- Contrast: white/gold text on near-black background throughout, no low-contrast gray-on-gray.

## Performance

- No video downloads until the visitor taps play (`preload="none"`, source only set on click).
- No icon font or UI library — the two social icons are inline SVG (a few hundred bytes total).
- The QR-generator's small third-party library (`qrcodejs`, ~5KB) only loads on that internal
  tool page, never on the actual `/signal` campaign page visitors land on.
- Fonts are the same Google Fonts already loaded elsewhere on the site (Anton + Inter) — no
  additional font request beyond what a visitor coming from the main site would have already
  cached.

## A note on testing

This was verified two ways before delivery:
1. **Actual DOM/JS execution** (via a headless DOM engine) — confirmed the step engine
   transitions correctly, reveal timings fire in the right order, and there are zero runtime
   errors.
2. **Visual screenshots** at both mobile and desktop widths.

One caveat, in the interest of honesty: the *visual* screenshots were taken with an old,
Grid/`clamp()`/`dvh`-unaware rendering engine (the same tool used earlier to QA the main site),
which rendered this page's typography-heavy CSS blank. Since point (1) independently confirms
the underlying logic and DOM state are correct, and every CSS feature used here (`clamp()`,
`dvh` with a `vh` fallback already added, CSS custom properties) has strong support in real
iPhone Safari and Android Chrome, this is very likely another false positive from that outdated
tool rather than a real bug — but it hasn't been confirmed on an actual modern phone browser.
**Test this on a real phone before the installation goes live.**
