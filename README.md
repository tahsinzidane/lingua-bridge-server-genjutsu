# lingua-bridge

> Originally built as the translation backend for **[Genjutsu](https://github.com/iamovi/genjutsu)** — for text posts translation. Now open source under the **MIT License**. Use it freely in your own projects.

A free, self-hostable **translation API** powered by `google-translate-api-x`. No API keys required — it reverse-engineers Google Translate's public endpoint.

This monorepo contains **three independent deployment targets** for the same translation service. Pick the one that fits your infrastructure:

| Sub-project | Folder | Runtime | Best for |
|---|---|---|---|
| [Own Server](#1-own-server-expressjs) | `/` (root) | Node.js + Express | VPS, Raspberry Pi, local LAN |
| [Vercel Serverless](#2-vercel-serverless) | `lingua-bridge-vercel-serverless/` | Vercel + Express | Hobby / free-tier cloud |
| [Cloudflare Workers](#3-cloudflare-workers) | `lingua-bridge-cloudflare/` | Cloudflare + Hono | Edge, global latency, 100k req/day free |

---

## API Reference

All three projects expose the **same API surface**:

### `GET /` or `GET /health`

Health check endpoint.

**Response:**
```json
{ "status": "API is running" }
```

---

### `POST /api/translate`

Translates text into a target language. Auto-detects the source language.

**Request body:**
```json
{
  "text": "Bonjour le monde",
  "target": "en"
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `text` | `string` | Yes | — | The text to translate |
| `target` | `string` | No | `"en"` | Target language as an [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) code |

**Success response (`200`):**
```json
{
  "success": true,
  "translatedText": "Hello world",
  "sourceLang": "fr"
}
```

**Validation error (`400`):**
```json
{
  "success": false,
  "message": "A valid \"text\" field is required for translation."
}
```

**Server error (`500`):**
```json
{
  "success": false,
  "message": "Internal Server Error: Translation service failed."
}
```

---

## 1. Own Server (Express.js)

A classic Node.js/Express server — runs on any machine you control. Ideal for self-hosted setups, local networks, home servers, or VPS deployments.

**Tech stack:** Node.js · Express 5 · TypeScript · `google-translate-api-x`

### Setup

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and set FRONTEND_ORIGIN to your frontend's URL

# Development (ts-node, no build step)
npm run dev

# Production build + start
npm run build
npm start
```

Server starts on `http://localhost:3000` by default. Override with the `PORT` environment variable.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `FRONTEND_ORIGIN` | Allowed CORS origin for your frontend | `http://192.168.0.1:8080` |
| `PORT` | Port to listen on (optional) | `3000` |

> **Note:** The current `src/index.ts` passes the string `"process.env.FRONTEND_ORIGIN"` literally to the CORS config instead of the evaluated value. Fix this before deploying:
> ```ts
> // Change this:
> origin: "process.env.FRONTEND_ORIGIN",
> // To this:
> origin: process.env.FRONTEND_ORIGIN,
> ```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with `ts-node` (no build needed) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output from `dist/` |

---

## 2. Vercel Serverless

Deploys the Express app as a single [Vercel Serverless Function](https://vercel.com/docs/functions). The Express app is exported without calling `app.listen()` — Vercel handles the server lifecycle.

**Tech stack:** Vercel · Express 4 · TypeScript · `google-translate-api-x`

### How it works

- `api/index.ts` — Vercel's entry point. It simply imports and re-exports the Express app.
- `src/app.ts` — The Express application, identical to the own-server version but **without** `app.listen()`.
- `vercel.json` — Routes all incoming requests (`/(.*)`) to `api/index.ts`.

### Local Development

```bash
cd lingua-bridge-vercel-serverless

npm install

# Copy env file
cp .env.example .env
# Edit .env → set FRONTEND_ORIGIN

# Run with Vercel Dev (emulates the serverless environment locally)
npm run dev
# → http://localhost:3000
```

### Deploy to Vercel

```bash
# Install Vercel CLI (once)
npm install -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables** (not in `.env` — that's for local only):

| Variable | Description | Example |
|---|---|---|
| `FRONTEND_ORIGIN` | Allowed CORS origin(s). Comma-separate multiple. | `https://yourapp.vercel.app` |

> Supports multiple origins: `https://app.com,https://staging.app.com`  
> Set to `*` to allow all origins.

---

## 3. Cloudflare Workers

Runs on Cloudflare's global edge network. Uses [Hono](https://hono.dev/) instead of Express, since Cloudflare Workers don't support Node.js APIs like `http.Server`.

**Tech stack:** Cloudflare Workers · Hono 4 · TypeScript · `google-translate-api-x` · Wrangler

**Free tier:** 100,000 requests/day · No cold starts · No spin-down

### How it works

- `src/index.ts` — Hono app exported as the Worker's default export. Cloudflare calls it directly per request.
- `wrangler.toml` — Configures the worker name, entry point, and environment variables. Uses `nodejs_compat` flag for `google-translate-api-x` compatibility.
- Unlike the Express projects, there is no `app.listen()` — Workers are event-driven.

### Local Development

```bash
cd lingua-bridge-cloudflare

npm install

# Create local env file (Wrangler reads this, not .env)
echo "FRONTEND_ORIGIN=http://localhost:3000" > .dev.vars

# Start local dev server
npm run dev
# → http://localhost:8787
```

### Deploy to Cloudflare

```bash
# Login to Cloudflare
npx wrangler login

# Deploy
npm run deploy
```

Your worker will be live at:
`https://lingua-bridge.<your-subdomain>.workers.dev`

### Environment Variables

Set via **Cloudflare Dashboard → Workers & Pages → lingua-bridge → Settings → Variables**, or via Wrangler CLI:

```bash
npx wrangler secret put FRONTEND_ORIGIN
```

| Variable | Description | Example |
|---|---|---|
| `FRONTEND_ORIGIN` | Allowed CORS origin(s). Comma-separate multiple. | `https://your-frontend.com` |

> **Do not** commit secrets to `wrangler.toml`. Use the dashboard or `wrangler secret` for production values.

---

## Choosing a Deployment Target

| | Own Server | Vercel Serverless | Cloudflare Workers |
|---|---|---|---|
| **Cost** | Your infrastructure | Free tier available | 100k req/day free |
| **Cold starts** | None | Yes (on free tier) | None |
| **Global edge** | No | Partial | Yes |
| **Node.js APIs** | Full | Full | Subset (compat flag) |
| **Framework** | Express 5 | Express 4 | Hono 4 |
| **Config** | `.env` | `vercel.json` + Dashboard | `wrangler.toml` + Dashboard |
| **Deploy command** | `npm start` | `vercel --prod` | `npm run deploy` |

---

## CORS Configuration

All three projects support the `FRONTEND_ORIGIN` environment variable:

- Set to a single origin: `https://myapp.com`
- Set to multiple comma-separated origins: `https://myapp.com,https://staging.myapp.com`
- Set to `*` to allow all origins (not recommended for production)
- If unset, defaults to `*`

---

## Language Codes

This API uses [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) two-letter language codes.

Common examples:

| Code | Language |
|---|---|
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `ja` | Japanese |
| `zh-cn` | Chinese (Simplified) |
| `ar` | Arabic |
| `pt` | Portuguese |
| `hi` | Hindi |
| `ko` | Korean |

For the full list, see [Google's supported languages](https://cloud.google.com/translate/docs/languages).

---

## Authors

This API was created by **[Tahsin](https://github.com/tahsinzidane)**, later transferred to **[Ovi](https://github.com/iamovi)**'s GitHub. Maintained by both.

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](./LICENSE) for details.
