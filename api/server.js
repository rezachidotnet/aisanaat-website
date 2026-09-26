// Plain Node server for the same relay (for a VPS inside Iran, or local testing).
// Usage:  node api/server.js        (reads settings from api/.env; Node 18+, no dependencies)
// Serves POST /api/brief.

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import relay from "./worker.js";

const here = dirname(fileURLToPath(import.meta.url));
const env = { ...process.env };
const envFile = join(here, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const PORT = Number(env.PORT || 8787);

createServer(async (req, res) => {
  if (!req.url.startsWith("/api/brief")) { res.writeHead(404).end(); return; }
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size > 20000) { res.writeHead(413).end(); return; } chunks.push(c); }
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  const response = await relay.fetch(request, env);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}).listen(PORT, () => console.log(`brief relay on http://localhost:${PORT}/api/brief`));
