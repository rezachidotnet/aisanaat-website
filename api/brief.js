// Vercel Function: POST /api/brief → the relay in worker.js, with settings from the project's
// environment variables (BOT_TOKEN, CHAT_ID, ALLOWED_ORIGIN). Set them in Vercel, never in the repo.

import relay from "./worker.js";

export default {
  fetch: (request) => relay.fetch(request, process.env),
};
