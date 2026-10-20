/* نردبان — site behaviour. No dependencies. */
document.documentElement.classList.add("js");

// Leads (problem brief + product enquiries) go to the owner's Bale chat through the relay in api/.
// On Vercel the relay is the function api/brief.js on the same host. For local testing with
// api/server.js set PUBLIC_BRIEF_ENDPOINT to "": the relay is then expected on this host, port 8787.
const PUBLIC_BRIEF_ENDPOINT = "/api/brief";
const BRIEF_ENDPOINT = PUBLIC_BRIEF_ENDPOINT || `http://${location.hostname}:8787/api/brief`;
const ROOT = document.body.dataset.root || "";

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

async function sendLead(payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(BRIEF_ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), signal: ctrl.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
  } finally { clearTimeout(timer); }
}

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
const PRODUCTS = {
  "monaghese-ban": "مناقصه‌بان",
  "stater": "استیتر",
  "space-frame": "دستیار برآورد هزینه سازه",
  "": "خدمات و پروژهٔ سفارشی",
};

/* ── Header, menu, products dropdown ───────────────── */
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 12);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const menuBtn = document.querySelector(".menu-btn");
const nav = document.getElementById("nav");
const prodWrap = document.querySelector(".nav__products");
const prodBtn = document.querySelector(".nav__trigger");
const setMenu = (open) => { nav.classList.toggle("is-open", open); menuBtn.setAttribute("aria-expanded", open); };
const setProducts = (open) => { prodWrap.classList.toggle("is-open", open); prodBtn.setAttribute("aria-expanded", open); };
menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
prodBtn.addEventListener("click", (e) => { e.stopPropagation(); setProducts(!prodWrap.classList.contains("is-open")); });
// desktop: open on hover too
const hoverable = matchMedia("(hover: hover) and (min-width: 861px)");
prodWrap.addEventListener("mouseenter", () => hoverable.matches && setProducts(true));
prodWrap.addEventListener("mouseleave", () => hoverable.matches && setProducts(false));
document.addEventListener("click", (e) => { if (!prodWrap.contains(e.target)) setProducts(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setProducts(false); setMenu(false); } });
nav.addEventListener("click", (e) => { if (e.target.closest("a, [data-enquire]")) { setMenu(false); setProducts(false); } });

/* ── The galaxy: nebula clouds + a twinkling starfield with gentle parallax ── */
(function cosmos() {
  const sky = document.createElement("div");
  sky.className = "cosmos";
  sky.setAttribute("aria-hidden", "true");
  sky.innerHTML = "<i></i><i></i><i></i><i></i><canvas></canvas>";
  document.body.prepend(sky);
  const cv = sky.querySelector("canvas"), ctx = cv.getContext("2d");
  let W, H, stars = [], raf, px = 0, py = 0, tx = 0, ty = 0;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  function size() {
    W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR;
    const n = Math.round((innerWidth * innerHeight) / 4200);
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, z: Math.random() * 0.8 + 0.2,       // z: depth (parallax + size)
      r: (Math.random() ** 3 * 1.6 + 0.35) * DPR, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.6,
    }));
  }
  function draw(t) {
    const rgb = getComputedStyle(document.documentElement).getPropertyValue("--star").trim() || "255,255,255";
    ctx.clearRect(0, 0, W, H);
    px += (tx - px) * 0.04; py += (ty - py) * 0.04;
    const sc = scrollY * 0.04 * DPR;
    for (const s of stars) {
      const a = reduced ? 0.8 : 0.45 + 0.55 * Math.sin(t * 0.001 * s.s + s.p) ** 2;
      let x = (s.x + px * s.z * 30 * DPR) % W, y = (s.y - sc * s.z + py * s.z * 30 * DPR) % H;
      if (x < 0) x += W; if (y < 0) y += H;
      ctx.globalAlpha = a * s.z;
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.beginPath(); ctx.arc(x, y, s.r * s.z, 0, 6.283); ctx.fill();
      if (s.r > 1.4 * DPR) { // a few bright stars get a soft cross glint
        ctx.globalAlpha = a * 0.25; ctx.fillRect(x - s.r * 3, y - 0.5, s.r * 6, 1); ctx.fillRect(x - 0.5, y - s.r * 3, 1, s.r * 6);
      }
    }
    if (!reduced) raf = requestAnimationFrame(draw);
  }
  size(); draw(0);
  addEventListener("resize", () => { size(); if (reduced) draw(0); });
  addEventListener("pointermove", (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden && !reduced) raf = requestAnimationFrame(draw); });
  if (reduced) addEventListener("scroll", () => draw(0), { passive: true });
})();

/* ── Theme: dark/light × nebula/aurora, remembered per viewer ── */
(function themeSwitch() {
  const root = document.documentElement;
  const box = document.createElement("div");
  box.className = "theme"; box.setAttribute("role", "group"); box.setAttribute("aria-label", "ظاهر سایت");
  box.innerHTML = `
    <button class="theme__mode" type="button" aria-label="تغییر حالت روشن و تیره">
      <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>
      <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/></svg>
    </button>
    <button class="theme__pal" type="button" data-palette="nebula" aria-label="رنگ‌بندی کهکشان"></button>
    <button class="theme__pal" type="button" data-palette="aurora" aria-label="رنگ‌بندی شفق"></button>`;
  const head = document.querySelector(".header__in");
  head.insertBefore(box, head.querySelector(".menu-btn"));
  const pals = [...box.querySelectorAll(".theme__pal")];
  const sync = () => pals.forEach((b) => b.setAttribute("aria-pressed", b.dataset.palette === root.dataset.palette));
  const save = () => { try { localStorage.setItem("ladder-theme", root.dataset.theme); localStorage.setItem("ladder-palette", root.dataset.palette); } catch {} };
  // A circular reveal from the button that was pressed (View Transitions), or a melt where unsupported.
  let busy = null;
  function apply(btn, change) {
    const r = btn.getBoundingClientRect();
    root.style.setProperty("--vt-x", `${r.left + r.width / 2}px`);
    root.style.setProperty("--vt-y", `${r.top + r.height / 2}px`);
    const run = () => { change(); sync(); save(); };
    if (!document.startViewTransition || reduced || busy) return run();
    busy = document.startViewTransition(run);
    busy.finished.finally(() => (busy = null));
  }
  box.querySelector(".theme__mode").addEventListener("click", (e) =>
    apply(e.currentTarget, () => (root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light")));
  pals.forEach((b) => b.addEventListener("click", () => apply(b, () => (root.dataset.palette = b.dataset.palette))));
  sync();
})();

/* ── Liquid glass: the specular spot follows the pointer; product screens tilt ── */
(function glassLight() {
  if (reduced || !matchMedia("(hover: hover)").matches) return;
  const SEL = ".lg, .idea, .prod__demo, .svc__item, .steps li, .others a, .principles li, .xr, .header__in, .ideas";
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest?.(SEL);
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    if (el.classList.contains("prod__demo")) {
      el.style.setProperty("--ty", `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`);
      el.style.setProperty("--tx", `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
    }
  }, { passive: true });
  document.querySelectorAll(".prod__demo").forEach((d) => d.addEventListener("pointerleave", () => { d.style.setProperty("--tx", "0deg"); d.style.setProperty("--ty", "0deg"); }));
})();

/* ── Scroll reveal: content rises out of the glass as it enters ── */
(function reveal() {
  const groups = [".intro", ".principles li", ".xr", ".prod__copy", ".prod__demo", ".svc__item", ".steps li", ".brief__qs", ".sketch", ".facts", ".feat li", ".note", ".cta-band", ".others a", ".footer__top > *", ".try"];
  const els = document.querySelectorAll(groups.join(","));
  els.forEach((el) => {
    if (el.closest(".hero")) return;
    el.classList.add("rv");
    const sibs = [...el.parentElement.children].filter((c) => c.matches(groups.join(",")));
    el.style.setProperty("--rv", Math.min(sibs.indexOf(el), 6));
  });
  if (reduced || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".rv").forEach((el) => io.observe(el));
})();

/* ── Hero word: types example processes until the visitor writes their own ── */
const heroWord = (function () {
  const input = document.getElementById("hero-word");
  if (!input) return null;
  const WORDS = ["مناقصه‌ها", "پیش‌فاکتورها", "گزارش‌های پروژه", "استعلام‌های مشتری", "بازرسی‌های کیفیت"];
  let owned = false, timer;
  const stop = () => { owned = true; clearTimeout(timer); };
  input.addEventListener("focus", () => { if (!owned) { stop(); input.select(); } });
  input.addEventListener("input", stop);
  if (!reduced) {
    let w = 0, i = WORDS[0].length, dir = -1;
    const tick = () => {
      if (owned) return;
      const word = WORDS[w];
      i += dir;
      input.value = word.slice(0, Math.max(0, i));
      if (dir < 0 && i <= 0) { w = (w + 1) % WORDS.length; dir = 1; i = 0; }
      else if (dir > 0 && i >= WORDS[w].length) { dir = -1; return (timer = setTimeout(tick, 2200)); }
      timer = setTimeout(tick, dir < 0 ? 45 : 90);
    };
    timer = setTimeout(tick, 2400);
  }
  return { owned: () => owned, value: () => input.value.trim(), focus: () => { input.focus(); input.select(); } };
})();

/* ── Enquiry side panel ──────────────────────────────
   One native <dialog> shared by every «درخواست اطلاعات» button (data-enquire="<product key>").
   The dialog handles focus trapping, Esc and the backdrop. */
const enquiry = (function buildEnquiry() {
  const dlg = document.createElement("dialog");
  dlg.className = "enq";
  dlg.setAttribute("aria-labelledby", "enq-title");
  const options = Object.entries(PRODUCTS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
  dlg.innerHTML = `
    <div class="enq__head">
      <h2 id="enq-title">درخواست اطلاعات</h2>
      <p>چند خط از نیازتان بنویسید. درخواست مستقیم به تیم نردبان می‌رسد و با شما تماس می‌گیریم.</p>
      <button class="enq__close" type="button" aria-label="بستن">×</button>
    </div>
    <form novalidate>
      <label class="f"><span>دربارهٔ</span><select name="product">${options}</select></label>
      <div class="enq__two">
        <label class="f"><span>نام شما</span><input name="name" type="text" maxlength="120" autocomplete="name" required></label>
        <label class="f"><span>شرکت <em>(اختیاری)</em></span><input name="company" type="text" maxlength="120" autocomplete="organization"></label>
      </div>
      <div class="enq__two">
        <label class="f"><span>شماره تماس</span><input name="reach" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" required class="ltr-input" placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"></label>
        <label class="f"><span>ایمیل <em>(اختیاری)</em></span><input name="email" type="email" maxlength="120" autocomplete="email" class="ltr-input"></label>
      </div>
      <label class="f"><span>نیاز شما</span><textarea name="need" rows="4" maxlength="1200" placeholder="مثلاً: در ماه حدود ده مناقصه بررسی می‌کنیم و می‌خواهیم خواندن اسناد سریع‌تر شود."></textarea></label>
      <fieldset class="enq__chips">
        <legend>زمان مناسب برای تماس</legend>
        <label><input type="radio" name="when" value="صبح"><span>صبح</span></label>
        <label><input type="radio" name="when" value="عصر"><span>عصر</span></label>
        <label><input type="radio" name="when" value="فرقی ندارد" checked><span>فرقی ندارد</span></label>
      </fieldset>
      <label class="hp" aria-hidden="true">وب‌سایت <input name="website" type="text" tabindex="-1" autocomplete="off"></label>
      <p class="enq__err" role="alert"></p>
      <div class="enq__foot">
        <button class="btn btn--primary" type="submit">ارسال درخواست</button>
        <small>اطلاعات شما فقط برای تماس دربارهٔ همین درخواست استفاده می‌شود.</small>
      </div>
    </form>
    <div class="enq__done" hidden></div>`;
  document.body.append(dlg);

  const form = dlg.querySelector("form");
  const done = dlg.querySelector(".enq__done");
  const err = dlg.querySelector(".enq__err");
  const submit = form.querySelector("[type=submit]");
  const title = dlg.querySelector("#enq-title");
  const el = form.elements;

  function close() {
    if (!dlg.open) return;
    if (reduced) return dlg.close();
    dlg.classList.add("is-closing");
    dlg.addEventListener("animationend", () => { dlg.classList.remove("is-closing"); dlg.close(); }, { once: true });
  }
  dlg.querySelector(".enq__close").addEventListener("click", close);
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); }); // backdrop

  function open(key = "", need = "") {
    form.hidden = false; done.hidden = true; err.textContent = "";
    el.product.value = key in PRODUCTS ? key : "";
    title.textContent = key ? `درخواست اطلاعات ${PRODUCTS[key]}` : "درخواست گفت‌وگو";
    if (need && !el.need.value.trim()) el.need.value = need;
    dlg.showModal();
    (el.name.value ? el.reach.value ? el.need : el.reach : el.name).focus();
  }
  el.product.addEventListener("change", () => {
    const k = el.product.value;
    title.textContent = k ? `درخواست اطلاعات ${PRODUCTS[k]}` : "درخواست گفت‌وگو";
  });

  function check() {
    if (!el.name.value.trim()) return [el.name, "نام خود را بنویسید."];
    if (!normalizePhone(el.reach.value)) return [el.reach, "شماره تماس درست نیست؛ مثلاً ۰۹۱۲۳۴۵۶۷۸۹."];
    const em = el.email.value.trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return [el.email, "ایمیل درست نیست؛ یا آن را اصلاح کنید یا خالی بگذارید."];
    if (!el.product.value && el.need.value.trim().length < 12) return [el.need, "برای پروژهٔ سفارشی، در یکی دو جمله بنویسید چه نیازی دارید."];
    return null;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = check();
    if (bad) { err.textContent = bad[1]; bad[0].focus(); return; }
    err.textContent = "";
    submit.disabled = true;
    submit.textContent = "در حال ارسال…";
    const key = el.product.value;
    const payload = {
      kind: "enquiry", product: PRODUCTS[key], name: el.name.value.trim(), company: el.company.value.trim(),
      reach: normalizePhone(el.reach.value), email: el.email.value.trim(), need: el.need.value.trim(),
      when: form.querySelector("[name=when]:checked")?.value || "", page: location.pathname, website: el.website.value,
    };
    try {
      await sendLead(payload);
      form.hidden = true; done.hidden = false;
      done.innerHTML = `<div class="enq__tick"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7"/></svg></div>
        <b>درخواست شما ارسال شد.</b><p>تیم نردبان با شماره‌ای که گذاشتید تماس می‌گیرد.</p><dl></dl>
        <button class="btn btn--ghost" type="button">بستن</button>`;
      const dl = done.querySelector("dl");
      for (const [k, v] of [["دربارهٔ", payload.product], ["نام", payload.name], ["تماس", fa(payload.reach)], ["زمان تماس", payload.when]]) {
        const dt = document.createElement("dt"), dd = document.createElement("dd");
        dt.textContent = k; dd.textContent = v; dl.append(dt, dd);
      }
      done.querySelector("button").addEventListener("click", close);
      done.querySelector("button").focus();
      el.need.value = "";
    } catch {
      err.textContent = "ارسال انجام نشد. اطلاعات شما سر جایش است؛ چند لحظه بعد دوباره «ارسال درخواست» را بزنید.";
    } finally {
      submit.disabled = false;
      submit.textContent = "ارسال درخواست";
    }
  });

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-enquire]");
    if (b) { e.preventDefault(); open(b.dataset.enquire); }
  });
  return { open };
})();

/* ── Problem brief ─────────────────────────────────
   Three answers build a live sketch. Keyword rules (deterministic, no AI)
   suggest related products and services. The visitor reviews, then sends. */
(function problemBrief() {
  const form = document.getElementById("brief");
  if (!form) return;
  const submit = document.getElementById("brief-submit");
  const hint = document.getElementById("brief-hint");
  const done = document.getElementById("brief-done");
  const capsBox = form.querySelector(".sketch__caps");
  const capsOut = document.getElementById("caps-out");
  const node = (k) => form.querySelector(`.sketch__flow li[data-k="${k}"]`);
  const DRAFT_KEY = "ladder-brief-draft";

  const RULES = [
    { re: /مناقصه|ستاد|پاکت|مزایده/, name: "مناقصه‌بان", href: "products/monaghese-ban.html", why: "خواندن اسناد مناقصه و سنجش آمادگی شرکت" },
    { re: /قیمت تمام|متر مربع|متری|ساخت‌وساز|ساختمان|مسکونی|زمین/, name: "استیتر", href: "products/stater.html", why: "برآورد قیمت تمام‌شدهٔ هر متر مربع در سه سناریو" },
    { re: /سازه|سوله|سقف|فضایی|مبحث|۲۸۰۰|بارگذاری/, name: "دستیار برآورد هزینه سازه", href: "products/space-frame.html", why: "طراحی و برآورد سقف سازهٔ فضایی" },
    { re: /سند|اسناد|pdf|اسکن|کاغذ|قرارداد|نامه|مدارک|فرم/i, name: "هوش اسناد", href: "#services", why: "خواندن اسناد و استخراج اطلاعات، با منبع" },
    { re: /تکرار|دستی|ایمیل|پیگیری|کپی|وارد کردن|یک هفته|چند روز|ساعت/, name: "خودکارسازی فرایند", href: "#services", why: "برداشتن کار تکراری از دوش آدم‌ها" },
    { re: /کارشناس|اپراتور|درخواست|مشتری|پاسخ|تیکت|پیام/, name: "عامل‌های هوشمند", href: "#services", why: "انجام بخشی از کار و برگرداندن نتیجه برای تأیید" },
    { re: /تعامل|مکاتبه|مکاتبات|بین واحد|واحدها|پیام‌رسان|نامه‌نگاری|ارجاع/, name: "هوشمندسازی تعاملات سازمانی", href: "#services", why: "درخواست‌ها و پیام‌ها یک جا، با مسئول و وضعیت روشن" },
    { re: /اکسل|excel|گزارش|داشبورد|شاخص|فروش|آمار|حسابداری|تصمیم/i, name: "پشتیبانی تصمیم و گزارش", href: "#services", why: "تصویر روشن از وضعیت، از داده‌ای که دارید" },
    { re: /دانش|پوشه|آرشیو|جست‌?وجو|جستجو|تجربه|بایگانی/, name: "دانش سازمان", href: "#services", why: "دانش پراکنده در یک جا و قابل جست‌وجو" },
  ];

  const val = (n) => form.elements[n].value.trim();
  const clip = (t, n = 90) => (t.length > n ? t.slice(0, n).trim() + "…" : t);
  function setNode(k, text) {
    const li = node(k), sm = li.querySelector("small");
    li.classList.toggle("is-set", !!text);
    sm.textContent = text || sm.dataset.empty;
  }
  const matchCaps = () => RULES.filter((r) => r.re.test([val("problem"), val("process"), val("data")].join(" ")));

  function update() {
    const p = val("problem"), pr = val("process"), d = val("data");
    setNode("problem", clip(p)); setNode("process", clip(pr)); setNode("data", clip(d));
    const caps = matchCaps();
    const ready = p.length >= 12 && (pr || d);
    setNode("intel", ready ? (caps.length ? `${caps[0].name}: ${caps[0].why}` : "در گفت‌وگو مشخص می‌شود") : "");
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

  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (draft) for (const k in draft) if (form.elements[k]) form.elements[k].value = draft[k];
  } catch {}
  form.addEventListener("input", update);
  update();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    submit.textContent = "در حال ارسال…";
    try {
      await sendLead({
        kind: "brief", problem: val("problem"), process: val("process"), data: val("data"),
        name: val("name"), reach: normalizePhone(val("reach")), website: form.elements.website.value,
        caps: matchCaps().map((c) => c.name),
      });
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      form.querySelector(".brief__send").hidden = true;
      done.hidden = false;
      done.innerHTML = `<b>مسئلهٔ شما ارسال شد.</b><p>تیم نردبان آن را می‌خواند و با شماره‌ای که گذاشتید تماس می‌گیرد.</p>`;
    } catch {
      submit.textContent = "ارسال مسئله";
      submit.disabled = false;
      hint.classList.add("is-error");
      hint.textContent = "ارسال انجام نشد. پاسخ‌هایتان ذخیره شده است؛ چند لحظه بعد دوباره «ارسال مسئله» را بزنید.";
    }
  });
})();

/* ── Process explorer ──────────────────────────────
   The visitor picks a common process and switches between «امروز» and «با سیستم».
   «با همین فرایند شروع کنید» fills the empty brief questions and goes to them. */
(function processExplorer() {
  const root = document.getElementById("problems");
  if (!root) return;

  // step: [name, today, role, with the system]
  const PROCS = [
    {
      name: "مناقصه", tools: "سامانه ستاد، اکسل و پوشه‌های مدارک",
      problem: "آماده کردن مدارک هر مناقصه وقت زیادی می‌گیرد و گاهی مدرکی جا می‌افتد.",
      process: "اسناد مناقصه دستی خوانده می‌شود، الزامات در اکسل فهرست می‌شود و مدارک از پوشه‌ها جمع می‌شود.",
      steps: [
        ["پیدا کردن مناقصه", "سر زدن هر روزه به سامانه ستاد", "auto", "کشف خودکار مناقصه‌های مرتبط"],
        ["خواندن اسناد", "ده‌ها صفحه، خط‌به‌خط", "ai", "استخراج الزامات با ارجاع به صفحه و بند"],
        ["فهرست الزامات", "تایپ دوباره در اکسل", "auto", "فهرست ساخت‌یافته، بدون تایپ"],
        ["تطبیق مدارک", "گشتن در پوشه‌ها و بایگانی", "ai", "مقایسه با مدارک شرکت و یافتن کمبودها"],
        ["شرکت یا انصراف", "تصمیم با اطلاعات ناقص", "human", "تصمیم شما، با تصویر کامل"],
        ["بستن پاکت‌ها", "چک‌لیست کاغذی", "auto", "چک‌لیست پاکت‌های الف، ب و ج"],
      ],
    },
    {
      name: "خرید و تأمین", tools: "فرم کاغذی، پیام‌رسان و اکسل",
      problem: "درخواست‌های خرید بین واحدها گم می‌شود و مقایسهٔ پیش‌فاکتورها زمان‌بر است.",
      process: "درخواست‌ها با فرم کاغذی و پیام می‌آیند، پیش‌فاکتورها در اکسل مقایسه و برای امضا دست‌به‌دست می‌شوند.",
      steps: [
        ["ثبت درخواست", "فرم کاغذی یا پیام", "auto", "یک فرم، با وضعیت قابل پیگیری"],
        ["استعلام قیمت", "تماس تلفنی با تأمین‌کننده‌ها", "auto", "ارسال استعلام به فهرست تأمین‌کنندگان"],
        ["خواندن پیش‌فاکتورها", "هر کدام در یک قالب", "ai", "استخراج قیمت، زمان تحویل و شرایط"],
        ["مقایسه", "جدول دستی در اکسل", "auto", "جدول مقایسه، کنار سابقهٔ خریدهای قبلی"],
        ["انتخاب تأمین‌کننده", "جلسه و حدس", "human", "انتخاب شما، با شواهد کنار هم"],
        ["پیگیری تحویل", "تماس‌های مکرر", "auto", "یادآوری و ثبت وضعیت تحویل"],
      ],
    },
    {
      name: "گزارش پیشرفت پروژه", tools: "گزارش کاغذی کارگاه، پیام‌رسان و اکسل",
      problem: "تهیهٔ گزارش پیشرفت پروژه هر هفته چند روز وقت می‌گیرد و تا آماده شود کهنه شده است.",
      process: "گزارش‌های روزانهٔ کارگاه جمع می‌شود، در اکسل تجمیع و به صورت فایل برای مدیر فرستاده می‌شود.",
      steps: [
        ["گزارش روزانه", "کاغذ و عکس در پیام‌رسان", "auto", "ثبت از موبایل، با عکس و تاریخ"],
        ["خواندن گزارش‌ها", "یک نفر همه را می‌خواند", "ai", "خلاصهٔ کار انجام‌شده و موانع"],
        ["تجمیع", "کپی کردن در اکسل", "auto", "تجمیع خودکار روی برنامهٔ زمان‌بندی"],
        ["مقایسه با برنامه", "برآورد چشمی", "auto", "انحراف از برنامه، به تفکیک فعالیت"],
        ["هشدار", "وقتی که دیر شده", "ai", "نشان دادن ریسک تأخیر، با دلیلش"],
        ["تصمیم مدیر", "جلسه بدون دادهٔ به‌روز", "human", "تصمیم شما، با تصویر امروز پروژه"],
      ],
    },
    {
      name: "استعلام مشتری", tools: "ایمیل، تلفن و اکسل",
      problem: "پاسخ به استعلام مشتری‌ها و ساختن پیش‌فاکتور کند است و به چند نفر وابسته است.",
      process: "استعلام با ایمیل یا تماس می‌رسد، کارشناس فنی مشخصات را می‌خواند و قیمت در اکسل حساب می‌شود.",
      steps: [
        ["دریافت استعلام", "ایمیل، تماس و پیام", "auto", "همه در یک صف، با وضعیت"],
        ["فهم نیاز", "کارشناس فنی نامه را می‌خواند", "ai", "استخراج مشخصات و مقادیر از نامه و پیوست"],
        ["یافتن سابقه", "پرسیدن از همکاران", "ai", "پروژه‌ها و قیمت‌های مشابه قبلی"],
        ["محاسبهٔ قیمت", "اکسل شخصی", "auto", "محاسبه با قواعد قیمت‌گذاری شرکت"],
        ["تأیید پیشنهاد", "امضای مدیر روی کاغذ", "human", "تأیید شما پیش از ارسال"],
        ["پیگیری", "اگر یادمان بماند", "auto", "یادآوری پیگیری و ثبت نتیجه"],
      ],
    },
    {
      name: "کنترل کیفیت", tools: "چک‌لیست کاغذی، اکسل و بایگانی",
      problem: "نتایج بازرسی و کنترل کیفیت پراکنده است و الگوی خطاها دیده نمی‌شود.",
      process: "بازرس‌ها چک‌لیست کاغذی پر می‌کنند و بعد نتایج در اکسل وارد می‌شود.",
      steps: [
        ["بازرسی", "چک‌لیست کاغذی", "auto", "چک‌لیست روی تبلت، با عکس"],
        ["ورود داده", "تایپ دوباره در اکسل", "auto", "همان لحظه ثبت می‌شود"],
        ["تطبیق با استاندارد", "از حافظهٔ بازرس", "ai", "یافتن بند مرتبط استاندارد، با ارجاع"],
        ["عدم انطباق", "فرم جدا و پیگیری دستی", "auto", "ارجاع به مسئول، با مهلت"],
        ["ریشه‌یابی", "کمتر فرصتش پیش می‌آید", "ai", "یافتن الگوی تکرار خطا در سوابق"],
        ["اقدام اصلاحی", "بعد از تکرار مشکل", "human", "تصمیم تیم کیفیت، با شواهد"],
      ],
    },
  ];

  const procsBox = document.getElementById("xr-procs");
  const stage = root.querySelector(".xr__stage");
  const flow = document.getElementById("xr-flow");
  const sum = document.getElementById("xr-sum");
  const modeBtns = [...root.querySelectorAll(".xr__mode button")];
  let cur = 0, mode = "today";

  const tabs = PROCS.map((p, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.role = "tab"; b.textContent = p.name;
    b.addEventListener("click", () => pick(i));
    procsBox.append(b);
    return b;
  });

  function summary() {
    const p = PROCS[cur], n = p.steps.length;
    const c = (r) => p.steps.filter((s) => s[2] === r).length;
    sum.innerHTML = mode === "today"
      ? `امروز: ${fa(n)} قدم، همه با نیروی انسانی.<span>بین ${p.tools} دست‌به‌دست می‌شود.</span>`
      : `با سیستم: ${fa(c("auto"))} قدم خودکار، ${fa(c("ai"))} قدم با هوش مصنوعی و ${fa(c("human"))} تصمیم که با شما می‌ماند.<span>هر خروجی هوش مصنوعی منبعش را نشان می‌دهد و بدون تأیید شما اقدامی انجام نمی‌شود.</span>`;
  }

  function pick(i) {
    cur = i;
    tabs.forEach((b, k) => b.setAttribute("aria-selected", k === i));
    flow.replaceChildren(...PROCS[i].steps.map(([name, today, role, sys], k) => {
      const li = document.createElement("li");
      li.className = `xs xs--${role}`;
      li.style.setProperty("--i", k);
      li.innerHTML = `<span class="xs__node" aria-hidden="true"></span><b></b><small class="xs__today"></small><small class="xs__sys"></small>`;
      li.querySelector("b").textContent = name;
      li.querySelector(".xs__today").textContent = today;
      li.querySelector(".xs__sys").textContent = sys;
      return li;
    }));
    summary();
  }

  function setMode(m) {
    mode = m;
    stage.dataset.mode = m;
    modeBtns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === m));
    summary();
  }
  modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));

  // Fill only the questions the visitor hasn't answered yet; never overwrite their words.
  function goToBrief(values) {
    const form = document.getElementById("brief");
    for (const [k, v] of values) if (!form.elements[k].value.trim()) form.elements[k].value = v;
    form.dispatchEvent(new Event("input"));
    document.getElementById("contact").scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    setTimeout(() => form.elements.problem.focus({ preventScroll: true }), reduced ? 0 : 700);
  }
  document.getElementById("xr-start").addEventListener("click", () => {
    const p = PROCS[cur];
    goToBrief([["problem", p.problem], ["process", p.process]]);
  });
  document.getElementById("own").addEventListener("submit", (e) => {
    e.preventDefault();
    const t = e.target.elements.own.value.trim();
    goToBrief(t ? [["problem", t]] : []);
  });

  // Hero idea cards: three common processes + "your own idea"
  const ideas = document.getElementById("ideas");
  if (ideas) {
    PROCS.slice(0, 3).forEach((p, i) => {
      const n = p.steps.length, auto = p.steps.filter((x) => x[2] !== "human").length;
      const a = document.createElement("a");
      a.className = "idea"; a.href = "#problems";
      a.innerHTML = `<small></small><b></b><p></p><small></small>`;
      a.children[0].textContent = "امروز: " + p.tools;
      a.children[1].textContent = p.name;
      a.children[2].textContent = p.problem;
      a.children[3].textContent = `${fa(auto)} قدم از ${fa(n)} قدم با سیستم؛ تصمیم با شما`;
      a.addEventListener("click", () => { pick(i); setMode("system"); });
      ideas.append(a);
    });
    const own = document.createElement("button");
    own.type = "button"; own.className = "idea";
    own.innerHTML = `<small>ایدهٔ خودتان</small><b>می‌دانم چه چیزی را خودکار کنم</b><p>در کادر بالا بنویسید؛ می‌گوییم ساختنش چه می‌خواهد.</p><small>نوشتن در کادر بالا</small>`;
    own.addEventListener("click", () => { heroWord?.focus(); scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });
    ideas.append(own);
  }
  // Hero CTA carries the visitor's own word into the brief
  document.getElementById("hero-go")?.addEventListener("click", (e) => {
    if (!heroWord?.owned() || !heroWord.value()) return;
    e.preventDefault();
    goToBrief([["problem", `می‌خواهم ${heroWord.value()} را خودکار کنم.`]]);
  });

  pick(0);
})();

/* ── Product recordings: play only while on screen ── */
(function recordings() {
  const vids = document.querySelectorAll(".rec video");
  if (!vids.length) return;
  if (reduced) { vids.forEach((v) => { v.controls = true; v.preload = "metadata"; }); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause();
  }), { threshold: 0.35 });
  vids.forEach((v) => io.observe(v));
})();

/* ── Demo: document → structured rows (on click) ───── */
document.querySelectorAll("[data-extract]").forEach((box) => {
  const btn = box.querySelector("[data-read]");
  const sheet = box.querySelector(".sheet");
  const scan = sheet.querySelector(".sheet__scan");
  const rowsBox = box.querySelector(".rows");
  const rows = rowsBox.querySelectorAll(".row");
  const marks = [...sheet.querySelectorAll("[data-hl]")];
  btn.addEventListener("click", () => {
    if (reduced || !sheet.offsetParent) { // sheet hidden on phones: reveal rows one by one
      rows.forEach((r) => r.classList.remove("is-on"));
      rowsBox.classList.add("is-reading");
      rows.forEach((r, i) => setTimeout(() => r.classList.add("is-on"), reduced ? 0 : 350 * (i + 1)));
      setTimeout(() => rowsBox.classList.remove("is-reading"), reduced ? 0 : 350 * (rows.length + 1));
      marks.forEach((m) => m.classList.add("hl"));
      return;
    }
    btn.disabled = true;
    marks.forEach((m) => m.classList.remove("hl"));
    rows.forEach((r) => r.classList.remove("is-on"));
    rowsBox.classList.add("is-reading");
    const h = sheet.clientHeight, dur = 2600, t0 = performance.now();
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
      btn.disabled = false;
      btn.textContent = "دوباره بخوانید";
    })(t0);
  });
});

/* ── Demo: Stater scenarios ─────────────────────────── */
document.querySelectorAll("[data-scenarios]").forEach((box) => {
  const NOTES = [
    "روند فعلی: اگر قیمت مصالح، دستمزد و ارز با همین روند جلو بروند.",
    "افزایش متعادل: اگر قیمت‌ها تندتر از روند فعلی بالا بروند.",
    "جهش و شوک شدید: اگر بازار یکباره جهش کند؛ برای سنجیدن ریسک پروژه.",
  ];
  const tabs = [...box.querySelectorAll("[data-s]")];
  const bars = [...box.querySelectorAll(".scen__bar")];
  const note = box.querySelector(".scen__note");
  const show = (i) => {
    tabs.forEach((t, k) => t.setAttribute("aria-selected", k === i));
    bars.forEach((b, k) => b.classList.toggle("is-on", k === i));
    note.textContent = NOTES[i] + " هر سناریو بازه، میزان اطمینان و تحلیل حساسیت خودش را دارد.";
  };
  tabs.forEach((t, i) => t.addEventListener("click", () => show(i)));
  show(0);
});

/* ── Demo: space-frame roof, double layer, morphing between shapes ── */
document.querySelectorAll("[data-frame]").forEach((box) => {
  const svg = box.querySelector("svg");
  const NS = "http://www.w3.org/2000/svg";
  const N = 9;                      // top-layer nodes per side
  const W = 30, H = 120, DEPTH = 14; // cell width, rise scale, layer depth (px)
  const cx = 260, cy = 70;
  const SHAPES = {
    flat:   () => 0,
    barrel: (u, v) => 1 - (2 * v - 1) ** 2,
    wave:   (u, v) => Math.abs(Math.sin(3 * Math.PI * v)) * 0.55,
    dome:   (u, v) => Math.max(0, 1 - ((u - 0.5) ** 2 + (v - 0.5) ** 2) * 4),
  };
  const VIS = { dome: (u, v) => ((u - 0.5) ** 2 + (v - 0.5) ** 2 <= 0.2501 ? 1 : 0) };
  const pts = [];
  const add = (u, v, layer) => (pts.push({ u, v, layer, z: 0, z0: 0, z1: 0, o: 1, o0: 1, o1: 1 }), pts.length - 1);
  const top = [], bot = [];
  for (let i = 0; i < N; i++) { top[i] = []; for (let j = 0; j < N; j++) top[i][j] = add(i / (N - 1), j / (N - 1), 0); }
  for (let i = 0; i < N - 1; i++) { bot[i] = []; for (let j = 0; j < N - 1; j++) bot[i][j] = add((i + 0.5) / (N - 1), (j + 0.5) / (N - 1), 1); }

  const lines = [];
  const g = (cls) => { const e = document.createElementNS(NS, "g"); e.setAttribute("class", cls); svg.append(e); return e; };
  const gBot = g("bot"), gDia = g("dia"), gTop = g("top");
  const line = (a, b, parent, stroke, w) => {
    const e = document.createElementNS(NS, "line");
    e.style.stroke = stroke; e.setAttribute("stroke-width", w);
    parent.append(e); lines.push({ a, b, e });
  };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    if (i < N - 1) line(top[i][j], top[i + 1][j], gTop, "#E9EBEE", 1.6);
    if (j < N - 1) line(top[i][j], top[i][j + 1], gTop, "#E9EBEE", 1.6);
  }
  for (let i = 0; i < N - 1; i++) for (let j = 0; j < N - 1; j++) {
    if (i < N - 2) line(bot[i][j], bot[i + 1][j], gBot, "#6E747D", 1.2);
    if (j < N - 2) line(bot[i][j], bot[i][j + 1], gBot, "#6E747D", 1.2);
    for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) line(bot[i][j], top[i + a][j + b], gDia, "var(--a1)", 0.9);
  }
  gDia.setAttribute("opacity", 0.7);

  const proj = (p) => {
    const x = cx + (p.u - p.v) * (N - 1) * W * 0.866;
    const y = cy + (p.u + p.v) * (N - 1) * W * 0.5 - p.z * H + (p.layer ? DEPTH : 0);
    return [x, y];
  };
  function draw() {
    for (const { a, b, e } of lines) {
      const [x1, y1] = proj(pts[a]), [x2, y2] = proj(pts[b]);
      e.setAttribute("x1", x1.toFixed(1)); e.setAttribute("y1", y1.toFixed(1));
      e.setAttribute("x2", x2.toFixed(1)); e.setAttribute("y2", y2.toFixed(1));
      e.setAttribute("opacity", Math.min(pts[a].o, pts[b].o).toFixed(2));
    }
  }
  function set(shape, animate) {
    const f = SHAPES[shape], vis = VIS[shape] || (() => 1);
    pts.forEach((p) => { p.z0 = p.z; p.o0 = p.o; p.z1 = f(p.u, p.v) * 0.9; p.o1 = vis(p.u, p.v); });
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    if (!animate || reduced) { pts.forEach((p) => { p.z = p.z1; p.o = p.o1; }); return draw(); }
    const t0 = performance.now();
    (function frame(now) {
      const t = ease(Math.min(1, (now - t0) / 700));
      pts.forEach((p) => { p.z = p.z0 + (p.z1 - p.z0) * t; p.o = p.o0 + (p.o1 - p.o0) * t; });
      draw();
      if (t < 1) requestAnimationFrame(frame);
    })(t0);
  }
  const btns = [...box.querySelectorAll("[data-shape]")];
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.setAttribute("aria-pressed", x === b));
    set(b.dataset.shape, true);
  }));
  set("flat", false);
});
