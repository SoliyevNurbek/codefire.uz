# codefire.uz — frontend

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · TanStack Query · next-intl (uz / ru / en) · Monaco · MSW mocks.

## Run

```bash
npm install
npm run dev          # http://localhost:3000 — works fully on mock data
npm run build && npm start
```

Uzbek is the default locale (`/problems`); Russian and English live under `/ru/...` and `/en/...`.

## Mock data vs the real Django API

By default every request is answered by the MSW handlers in `mocks/` (realistic Uzbek data,
simulated judging and a live scoreboard). They are resolved in-process with MSW's `getResponse`,
so they work for server rendering and in the browser, and are never loaded in a production build
with mocking off.

In mock mode, sign in with any login and a password of 6+ characters (session cookie
`cf_mock_session`).

To switch to the real backend, create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.codefire.uz
NEXT_PUBLIC_WS_URL=wss://api.codefire.uz
NEXT_PUBLIC_API_MOCKING=disabled
```

The backend has to implement `docs/API_CONTRACT.md` (JWT in httpOnly cookies, CSRF, camelCase JSON).

## Layout

```
app/[locale]/(public)   home, problems, problem page, submissions, contests, rating, profiles, coming-soon sections
app/[locale]/(app)      signed-in pages (settings — coming soon)
app/[locale]/(auth)     login, register
components/ui           design-system primitives (see docs/DESIGN_SYSTEM.md, live at /design-system)
components/shell        sidebar, top bar, Ctrl+K palette, contest banner
components/features     problem explorer, workspace (Monaco + live verdict), standings, profile charts…
lib/api                 typed client, endpoints, zod schemas, types
lib/ws                  WebSocket hooks (submission verdict, standings)
mocks/                  MSW handlers and generated data
messages/               uz.json, ru.json, en.json
```

## Status

Built: shell, home (landing + dashboard), problems, problem page with editor and live verdict,
submissions, contests, contest page with live standings, rating, profiles, sign-in.
Shown as "coming soon": courses, roadmap, algorithms, clans, blogs, settings, password reset.
