# Kế hoạch triển khai

## Phạm vi

MVP Level A: tracking torso 2D từ webcam, chuyển đổi sang world overlay 3D, garment hình học 3D, React demo. Level B chỉ là hướng mở rộng vì không có GLB rig hợp lệ trong repository.

| Giai đoạn | Trạng thái | Kết quả |
|---|---|---|
| Research/architecture | DONE | Tách `ar-core` và demo; stack đã pin trong lockfile |
| Camera/pose | DONE (code) | `getUserMedia`, cleanup, MediaPipe Pose Landmarker |
| 3D alignment/catalog | DONE (code) | Three renderer, 3 mẫu procedural 3D, scale/position/rotation torso |
| UI/capture | DONE (code) | Permission-by-click, đổi mẫu, diagnostics, capture theo thao tác |
| Automated verification | DONE | Typecheck, lint, 2 unit tests, production build, HTTP smoke PASS |
| Physical acceptance | BLOCKED | Cần webcam/browser thật của người nghiệm thu |

## Rủi ro

CDN WASM/model yêu cầu mạng; tracking thay đổi theo ánh sáng và thiết bị. Không đo kích thước cơ thể, không mô phỏng vải, không xử lý che khuất chính xác.
