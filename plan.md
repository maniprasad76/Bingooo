# Implementation Plan: Install & Configure Vercel Speed Insights

## 1. Problem & Context
The user requested adding `@vercel/speed-insights`.
Because Bingooo is a **React 19 + Vite** single-page application (monorepo workspaces `apps/frontend` and `apps/admin`) rather than a Next.js framework app, importing from `@vercel/speed-insights/next` will fail compilation due to missing Next.js internals (`next/navigation`).
The official export for Vite/React applications is `@vercel/speed-insights/react`.

## 2. Changes
1. Install `@vercel/speed-insights` in `apps/frontend` (and `apps/admin`).
2. Import `SpeedInsights` from `@vercel/speed-insights/react` in `apps/frontend/src/app/App.tsx`.
3. Render `<SpeedInsights />` inside the root tree in `App.tsx`.
4. Import and render `<SpeedInsights />` in `apps/admin/src/App.tsx`.

## 3. Verification Plan
- Run `npm run typecheck` to verify zero TypeScript errors.
- Run `npm run build` to confirm production bundling succeeds.
