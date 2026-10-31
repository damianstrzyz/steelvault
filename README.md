# Steelvault

React + TypeScript + Vite + Tailwind v4 + React Router + TanStack Query + Supabase + PWA.

## Run
    npm install
    cp .env.example .env   # fill in Supabase URL and anon key
    npm run dev

## Structure
    src/app/          App shell, providers, route table (all pages lazy-loaded)
    src/components/   layout/ (header, footer, drawer) and ui/ (dialogs, skeletons)
    src/features/     one folder per domain (auth now; catalog, collection, sharing, stats later)
    src/lib/          env validation, Supabase client, query client
    src/pages/        thin route components; logic lives in features/

## Stages
1 Setup (this) · 2 Database · 3 UI · 4 Catalog · 5 Auth · 6 Collection · 7 Sharing · 8 Stats · 9 PWA/perf · 10 QA
