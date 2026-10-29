---
status: completed
---
# Free local try-on migration

## Goal

Replace the Decart WebRTC implementation with a browser-only MediaPipe Pose and
2D Canvas garment overlay that requires no API key and sends no camera data off
the device.

## Acceptance criteria

- A user can select one of three bundled transparent garment samples, enable
  the camera, and see it follow their shoulders and hips in the local canvas.
- Camera tracks and object URLs are released when the user stops the camera or
  leaves the page.
- No server process, API key, Decart package, or remote AI request remains.
- Production build is static-hostable and documentation states the visual
  fidelity limitation of 2D overlay.

## Implementation

1. Restore only the MediaPipe model/WASM assets required for local pose
   inference, add the browser SDK dependency, and bundle three sample garments.
2. Replace the Decart client session with webcam, pose-inference, smoothing,
   and Canvas 2D rendering.
3. Remove server/API configuration and update README/tests.
4. Verify lint, types, build, and UI smoke test.

## Verification

- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm build` passed.
- `pnpm test` passed, including the no-external-request smoke test.
