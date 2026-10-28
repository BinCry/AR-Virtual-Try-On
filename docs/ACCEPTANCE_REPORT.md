# Báo cáo nghiệm thu kỹ thuật

## Kết quả xác minh tự động

Ngày 28-10-2026 (Asia/Ho_Chi_Minh): `pnpm typecheck`, `pnpm lint`, `pnpm test` (2/2), `pnpm build` đều PASS. Vite dev server trả HTTP 200 tại `http://127.0.0.1:5173/`.

Code review sau đó đã sửa bù crop viewport, giải phóng GPU khi đổi garment/restart, cancellation cho start/stop, bắt lỗi frame loop và fallback MediaPipe CPU; toàn bộ lệnh trên được chạy lại PASS.

## Trạng thái tính năng

| Hạng mục | Trạng thái | Bằng chứng |
|---|---|---|
| Camera lifecycle và consent | DONE (code), PARTIAL (physical) | `CameraManager`, cần webcam thật để xác nhận permission/device errors |
| Pose Landmarker | DONE (code), PARTIAL (physical) | `MediaPipePoseTracker` gọi Tasks Vision thật; chưa có camera thật |
| 3D torso garment | DONE (code) | Three.js procedural mesh, mapping vai/hông và production build |
| Garment switching/capture | DONE (code), PARTIAL (browser) | UI handlers thực; browser automation unavailable vì CLI không cài |
| Skeletal retargeting/GLB | NOT IMPLEMENTED | Không có GLB rig được nghiệm thu |
| Cloth, body fit, occlusion | NOT IMPLEMENTED | Ngoài phạm vi Level A MVP |

## Hiệu năng và an toàn

Không benchmark FPS; bundle JS minified 830.93 kB và cần tối ưu/code split trước production. Video, landmarks và ảnh không được upload/lưu tự động. Model/WASM tải CDN nên cần quyết định CSP/self-host trước production.
