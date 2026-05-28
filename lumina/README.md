# Lumina Studio

Lumina Studio is a production-ready AI portfolio builder for designers, developers, freelancers, students, and creators. It generates polished portfolio copy, recommends layouts and color systems, previews responsive templates, exports standalone HTML/JSON, tracks views/exports, and saves shareable portfolio slugs.

Tagline: **AI portfolios that get you noticed.**

## Features

- Dark luxury SaaS landing page with pricing, testimonials, comparison, FAQ, MRR calculator, trust microcopy, and waitlist capture.
- Premium multi-step portfolio wizard with autosave, resume draft banner, completed-step progress, quality score, tone selector, audience selector, template selector, and drag/reorder project cards.
- Server-side Gemini `gemini-1.5-flash` generation with strict JSON prompting, JSON repair, validation, request timeout, graceful fallback content, and generation metadata.
- Preview studio with Minimal, Bold, Creative, Editorial, and Premium layouts, device preview, palette switcher, one-click regenerate controls, watermark logic, upgrade CTA, copy HTML, download HTML, and copy JSON.
- Public share route `/p/:slug` with dynamic document title, description, OpenGraph tags, and view tracking.
- Cookie-based authentication with email/password, Google OAuth structure, protected dashboard, user-owned portfolios, monthly free-generation limits, and Pro bypass rules.
- SaaS dashboard architecture for owned portfolios, view/export counters, quality metrics, and future Stripe subscription state.
- Express API with Helmet, CORS allowlist, rate limiting, input sanitization, URL/email validation, body-size limits, centralized error handling, and production-safe logging.
- MongoDB Atlas-ready schema with an in-memory local development fallback when `MONGODB_URI` is not configured.
- Deployment-ready config for Vercel frontend and Railway backend.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS v3, Framer Motion v11, Axios, React Hook Form, React Hot Toast, Lucide React
- Backend: Node.js, Express.js, MongoDB, Mongoose, Passport, JWT, bcrypt, Google Gemini API, Helmet, CORS, Morgan, express-rate-limit, dotenv
- Deployment: Vercel frontend, Railway backend

## Local Setup

Install frontend dependencies:

```bash
cd lumina/client
npm install
npm run dev
```

Install backend dependencies:

```bash
cd lumina/server
npm install
npm run dev
```

The frontend defaults to `http://localhost:5000/api` for API calls. The backend can start without secrets in development and will use fallback AI content plus in-memory portfolio storage. For real persistence and Gemini output, configure the server environment.

## Environment Variables

Create `client/.env` locally:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLIENT_URL=http://localhost:5173
```

Create `server/.env` locally:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lumina-studio
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
NODE_ENV=development
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=
JWT_ACCESS_SECRET=generate_a_64_char_random_string_here
JWT_REFRESH_SECRET=generate_a_different_64_char_random_string_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Do not commit real credentials. MongoDB URLs and Gemini API keys are private account secrets and cannot be safely fetched from the public internet.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with read/write access.
3. Add your current IP to Network Access for local testing.
4. Copy the connection string and replace the username, password, and database name.
5. Set `MONGODB_URI` locally and in Railway.

## Gemini API Setup

1. Open Google AI Studio.
2. Create an API key for Gemini.
3. Set `GEMINI_API_KEY` only on the backend.
4. Never expose the Gemini key through Vite or frontend variables.

## Google OAuth Setup

1. Create OAuth credentials in Google Cloud Console.
2. Add `http://localhost:5000/api/auth/google/callback` for local development.
3. Add your Railway callback URL for production.
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` only on the backend.

## API Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `POST /api/gemini/generate`
- `GET /api/portfolios`
- `POST /api/portfolios`
- `GET /api/portfolios/:id`
- `PUT /api/portfolios/:id`
- `DELETE /api/portfolios/:id`
- `GET /api/portfolios/public/:slug`
- `POST /api/waitlist`

## Deployment

### Vercel Frontend

- Root directory: `lumina/client`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL=https://your-railway-api.up.railway.app/api`
- Add `VITE_CLIENT_URL=https://your-vercel-app.vercel.app`
- `client/vercel.json` includes SPA rewrites for React Router.

### Railway Backend

- Root directory: `lumina/server`
- Start command: `node server.js`
- Add `MONGODB_URI`, `GEMINI_API_KEY`, `NODE_ENV=production`, `CLIENT_URL`, `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true`, JWT secrets, and Google OAuth secrets.
- Set `CLIENT_URL` to your Vercel URL. Multiple origins can be comma-separated.
- `server/railway.toml` and `server/railway.json` include the start command, health check, and restart policy.

## Production CORS

Set `CLIENT_URL` to exact allowed origins:

```env
CLIENT_URL=https://lumina-studio.vercel.app,https://www.yourdomain.com
```

Avoid `*` in production because the API uses credential-ready CORS behavior.

## Future Stripe Structure

The frontend already models `free`, `pro`, and `studio` plan states, upgrade nudges, watermark logic, and dashboard plan cards. A Stripe integration can attach checkout sessions to plan upgrades without rewriting the portfolio builder.

Suggested future backend routes:

- `POST /api/billing/create-checkout-session`
- `POST /api/billing/webhook`
- `GET /api/billing/subscription`

## Troubleshooting

- Frontend cannot reach backend: confirm `VITE_API_URL` points to the backend `/api` base URL.
- CORS error: add the frontend origin to `CLIENT_URL` on the backend.
- Gemini returns fallback content: confirm `GEMINI_API_KEY` exists on the server and the key is enabled.
- Portfolio does not persist after restart: configure `MONGODB_URI`; the in-memory store is development-only.
- Vite port changes to 5174: add `http://localhost:5174` to `CLIENT_URL` during local testing.

## Screenshots

Add final product screenshots after deployment:

- Landing page
- Builder wizard
- Preview studio
- Public portfolio
- Analytics dashboard
