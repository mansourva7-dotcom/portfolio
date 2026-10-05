# Mansour Mohamed Saad — Video Editor & Reels Creator (Portfolio)

Premium one-page portfolio. Static HTML/CSS/JS — no build step, no dependencies, no framework lock-in. Deploys anywhere static files are served.

## Project structure

```
├── index.html                  # The whole page (semantic, SEO-ready)
├── robots.txt                  # Search engine rules
├── sitemap.xml                 # Sitemap (update domain after going live)
├── _headers                    # Security + caching headers (Netlify format)
└── assets/
    ├── css/style.css           # Full design system (tokens at :root)
    ├── js/config.js            # ★ YOUR INFO: phone, WhatsApp, socials, domain
    ├── js/portfolio-data.js    # ★ YOUR VIDEOS: add/edit projects here
    ├── js/player.js            # Portfolio grid + in-page video modal
    ├── js/main.js              # Nav, mobile menu, reveals, socials wiring
    ├── posters/                # Video thumbnails (placeholders for now)
    └── img/                    # Portrait placeholder, favicon, OG cover
```

## How to add a new video (no rebuild, no code knowledge needed)

1. Upload the video file to your **video CDN / object storage** — e.g. Cloudflare R2,
   Bunny Stream, or Backblaze B2 + CDN. Never upload large videos to the web host.
2. Upload a 9:16 poster image (WebP, ~720x1280) to the same place.
3. Open `assets/js/portfolio-data.js` and copy any existing block:

```js
{
  title: "My New Reel",
  category: "Reels",
  description: "One short line about the video.",
  poster: "https://your-cdn.com/posters/my-reel.webp",
  video: "https://your-cdn.com/videos/my-reel.mp4"
}
```

Save, deploy — the card appears automatically in the grid AND in the player.

## How to update your info / social links

Open `assets/js/config.js` — everything is in one place: phone, WhatsApp message,
social URLs, domain, analytics ID. Social icons render automatically in both the
contact section and the footer. Leave a URL empty to keep a "coming soon" placeholder.

## Video architecture (high-traffic ready)

- Thumbnails load lazily with fixed dimensions (no layout shift).
- The actual video file is requested **only when a visitor opens it**
  (`preload="metadata"`, source attached on demand, released on close).
- Videos stream from your CDN, so the web server only serves tiny HTML/CSS/JS.
- Recommended video settings: MP4 (H.264), 1080x1920, ~8-12 Mbps, under 30 MB per reel.

## Deployment

**Netlify / Vercel / Cloudflare Pages / GitHub Pages** — drag the folder or connect the repo.
HTTPS, CDN, and custom domain (e.g. mansourmohamedsaad.com) come free on all of them.

After going live:
1. Replace `https://www.mansourmohamedsaad.com` with your real domain in
   `index.html` (canonical + Open Graph), `sitemap.xml`, and `robots.txt`.
2. `_headers` is already configured (security headers + 1-year caching for assets).

## Analytics (optional)

Paste a Google Analytics 4 measurement ID into `analyticsId` in `config.js`.
While it's empty, zero tracking scripts are loaded.
