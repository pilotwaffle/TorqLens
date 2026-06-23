# TorqLens — Backend Deploy (Vercel)

This is the **last non-Mac prerequisite** before the cloud-Mac TestFlight build.
Deploying the Next.js app to Vercel gives you, over HTTPS:

- `POST /api/identify` and `POST /api/info` — the endpoints the iOS app calls
- `/privacy` and `/support` — the public URLs App Store Connect requires

The repo is already deploy-ready: the default `next build` is a server build
(API routes included), routes run on the Node.js runtime, and there is no
conflicting config. Vercel auto-detects Next.js. **~15 minutes, no Mac needed.**

> Do not paste secrets into chat or commit them. `ANTHROPIC_API_KEY` is set in
> Vercel's encrypted env store only.

---

## Prerequisites
- The repo on GitHub: `pilotwaffle/TorqLens` (private — already pushed).
- A Vercel account (free Hobby tier is fine to start) — sign in at vercel.com,
  ideally with the same GitHub account so it can see the private repo.
- An **Anthropic API key** for the backend model (Claude Sonnet 4.6). Get one at
  console.anthropic.com → API Keys. You'll paste it into Vercel, never here.

---

## Option A — Deploy from the Vercel dashboard (recommended, no CLI)

1. **Import the repo**
   - Vercel dashboard → **Add New… → Project**.
   - Find **pilotwaffle/TorqLens** (authorize Vercel for the private repo if asked) → **Import**.

2. **Framework / build settings** — leave defaults:
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `next build` (default — do **not** change to a Capacitor build)
   - Install Command: `npm install` (default)
   - Output: default
   - Root Directory: `./` (default)

3. **Environment Variables** — add these (Production + Preview):

   | Name | Value | Notes |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | *(paste your real key)* | **Server-only.** Powers `/api/identify` + `/api/info`. Never prefix with `NEXT_PUBLIC_`. |
   | `NEXT_PUBLIC_API_BASE_URL` | *(leave empty)* | The web app calls its own origin. Empty = same-origin. (The **iOS** build sets this to the deployed URL — see below.) |

   Add `ANTHROPIC_API_KEY` by typing the name, pasting the value into the masked
   field, and selecting Production + Preview. Do not put it in a file.

4. **Deploy.** Vercel runs `npm install` + `next build` and gives you a URL like
   `https://torqlens.vercel.app` (or your custom domain).

5. **Verify** (see Health check below).

---

## Option B — Deploy from the CLI

```bash
npm i -g vercel
cd TorqLens
vercel link          # link to the project (creates one if new)
vercel env add ANTHROPIC_API_KEY production   # paste the key when prompted (masked)
vercel env add ANTHROPIC_API_KEY preview
vercel --prod        # build + deploy to production
```
> `NEXT_PUBLIC_API_BASE_URL` can stay unset for the web deploy (same-origin).

---

## Custom domain (optional but recommended)
A stable domain makes the App Store Privacy/Support URLs cleaner and lets you
redeploy without changing the iOS build's backend URL.
- Vercel → Project → **Settings → Domains** → add e.g. `api.torqlens.app` or
  `torqlens.app`, then point DNS as Vercel instructs.
- Whatever final HTTPS host you land on is the value you'll use for the iOS
  build's `NEXT_PUBLIC_API_BASE_URL`.

---

## Health check (run before the cloud-Mac build)

Replace `https://YOUR-DEPLOYMENT` with your live URL.

1. **Pages are live (App Store URLs):**
   ```bash
   curl -s -o /dev/null -w "privacy %{http_code}\n" https://YOUR-DEPLOYMENT/privacy
   curl -s -o /dev/null -w "support %{http_code}\n" https://YOUR-DEPLOYMENT/support
   ```
   Expect `200` for both. These become the **Privacy Policy URL** and
   **Support URL** in App Store Connect.

2. **Identify returns a real result** (needs `ANTHROPIC_API_KEY` set):
   ```bash
   IMG="data:image/jpeg;base64,$(base64 -i test-plant.jpg | tr -d '\n')"
   curl -s -X POST https://YOUR-DEPLOYMENT/api/identify \
     -H 'Content-Type: application/json' \
     -d "{\"image\":\"$IMG\"}" | head -c 600
   ```
   Expect JSON like `{"identified":true,"isPlant":true,"primary":{...},"candidates":[...]}`.
   If you instead get `{"error":"Something went wrong..."}`, the key isn't set
   or is wrong — fix it in Vercel env and redeploy.

3. **Errors are sanitized** (no provider/key/stack leak):
   ```bash
   curl -s -X POST https://YOUR-DEPLOYMENT/api/identify \
     -H 'Content-Type: application/json' -d '{}'
   # → {"error":"Missing image. Please attach a photo and try again."}
   ```

4. **No key exposed in the client** (should print nothing / "clean"):
   ```bash
   curl -s https://YOUR-DEPLOYMENT/ | grep -ioE 'anthropic|sk-[a-z0-9]+|api[_-]?key' || echo clean
   ```

---

## Hand-off to the iOS build
Once the deploy is healthy, the iOS bundle points at it. On the cloud Mac
(`CLOUD_MAC_QUICKSTART.md` step 3):
```bash
echo 'NEXT_PUBLIC_API_BASE_URL=https://YOUR-DEPLOYMENT' > .env.production
```
That bakes the HTTPS backend URL into the app at build time. The build guard
rejects http/localhost, so it must be your real https deployment.

---

## What is and isn't deployed
- **Deployed (server):** the SPA shell at `/`, `/privacy`, `/support`, and the
  `/api/*` routes. This is the backend.
- **Not deployed here:** the iOS bundle. That's built separately on the Mac via
  `cap:sync` and never contains `ANTHROPIC_API_KEY` or the SDK — it only calls
  this backend over HTTPS.

© 2026 Torq Business Solutions.
