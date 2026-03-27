# Lingua Bridge — Vercel Serverless

A translation API powered by `google-translate-api-x`, deployed as a Vercel Serverless Function.

## Project Structure

```
.
├── api/
│   └── index.ts          ← Vercel serverless entry point
├── src/
│   ├── app.ts            ← Express app (no app.listen)
│   ├── controllers/
│   │   └── translateController.ts
│   └── routes/
│       └── translateRoutes.ts
├── vercel.json           ← Vercel routing config
├── tsconfig.json
└── package.json
```

## API Endpoints

### `GET /` or `GET /health`
Returns `{ "status": "API is running" }`.

### `POST /api/translate`
**Body:**
```json
{ "text": "Bonjour", "target": "en" }
```
**Response:**
```json
{
  "success": true,
  "translatedText": "Hello",
  "sourceLang": "fr"
}
```
`target` defaults to `"en"` if omitted.

## Local Development

```bash
npm install
npm run dev        # starts vercel dev on http://localhost:3000
```

## Deploy to Vercel

```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy (first time — follow the prompts)
vercel

# Deploy to production
vercel --prod
```

## Environment Variables

Set these in **Vercel Project Settings → Environment Variables**:

| Variable          | Description                            | Example                       |
|-------------------|----------------------------------------|-------------------------------|
| `FRONTEND_ORIGIN` | Allowed CORS origin for your frontend  | `https://yourapp.vercel.app`  |

> You do **not** need a `.env` file in production — Vercel injects env vars automatically.
