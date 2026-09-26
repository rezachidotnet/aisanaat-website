# فناساخت — Design System

The website should read as a sign of how the company works: **minimal, industrial, intelligent, premium**.
Everything here exists so future pages (Solutions, Case Studies, About, Insights, Contact) look like parts of the same company.

Source of truth for values: `assets/css/tokens.css`. Components: `assets/css/site.css`.

---

## 1. Principles

1. **Less information, more meaning.** If a component doesn't communicate something, remove it.
2. **Engineered, not decorated.** Industry shows up through grids, rulers, schematics and measurements. Never through stock photos of factories or helmets.
3. **Intelligence through structure.** Show how information is organised and connected. No robots, brains, glowing circuits or particles.
4. **Problem first.** Every capability is presented next to the real problem it solves.
5. **The human decides.** Copy and diagrams always show that AI proposes and people approve.
6. **One bold thing per page.** On the home page it's the hero system visual. Everything around it stays quiet.

## 2. Logo

Files in `assets/brand/` (cut from the master logo image):

| File | Use |
|---|---|
| `logo.png` | Primary: blue mark + navy wordmark on white / light gray |
| `logo-white.png` | On navy: blue mark + white wordmark |
| `logo-full.png` | Reserved for a lockup with tagline (currently the same crop) |
| `mark.png` | Symbol only (avatars, small spaces) |
| `mark-white.png` | Monochrome white symbol |
| `favicon.png`, `apple-touch-icon.png` | Browser icons |

Rules: never distort, recolor or redraw it. Clear space around it should be at least the height of the lower chevron. Minimum height 24px (lockup) / 16px (mark).

The files come from a 1254px raster master, so they're sharp up to about 1000px wide. **Replace them with vector originals when available.**

### The mark as a building block
The logo's stacked chevrons are simplified into `<symbol id="chev">` (inline SVG in `index.html`). It has exactly two uses:
- the marker at the start of each section `.ruler`,
- the form the hero system visual resolves into.

Don't use it anywhere else.

## 3. Color

| Token | Value | Role |
|---|---|---|
| `--navy` | `#0B1F33` | Headings, primary buttons, dark sections, footer |
| `--blue` | `#1677FF` | Accent only: key nodes, hover states, the final step of a diagram |
| `--blue-light` | `#5AA2FF` | Blue on navy backgrounds (contrast) |
| `--text` | `#3B4B5D` | Body |
| `--muted` | `#6E7C8C` | Secondary text, captions |
| `--faint` | `#A5B0BC` | Light second line of an H2, sequence numerals |
| `--line` / `--line-strong` | `#E4E9EF` / `#CCD5DF` | Hairlines, rules, grid |
| `--bg` / `--bg-alt` | `#FFFFFF` / `#F5F7F9` | Page / alternate section |

Proportion: roughly **80% white/gray, 15% navy, ≤5% blue**. Blue marks what matters, so it loses meaning if it's everywhere.
No other hues. Status is shown by **marker shape + text** (filled dot, hollow diamond, dashed ring), not by red/green.

## 4. Typography

- **One family: Estedad** (variable 100–900, self-hosted in `assets/fonts/` as an Arabic-script subset + a Latin subset). It's geometric and low-contrast, close to the wordmark. Google Fonts isn't used because it's unreliable from Iran.
- Latin terms (AI Agents, SETAD, OCR, Word) stay in Latin script and never get transliterated. Wrap standalone Latin labels in `.ltr` so they isolate correctly. They render in Estedad's Latin, never in a monospace face.
- Persian copy uses Persian numerals (۱، ۱۴۰۵).
- Weight carries hierarchy: 850 display, 800 headings, 700 sub-heads, 400 body, 300 for the soft second line of an H2.

| Style | Token | Weight | Use |
|---|---|---|---|
| Display | `--fs-display` (38→86px) | 850 | At most two per page: hero H1, closing CTA (a case-study title may use a smaller display) |
| H2 | `--fs-h2` (30→54px) | 800 | Section statement, max 22ch, `text-wrap: balance` |
| H3 | `--fs-h3` | 700 | Sub-blocks |
| Lead | `--fs-lead` | 400 | One short paragraph under a heading |
| Body | 16px / 1.95 | 400 | Persian needs generous line height |
| Small | `--fs-small` | 400 | Captions, secondary lines |

A two-part H2 puts its second sentence in `<span class="soft">` (light weight, faint color, on its own line), e.g. «ما از فناوری شروع نمی‌کنیم. / از مسئله شروع می‌کنیم.». Headlines are never accented by coloring one word or phrase.

## 5. Space & grid

- 4px base scale: `--s-1` (4) … `--s-10` (144).
- Section rhythm: `--section` (88 → 168px vertical padding).
- Container: `--max` 1240px, gutter 16–40px.
- Typical layout: a **two-column statement**, with the heading on the right and supporting text on the left (RTL), aligned to the bottom.
- Line length stays under ~80 characters (`.lead` max 34em).
- Whitespace is part of the identity. Don't fill empty areas.

## 6. Components

**Ruler** (`.ruler`): the section opener. Brand chevron + a measuring-tape line (fine ticks every 24px, taller ticks every 120px). It has no label and no section number, because the H2 names the section.

**Buttons** (`.btn`): 52px tall, 2px radius, 1px border, plain label with no arrow. Variants:
`btn--primary` (navy fill → blue on hover), `btn--ghost` (outline), and `btn--small` (40px, for the header and inline actions). The label says exactly what happens: «آشنایی با راهکارها»، «مسئله‌تان را بنویسید»، «خواندن سند را ببینید».

**Chain** (`.chain`): numbered steps on a line with diamond nodes; the first and last are blue (`.key`). Numbers are used **only because the content is a real sequence**. Horizontal on desktop, 4-up on tablet, vertical rail on mobile.

**Capability map** (`.capmap` / `.cap`): rows, not cards. Persian name (+ Latin name in `.ltr`), a connector, then the problem and its outcome. No numbers, because capabilities aren't a sequence. Hover colors the connector blue.

**Pipeline schematic** (`.pipe`): square numbered nodes on a line. A second input (e.g. company knowledge) uses a dashed node labelled «ورودی دوم»; the outcome node is solid blue. It's static.

**Data rows** (`.rows` / `.row`): table-like, hairline separators, source reference in blue («صفحه ۴، بند ۲-۱»), status marker + text.

**Step chart** (`.stairs`): narrow hatched columns (engineering hatch) rising toward the outcome; the outcome column is solid blue. It has a vertical axis label (e.g. «اهرم») and becomes horizontal bars on mobile.

**Problem brief** (`.brief` + `.sketch`): the contact section. There are no email/phone/form clichés. Three numbered questions (مسئله → فرایند → داده, the same chain as «رویکرد») plus name and a phone number (validated). A sticky "sketch" beside them turns each answer into a node (dashed → navy). The «جای هوش» node turns blue with the best-matching capability, and related capabilities appear as links back to the site. Matching is deterministic keyword rules in `site.js` (`RULES`), not AI, and is labelled as a first reading. The draft is kept in `localStorage` until sent. Delivery is automatic to the owner's Bale via the relay in `api/`; if it fails, the answers stay and the visitor can retry (never copy-paste). The visitor gives only a phone number; the owner's contact details never appear on the site. See `api/README.md`.

**Tag** (`.tag`): small pill, only for status like «در حال توسعه».

## 7. Diagrams & data visualization

- Lines 1px, nodes as squares/diamonds/small circles. Blue marks the key path or the result.
- Label with plain Persian words; add a Latin term only when it's the real name of something (SETAD, Word).
- Show the real mechanism (inputs, flow, human gate). Diagrams are not marketing infographics.
- Background grids: 28/140px on light, 96px on navy, always faint and masked.

## 8. Motion

Budget: **one orchestrated moment per page.** Everything else is static or answers the visitor.

| Where | What | Trigger |
|---|---|---|
| Hero | 52 points → links discovered → the relevant 22 settle into the logo's chevrons → resolve in blue with a «رشد» arrow (~7s), then hold | Auto, once, when visible. «اجرای دوباره» replays it |
| Document demo | A scan line reads the page; each highlighted line produces its row | Click «خواندن سند را ببینید» / «دوباره بخوان» |
| Capability row | Connector turns blue | Hover |
| Problem brief sketch | Nodes fill in; the intelligence node turns blue | Typing |
| Header | Gains a white background + hairline after scrolling | Scroll |

There are no entrance/reveal animations, no looping motion, no parallax and no floating. `prefers-reduced-motion` shows final states only.

## 9. Avoid (templated-page tells)

These were deliberately removed and must not come back:
- coloring one word or phrase in a headline,
- UPPERCASE or monospace labels, "status readouts" or tech-jargon captions,
- an eyebrow label or ۰۱/۰۲ number above every heading,
- numbering items that aren't a sequence,
- `←` / `→` appended to buttons and links,
- strings joined with middle dots (A · B · C),
- fade-up on every block, looping decorative motion,
- card grids, soft shadows, gradient washes, glassmorphism, decorative icons.

## 10. Voice

- Short sentences. Builders talking, not advertisers.
- Say what the system does and where the human decides.
- Never claim metrics, clients or testimonials that don't exist. Demo data is labelled as demo.
- Don't say «ما یک شرکت هوش مصنوعی هستیم».

## 11. Responsive

- **Desktop ≥1081px**: two-column statements, horizontal diagrams.
- **Tablet 761–1080px**: hero stacks (text, then visual), chain and pipeline become 4-up grids, the four case columns become 2×2.
- **Mobile ≤760px**: diagrams become vertical rails; each capability shows its problem underneath with a blue rule; the step chart becomes horizontal bars; data rows reflow to two lines; CTAs go full width; the menu collapses; the hero phase list shows only the current phase.

## 12. Adding a page

1. Copy the `<head>`, the `#chev` symbol, the header and the footer from `index.html`.
2. Link `tokens.css`, then `site.css`, and include `site.js`.
3. Open each section with a `.ruler`. Use at most one or two `.display` headings per page.
4. Pick the page's single bold moment; keep the rest static.
5. Reuse the components above before creating new ones. Put any new tokens in `tokens.css` and document them here.
