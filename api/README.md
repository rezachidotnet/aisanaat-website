# Problem brief → Bale

When a visitor presses «ارسال مسئله», the brief arrives **automatically** in the owner's private Bale chat. The visitor doesn't copy or paste anything.

```
site (assets/js/site.js) ──POST──▶ relay (worker.js) ──▶ Bale bot API ──▶ your Bale chat
```

The relay exists so the bot token never appears in the website's code. The same logic runs two ways:
- `server.js`: a plain Node server (Node 18+, no dependencies). Use it on any VPS, including one inside Iran.
- `worker.js` on Cloudflare Workers (`wrangler.toml`).

**Recommended: a server inside Iran (`server.js`).** Bale is an Iranian service and its API is reliably reachable from inside Iran. It may restrict requests from servers abroad, where Cloudflare runs.

If sending ever fails, the page keeps the visitor's answers and lets them retry. The visitor only gives a phone number, and the owner's contact details are never shown on the site.

## 1. Create the bot (owner, ~2 minutes)

1. In Bale, open **@botfather** → create a new bot (e.g. `fanasakht_brief_bot`) → copy the **token**.
2. Open your new bot and press **Start** (send it any message). A bot can only message people who have started it.

## 2. Connect it

1. Copy `api/.env.example` to `api/.env` and put the token after `BOT_TOKEN=`. `.env` is secret: never publish it.
2. Find your **chat id**: open `https://tapi.bale.ai/bot<TOKEN>/getUpdates` and copy the number from `"chat":{"id":…}`. Put it after `CHAT_ID=`.
3. Test locally:
   ```bash
   node api/server.js                      # relay on http://localhost:8787/api/brief
   python3 -m http.server 8765             # the site, in another terminal
   ```
   Open http://localhost:8765 (or from a phone on the same Wi-Fi: http://10.101.176.20:8765; add that origin to `ALLOWED_ORIGIN`), fill in «مسئله شما چیست؟», and press «ارسال مسئله». The message should arrive in your Bale within seconds.

## 3. Go live

1. Run `node api/server.js` on the server (e.g. with `systemd` or `pm2`) and put it behind the site's domain, e.g. `https://fanasakht.ir/api/brief` (an nginx `location /api/brief { proxy_pass http://127.0.0.1:8787; }`).
2. In `api/.env`, set `ALLOWED_ORIGIN=https://fanasakht.ir`.
3. In `assets/js/site.js`, set `PUBLIC_BRIEF_ENDPOINT` to the public address (e.g. `"https://fanasakht.ir/api/brief"`). While it's empty, the page looks for the relay on its own host, port 8787.

(Cloudflare alternative: `npx wrangler secret put BOT_TOKEN`, `npx wrangler secret put CHAT_ID`, `npx wrangler deploy`, then use a custom route, not `*.workers.dev`, which is often filtered in Iran.)

## What the relay does

- Accepts `POST` only from `ALLOWED_ORIGIN` (comma-separated list).
- Silently drops submissions that fill the hidden honeypot field (spam bots).
- Trims every field to a length limit, requires a problem (≥12 characters), and requires a valid Iranian phone number (Persian digits, spaces and +98 accepted; stored as `09…`).
- Sends plain text, so visitor input can't inject formatting or links.
- Rejects bodies over 20 KB (`server.js`).
