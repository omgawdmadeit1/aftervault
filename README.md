# AfterVault

**The operational manual for your life.**

AfterVault helps people capture the accounts, auto-pays, document locations, and practical wishes that only live in their head — one small weekly prompt at a time. When the moment comes, a designated person gets a guided Day 1 / Week 1 / Month 1 checklist with notification templates.

This is pure operational logistics and knowledge capture — **not a will, not legal advice, not full estate planning**.

## Features

### Before mode (living vault)
- Progressive weekly micro-prompts
- Vault completeness scoring by category
- Designated contacts + release framing
- Local browser vault (demo) with optional sign-in

### After mode (moment of need)
- Demo release → phased checklist generated from vault data
- Pre-filled notification templates (bank, SSA, subscriptions, employer, utilities, insurance)
- Progress tracking, notes, and share loop

### Mobile + PWA
- Responsive layout with bottom tab navigation
- Web app manifest, icons, offline fallback page
- Service worker in production only (safe for Vite live preview)

## Stack

- React 19 + TypeScript
- Vite 8 + TanStack Start / Router
- Tailwind CSS v4
- Zustand (vault state)
- Better Auth (Google / X via Grok broker)
- PGLite / Postgres

## Develop

```bash
npm install
npm run dev          # http://0.0.0.0:8080
npm run typecheck
npm run build
```

`startup.sh` starts the dev server for sandbox revive / live preview.

## Product notes

- **Name:** AfterVault (also evaluated: LifeManual, Continuum, PeaceVault)
- **Moat:** trust & security posture; progressive capture habit; After-mode word-of-mouth
- **Non-goals:** will generator, probate software, legal advice, password manager replacement

## License

Private / all rights reserved unless otherwise noted by the repository owner.
