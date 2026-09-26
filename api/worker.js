// فناساخت — problem brief → Bale.
// Receives the brief from the website and posts it to the owner's Bale chat through a bot.
// The bot token never reaches the browser.
// Runs as a Cloudflare Worker (this file) or as a plain Node server (server.js).
//
// Settings:
//   BOT_TOKEN        secret   token from @botfather in Bale
//   CHAT_ID          secret   the Bale chat that receives briefs (see README.md)
//   ALLOWED_ORIGIN   var      the site's origin(s), comma-separated, e.g. https://fanasakht.ir
//   BALE_API         var      optional, only for tests (default https://tapi.bale.ai)

const LIMITS = { problem: 1200, process: 1200, data: 1200, name: 120, reach: 30 };

// Same rule as the site: an Iranian phone number, normalized to 11 digits (e.g. 09121234567), or "".
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedList = (env.ALLOWED_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
    const allowed = allowedList.includes(origin) ? origin : allowedList[0] || "";
    const cors = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "method" }, 405, cors);
    if (allowedList.length && !allowedList.includes(origin)) return json({ error: "origin" }, 403, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: "json" }, 400, cors); }

    // Honeypot: bots fill the hidden "website" field. Pretend success, send nothing.
    if (body.website) return json({ ok: true }, 200, cors);

    const f = {};
    for (const k in LIMITS) f[k] = String(body[k] || "").trim().slice(0, LIMITS[k]);
    f.reach = normalizePhone(f.reach);
    if (f.problem.length < 12 || !f.reach) return json({ error: "fields" }, 422, cors);
    const caps = Array.isArray(body.caps) ? body.caps.slice(0, 8).map((c) => String(c).slice(0, 40)) : [];

    // Plain text (no parse_mode), so visitor input can't inject formatting or links.
    const text = [
      "مسئلهٔ جدید از سایت فناساخت",
      "",
      "مسئله: " + f.problem,
      "فرایند: " + (f.process || "-"),
      "داده: " + (f.data || "-"),
      "",
      "نام: " + (f.name || "-"),
      "شماره تماس: " + f.reach,
      caps.length ? "توانمندی‌های مرتبط: " + caps.join("، ") : "",
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");

    const base = env.BALE_API || "https://tapi.bale.ai";
    let sent;
    try {
      sent = await fetch(`${base}/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: env.CHAT_ID, text }),
      });
    } catch {
      return json({ error: "bale_unreachable" }, 502, cors);
    }
    if (!sent.ok) return json({ error: "bale" }, 502, cors);
    return json({ ok: true }, 200, cors);
  },
};

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json" } });
}
