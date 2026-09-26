# فناساخت — website

A static site: HTML, CSS, vanilla JS, with no build step and no external requests (the font is self-hosted).

```
index.html              Home page
assets/css/tokens.css   Design tokens (colors, type, spacing, motion)
assets/css/site.css     Components and sections
assets/js/site.js       Hero animation, document demo, problem brief, menu
api/                    Relay that posts problem briefs to Bale (Node server or Cloudflare Worker + setup guide)
assets/brand/           Logo variants + favicon (from the master logo image)
assets/fonts/           Estedad variable font (Arabic + Latin subsets)
DESIGN_SYSTEM.md        Design system documentation
```

## Run locally

```bash
cd ~/fanasakht-web
python3 -m http.server 8765
# open http://localhost:8765
```

## Deploy

Publish **only** `index.html` and the `assets/` folder to the static host (nginx, a CDN or object storage). Nothing needs to be built.

**Never upload the rest of this folder to the public site.** `api/.env` holds the Bale bot token, and the `.md` files are internal notes. The relay in `api/` runs separately on a server (see `api/README.md`).

## Before launch

- Contact is the «مسئله شما چیست؟» problem brief, sent automatically to the owner's private Bale chat by the bot through the relay in `api/`. Before launch: run the relay on a server, and set `PUBLIC_BRIEF_ENDPOINT` in `assets/js/site.js` to the public address. Full steps: `api/README.md`.
- Replace the raster logo files in `assets/brand/` with vector originals if available.
- The extraction table in the مناقصه‌بان section is labelled as demo data. Keep that label unless it's replaced with real output.
