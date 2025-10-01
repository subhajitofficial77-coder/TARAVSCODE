<!-- Single, production-ready README
     Starts with status banner -> critical bug -> quick links -> phase checklist -> getting started. -->

# TARA — The Sentient AI Creative Platform

**Status:** ✅ Production Ready (with required bug fix) | **Version:** 1.0.0 | **Phases:** 8/8 Complete

This repository contains a production-ready implementation of TARA — an AI-driven creative platform built around a TALE emotional simulation engine, creative content generation, realtime dashboards, and an interactive 3D hero experience.

## Read this first — Critical notice

Before running the TALE engine or deploying Edge Functions, ensure the critical fix in `supabase/functions/daily-awakening/index.ts` is present: the call to `runDailySimulation(...)` must be awaited. Without this change the Edge Function will behave incorrectly or crash.

Run the preflight validator which checks for this and other common issues:

```powershell
npm run verify-deployment
```

## Quick links

- Deployment & testing: DEPLOYMENT_AND_TESTING.md
- Quick start: QUICKSTART.md
- Critical bug details: CRITICAL_BUG_FIX.md

## Production overview

Key capabilities shipped in this repository:

- TALE emotional simulation engine (Supabase Edge Functions + Postgres)
- AI chat and creative content generation (OpenRouter primary, Google AI fallback)
- Content persistence with emotional context snapshots
- 3D hero experience (React Three Fiber + GSAP) with component-scoped cleanup
- Feedback loop that converts user feedback into emotional impact
- 3D/interactive Content Carousel with platform badges and emotion chips

## Getting started (developer)

Prerequisites: Node.js 18+ and a package manager (npm, yarn or pnpm).

1. Install dependencies

```bash
npm install
```

2. Prepare environment

```bash
cp .env.local.example .env.local
# Fill in the values in .env.local (do NOT commit secrets)
```

3. Run quick validation

```powershell
npm run check-env
npm run verify-deployment
```

4. Start the app

```bash
npm run dev
```

## Project structure (high level)

- /app — Next.js App Router pages and layouts
- /components — React UI components (hero, content, dashboard)
- /lib — Utilities, prompt builders, and API clients
- /supabase — Migrations and Edge Functions (TALE engine and feedback handler)
- /scripts — Preflight and diagnostic scripts

## Completed development phases

All development phases are implemented and validated for this release:

1. Foundation (Next.js, TypeScript, Tailwind, Supabase)
2. TALE engine & core logic
3. 3D Hero Scene
4. Dashboard & UI flows
5. AI Chat integration
6. Cognitive Feedback Loop
7. Content Generation & Display
8. Production hardening & deployment readiness

## How core flows work (brief)

- Content generation: client → `POST /api/generate-content` → prompt builder includes current `emotional_context` snapshot → OpenRouter/Google AI → parsed JSON → saved to `generated_content` with `emotional_context`.
- Feedback: client submits feedback to `/api/feedback` → server forwards to Supabase Edge Function which calculates applied emotional deltas and returns an `impact` object; server persists feedback and updates emotional state.
- Hero scene: React Three Fiber scene wrapped in a client-only shell (`HeroShell`) that uses gsap.context for scoped ScrollTrigger lifecycle to avoid cross-component side effects.

## Common troubleshooting

- Edge function errors: confirm the `await runDailySimulation(...)` fix in `supabase/functions/daily-awakening/index.ts` and redeploy the function.
- 3D scene black screen: check browser WebGL console, ensure fonts and assets are loaded.
- API/key issues: verify `.env.local` contains valid keys (OpenRouter, Supabase). Use `npm run test-apis` to validate runtime connectivity.

## Pre-deploy validation (recommended)

Run these before deploying to catch common issues:

```powershell
npm run check-env
npm run test-apis
npm run verify-deployment
```

These scripts will validate environment variables, basic API connectivity, and the presence of the critical bug fix referenced above.

## Contributing & security

- Keep secrets out of version control. `.env.local` is ignored by default.
- Open issues for bugs or feature requests. For security-sensitive issues, contact maintainers privately.

## Files & documentation

- DEPLOYMENT_AND_TESTING.md — detailed preflight and deployment steps (primary reference)
- DEPLOYMENT.md — concise deployment instructions
- QUICKSTART.md — minimal steps to run locally
- CRITICAL_BUG_FIX.md — one-click reference and diff for the blocking bug

## License

MIT

---

If you want, I can also run a markdown linter/formatter on this file or add a short changelog section summarizing the latest commits included in this release.

