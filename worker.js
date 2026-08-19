export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/waitlist" && request.method === "POST") {
      try {
        const body = await request.json();
        const wallet = String(body.wallet || "").trim();

        if (!wallet || wallet.length < 10 || wallet.length > 120) {
          return Response.json({ ok: false, error: "Invalid wallet address." }, { status: 400 });
        }

        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS waitlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`
        ).run();

        await env.DB.prepare(
          "INSERT OR IGNORE INTO waitlist (wallet) VALUES (?)"
        ).bind(wallet).run();

        return Response.json({ ok: true });
      } catch (e) {
        return Response.json({ ok: false, error: "Unable to save wallet." }, { status: 500 });
      }
    }

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, service: "glitchedhood" });
    }

    return env.ASSETS.fetch(request);
  }
};
