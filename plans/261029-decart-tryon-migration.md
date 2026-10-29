---
status: completed
---
# Decart virtual try-on migration

## Goal

Replace the browser-only MediaPipe/Three.js garment overlay with Decart's
realtime WebRTC virtual try-on, while retaining a self-contained local demo.

## Acceptance criteria

- The permanent `DECART_API_KEY` is read only by a server endpoint and never
  included in the browser build.
- A visitor can upload a garment image, describe it, start the camera, and see
  the Decart remote stream once a valid key is configured.
- Stopping, closing, unmounting, or a connection failure releases both the
  Decart realtime client and camera tracks.
- The former 3D pose-tracking package and binary garment/model assets are no
  longer dependencies of the runnable application.
- README documents local setup, environment configuration, operational limits,
  and production requirements.

## Plan

1. Replace the Vite-only entry point with an Express host that issues Decart
   client tokens and serves Vite in development or the built app in production.
2. Rebuild the React UI around a Decart realtime session and local garment
   upload; remove the Three.js/MediaPipe state, controls, and preview paths.
3. Remove obsolete workspace dependencies and assets, then update configuration
   and documentation.
4. Run lint, typecheck, unit tests, and a production build; repair any issues.

## Verification

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `pnpm test` passed (Playwright UI smoke test).
