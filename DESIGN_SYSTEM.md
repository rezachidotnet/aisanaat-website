# نردبان (Ladder) — design system

Replaced the فناساخت site on 2026-10-09. The theme follows sitechs.co's structure (a dark base with cream bands, a floating pill header, a giant centred headline with an editable word, idea cards, a marquee and pill buttons) with Ladder's own accent and content.

## Look (2026-10-09, v3): liquid glass over a living galaxy
- Background: fixed `.cosmos` (built by site.js) has four drifting nebula clouds (CSS) and a canvas starfield that twinkles, with parallax on scroll and pointer. It pauses when the tab is hidden and is static under reduced motion.
- Glass: translucent fill with `backdrop-filter: blur(22px) saturate(170%)`, a bright top edge (`--glass-hi`), and a specular spot that follows the pointer (`--mx/--my`, set by site.js). Product screens tilt slightly.
- Themes: `<html data-theme="dark|light" data-palette="nebula|aurora">`, set before first paint by an inline head script and remembered in localStorage (`ladder-theme`, `ladder-palette`). The header switch changes mode or palette with a circular View Transition reveal; colours are @property tokens, so they melt.
  - Nebula: violet #A78BFA / pink #F472B6 / blue #60A5FA (light: #7C3AED / #DB2777 / #2563EB)
  - Aurora: teal #2DD4BF / lime #A3E635 / sky #38BDF8 (light: #0D9488 / #65A30D / #0284C7)
- Motion: the hero assembles on load (`[data-in]`, staggered); sections rise out of a blur on scroll (`.rv` → `.in`); buttons are springy pills with a light sweep; the ticker pauses on hover. Everything respects prefers-reduced-motion.
- Font: self-hosted Estedad. Radii: controls 14, cards 22, panels 30, buttons and chips are pills.
- Enquiry panel: a native `<dialog class="enq">` glass sheet. Any `[data-enquire="<product key>"]` opens it. Leads POST to `/api/brief` (`kind: "enquiry"`), and the relay formats them for Bale.

## Content rules
- No invented product names, testimonials, client logos or metrics. Demos are labelled «نمایشی», and products are tagged «قابل ارائه».
- Products: مناقصه‌بان (~/tender-ai), استیتر (~/stater), دستیار برآورد هزینه سازه (~/spaceframe-agent). Status tag: «قابل ارائه».
- Product animations are real screen recordings (assets/media/*.mp4 + poster jpg). Re-record with `node ~/fanasakht-video/rec/record.js tender|stater|frame` (apps on :3100/:3200/:8800, demo users), then encode with ffmpeg (setpts=PTS/1.25, 1120w, crf 30). Product pages keep the interactive demo in «خودتان امتحان کنید».
- Avoid: uppercase labels, a different colour on a single word in a headline, middle-dot meta strings, arrows appended to text.
