# Deployment guide

The client is a static Vite application and the API is a Node HTTP service. Deploy them as two services and set the client API base URL to the deployed API address.

## Client

```bash
cd client
npm ci
npm run build
```

Publish `client/dist` to a static host such as Vercel, Netlify, or Cloudflare Pages.

For Vercel, import the GitHub repository and use:

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-api.onrender.com`

## API

```bash
cd server
npm ci
npm start
```

Use a Node-compatible host such as Render, Railway, Fly.io, or a container platform. The current API writes `server/data.json`; replace this with Postgres or another managed database before using a host with ephemeral storage.

For Render, create a **Web Service** from the same repository and use:

- Root Directory: `server`
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Environment variable: `CLIENT_ORIGIN=https://your-project.vercel.app`

After the API deploys, copy its HTTPS URL into Vercel as `VITE_API_BASE_URL`, then redeploy the Vercel project.

## Required production changes

- Move the API URL into a `VITE_API_BASE_URL` environment variable.
- Restrict CORS to the deployed client origin.
- Replace demo accounts and SHA-256 password hashing with an identity provider or a password-hashing algorithm such as Argon2/bcrypt.
- Store sessions in signed, expiring cookies or JWTs with secure key rotation.
- Use a managed database, encrypted backups, and migrations.
- Add HTTPS, rate limiting, structured logging, error monitoring, and CI checks.
