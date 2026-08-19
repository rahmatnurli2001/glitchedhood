GLITCHED HOOD — FULL-STACK CLOUDFLARE WORKER

This package combines:
- Static website assets
- A Cloudflare Worker API
- Cloudflare D1 storage for wallet addresses
- X profile and post buttons

IMPORTANT:
The D1 database already created in your Cloudflare account is named:
glitchedhood-waitlist

The package needs the D1 database ID if you deploy with Wrangler.
You can find it on the D1 database page, then replace:
REPLACE_WITH_YOUR_D1_DATABASE_ID
in wrangler.jsonc.

EASIER DASHBOARD ROUTE FOR YOUR CURRENT SETUP:
1. Create a Worker from the "Hello World" template (not "Upload your static files").
2. Open Edit Code.
3. Use worker.js as the Worker code.
4. Deploy.
5. Go to Bindings > Add binding > D1 database.
6. Variable name: DB
7. Select glitchedhood-waitlist.
8. Add binding.
9. The static files in public/ should be deployed together with the Worker using Wrangler/Git integration. The dashboard's static-only upload screen cannot turn a static-only Worker into a full-stack Worker.

X LINKS USED BY THE SITE:
Profile:
https://x.com/glitched_hood

Post:
https://x.com/glitched_hood/status/2089545273299370321

The Like/Repost button opens the post. X decides the user's actual like/repost state.
This package does NOT pretend to verify likes/reposts through an X API.

D1 TABLE:
The Worker automatically creates:
waitlist(id, wallet, created_at)

Wallet addresses are stored only after the user submits the form.
