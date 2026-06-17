# StepThrough

Nuxt 4 app configured for Cloudflare Workers, D1, and Google OAuth.

## Setup

```bash
npm install
cp .env.example .env
npm run db:migrate:local
npm run dev
```

For Google OAuth, set the callback URL to:

```text
http://localhost:3000/auth/google
```

Before deploying, create the Cloudflare D1 database and replace the placeholder IDs in `wrangler.jsonc`.

## Production

This app is deployed as the `stepthrough` Worker:

```text
https://stepthrough.moonbeam.workers.dev
```

Cloudflare D1 databases:

```text
stepthrough-db      production
stepthrough-db-dev  dev/preview
```

Apply remote migrations with:

```bash
npm run db:migrate:remote
npm run db:migrate:remote:dev
```

For Google OAuth in production, add this authorized redirect URI in Google Cloud Console:

```text
https://stepthrough.moonbeam.workers.dev/auth/google
```
