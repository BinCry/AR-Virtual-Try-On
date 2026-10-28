---
date: 2026-10-28
status: completed
scope: studio-ar-lab-mvp
---

# Nhật ký kỹ thuật — Studio AR Lab MVP

## Bối cảnh

Hoàn tất MVP thử trang phục torso chạy hoàn toàn trong trình duyệt: webcam → MediaPipe Pose Landmarker → làm mượt/mapping → lớp phủ Three.js trong demo React.

## Diễn biến

- Tạo workspace pnpm gồm `packages/ar-core` độc lập và `apps/demo`.
- Hoàn thiện vòng đời camera, theo dõi pose cục bộ, overlay áo 3D, đổi mẫu, chụp theo thao tác và cleanup.
- Bổ sung tài liệu kiến trúc, tích hợp, testing, giới hạn và bàn giao.

## Xác minh

Theo báo cáo nghiệm thu ngày 28-10-2026: `pnpm typecheck`, `pnpm lint`, `pnpm test` (2/2), `pnpm build` và smoke HTTP localhost đều đạt.

## Quyết định

- Giữ phạm vi Level A: không backend, upload, phân tích hay lưu video/landmark/ảnh tự động.
- Không tuyên bố mô phỏng vải, đo size chính xác hoặc body fit khi chưa có bằng chứng kỹ thuật.

## Rủi ro và bước tiếp

- Cần nghiệm thu webcam thật cho quyền camera, lỗi thiết bị và calibration theo tỉ lệ khung hình.
- Trước production: benchmark FPS, code-split bundle (~831 kB), và quyết định CSP/self-host cho model/WASM CDN.
- GLB rig/retargeting, occlusion và cloth simulation vẫn ngoài phạm vi MVP.
