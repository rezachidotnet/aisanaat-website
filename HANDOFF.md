# HANDOFF: فناساخت website (resume from here)

Written 2026-09-25. Read this whole file before touching anything. It's self-contained, so you don't need to ask the owner anything to continue.

---

## 1. What this project is

- **فناساخت** (Fanasakht) is the owner's industrial-technology company. It builds technology for real industrial and business problems.
- **مناقصه‌بان** (Monaghese Ban) is its *first solution*: an AI tender-management system. Its code and specs live in `~/tender-ai` (see `~/tender-ai/docs/00_PROJECT.md`, `04_AGENT_SPEC.md`, `05_TENDER_PIPELINE.md`, `11_PROGRESS.md`).
- **Rule: فناساخت ≠ مناقصه‌بان.** The website is about the company; مناقصه‌بان appears as a case study only.
- **Don't confuse it with Faza Sazeh (فضاسازه)**, the owner's *other* company (space-frame structures). Its navy+yellow logo files are in `~/Downloads` («لوگو پشت سفید.jpg», «لوگو.png.jpeg»). They are **not** فناساخت.

## 2. Where everything is

```
~/fanasakht-web/
  index.html              Single home page (Persian, RTL)
  assets/css/tokens.css   Design tokens: colors, type scale, spacing, motion. Font = Estedad
  assets/css/site.css     All components + sections + responsive rules
  assets/js/site.js       Menu, contact email, hero animation, click-to-read document demo
  assets/brand/           Logo variants cut from the master logo (see §4)
  assets/fonts/           Estedad-arabic.woff2, Estedad-latin.woff2 (self-hosted, variable 100–900)
  DESIGN_SYSTEM.md        Design system doc. OUT OF DATE, see §7 task 1
  README.md               Run/deploy notes. Mentions Vazirmatn, which is outdated
  HANDOFF.md              This file
```

Static site: no build step, no npm, no framework, no external requests. Deploy by uploading the folder.

**Preview:** `cd ~/fanasakht-web && python3 -m http.server 8765`, then open http://localhost:8765. A server may already be running on 8765 from the previous session. If the port is busy, it's that server, so just open the URL.

## 3. The owner's brief (condensed, but every requirement is here)

Direction: **minimal + industrial + intelligent + premium**. Calm, precise, confident. The visitor should feel: "these people understand technology deeply and build serious systems." Final feeling, in order: «این یک شرکت معمولی نرم‌افزاری نیست.» → «این‌ها صنعت را می‌فهمند و فناوری را بلدند.» → «این‌ها می‌توانند برای مسئله واقعی من یک سیستم بسازند.» The design should say this without stating it.

Must NOT feel like: a generic AI startup, a SaaS template, an outsourcing shop, a traditional industrial company, sci-fi, crypto/Web3, or an ad agency.

- **No AI clichés:** no robots, glowing brains, neural-net stock art, particles, holograms or circuits. Show intelligence through structure, geometry, systems, connections, data flow and precise motion.
- **No industrial stock photos** (factories, helmets, refineries). Show industry through engineering grids, schematics, rulers, measurements and flow diagrams.
- **Colors:** Deep Navy `#0B1F33`, Technology Blue `#1677FF` (accent only), White, cool grays. Mostly white/light gray/navy. No unrelated colors.
- **Typography:** a modern Persian face, large and confident, strong hierarchy, lots of whitespace.
- **Minimalism:** no card grids, heavy borders, shadows, rounded containers, decorative icons or glassmorphism.
- **Motion:** subtle and purposeful, like "a system thinking". No constant floating, parallax or flashy transitions.
- **Logo:** use it as-is, never redesign it. Primary = blue mark + navy wordmark; also symbol-only, white-on-dark and mono versions. The mark may be used *subtly* as a building block.
- **Required sections:** Hero (big statement, short text, one primary + one secondary CTA, intelligent visual: Problem → Intelligence → Solution → Growth) · Growth (Understand → Intelligence → Automation → Execution → Growth, shown visually) · Solutions as a *system of capabilities* tied to real problems (AI Agents, Intelligent Automation, Document Intelligence, Data & Knowledge Systems, Decision Support, Industrial Software, Business Intelligence) · مناقصه‌بان as a case study (Problem / Intelligence / Solution / Human; diagram Tender → Documents → Extraction → Understanding → Company Knowledge → Analysis → Decision Support) · "How we think" («از فناوری شروع نمی‌کنیم، از مسئله شروع می‌کنیم»; Problem → Process → Data → Intelligence → Technology → Solution → Growth).
- **Personality:** "We are builders." Not "we sell AI", not consultants, not web developers.
- **CTA examples:** [ آشنایی با راهکارها ] [ مسئله شما چیست؟ ]
- **Design system** must be documented in the project so future pages (Solutions, Case Studies, About, Insights, Contact) match.
- **Responsive:** redesigned for tablet and mobile, not just shrunk.

Owner preferences (from memory, apply them):
- **Decide and show finished work.** Don't ask craft or design questions. The owner judges the result.
- **English words stay in Latin script** in Persian text (SETAD, OCR, Word, AI Agents). Never transliterate them.
- The owner has **no GPU**. Network goes through a proxy at `127.0.0.1:12334` (npm and PyPI work directly; Node needs `NODE_USE_ENV_PROXY=1` for other traffic).

## 4. Logo

- Master file: `~/Downloads/ChatGPT Image Sep 25, 2026, 09_17_26 PM.png` (1254×1254 raster, white background). It contains the stacked blue chevron mark, the navy wordmark «فناساخت», and the tagline «فناوری برای ساختن آینده صنعت».
- Cut into `assets/brand/`: `logo.png` (primary), `logo-white.png` (white wordmark for navy backgrounds), `logo-full.png`, `mark.png`, `mark-white.png`, `favicon.png`, `apple-touch-icon.png`. The background was removed with a color-to-alpha script (numpy + Pillow).
- System `python3` has no Pillow/numpy and `python3-venv` is missing. Use **`~/miniconda3/bin/python`**, which now has pillow + numpy installed.
- The tagline is the hero H1. The simplified chevron `<symbol id="chev">` in `index.html` is the only UI use of the mark (section divider marker), and the hero animation resolves into the two chevrons.

## 5. Current page structure (index.html)

1. **Header:** logo, nav (رویکرد · راهکارها · مناقصه‌بان · رشد), a small primary button «مسئله شما چیست؟». Collapses to a menu at ≤760px.
2. **Hero:** H1 «فناوری برای ساختن / آینده صنعت», all navy with no colored phrase. A lead paragraph and two buttons. Beside it an SVG system visual (`#viz`, built in `site.js`): 52 scattered points on an engineering grid, then links form, then 22 points settle into the logo's two chevrons, then blue strokes plus a «رشد» arrow. It runs **once** (~7s) when visible, then holds. Below it a phase list (مسئله — هوش — راه‌حل — رشد) and an «اجرای دوباره» replay button. This is the page's **one orchestrated motion moment**.
3. **Approach `#approach`:** H2 «ما از فناوری شروع نمی‌کنیم.» plus a light-weight second line «از مسئله شروع می‌کنیم.». A 7-step chain with Persian numerals (it's a real sequence). A two-column note underneath.
4. **Solutions `#solutions`:** capability ↔ problem map as rows, not cards: Persian name + small Latin name, a connector, the problem + outcome. Hover lights the connector. No numbers (the capabilities aren't a sequence).
5. **Case `#case` (navy section):** «مناقصه‌بان» + «در حال توسعه» tag. Four columns مسئله/هوش/راه‌حل/انسان. A static 7-node pipeline (node 5 «دانش شرکت» is dashed = second input, node 7 solid blue). A document → structured-rows demo **triggered by the button «خواندن سند را ببینید»** (then «دوباره بخوان»). The rows show requirement, envelope, source («صفحه ۴، بند ۲-۱»), and status marker. It's labelled as demo data.
6. **Growth `#growth`:** H2 about leverage. A step chart of 5 narrow hatched columns rising to one solid blue «رشد» column, with a vertical axis label «اهرم». Three notes: زمان / دقت / دانش.
7. **Contact `#contact`:** display H2 «مسئله شما چیست؟» and a guided problem brief: three questions (مسئله/فرایند/داده) + name + phone number (validated), a live "system sketch" that fills as they type, and keyword-matched related capabilities. «ارسال مسئله» POSTs to the relay (`api/`), which posts it to the owner's Bale; on failure the answers stay and the visitor can retry.
8. **Footer (navy):** white logo, tagline, nav, «© ۱۴۰۵ فناساخت», and the owner's Bale link + phone.

Every section starts with a `.ruler` divider (chevron + measuring-tape tick line). It has no labels and no section numbers.

## 6. What was done in the last pass (frontend-design plugin critique)

The owner installed the plugins **frontend-design**, **superpowers** and **claude-code-setup** (`~/.claude/plugins/cache/claude-plugins-official/`). The frontend-design `SKILL.md` lists "templated AI page" tells. Changes made:

| Removed tell | Replacement |
|---|---|
| One phrase colored blue in the H1 | All-navy H1 |
| UPPERCASE monospace labels (PROBLEM, SYSTEM FLOW, NODES 52, a footer word string with middle dots) | Deleted. `--mono` token and `.mono` class removed; Latin names use class `.ltr` in Estedad |
| Section eyebrow + ۰۱–۰۵ numbers above each heading | `.ruler` divider only |
| Numbers on non-sequential items (capabilities) | Removed; kept on real sequences (chain, pipeline, growth, contact steps) |
| `←` on buttons | Removed |
| Fade-up reveal on every block, looping pipeline packet, bars/lines animating on scroll | All removed. Only the hero animation auto-plays; the document demo runs on click |
| Middle-dot meta strings | Plain Persian with commas |
| Vazirmatn (default Persian font) | **Estedad** (geometric, closer to the wordmark), one family for the whole site |

Verified in Chrome after the pass: no console errors, and hero, approach, solutions, case header, the document demo click and the growth chart all render correctly on desktop (1553px).

## 7. Remaining tasks

> **Status 2026-09-25 (later the same day): tasks 1–5 below are DONE.** DESIGN_SYSTEM.md was rewritten and README fixed. Verified: the pipeline and contact/footer on desktop, and 390px + 800px with no horizontal overflow (the H1 first line is 310px in a 343px column). Also a full 390px capture of every section, and the memory file updated. Only the owner-supplied items at the end of this section remain. The task list is kept below for reference.

1. **Rewrite `DESIGN_SYSTEM.md` to match the current code.** It still describes the old version: Vazirmatn, monospace labels, `.shead` with index + label, numbered capabilities, reveal animations, a looping pipeline packet, `←` on buttons, and "section index ۰۱". Update the Typography (Estedad, `.ltr` for Latin), Components (`.ruler` in place of `.shead`, button without arrow, `.btn--small`), Motion (only the hero auto-plays, the document demo is click-to-play, no reveals) and Logo sections. Add a short "Avoid" list from §6 so future pages don't bring the tells back.
2. **Fix `README.md`:** replace "Vazirmatn variable font" with "Estedad variable font (Arabic + Latin subsets)".
3. **Verify what wasn't re-checked after the last pass** (the Chrome screenshot timed out):
   - Pipeline section (`.pipe`) on desktop.
   - Contact section and footer (the footer email should read `info@fanasakht.ir`, left-to-right).
   - **Mobile 390px and tablet 800px.** The Chrome window won't resize below ~500px, so replace the tab's document with side-by-side iframes: `document.open(); document.write('<iframe src="/?m" style="width:390px;height:660px"></iframe><iframe src="/?t" style="width:800px;height:660px"></iframe>'); document.close();` and scroll inside each frame with `contentWindow.scrollTo`. Check `scrollWidth <= innerWidth` (no horizontal overflow). Also check that the H1 first line «فناوری برای ساختن» (`white-space: nowrap`) fits at 390px with Estedad. If it overflows, lower the min in `--fs-display` (currently `clamp(2.4rem, 1.1rem + 4.9vw, 5.4rem)`).
   - Hover on a capability row, and the mobile menu open/close.
4. **Update the memory file** `~/.claude/projects/-home-jimmy/memory/project_fanasakht_website.md`: font is now Estedad (not Vazirmatn), and the frontend-design critique pass is done.
5. **Report to the owner** with a short summary and a screenshot or two. Don't ask design questions (owner preference).

Still open, and the owner must supply these (mention them, don't invent them):
- Contact: the problem brief is sent **automatically** to the owner's private Bale chat by a bot through `api/server.js` (Node, preferred inside Iran) or `api/worker.js` (Cloudflare). Telegram was removed 2026-09-26. Tested end to end against a fake Bale API. The form asks only for a phone number (validated as an Iranian number on the page and in the relay). **The owner's own Bale ID and phone must never appear on the site** (owner's instruction, 2026-09-26). Bot **@fanasakhtbot** created 2026-09-26; token + chat id (owner's private chat) are in `api/.env` (mode 600). A real brief was sent through the site and confirmed by Bale. Still needed at launch: deploy the relay publicly and set `PUBLIC_BRIEF_ENDPOINT` in `assets/js/site.js` (empty = relay on the page's own host, port 8787, which works for LAN testing at http://10.101.176.20:8765). The owner may rotate the token (it was pasted in chat); if so, update `api/.env`. Steps in `api/README.md`.
- Vector (SVG) logo files to replace the raster cut-outs.

## 8. Tooling quirks learned the hard way

- **Background tabs pause `requestAnimationFrame`.** If the hero looks frozen on its first frame, the tab is hidden (`document.visibilityState === "hidden"`), not broken. Taking a screenshot brings it to the front and the animation finishes.
- **Headless Chrome full-page screenshots mislead:** a tall `--window-size` makes the `100svh` hero huge. Use the real Chrome extension tab at a normal viewport and scroll with `scrollTo`.
- Chrome screenshots sometimes time out ("renderer may be frozen"). Just retry.
- The auto-mode safety check occasionally returns "no verdict" for Bash. Retry once, or use the Edit/Write tools instead.
- Fonts were fetched from npm: `npm pack @fontsource-variable/estedad` (files `estedad-arabic-wght-normal.woff2`, `estedad-latin-wght-normal.woff2`). Google Fonts is avoided on purpose because it's unreliable from Iran.
- The `tokens.css` `@font-face` for Estedad-arabic has a `unicode-range` for Persian/Arabic; the Latin file covers everything else.

## 9. Guardrails

- Keep it a static site with no new dependencies.
- Keep all copy truthful to `~/tender-ai/docs`: مناقصه‌بان is in development, never submits automatically, always has human approval, and keeps a source reference for every extracted requirement. Don't invent metrics, clients or testimonials.
- Blue stays an accent (≤5% of the page). Add no new hues. Status uses marker shape + text, not red/green.
- One auto-playing motion moment (the hero). Anything else must answer a click or hover.
