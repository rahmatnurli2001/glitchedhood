export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // WAITLIST - SAVE WALLET
    // =========================
    if (url.pathname === "/api/waitlist" && request.method === "POST") {
      try {
        const body = await request.json();
        const wallet = String(body.wallet || "").trim();

        if (!wallet || wallet.length < 10 || wallet.length > 120) {
          return Response.json(
            { ok: false, error: "Invalid wallet address." },
            { status: 400 }
          );
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
        return Response.json(
          { ok: false, error: "Unable to save wallet." },
          { status: 500 }
        );
      }
    }

    // =========================
    // ADMIN PAGE
    // =========================
    if (url.pathname === "/admin" && request.method === "GET") {
      return new Response(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GLITCHED HOOD — Admin</title>
<style>
body{
  margin:0;
  padding:30px 20px;
  background:#050505;
  color:#fff;
  font-family:Arial,sans-serif;
}
main{
  max-width:800px;
  margin:auto;
}
h1{
  font-size:32px;
  letter-spacing:3px;
}
input,button{
  width:100%;
  box-sizing:border-box;
  padding:16px;
  margin-top:12px;
  border-radius:10px;
  font-size:16px;
}
input{
  background:#111;
  color:#fff;
  border:1px solid #555;
}
button{
  background:#fff;
  color:#000;
  border:0;
  font-weight:bold;
}
#status{
  margin:20px 0;
}
table{
  width:100%;
  border-collapse:collapse;
  margin-top:20px;
}
th,td{
  padding:12px;
  border-bottom:1px solid #333;
  text-align:left;
  word-break:break-all;
}
th{
  color:#aaa;
}
</style>
</head>

<body>
<main>
<h1>GLITCHED HOOD ADMIN</h1>

<input id="key" type="password" placeholder="Admin password">
<button onclick="loadList()">VIEW WAITLIST</button>

<div id="status"></div>
<div id="result"></div>

<script>
async function loadList(){
  const key = document.getElementById("key").value;
  const status = document.getElementById("status");
  const result = document.getElementById("result");

  status.textContent = "Loading...";
  result.innerHTML = "";

  try {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ key })
    });

    const data = await response.json();

    if (!data.ok) {
      status.textContent = data.error || "Access denied.";
      return;
    }

    status.textContent = "Total entries: " + data.total;

    const table = document.createElement("table");

    const header = document.createElement("tr");

    ["ID","WALLET","DATE"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      header.appendChild(th);
    });

    table.appendChild(header);

    data.rows.forEach(row => {
      const tr = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = row.id;

      const wallet = document.createElement("td");
      wallet.textContent = row.wallet;

      const date = document.createElement("td");
      date.textContent = row.created_at;

      tr.appendChild(id);
      tr.appendChild(wallet);
      tr.appendChild(date);

      table.appendChild(tr);
    });

    result.appendChild(table);

  } catch (e) {
    status.textContent = "Connection error.";
  }
}
</script>

</main>
</body>
</html>`, {
        headers: {
          "content-type": "text/html; charset=UTF-8"
        }
      });
    }

    // =========================
    // ADMIN API
    // =========================
    if (url.pathname === "/api/admin" && request.method === "POST") {
      try {
        const body = await request.json();
        const key = String(body.key || "");

        if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
          return Response.json(
            { ok: false, error: "Invalid admin password." },
            { status: 401 }
          );
        }

        const result = await env.DB.prepare(
          `SELECT id, wallet, created_at
           FROM waitlist
           ORDER BY id DESC`
        ).all();

        return Response.json({
          ok: true,
          total: result.results.length,
          rows: result.results
        });

      } catch (e) {
        return Response.json(
          { ok: false, error: "Unable to load waitlist." },
          { status: 500 }
        );
      }
    }

    // =========================
    // HEALTH CHECK
    // =========================
    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "glitchedhood"
      });
    }

    // =========================
    // WEBSITE
    // =========================
    return env.ASSETS.fetch(request);
  }
};
