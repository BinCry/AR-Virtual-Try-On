# Studio AR Lab

[![React 19](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-8B5CF6?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vite.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-111827?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose%20AI-00A67E?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

Demo độc lập cho thử trang phục torso 3D realtime bằng webcam. Pipeline là thật: webcam → MediaPipe Pose Landmarker → EMA + mapping vai/hông → transparent Three.js canvas. Không upload video, không backend, không tự bật camera.

## Chạy

```bash
pnpm install
pnpm dev
```

Mở URL Vite in ra (thường `http://localhost:5173`), bấm **Bật camera**. Camera chỉ hoạt động trên localhost/HTTPS.

## Chất lượng

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Cấu trúc

- `packages/ar-core`: engine TypeScript độc lập với React.
- `apps/demo`: React/Vite UI demo.
- `docs`: kiến trúc, tracking, coordinate, integration, test và handoff.

Xem [giới hạn kỹ thuật](docs/KNOWN_LIMITATIONS.md) trước khi sử dụng như một hệ thống đo size hay fitting chính xác.
