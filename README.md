# Steelvault

Catalog and collection manager for steelbooks and video games.
React 19, TypeScript, Vite, Tailwind v4, React Router, TanStack Query, Supabase, PWA.

## Setup
1. `npm install`
2. `cp .env.example .env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. In the Supabase SQL editor run every file in `supabase/migrations/` in order (0001 to 0008).
4. Supabase > Authentication > URL Configuration: set the Site URL and add `<your origin>/login`
   and `<your origin>/reset-password` as redirect URLs.
5. Add catalog data: see `docs/IMPORTING_CATALOG.md`. Add exchange rates: `docs/EXCHANGE_RATES.md`.
6. `npm run dev`

## Scripts
- `npm run dev` start the dev server
- `npm run build` type-check and build for production
- `npm run preview` serve the production build (use it to test the PWA)
- `npm test` run the unit tests
- `npm run types` generate Supabase types (needs the Supabase CLI, linked project)

## Structure
    src/app/          providers, routes, lazy page loaders
    src/components/   layout/ and ui/ building blocks
    src/features/     auth, catalog, collection, sharing, stats, profile (logic lives here)
    src/pages/        thin route components
    src/lib/          env, Supabase client, query client, storage helpers
    supabase/         migrations, import template, demo seed
    docs/             importing, exchange rates, PWA and hosting notes

## Security model
- Row Level Security is on for every table. Catalog tables are read-only for users; users can only
  read and change their own profile, collection and photos.
- Sharing never exposes tables. Public pages call two functions that return data only when the
  owner enabled sharing, and never return email, username, notes, tags, purchase prices or photos.
- The service worker never caches private data (see docs/PWA_AND_PERFORMANCE.md).
- The anon key in `.env` is public by design. Never put the service-role key in the app.

## Not included yet
Price history and market comparisons, release tracking, import/export of collections, personal
photos of items, custom categories beyond tags, account deletion, avatars.
