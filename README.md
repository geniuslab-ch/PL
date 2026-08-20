# Panna League — Website

Bilingual (FR/EN) marketing site for **Panna League**, a 1v1 street-football event launching in Lausanne, Switzerland.

🔗 Live: [panna-league.vercel.app](https://panna-league.vercel.app)

---

## Structure

```
PL/
├── index.html          # Homepage — FRENCH (default)
├── club.html            # Club/venue partnership page — FRENCH
├── register.html        # Standalone player registration — FRENCH
├── privacy.html          # Privacy policy — FRENCH
├── 404.html              # Custom bilingual 404 page
│
├── en/                    # Full English version (mirrors root)
│   ├── index.html
│   ├── club.html
│   ├── register.html
│   └── privacy.html
│
├── styles.css            # Single shared stylesheet (both languages)
├── script.js               # Form validation, nav, submission handling
│
├── logo.png                # Main logo (referenced as /logo.png everywhere)
├── favicon.ico
├── assets/
│   ├── logo-nav.png       # Small logo for nav/favicon
│   ├── apple-touch-icon.png
│   └── og-image.jpg       # Social share preview image
│
├── robots.txt
└── sitemap.xml
```

**Language routing:** French is the default site at the domain root. English lives under `/en/`. Every page has a language switcher in the nav (🇬🇧 EN ↔ 🇫🇷 FR) linking to its counterpart. All CSS/JS/images are shared via root-relative paths (`/styles.css`, `/logo.png`, etc.) so they resolve correctly from both `/` and `/en/`.

---

## Deploy

### Vercel (current host)
This repo deploys as-is — no build step needed (static HTML/CSS/JS).
1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Other**
3. Root directory: `/`
4. Deploy

### GitHub Pages (alternative)
1. Push to `main`
2. Repo Settings → Pages → Source: `main` branch, `/ (root)`
3. Site goes live at `https://<username>.github.io/<repo>/`
   - Note: if using a GitHub Pages *project* site (not a custom domain), root-relative paths (`/styles.css`) will break unless you either use a custom domain or add a `<base href="/<repo-name>/">` tag. Vercel with a custom/preview domain does not have this issue.

---

## Forms

Both the player registration form and the club partnership form are **not yet wired to a backend** — they currently just show a success message client-side (see `script.js`).

**Recommended:** [Formspree](https://formspree.io) — create a "Dashboard Project," create one form per use case, then add the form's endpoint as the `action` attribute on:
- `<form class="player-form" id="playerForm">` (on `index.html`, `register.html`, and their `/en/` counterparts)
- `<form class="partnership-form" id="partnershipForm">` (on `club.html` and `/en/club.html`)

Example:
```html
<form class="player-form" id="playerForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Do this in **all 8 HTML files** where the relevant form appears (4 FR + 4 EN) — field names (`first_name`, `email`, `phone`, etc.) are identical across languages so no JS changes are needed.

---

## Before going live — replace/verify

- [ ] Formspree endpoints added to both forms, in both languages
- [ ] Analytics IDs (Google Analytics / Meta Pixel / TikTok Pixel) — placeholders are commented out in each `<head>`/before `</body>`
- [ ] Event date, venue, and price — currently "Coming soon" / "À confirmer" by design (demand validation phase)
- [ ] Instagram link — not yet created, currently omitted from the site

---

## Contact
`pannaleague@mycountryisgoodat.com`

---

## Hidden campaign microsite — `/signal`

There's an isolated guerrilla-marketing experience at `/signal`, built for a physical QR-code
installation in Lausanne ("THE SIGNAL" campaign). It is intentionally **not linked from anywhere**
on the main site and is excluded from the sitemap and `robots.txt` — it should only be reached by
scanning a QR code or knowing the URL directly.

- Full docs: `signal/README.md`
- Everything editable (social links, form endpoints, video, share text, accent color) lives in
  `signal/signal-config.js` and the `--accent` CSS variable at the top of `signal/signal.css`.
- Internal QR-code generator (also unlinked): `/signal/qr-generator.html`
