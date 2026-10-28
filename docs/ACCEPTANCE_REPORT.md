# Báo cáo nghiệm thu kỹ thuật

## Kết quả xác minh tự động

Ngày 28-10-2026 (Asia/Ho_Chi_Minh): `pnpm typecheck`, `pnpm lint`, `pnpm test` (3/3), `pnpm build` đều PASS. Vite dev server trả HTTP 200 tại `http://127.0.0.1:5173/`; endpoint WASM và model MediaPipe CDN đều trả HTTP 200.

Code review sau đó đã sửa bù crop viewport, giải phóng GPU khi đổi garment/restart, cancellation cho start/stop, bắt lỗi frame loop và fallback MediaPipe CPU; toàn bộ lệnh trên được chạy lại PASS.

## Trạng thái tính năng

| Hạng mục | Trạng thái | Bằng chứng |
|---|---|---|
| Camera lifecycle và consent | DONE (code), PARTIAL (physical) | `CameraManager`, cần webcam thật để xác nhận permission/device errors |
| Pose Landmarker | DONE (code), PARTIAL (physical) | `MediaPipePoseTracker` gọi Tasks Vision thật; chưa có camera thật |
| 3D torso garment | DONE (code) | Three.js procedural mesh, mapping vai/hông và production build |
| Garment switching/capture | DONE (code), PARTIAL (browser) | UI handlers thực; browser automation unavailable vì CLI không cài |
| Skeletal retargeting/GLB | PARTIAL | GLB demo có rig upper-arm và validation; chưa nghiệm thu camera thật |
| Cloth, body fit, occlusion | PARTIAL | Fit profile local-only là tham khảo; occlusion/cloth physics chưa triển khai |

## Hiệu năng và an toàn

Không benchmark FPS; bundle JS minified 830.93 kB và cần tối ưu/code split trước production. Video, landmarks và ảnh không được upload/lưu tự động. Model/WASM tải CDN nên cần quyết định CSP/self-host trước production.
