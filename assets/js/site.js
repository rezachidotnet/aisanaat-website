/* فناساخت — site behaviour. No dependencies. */

// Problem brief delivery. See api/README.md.
// Relay (api/) that posts each brief to the owner's Bale chat.
// PUBLIC_BRIEF_ENDPOINT: the public relay address. On Vercel it's the function api/brief.js on the same host.
// Set it to "" for local testing with api/server.js: the relay is then expected on the same machine as the
// page, port 8787, so it works from localhost and from other devices on the network (e.g. http://10.101.176.20:8765).
const PUBLIC_BRIEF_ENDPOINT = "/api/brief";
const BRIEF_ENDPOINT = PUBLIC_BRIEF_ENDPOINT || `http://${location.hostname}:8787/api/brief`;

// Iranian phone number (mobile or landline): Persian/Arabic digits, spaces, dashes and +98/0098 accepted.
// Returns the normalized 11-digit form (e.g. 09121234567), or "" if it isn't a valid number.
function normalizePhone(raw) {
  let d = String(raw)
    .replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c))
    .replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c))
    .replace(/[\s\-()]/g, "");
  if (d.startsWith("+98")) d = "0" + d.slice(3);
  else if (d.startsWith("0098")) d = "0" + d.slice(4);
  else if (/^98\d{10}$/.test(d)) d = "0" + d.slice(2);
  else if (/^9\d{9}$/.test(d)) d = "0" + d;
  return /^0[1-9]\d{9}$/.test(d) ? d : "";
}

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SVGNS = "http://www.w3.org/2000/svg";

/* ── Header, menu, contact ─────────────────────────── */
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 12);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const menuBtn = document.querySelector(".menu-btn");
const nav = document.getElementById("nav");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", false); }
});


/* ── Problem brief ─────────────────────────────────
   Three answers build a live sketch. Keyword rules (deterministic, no AI)
   suggest related capabilities. The visitor reviews, then sends. */
(function problemBrief() {
  const form = document.getElementById("brief");
  if (!form) return;
  const submit = document.getElementById("brief-submit");
  const hint = document.getElementById("brief-hint");
  const done = document.getElementById("brief-done");
  const capsBox = form.querySelector(".sketch__caps");
  const capsOut = document.getElementById("caps-out");
  const node = (k) => form.querySelector(`.sketch__flow li[data-k="${k}"]`);
  const DRAFT_KEY = "fanasakht-brief-draft";

  const RULES = [
    { re: /مناقصه|ستاد|استعلام|پاکت|مزایده/, name: "مناقصه‌بان", href: "#case", why: "خواندن اسناد مناقصه و سنجش آمادگی شرکت" },
    { re: /سند|اسناد|pdf|اسکن|کاغذ|قرارداد|نامه|مدارک|فرم/i, name: "هوش اسناد", href: "#solutions", why: "خواندن اسناد و استخراج اطلاعات، با منبع" },
    { re: /تکرار|دستی|ایمیل|پیگیری|کپی|وارد کردن|یک هفته|چند روز|ساعت/, name: "خودکارسازی هوشمند", href: "#solutions", why: "برداشتن کار تکراری از دوش آدم‌ها" },
    { re: /کارشناس|اپراتور|درخواست|مشتری|پاسخ|تیکت/, name: "عامل‌های هوشمند", href: "#solutions", why: "انجام بخشی از کار و برگرداندن نتیجه برای تأیید" },
    { re: /اکسل|excel|گزارش|داشبورد|شاخص|فروش|آمار|حسابداری/i, name: "هوش تجاری", href: "#solutions", why: "تصویر روشن از وضعیت، از داده‌ای که دارید" },
    { re: /دانش|پوشه|آرشیو|جست‌?وجو|جستجو|تجربه|بایگانی/, name: "سیستم‌های داده و دانش", href: "#solutions", why: "دانش پراکنده در یک جا و قابل جست‌وجو" },
    { re: /تصمیم|انتخاب|ریسک|اولویت|برآورد/, name: "پشتیبانی تصمیم", href: "#solutions", why: "تحلیل با شواهد برای تصمیم شما" },
    { re: /کارگاه|تولید|انبار|تعمیر|نگهداری|پروژه|ماشین|خط تولید|سازه/, name: "نرم‌افزار صنعتی", href: "#solutions", why: "نرم‌افزاری برای فرایند واقعی شما" },
  ];

  const val = (n) => form.elements[n].value.trim();
  const clip = (t, n = 90) => (t.length > n ? t.slice(0, n).trim() + "…" : t);

  function setNode(k, text) {
    const li = node(k), sm = li.querySelector("small");
    li.classList.toggle("is-set", !!text);
    sm.textContent = text || sm.dataset.empty;
  }

  function matchCaps() {
    const all = [val("problem"), val("process"), val("data")].join(" ");
    return RULES.filter((r) => r.re.test(all));
  }

  function update() {
    const p = val("problem"), pr = val("process"), d = val("data");
    setNode("problem", clip(p));
    setNode("process", clip(pr));
    setNode("data", clip(d));

    const caps = matchCaps();
    const ready = p.length >= 12 && (pr || d);
    if (ready) setNode("intel", caps.length ? `${caps[0].name}: ${caps[0].why}` : "در گفت‌وگو مشخص می‌شود");
    else setNode("intel", "");

    capsBox.hidden = !(ready && caps.length);
    capsOut.replaceChildren(...caps.slice(0, 4).map((c) => {
      const li = document.createElement("li"), a = document.createElement("a");
      a.href = c.href; a.textContent = c.name; li.append(a); return li;
    }));

    const phoneRaw = val("reach"), phone = normalizePhone(phoneRaw);
    const canSend = p.length >= 12 && !!phone;
    submit.disabled = !canSend;
    hint.classList.remove("is-error");
    hint.textContent = canSend
      ? "قبل از ارسال، طرح بالا را مرور کنید."
      : phoneRaw && !phone && (phoneRaw.match(/[0-9۰-۹٠-٩]/g) || []).length >= 10
        ? "شماره تماس درست نیست؛ مثلاً ۰۹۱۲۳۴۵۶۷۸۹ یا ۰۲۱۱۲۳۴۵۶۷۸."
        : "برای ارسال، مسئله و شماره تماس را بنویسید.";

    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ problem: p, process: pr, data: d, name: val("name"), reach: val("reach") })); } catch {}
  }

  // restore an unsent draft
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (draft) for (const k in draft) if (form.elements[k]) form.elements[k].value = draft[k];
  } catch {}
  form.addEventListener("input", update);
  update();

  function showDone(html) {
    form.querySelector(".brief__send").hidden = true;
    done.hidden = false;
    done.innerHTML = html;
  }

  // Sending failed: keep the answers (the draft is saved) so the visitor can retry.
  // The visitor never has to copy anything.
  function showFailed() {
    hint.classList.add("is-error");
    hint.textContent = "ارسال انجام نشد. پاسخ‌هایتان ذخیره شده است؛ چند لحظه بعد دوباره «ارسال مسئله» را بزنید.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submit.disabled) return;

    submit.disabled = true;
    submit.textContent = "در حال ارسال…";
    const payload = {
      problem: val("problem"), process: val("process"), data: val("data"),
      name: val("name"), reach: normalizePhone(val("reach")), website: form.elements.website.value,
      caps: matchCaps().map((c) => c.name),
    };
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(BRIEF_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      showDone(`<b>مسئلهٔ شما رسید.</b><p>تیم فناساخت آن را می‌خواند و با شماره‌ای که گذاشتید با شما تماس می‌گیرد.</p>`);
    } catch {
      submit.textContent = "ارسال مسئله";
      submit.disabled = false;
      showFailed();
    }
  });
})();

/* ── Document → structured rows ────────────────────── */
// Answers the visitor's click: a scan line reads the page, each marked line produces its row.
const readBtn = document.getElementById("read-doc");
readBtn.addEventListener("click", runExtract);

function runExtract() {
  const sheet = document.querySelector(".sheet");
  const scan = sheet.querySelector(".sheet__scan");
  const rowsBox = document.getElementById("rows");
  const rows = rowsBox.querySelectorAll(".row");
  const marks = [...sheet.querySelectorAll("[data-hl]")];
  if (reduced) { marks.forEach((m) => m.classList.add("hl")); return; }

  readBtn.disabled = true;
  marks.forEach((m) => m.classList.remove("hl"));
  rows.forEach((r) => r.classList.remove("is-on"));
  rowsBox.classList.add("is-reading");

  const h = sheet.clientHeight;
  const dur = 3200;
  const t0 = performance.now();
  scan.style.transition = "none";
  scan.style.opacity = 1;
  (function frame(now) {
    const p = Math.min(1, (now - t0) / dur);
    const y = p * (h - 36);
    scan.style.transform = `translateY(${y}px)`;
    marks.forEach((m) => {
      if (!m.classList.contains("hl") && m.offsetTop < y + 24) {
        m.classList.add("hl");
        rows[+m.dataset.hl]?.classList.add("is-on");
      }
    });
    if (p < 1) return requestAnimationFrame(frame);
    scan.style.transition = "opacity .6s";
    scan.style.opacity = 0;
    rowsBox.classList.remove("is-reading");
    readBtn.disabled = false;
    readBtn.textContent = "دوباره بخوان";
  })(t0);
}

/* ── Hero system visual ────────────────────────────
   Scattered points → relations discovered → the relevant points settle into
   the stacked chevrons of the logo → the structure resolves in blue.
   Runs once, then holds. Irrelevant points stay as quiet context. */
(function heroViz() {
  const svg = document.getElementById("viz");
  if (!svg) return;
  const gEdges = svg.querySelector("#edges");
  const gStruct = svg.querySelector("#struct");
  const gNodes = svg.querySelector("#nodes");
  const gTicks = svg.querySelector("#ticks");
  const phases = [...document.querySelectorAll("#phases li")];

  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };

  // axis ticks: engineering frame
  gTicks.setAttribute("fill", "#A5B0BC");
  gTicks.setAttribute("font-size", "9");
  gTicks.setAttribute("font-family", "Estedad, sans-serif");
  for (let v = 0; v <= 560; v += 140) {
    const t = String(v).padStart(3, "0");
    el("text", { x: v + 3, y: 552 }, gTicks).textContent = t;
    if (v && v < 560) el("text", { x: 3, y: v - 4 }, gTicks).textContent = t;
  }
  [[0, 0], [560, 0], [0, 560], [560, 560]].forEach(([x, y]) => {
    const dx = x ? -1 : 1, dy = y ? -1 : 1;
    el("path", { d: `M${x + dx * 14} ${y}H${x}V${y + dy * 14}`, stroke: "#8C99A8", fill: "none", "stroke-width": 1.2 }, gTicks);
  });

  // targets: the two stacked chevrons of the mark
  const along = (pts, n) => {
    const segs = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const len = Math.hypot(bx - ax, by - ay);
      segs.push({ ax, ay, bx, by, len }); total += len;
    }
    const out = [];
    for (let k = 0; k < n; k++) {
      let d = (k / (n - 1)) * total;
      for (const s of segs) {
        if (d <= s.len + 1e-6) { out.push([s.ax + (s.bx - s.ax) * d / s.len, s.ay + (s.by - s.ay) * d / s.len]); break; }
        d -= s.len;
      }
    }
    return out;
  };
  const upper = [[112, 318], [280, 214], [448, 318]];
  const lower = [[176, 410], [280, 346], [384, 410]];
  const targets = [along(upper, 13), along(lower, 9)];

  // seeded random so the layout is identical on every visit
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  const N = 52;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    nodes.push({ x0: 40 + rnd() * 480, y0: 40 + rnd() * 470, delay: rnd() * 900, role: null });
  }
  // assign structural roles to the nodes nearest each target (keeps motion short and legible)
  const free = new Set(nodes.keys());
  const chains = targets.map((line) => line.map(([tx, ty]) => {
    let best = -1, bd = Infinity;
    for (const i of free) {
      const n = nodes[i];
      const d = Math.hypot(n.x0 - tx, n.y0 - ty) + rnd() * 90;
      if (d < bd) { bd = d; best = i; }
    }
    free.delete(best);
    Object.assign(nodes[best], { role: "s", tx, ty });
    return best;
  }));

  const structEdges = chains.flatMap((c) => c.slice(1).map((b, k) => [c[k], b]));
  // hypotheses that get rejected: links among context nodes
  const ctx = [...free];
  const noiseEdges = [];
  for (let k = 0; k < 16; k++) {
    const a = ctx[Math.floor(rnd() * ctx.length)];
    let b = -1, bd = Infinity;
    for (const j of ctx) {
      if (j === a) continue;
      const d = Math.hypot(nodes[a].x0 - nodes[j].x0, nodes[a].y0 - nodes[j].y0);
      if (d < bd && !noiseEdges.some(([p, q]) => (p === a && q === j) || (p === j && q === a))) { bd = d; b = j; }
    }
    noiseEdges.push([a, b]);
  }
  const edges = [
    ...structEdges.map(([a, b], k) => ({ a, b, s: true, at: 1400 + k * 70 })),
    ...noiseEdges.map(([a, b], k) => ({ a, b, s: false, at: 1300 + k * 90 })),
  ];

  // elements
  edges.forEach((e) => { e.el = el("line", { stroke: e.s ? "#1677FF" : "#9AA8B8", "stroke-width": 1, opacity: 0 }, gEdges); });
  nodes.forEach((n) => { n.el = el("circle", { r: n.role ? 3.2 : 2.4, fill: "#0B1F33", opacity: 0 }, gNodes); });
  const chevPaths = [upper, lower].map((pts) => {
    const d = "M" + pts.map((p) => p.join(" ")).join("L");
    const p = el("path", { d, fill: "none", stroke: "url(#chevGrad)", "stroke-width": 22, "stroke-linejoin": "miter", "stroke-linecap": "butt", opacity: 0.92 }, gStruct);
    const L = p.getTotalLength();
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p._L = L;
    return p;
  });
  const growth = el("path", { d: "M280 196V150M268 162l12-12 12 12", stroke: "#1677FF", "stroke-width": 1.4, fill: "none", opacity: 0 }, gStruct);
  const growthLbl = el("text", { x: 298, y: 160, fill: "#1677FF", "font-size": 13, "font-weight": 700, "font-family": "Estedad, sans-serif", opacity: 0 }, gStruct);
  growthLbl.textContent = "رشد";

  const ease = (t) => (t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3));
  const inout = (t) => (t < 0 ? 0 : t > 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // timeline (ms)
  const T = { appear: 0, relate: 1300, settle: 3300, resolve: 5300, end: 7000 };
  let raf, t0;

  function setPhase(i) {
    phases.forEach((li, k) => { li.classList.toggle("is-on", k === i); li.classList.toggle("is-done", k < i); });
  }

  function render(t) {
    const phase = t < T.relate ? 0 : t < T.settle ? 1 : t < T.resolve ? 2 : 3;
    setPhase(phase);
    const m = inout((t - T.settle) / 1800);

    let visible = 0;
    nodes.forEach((n) => {
      const a = ease((t - n.delay) / 600);
      if (a > 0.5) visible++;
      n.x = n.role ? n.x0 + (n.tx - n.x0) * m : n.x0;
      n.y = n.role ? n.y0 + (n.ty - n.y0) * m : n.y0;
      let op = a * 0.85;
      if (!n.role) op *= 1 - 0.7 * ease((t - T.settle) / 1200);
      n.el.setAttribute("cx", n.x.toFixed(1));
      n.el.setAttribute("cy", n.y.toFixed(1));
      n.el.setAttribute("opacity", op.toFixed(3));
      if (n.role) n.el.setAttribute("fill", t > T.resolve ? "#fff" : t > T.settle + 900 ? "#1677FF" : "#0B1F33");
    });

    let links = 0;
    edges.forEach((e) => {
      const a = nodes[e.a], b = nodes[e.b];
      let op = ease((t - e.at) / 500);
      if (e.s) op *= 0.75 * (1 - ease((t - T.resolve - 600) / 600));
      else op *= 0.45 * (1 - ease((t - T.settle + 300) / 700));
      if (op > 0.05) links++;
      e.el.setAttribute("x1", a.x.toFixed(1)); e.el.setAttribute("y1", a.y.toFixed(1));
      e.el.setAttribute("x2", b.x.toFixed(1)); e.el.setAttribute("y2", b.y.toFixed(1));
      e.el.setAttribute("opacity", op.toFixed(3));
    });

    chevPaths.forEach((p, k) => {
      const d = ease((t - T.resolve - k * 250) / 1000);
      p.style.strokeDashoffset = (p._L * (1 - d)).toFixed(1);
    });
    const g = ease((t - T.resolve - 1100) / 600);
    growth.setAttribute("opacity", g); growthLbl.setAttribute("opacity", g * 0.9);

  }

  function loop(now) {
    const t = now - t0;
    render(t);
    if (t < T.end) raf = requestAnimationFrame(loop);
  }
  function play() {
    cancelAnimationFrame(raf);
    if (reduced) { render(T.end); return; }
    t0 = performance.now();
    raf = requestAnimationFrame(loop);
  }

  document.getElementById("replay").addEventListener("click", play);
  // start when visible
  const vio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); vio.disconnect(); } }, { threshold: 0.3 });
  vio.observe(svg);
})();
